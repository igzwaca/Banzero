import { StyleSheet, TextStyle, ImageStyle } from "react-native";

// Centralização de tokens de design padronizados com o restante do app
const COLORS = {
    primary: '#5e3003',
    background: '#FFDEAD',
} as const;

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoImage: {
        width: 280,
        height: 220,
    } as ImageStyle,
    logoText: {
        fontSize: 42,
        fontWeight: 'bold',
        color: COLORS.primary,
        letterSpacing: 2,
    } as TextStyle,
});