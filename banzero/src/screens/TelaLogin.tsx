import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from "../services/Firebase";
import { ref, get, query, orderByChild, equalTo } from "firebase/database";
import { styles } from '../styles/TelaLogin';
import {
    SafeAreaView,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert
} from 'react-native';

export default function LoginScreen({ navigation, onLoginSuccess }: any) {
    const [verSenha, setVerSenha] = useState(false);
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [carregando, setCarregando] = useState(false);

    const login = async () => {
        const emailFormatado = email.trim().toLowerCase();

        if (!emailFormatado || !senha) {
            Alert.alert("Atenção", "Preencha todos os campos");
            return;
        }

        setCarregando(true);

        try {
            const usuariosRef = ref(db, "Usuarios");
            const consulta = query(usuariosRef, orderByChild("email"), equalTo(emailFormatado));
            const snapshot = await get(consulta);

            if (snapshot.exists()) {
                const dadosFirebase = snapshot.val();
                const userId = Object.keys(dadosFirebase)[0];
                const usuarioDB = dadosFirebase[userId];   

                if (usuarioDB.senha === senha) {
                    await AsyncStorage.setItem("@Banzero:token", userId);
                    await AsyncStorage.setItem("@Banzero:userId", userId);
                    await AsyncStorage.setItem("@Banzero:nome", usuarioDB.nome || "Usuário");
                    await AsyncStorage.setItem("@Banzero:foto", usuarioDB.fotoUrl || "");

                    onLoginSuccess(userId);

                } else {
                    Alert.alert("Erro", "Senha incorreta");
                }
            } else {
                Alert.alert("Erro", "E-mail não encontrado");
            }
        } catch (error: any) {
            console.error(error);
            Alert.alert("Erro de Conexão", "Não foi possível conectar ao servidor.");
        } finally {
            setCarregando(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar style="dark" />

            <View style={styles.logoContainer}>
                <Image
                    source={require("../assets/logo.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.loginTitle}>LOGIN</Text>

                <View style={styles.inputEspacamento}>
                    <TextInput
                        style={styles.inputTextEmail}
                        placeholder="E-MAIL"
                        placeholderTextColor="#000"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputEspacamento}>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.inputSenha}
                            placeholder="SENHA"
                            placeholderTextColor="#000"
                            secureTextEntry={!verSenha}
                            value={senha}
                            onChangeText={setSenha}
                        />
                        <TouchableOpacity onPress={() => setVerSenha(!verSenha)}>
                            <Ionicons
                                name={verSenha ? "eye-outline" : "eye-off-outline"}
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Recuperar')}
                        style={styles.forgotPasswordContainer}
                    >
                        <Text style={styles.forgotPassword}>Esqueceu sua senha?</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[styles.buttonEntrar, carregando && { opacity: 0.7 }]}
                    onPress={login}
                    disabled={carregando}
                >
                    {carregando ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>ENTRAR</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.registerContainer}
                    onPress={() => navigation.navigate('Cadastro')}
                >
                    <Text style={styles.registerText}>Não possui cadastro?</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}