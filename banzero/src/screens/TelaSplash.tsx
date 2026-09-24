import React, { useEffect, useRef } from "react";
import { View, Image, StatusBar, Animated } from "react-native";
import { Asset } from "expo-asset";
import { styles } from "../styles/TelaSplash";

const LOGO_ASSET = require("../assets/logo.png");

interface TelaSplashProps {
    navigation?: any;
    onFinish?: () => void;
}

export default function TelaSplash({ navigation, onFinish }: TelaSplashProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;

    useEffect(() => {
        let isMounted = true;
        let timer: ReturnType<typeof setTimeout>;

        const animation = Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 4,
                useNativeDriver: true,
            }),
        ]);

        const inicializarSplash = async () => {
            try {
                await Asset.fromModule(LOGO_ASSET).downloadAsync();
            } catch (e) {
                console.warn(e);
            }

            if (!isMounted) return;

            animation.start();

            // Após o splash concluir a exibição, avisa o App.tsx para transicionar
            timer = setTimeout(() => {
                if (isMounted) {
                    if (onFinish) {
                        onFinish();
                    } else if (navigation?.replace) {
                        navigation.replace("Login");
                    }
                }
            }, 2500);
        };

        inicializarSplash();

        return () => {
            isMounted = false;
            animation.stop();
            if (timer) clearTimeout(timer);
        };
    }, [fadeAnim, scaleAnim, navigation, onFinish]);

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <Animated.View
                style={[
                    styles.content,
                    {
                        opacity: fadeAnim,
                        transform: [{ scale: scaleAnim }],
                    },
                ]}
            >
                <Image
                    source={LOGO_ASSET}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    );
}