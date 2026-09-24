import React, { useState, useCallback, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { db } from "../services/Firebase";
import { ref, push, set, get, query, orderByChild, equalTo } from "firebase/database";
import { styles } from '../styles/TelaCadastro';
import {
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    SafeAreaView,
    Alert,
    ActivityIndicator
} from 'react-native';

export default function CadastroScreen({ navigation }: any) {
    const [verSenha, setVerSenha] = useState(false);
    const [carregando, setCarregando] = useState(false);

    // Refs para navegação suave entre os campos pelo teclado
    const emailRef = useRef<TextInput>(null);
    const senhaRef = useRef<TextInput>(null);
    const confirmarSenhaRef = useRef<TextInput>(null);
    const isMountedRef = useRef(true);

    const [form, setForm] = useState({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: ""
    });

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // Evita recriação desnecessária da função a cada render
    const atualizarCampo = useCallback((campo: keyof typeof form, valor: string) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    }, []);

    const toggleVerSenha = useCallback(() => {
        setVerSenha(prev => !prev);
    }, []);

    const cadastrar = async () => {
        const nomeFormatado = form.nome.trim();
        const emailFormatado = form.email.trim().toLowerCase();
        const { senha, confirmarSenha } = form;

        // Validação com trim para evitar cadastros com apenas espaços
        if (!nomeFormatado || !emailFormatado || !senha || !confirmarSenha) {
            Alert.alert("Erro", "Preencha todos os campos.");
            return;
        }

        if (senha !== confirmarSenha) {
            Alert.alert("Erro", "As senhas não coincidem.");
            return;
        }

        setCarregando(true);

        try {
            const usuariosRef = ref(db, "Usuarios");
            const consultaEmail = query(usuariosRef, orderByChild("email"), equalTo(emailFormatado));
            const snapshot = await get(consultaEmail);

            if (snapshot.exists()) {
                Alert.alert("Erro", "Este email já está cadastrado!");
                return; // O bloco finally já cuidará do setCarregando(false)
            }

            const novoUsuarioRef = push(usuariosRef);
            await set(novoUsuarioRef, {
                nome: nomeFormatado,
                email: emailFormatado,
                senha
            });

            Alert.alert("Sucesso", "Cadastro realizado com sucesso!", [
                { text: "OK", onPress: () => navigation.navigate('Login') }
            ]);

        } catch (error: any) {
            Alert.alert("Erro ao cadastrar", error?.message || "Ocorreu um erro inesperado.");
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
                <Text style={styles.loginTitle}>FAÇA SEU CADASTRO</Text>

                <View style={styles.inputEspacamento}>
                    <TextInput
                        style={styles.inputsNomeEmail}
                        placeholder="NOME COMPLETO"
                        placeholderTextColor="#000"
                        autoCapitalize="words"
                        autoCorrect={false}
                        returnKeyType="next"
                        onSubmitEditing={() => emailRef.current?.focus()}
                        value={form.nome}
                        onChangeText={(v) => atualizarCampo('nome', v)}
                    />
                </View>

                <View style={styles.inputEspacamento}>
                    <TextInput
                        ref={emailRef}
                        style={styles.inputsNomeEmail}
                        placeholder="E-MAIL"
                        placeholderTextColor="#000"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="next"
                        onSubmitEditing={() => senhaRef.current?.focus()}
                        value={form.email}
                        onChangeText={(v) => atualizarCampo('email', v)}
                    />
                </View>

                <View style={styles.inputEspacamento}>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={senhaRef}
                            style={styles.inputSenha}
                            placeholder="SENHA"
                            placeholderTextColor="#000"
                            secureTextEntry={!verSenha}
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="newPassword"
                            returnKeyType="next"
                            onSubmitEditing={() => confirmarSenhaRef.current?.focus()}
                            value={form.senha}
                            onChangeText={(v) => atualizarCampo('senha', v)}
                        />
                        <TouchableOpacity onPress={toggleVerSenha} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons
                                name={verSenha ? "eye-outline" : "eye-off-outline"}
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.inputEspacamento}>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={confirmarSenhaRef}
                            style={styles.inputSenha}
                            placeholder="CONFIRME SUA SENHA"
                            placeholderTextColor="#000"
                            secureTextEntry={!verSenha}
                            autoCapitalize="none"
                            autoCorrect={false}
                            textContentType="newPassword"
                            returnKeyType="done"
                            onSubmitEditing={cadastrar}
                            value={form.confirmarSenha}
                            onChangeText={(v) => atualizarCampo('confirmarSenha', v)}
                        />
                        <TouchableOpacity onPress={toggleVerSenha} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                            <Ionicons
                                name={verSenha ? "eye-outline" : "eye-off-outline"}
                                size={24}
                                color="black"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.buttonEntrar, carregando && { opacity: 0.7 }]}
                    onPress={cadastrar}
                    disabled={carregando}
                    activeOpacity={0.8}
                >
                    {carregando ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>CADASTRAR</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}