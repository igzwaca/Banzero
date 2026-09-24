import React, { useState, useEffect, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AsyncStorage from "@react-native-async-storage/async-storage";

import TelaSplash from "./src/screens/TelaSplash";
import TelaApp from "./src/screens/TelaApp";
import TelaLogin from "./src/screens/TelaLogin";
import TelaCadastro from "./src/screens/TelaCadastro";
import TelaRecuperar from "./src/screens/TelaRecuperar";
import TelaTrocarSenha from "./src/screens/TelaTrocarSenha";

const Stack = createNativeStackNavigator();

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    const carregarDadosSessao = async () => {
      try {
        // 🚨 SE QUISER FORÇAR O LOGIN UMA VEZ PARA TESTAR, DESCOMENTE A LINHA ABAIXO:
        // await AsyncStorage.clear();

        const token = await AsyncStorage.getItem("@Banzero:token");
        console.log(">>> TOKEN ENCONTRADO NO APARELHO:", token);

        if (token && token.trim() !== "" && token !== "null" && token !== "undefined") {
          setUserToken(token);
        } else {
          setUserToken(null);
        }
      } catch (e) {
        console.error("Erro ao carregar token", e);
        setUserToken(null);
      } finally {
        // Garante que o splash saia após 2.5s caso o TelaSplash não chame onFinish
        setTimeout(() => setIsLoading(false), 2500);
      }
    };

    carregarDadosSessao();
  }, []);

  const handleLoginSuccess = useCallback((token: string) => {
    setUserToken(token);
  }, []);

  const handleLogout = useCallback(async () => {
    await AsyncStorage.multiRemove(["@Banzero:token", "@Banzero:userId", "@Banzero:nome", "@Banzero:foto"]);
    setUserToken(null);
  }, []);

  if (isLoading) {
    return <TelaSplash onFinish={() => setIsLoading(false)} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: "fade",
          animationDuration: 400,
        }}
      >
        {!userToken ? (
          // Se NÃO houver token salvo -> Tela de Login
          <>
            <Stack.Screen name="Login">
              {(props) => <TelaLogin {...props} onLoginSuccess={handleLoginSuccess} />}
            </Stack.Screen>
            <Stack.Screen name="Cadastro" component={TelaCadastro} />
            <Stack.Screen name="Recuperar" component={TelaRecuperar} />
            <Stack.Screen name="Trocar" component={TelaTrocarSenha} />
          </>
        ) : (
          // Se HOUVER token salvo -> Tela Principal
          <Stack.Screen name="App">
            {(props) => <TelaApp {...props} onLogout={handleLogout} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}