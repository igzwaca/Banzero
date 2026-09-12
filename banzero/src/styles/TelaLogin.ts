import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFDEAD',
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
        backgroundColor: '#FFDEAD',
        padding: 22,
        borderRadius: 12,
        elevation: 5,
        shadowColor: '#5e3003',
        shadowOpacity: 0.15,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: 5 },
    },

    loginTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#5e3003',
        marginBottom: 20,
        textAlign: 'center',
    },

    inputEspacamento: {
        width: '100%',
        marginBottom: 15,
    },

    inputTextEmail: {
        height: 50,
        fontSize: 14,
        color: '#5e3003',
        paddingHorizontal: 12,
        borderRadius: 10,
        backgroundColor: '#FFF5E6',
        borderWidth: 1.5,
        borderColor: '#a0512da9',
    },

    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 50,
        borderRadius: 10,
        backgroundColor: '#FFF5E6',
        paddingHorizontal: 12,
        borderWidth: 1.5,
        borderColor: '#a0512da9',
    },

    inputSenha: {
        flex: 1,
        height: '100%',
        fontSize: 14,
        color: '#5e3003',
    },

    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginTop: 8,
    },

    forgotPassword: {
        fontSize: 12,
        fontWeight: '600',
        color: '#5e3003',
    },

    buttonEntrar: {
        backgroundColor: '#5e3003',
        width: '100%',
        height: 50,
        borderRadius: 12,
        marginTop: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOpacity: 0.2,
        shadowRadius: 4,
        borderWidth: 1.5,
        borderColor: '#eedfd89e',
    },

    buttonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },

    registerContainer: {
        marginTop: 12,
    },

    registerText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#5e3003',
        textAlign: 'center',
    },
});