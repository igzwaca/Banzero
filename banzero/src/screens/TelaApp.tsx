import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, View, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import { StatusBar } from "expo-status-bar";
import * as Location from "expo-location";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ref, update } from "firebase/database";
import { db } from "../services/Firebase";
import { monitorarTodasEmbarcacoes } from "../services/Embarcacao";
import { Asset } from "expo-asset";
import { MapaHTML } from "../styles/TelaApp";

const IMGBB_API_KEY = "1004adfd76903eef741f7689abe70fcf";
const FOTO_DEFAULT = "https://i.ibb.co/99WSv32T/Banzero-1.jpg";

export default function TelaApp({ onLogout }: any) {
  const webViewRef = useRef<WebView>(null);
  const [logoAsset, setLogoAsset] = useState<string>("");
  const [minhaLocation, setMinhaLocation] = useState<any>(null);
  const [carregandoMapa, setCarregandoMapa] = useState(true);
  const [ultimaLista, setUltimaLista] = useState<string>("");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userData, setUserData] = useState({ id: "", nome: "", fotoUrl: "" });

  const executarJS = (script: string) => {
    webViewRef.current?.injectJavaScript(`${script}; true;`);
  };

  const transicaoFotoWebView = (url: string) => {
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
  };

  useEffect(() => {
    const inicializarApp = async () => {
      try {
        const [id, nomeCompleto, foto, tema] = await Promise.all([
          AsyncStorage.getItem("@Banzero:userId"),
          AsyncStorage.getItem("@Banzero:nome"),
          AsyncStorage.getItem("@Banzero:foto"),
          AsyncStorage.getItem("@Banzero:tema")
        ]);

        const primeiroNome = nomeCompleto?.trim().split(" ")[0] || "Usuário";
        setUserData({ id: id || "", nome: primeiroNome.toUpperCase(), fotoUrl: foto || FOTO_DEFAULT });

        if (tema === "dark") setIsDarkMode(true);

        const asset = Asset.fromModule(require("../assets/logo.png"));
        await asset.downloadAsync();
        setLogoAsset(asset.uri);

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === "granted") {
          let localizacaoFinal = null;
          let tentativas = 0;

          while (!localizacaoFinal && tentativas < 2) {
            try {
              const loc = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              });
              if (loc?.coords) localizacaoFinal = loc.coords;
            } catch (e) {
              tentativas++;
              if (tentativas < 2) await new Promise(r => setTimeout(r, 800));
            }
          }

          if (!localizacaoFinal) {
            const lastLoc = await Location.getLastKnownPositionAsync({});
            localizacaoFinal = lastLoc?.coords || aplicarLocalizacaoPadrao;
          }

          setMinhaLocation(localizacaoFinal);
        } else {
          setMinhaLocation(aplicarLocalizacaoPadrao);
        }

      } catch (error) {
        setMinhaLocation(aplicarLocalizacaoPadrao);
      } finally {
        setCarregandoMapa(false);
      }
    };

    const aplicarLocalizacaoPadrao = () => {
      Alert.alert("Aviso", "GPS não identificado. Reinicie o aplicativo caso queira obter sua localização real.");
      setMinhaLocation({
        latitude: -3.0756,
        longitude: -60.0127,
      });
    };

    inicializarApp();

    const unsub = monitorarTodasEmbarcacoes((lista) => {
      const dados = JSON.stringify(lista);
      setUltimaLista(dados);
      injetarNoMapa(dados);
    });

    return () => unsub();
  }, []);

  const injetarNoMapa = (dados: string) => {
    executarJS(`if (window.atualizarFrota) window.atualizarFrota('${dados}')`);
  };

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

    if (result.canceled) return;

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
      const novaUrl = resJson.data.url;

      await Promise.all([
        update(ref(db, `Usuarios/${userData.id}`), { fotoUrl: novaUrl }),
        AsyncStorage.setItem("@Banzero:foto", novaUrl)
      ]);

      setUserData(prev => ({ ...prev, fotoUrl: novaUrl }));
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
        AsyncStorage.removeItem("@Banzero:foto")
      ]);
      setUserData(prev => ({ ...prev, fotoUrl: FOTO_DEFAULT }));
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
          await AsyncStorage.multiRemove(["@Banzero:token", "@Banzero:userId", "@Banzero:nome", "@Banzero:foto"]);
          onLogout();
        }
      }
    ]);
  };

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
        source={{
          html: MapaHTML(
            minhaLocation.latitude,
            minhaLocation.longitude,
            logoAsset,
            userData.nome,
            userData.fotoUrl,
            isDarkMode
          ),
        }}
        style={styles.map}
        onLoadEnd={() => ultimaLista && injetarNoMapa(ultimaLista)}
        onMessage={(event) => {
          const msg = event.nativeEvent.data;
          switch (msg) {
            case "logout": handleLogout(); break;
            case "trocarFoto": gerenciarFotoPerfil(); break;
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