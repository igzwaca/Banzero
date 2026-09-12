import React, { useState, useCallback } from 'react';
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

    const [form, setForm] = useState({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: ""
    });

    const atualizarCampo = (campo: string, valor: string) => {
        setForm(prev => ({ ...prev, [campo]: valor }));
    };

    const cadastrar = async () => {
        const { nome, email, senha, confirmarSenha } = form;

        if (!nome || !email || !senha || !confirmarSenha) {
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
            const emailFormatado = email.trim().toLowerCase();

            const consultaEmail = query(usuariosRef, orderByChild("email"), equalTo(emailFormatado));
            const snapshot = await get(consultaEmail);

            if (snapshot.exists()) {
                Alert.alert("Erro", "Este email já está cadastrado!");
                setCarregando(false);
                return;
            }

            const novoUsuarioRef = push(usuariosRef);
            await set(novoUsuarioRef, {
                nome,
                email: emailFormatado,
                senha
            });

            Alert.alert("Sucesso", "Cadastro realizado com sucesso!", [
                { text: "OK", onPress: () => navigation.navigate('Login') }
            ]);

        } catch (error: any) {
            Alert.alert("Erro ao cadastrar", error.message);
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
                <Text style={styles.loginTitle}>FAÇA SEU CADASTRO</Text>

                <View style={styles.inputEspacamento}>
                    <TextInput
                        style={styles.inputsNomeEmail}
                        placeholder="NOME COMPLETO"
                        placeholderTextColor="#000"
                        value={form.nome}
                        onChangeText={(v) => atualizarCampo('nome', v)}
                    />
                </View>

                <View style={styles.inputEspacamento}>
                    <TextInput
                        style={styles.inputsNomeEmail}
                        placeholder="E-MAIL"
                        placeholderTextColor="#000"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={form.email}
                        onChangeText={(v) => atualizarCampo('email', v)}
                    />
                </View>

                <View style={styles.inputEspacamento}>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.inputSenha}
                            placeholder="SENHA"
                            placeholderTextColor="#000"
                            secureTextEntry={!verSenha}
                            value={form.senha}
                            onChangeText={(v) => atualizarCampo('senha', v)}
                        />
                        <TouchableOpacity onPress={() => setVerSenha(!verSenha)}>
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
                            style={styles.inputSenha}
                            placeholder="CONFIRME SUA SENHA"
                            placeholderTextColor="#000"
                            secureTextEntry={!verSenha}
                            value={form.confirmarSenha}
                            onChangeText={(v) => atualizarCampo('confirmarSenha', v)}
                        />
                        <TouchableOpacity onPress={() => setVerSenha(!verSenha)}>
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