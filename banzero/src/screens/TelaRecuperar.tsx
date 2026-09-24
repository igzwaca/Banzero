import React, { useState, useRef, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
    SafeAreaView,
    Text,
    View,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
    ActivityIndicator
} from 'react-native';
import { styles } from '../styles/TelaRecuperar';
import { ref, get, set, query, orderByChild, equalTo } from "firebase/database";
import { db } from "../services/Firebase";
import emailjs from 'emailjs-com';

// Centralização de constantes fora do ciclo de renderização
const EMAILJS_CONFIG = {
    SERVICE_ID: 'service_qvq4inr',
    TEMPLATE_ID: 'template_sgb73ot',
    PUBLIC_KEY: 'NjOwSMElhQFUf380u',
};

const TEMPO_EXPIRACAO_CODIGO_MS = 5 * 60 * 1000; // 5 minutos (300.000 ms)

export default function RecuperarScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [carregando, setCarregando] = useState(false);
    const isMountedRef = useRef(true);

    useEffect(() => {
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    const enviarCodigo = async () => {
        const emailFormatado = email.trim().toLowerCase();

        if (!emailFormatado) {
            Alert.alert("Atenção", "Por favor, insira o seu e-mail.");
            return;
        }

        setCarregando(true);

        try {
            const usuariosRef = ref(db, "Usuarios");
            const consulta = query(usuariosRef, orderByChild("email"), equalTo(emailFormatado));
            const snapshot = await get(consulta);

            if (!snapshot.exists()) {
                Alert.alert("Aviso", "Este e-mail não foi encontrado em nossa base.");
                return; // O bloco finally já executa setCarregando(false)
            }

            const dados = snapshot.val();
            const userId = Object.keys(dados)[0];
            const nomeUsuario = dados[userId]?.nome || "Usuário";

            const codigo = Math.floor(100000 + Math.random() * 900000);
            const emailKey = emailFormatado.replace(/\./g, "_");

            // Grava o código temporário no Firebase
            await set(ref(db, `codigos/${emailKey}`), {
                codigo: codigo,
                expira: Date.now() + TEMPO_EXPIRACAO_CODIGO_MS
            });

            // Dispara o e-mail via EmailJS
            await emailjs.send(
                EMAILJS_CONFIG.SERVICE_ID,
                EMAILJS_CONFIG.TEMPLATE_ID,
                {
                    user_name: nomeUsuario,
                    email: emailFormatado,
                    codigo: codigo
                },
                EMAILJS_CONFIG.PUBLIC_KEY
            );

            if (isMountedRef.current) {
                Alert.alert(
                    "Sucesso",
                    "Código de recuperação enviado para o seu e-mail!",
                    [{ 
                        text: "Entendido", 
                        onPress: () => navigation.replace("Trocar", { email: emailFormatado }) 
                    }]
                );
            }

        } catch (error: any) {
            if (isMountedRef.current) {
                Alert.alert("Erro", "Falha ao enviar o código de recuperação: " + (error?.message || ""));
            }
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
                <Text style={styles.loginTitle}>RECUPERAR SENHA</Text>

                <View style={styles.inputEspacamento}>
                    <TextInput
                        style={styles.inputEmail}
                        placeholder="E-MAIL"
                        placeholderTextColor="#000"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoCorrect={false}
                        autoComplete="email"
                        textContentType="emailAddress"
                        returnKeyType="done"
                        onSubmitEditing={enviarCodigo}
                        value={email}
                        onChangeText={setEmail}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.buttonEntrar, carregando && { opacity: 0.7 }]}
                    onPress={enviarCodigo}
                    disabled={carregando}
                    activeOpacity={0.8}
                >
                    {carregando ? (
                        <ActivityIndicator color="#FFF" />
                    ) : (
                        <Text style={styles.buttonText}>ENVIAR</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    activeOpacity={0.6}
                >
                    <Text style={styles.backButtonText}>Voltar para o Login</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}