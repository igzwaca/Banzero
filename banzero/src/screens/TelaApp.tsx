import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, update } from "firebase/database";
import { db } from "../services/Firebase";
import { monitorarTodasEmbarcacoes } from "../services/Embarcacao";
import { Asset } from "expo-asset";
import { MapaHTML } from "../styles/TelaApp";

const IMGBB_API_KEY = "1004adfd76903eef741f7689abe70fcf";
const FOTO_DEFAULT = "https://i.ibb.co/99WSv32T/Banzero-1.jpg";

const LOCALIZACAO_PADRAO = {
  latitude: -3.0756,
  longitude: -60.0127,
};

const STORAGE_KEYS = [
  "@Banzero:userId",
  "@Banzero:nome",
  "@Banzero:foto",
  "@Banzero:tema",
];

export default function TelaApp({ onLogout }: any) {
  const webViewRef = useRef<WebView>(null);
  const ultimaListaRef = useRef<string>("");

  const [logoAsset, setLogoAsset] = useState<string>("");
  const [minhaLocation, setMinhaLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [carregandoMapa, setCarregandoMapa] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState({ id: "", nome: "", fotoUrl: "" });

  const executarJS = useCallback((script: string) => {
    webViewRef.current?.injectJavaScript(`${script}; true;`);
  }, []);

  const transicaoFotoWebView = useCallback((url: string) => {
    executarJS(`
      (function() {
        const img = document.getElementById('user-photo');
        if(img) {
          img.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
          img.style.opacity = '0';
          img.style.transform = 'scale(0.9)';
          setTimeout(() => {
            img.src = '${url}';
            img.onload = () => {
              img.style.opacity = '1';
              img.style.transform = 'scale(1)';
            };
          }, 300);
        }
      })()
    `);
  }, [executarJS]);

  const injetarNoMapa = useCallback((dados: string) => {
    // Uso de JSON.stringify evita quebras caso haja aspas simples nos dados (ex: barcos com nomes tipo "D'Água")
    executarJS(`if (window.atualizarFrota) window.atualizarFrota(${JSON.stringify(dados)})`);
  }, [executarJS]);

  useEffect(() => {
    let isMounted = true;

    const aplicarLocalizacaoPadrao = () => {
      Alert.alert("Aviso", "GPS não identificado. Reinicie o aplicativo caso queira obter sua localização real.");
      return LOCALIZACAO_PADRAO;
    };

    const obterLocalizacao = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          return aplicarLocalizacaoPadrao();
        }

        let localizacaoFinal = null;
        let tentativas = 0;

        while (!localizacaoFinal && tentativas < 2) {
          try {
            const loc = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            if (loc?.coords) localizacaoFinal = loc.coords;
          } catch {
            tentativas++;
            if (tentativas < 2) await new Promise((r) => setTimeout(r, 800));
          }
        }

        if (!localizacaoFinal) {
          const lastLoc = await Location.getLastKnownPositionAsync({});
          localizacaoFinal = lastLoc?.coords || aplicarLocalizacaoPadrao();
        }

        return localizacaoFinal;
      } catch {
        return aplicarLocalizacaoPadrao();
      }
    };

    const carregarLogo = async () => {
      const asset = Asset.fromModule(require("../assets/logo.png"));
      await asset.downloadAsync();
      return asset.uri;
    };

    const inicializarApp = async () => {
      try {
        // Execução concorrente (AsyncStorage em batch, Asset e GPS ao mesmo tempo)
        const [storageData, logoUri, coords] = await Promise.all([
          AsyncStorage.multiGet(STORAGE_KEYS),
          carregarLogo(),
          obterLocalizacao(),
        ]);

        if (!isMounted) return;

        const storageMap = Object.fromEntries(storageData);
        const nomeCompleto = storageMap["@Banzero:nome"];
        const primeiroNome = nomeCompleto?.trim().split(" ")[0] || "Usuário";

        setUserData({
          id: storageMap["@Banzero:userId"] || "",
          nome: primeiroNome.toUpperCase(),
          fotoUrl: storageMap["@Banzero:foto"] || FOTO_DEFAULT,
        });

        if (storageMap["@Banzero:tema"] === "dark") {
          setIsDarkMode(true);
        }

        setLogoAsset(logoUri);
        setMinhaLocation(coords);
      } catch (error) {
        if (isMounted) {
          setMinhaLocation(aplicarLocalizacaoPadrao());
        }
      } finally {
        if (isMounted) setCarregandoMapa(false);
      }
    };

    inicializarApp();

    const unsub = monitorarTodasEmbarcacoes((lista) => {
      const dados = JSON.stringify(lista);
      ultimaListaRef.current = dados;
      injetarNoMapa(dados);
    });

    return () => {
      isMounted = false;
      unsub();
    };
  }, [injetarNoMapa]);

  const gerenciarFotoPerfil = () => {
    if (!userData.id) return;
    Alert.alert("Perfil", "Personalize sua foto de exibição", [
      { text: "Cancelar", style: "cancel" },
      { text: "🗑️ Remover Foto", style: "destructive", onPress: executarRemocaoFoto },
      { text: "📸 Galeria", onPress: executarUploadFoto },
    ]);
  };

  const executarUploadFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") return Alert.alert("Erro", "Permissão necessária.");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: result.assets[0].uri,
        type: "image/jpeg",
        name: `perfil_${userData.id}.jpg`,
      } as any);

      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: "POST",
        body: formData,
      });

      const resJson = await response.json();
      const novaUrl = resJson?.data?.url;

      if (!novaUrl) throw new Error("URL não retornada");

      await Promise.all([
        update(ref(db, `Usuarios/${userData.id}`), { fotoUrl: novaUrl }),
        AsyncStorage.setItem("@Banzero:foto", novaUrl),
      ]);

      setUserData((prev) => ({ ...prev, fotoUrl: novaUrl }));
      transicaoFotoWebView(novaUrl);
    } catch (error) {
      Alert.alert("Erro", "Falha ao enviar.");
    }
  };

  const executarRemocaoFoto = async () => {
    if (!userData.fotoUrl || userData.fotoUrl === FOTO_DEFAULT) {
      return Alert.alert("Aviso", "Você já está usando a foto padrão.");
    }

    try {
      await Promise.all([
        update(ref(db, `Usuarios/${userData.id}`), { fotoUrl: "" }),
        AsyncStorage.removeItem("@Banzero:foto"),
      ]);
      setUserData((prev) => ({ ...prev, fotoUrl: FOTO_DEFAULT }));
      transicaoFotoWebView(FOTO_DEFAULT);
    } catch (error) {
      Alert.alert("Erro", "Falha ao remover.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Sair", "Deseja encerrar a sessão?", [
      { text: "Não", style: "cancel" },
      {
        text: "Sair",
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.multiRemove(STORAGE_KEYS);
          onLogout();
        },
      },
    ]);
  };

  // Memoiza a fonte HTML para evitar recarregar/flicker da WebView a cada render
  const webViewSource = useMemo(() => {
    if (!minhaLocation || !logoAsset) return undefined;
    return {
      html: MapaHTML(
        minhaLocation.latitude,
        minhaLocation.longitude,
        logoAsset,
        userData.nome,
        userData.fotoUrl,
        isDarkMode
      ),
    };
  }, [minhaLocation, logoAsset, userData.nome, userData.fotoUrl, isDarkMode]);

  if (carregandoMapa || !minhaLocation || !logoAsset) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0047AB" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar hidden={true} />
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={webViewSource}
        style={styles.map}
        onLoadEnd={() => {
          if (ultimaListaRef.current) {
            injetarNoMapa(ultimaListaRef.current);
          }
        }}
        onMessage={(event) => {
          const msg = event.nativeEvent.data;
          switch (msg) {
            case "logout":
              handleLogout();
              break;
            case "trocarFoto":
              gerenciarFotoPerfil();
              break;
            case "temaEscuro":
              setIsDarkMode(true);
              AsyncStorage.setItem("@Banzero:tema", "dark");
              break;
            case "temaClaro":
              setIsDarkMode(false);
              AsyncStorage.setItem("@Banzero:tema", "light");
              break;
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  map: { flex: 1 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f5f5f5" },
});