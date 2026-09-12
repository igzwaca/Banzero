import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { db } from "../services/Firebase";
import { ref, get, update, remove, query, orderByChild, equalTo } from "firebase/database";
import { styles } from '../styles/TelaTrocarSenha';
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

export default function TrocarSenhaScreen({ navigation, route }: any) {
    const [verSenha, setVerSenha] = useState(false);
    const [loading, setLoading] = useState(false);

    const [email, setEmail] = useState(route.params?.email || "");
    const [codigo, setCodigo] = useState("");
    const [novaSenha, setNovaSenha] = useState("");

    const alterarSenha = async () => {
        const emailFormatado = email.trim().toLowerCase();

        if (!emailFormatado || !codigo || !novaSenha) {
            Alert.alert("Atenção", "Preencha todos os campos");
            return;
        }

        setLoading(true);

        try {
            const emailKey = emailFormatado.replace(/\./g, "_");
            const codigoRef = ref(db, "codigos/" + emailKey);
            const snapshotCodigo = await get(codigoRef);

            if (!snapshotCodigo.exists()) {
                Alert.alert("Erro", "Código não encontrado ou e-mail inválido.");
                setLoading(false);
                return;
            }

            const dadosCodigo = snapshotCodigo.val();

            if (Date.now() > dadosCodigo.expira) {
                Alert.alert("Erro", "Este código expirou.");
                await remove(codigoRef);
                setLoading(false);
                return;
            }

            if (parseInt(codigo) !== dadosCodigo.codigo) {
                Alert.alert("Erro", "Código incorreto.");
                setLoading(false);
                return;
            }

            const usuariosRef = ref(db, "Usuarios");
            const consultaUsuario = query(usuariosRef, orderByChild("email"), equalTo(emailFormatado));
            const snapshotUsuarios = await get(consultaUsuario);

            if (!snapshotUsuarios.exists()) {
                Alert.alert("Erro", "Usuário não encontrado.");
                setLoading(false);
                return;
            }

            const usuarioKey = Object.keys(snapshotUsuarios.val())[0];

            await update(ref(db, `Usuarios/${usuarioKey}`), {
                senha: novaSenha
            });

            await remove(codigoRef);

            Alert.alert("Sucesso", "Sua senha foi alterada com sucesso!", [
                {
                    text: "Fazer Login",
                    onPress: () => navigation.reset({
                        index: 0,
                        routes: [{ name: 'Login' }],
                    })
                }
            ]);

        } catch (error: any) {
            Alert.alert("Erro", "Ocorreu um erro técnico: " + error.message);
        } finally {
            setLoading(false);
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
                <Text style={styles.loginTitle}>NOVA SENHA</Text>

                <View style={styles.inputEspacamento}>
                    <TextInput
                        style={styles.inputsNomeEmail}
                        placeholder="E-MAIL"
                        placeholderTextColor="#000"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputEspacamento}>
                    <TextInput
                        style={styles.inputsNomeEmail}
                        placeholder="CÓDIGO DE 6 DÍGITOS"
                        placeholderTextColor="#000"
                        keyboardType="numeric"
                        maxLength={6}
                        value={codigo}
                        onChangeText={setCodigo}
                    />
                </View>

                <View style={styles.inputEspacamento}>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.inputSenha}
                            placeholder="NOVA SENHA"
                            placeholderTextColor="#000"
                            secureTextEntry={!verSenha}
                            value={novaSenha}
                            onChangeText={setNovaSenha}
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
                    style={[styles.buttonEntrar, loading && { opacity: 0.7 }]}
                    onPress={alterarSenha}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>ALTERAR SENHA</Text>
                    )}
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}