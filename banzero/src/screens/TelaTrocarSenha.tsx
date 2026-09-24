import React, { useState, useRef, useEffect, useCallback } from 'react';
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

    const codigoInputRef = useRef<TextInput>(null);
    const novaSenhaInputRef = useRef<TextInput>(null);
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const toggleVerSenha = useCallback(() => {
        setVerSenha(prev => !prev);
    }, []);

    const alterarSenha = async () => {
        const emailFormatado = email.trim().toLowerCase();
        const codigoLimpo = codigo.trim();

        if (!emailFormatado || !codigoLimpo || !novaSenha) {
            Alert.alert("Atenção", "Preencha todos os campos");
            return;
        }

        setLoading(true);

        try {
            const emailKey = emailFormatado.replace(/\./g, "_");
            const codigoRef = ref(db, `codigos/${emailKey}`);
            const snapshotCodigo = await get(codigoRef);

            if (!snapshotCodigo.exists()) {
                Alert.alert("Erro", "Código não encontrado ou e-mail inválido.");
                return; // O bloco finally já cuidará do setLoading(false)
            }

            const dadosCodigo = snapshotCodigo.val();

            if (Date.now() > dadosCodigo.expira) {
                Alert.alert("Erro", "Este código expirou.");
                await remove(codigoRef);
                return;
            }

            if (parseInt(codigoLimpo, 10) !== dadosCodigo.codigo) {
                Alert.alert("Erro", "Código incorreto.");
                return;
            }

            const usuariosRef = ref(db, "Usuarios");
            const consultaUsuario = query(usuariosRef, orderByChild("email"), equalTo(emailFormatado));
            const snapshotUsuarios = await get(consultaUsuario);

            if (!snapshotUsuarios.exists()) {
                Alert.alert("Erro", "Usuário não encontrado.");
                return;
            }

            const usuarioKey = Object.keys(snapshotUsuarios.val())[0];

            // Atualiza a nova senha e descarta o código de recuperação usado
            await Promise.all([
                update(ref(db, `Usuarios/${usuarioKey}`), { senha: novaSenha }),
                remove(codigoRef)
            ]);

            if (isMountedRef.current) {
                Alert.alert("Sucesso", "Sua senha foi alterada com sucesso!", [
                    {
                        text: "Fazer Login",
                        onPress: () => navigation.reset({
                            index: 0,
                            routes: [{ name: 'Login' }],
                        })
                    }
                ]);
            }

        } catch (error: any) {
            if (isMountedRef.current) {
                Alert.alert("Erro", "Ocorreu um erro técnico: " + (error?.message || ""));
            }
        } finally {
            if (isMountedRef.current) {
                setLoading(false);
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
                <Text style={styles.loginTitle}>NOVA SENHA</Text>

                <View style={styles.inputEspacamento}>
                    <TextInput
                        style={styles.inputsNomeEmail}
                        placeholder="E-MAIL"
                        placeholderTextColor="#000"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="next"
                        onSubmitEditing={() => codigoInputRef.current?.focus()}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <View style={styles.inputEspacamento}>
                    <TextInput
                        ref={codigoInputRef}
                        style={styles.inputsNomeEmail}
                        placeholder="CÓDIGO DE 6 DÍGITOS"
                        placeholderTextColor="#000"
                        keyboardType="numeric"
                        maxLength={6}
                        returnKeyType="next"
                        onSubmitEditing={() => novaSenhaInputRef.current?.focus()}
                        value={codigo}
                        onChangeText={setCodigo}
                    />
                </View>

                <View style={styles.inputEspacamento}>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            ref={novaSenhaInputRef}
                            style={styles.inputSenha}
                            placeholder="NOVA SENHA"
                            placeholderTextColor="#000"
                            secureTextEntry={!verSenha}
                            autoCapitalize="none"
                            autoCorrect={false}
                            autoComplete="password-new"
                            textContentType="newPassword"
                            returnKeyType="done"
                            onSubmitEditing={alterarSenha}
                            value={novaSenha}
                            onChangeText={setNovaSenha}
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
                </View>

                <TouchableOpacity
                    style={[styles.buttonEntrar, loading && { opacity: 0.7 }]}
                    onPress={alterarSenha}
                    disabled={loading}
                    activeOpacity={0.8}
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