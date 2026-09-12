import React, { useState, useEffect } from "react";
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
        const token = await AsyncStorage.getItem("@Banzero:token");
        setUserToken(token);
      } catch (e) {
        console.error("Erro ao carregar token", e);
      } finally {
        setTimeout(() => setIsLoading(false), 2000);
      }
    };

    carregarDadosSessao();
  }, []);

  if (isLoading) {
    return <TelaSplash />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          animationDuration: 500
        }}
      >
        {userToken == null ? (
          <>
            <Stack.Screen name="Login">
              {(props) => <TelaLogin {...props} onLoginSuccess={(token: any) => setUserToken(token)} />}
            </Stack.Screen>
            <Stack.Screen name="Cadastro" component={TelaCadastro} />
            <Stack.Screen name="Recuperar" component={TelaRecuperar} />
            <Stack.Screen name="Trocar" component={TelaTrocarSenha} />
          </>
        ) : (
          <Stack.Screen name="App">
            {(props) => <TelaApp {...props} onLogout={() => setUserToken(null)} />}
          </Stack.Screen>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}