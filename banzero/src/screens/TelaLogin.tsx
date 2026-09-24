import React, { useState, useRef, useEffect, useCallback } from 'react';
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

    const senhaInputRef = useRef<TextInput>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const toggleVerSenha = useCallback(() => {
        setVerSenha(prev => !prev);
    }, []);

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
                    // Gravação atômica em lote (1 única chamada nativa em vez de 4 separadas)
                    await AsyncStorage.multiSet([
                        ["@Banzero:token", userId],
                        ["@Banzero:userId", userId],
                        ["@Banzero:nome", usuarioDB.nome || "Usuário"],
                        ["@Banzero:foto", usuarioDB.fotoUrl || ""]
                    ]);

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
            if (isMountedRef.current) {
                setCarregando(false);
            }
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
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="next"
                        onSubmitEditing={() => senhaInputRef.current?.focus()}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputEspacamento}>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={senhaInputRef}
                            style={styles.inputSenha}
                            placeholder="SENHA"
                            placeholderTextColor="#000"
                            secureTextEntry={!verSenha}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password"
                            textContentType="password"
                            returnKeyType="done"
                            onSubmitEditing={login}
                            value={senha}
                            onChangeText={setSenha}
                        />
                        <TouchableOpacity 
                            onPress={toggleVerSenha}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
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
                    activeOpacity={0.8}
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