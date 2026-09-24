import { StyleSheet, ViewStyle, TextStyle } from "react-native";

// Centralização da paleta para facilitar manutenção e evitar repetições
const COLORS = {
    primary: '#5e3003',
    background: '#FFDEAD',
    inputBackground: '#FFF5E6',
    border: '#a0512da9',
    buttonBorder: '#eedfd89e',
    white: '#FFFFFF',
    shadowDark: '#000000',
} as const;

// Estilo base compartilhado entre inputs normais e container de senha
const baseInputStyle: ViewStyle = {
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.inputBackground,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
};

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },

    logoImage: {
        width: 220,
        height: 180,
        marginBottom: 10,
    },

    formContainer: {
        width: '88%',
        backgroundColor: COLORS.background,
        padding: 22,
        borderRadius: 12,
        elevation: 5,
        shadowColor: COLORS.primary,
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },

    loginTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: COLORS.primary,
        marginBottom: 20,
        textAlign: 'center',
    },

    inputEspacamento: {
        width: '100%',
        marginBottom: 15,
    },

    inputsNomeEmail: {
        ...baseInputStyle,
        fontSize: 14,
        color: COLORS.primary,
    } as TextStyle,

    passwordContainer: {
        ...baseInputStyle,
        flexDirection: 'row',
        alignItems: 'center',
    },

    inputSenha: {
        flex: 1,
        height: '100%',
        fontSize: 14,
        color: COLORS.primary,
        paddingVertical: 0, // Previne que o Android corte ou desalinhe o texto internamente
    },

    buttonEntrar: {
        backgroundColor: COLORS.primary,
        width: '100%',
        height: 50,
        borderRadius: 12,
        marginTop: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: COLORS.shadowDark,
        shadowOffset: { width: 0, height: 2 }, // Garante que a sombra fique idêntica ao Android no iOS
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 1.5,
        borderColor: COLORS.buttonBorder,
    },

    buttonText: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
    },

    registerContainer: {
        marginTop: 12,
    },

    registerText: {
        fontSize: 13,
        fontWeight: '600',
        color: COLORS.primary,
        textAlign: 'center',
    },
});