import React, { useEffect, useRef, useState } from "react";
import { View, Image, StatusBar, Animated } from "react-native";
import { Asset } from "expo-asset";
import { styles } from "../styles/TelaSplash";

export default function TelaSplash({ navigation }: any) {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                await Asset.fromModule(require("../assets/logo.png")).downloadAsync();
            } catch (e) {
                console.warn(e);
            } finally {
                setIsReady(true);
            }
        }
        prepare();
    }, []);

    useEffect(() => {
        if (isReady) {
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                })
            ]).start();

            const timer = setTimeout(() => {
                navigation.replace("Login");
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [isReady, navigation]);

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            <Animated.View style={[
                styles.content,
                {
                    opacity: fadeAnim,
                    transform: [{ scale: scaleAnim }]
                }
            ]}>
                <Image
                    source={require("../assets/logo.png")}
                    style={styles.logoImage}
                    resizeMode="contain"
                />
            </Animated.View>
        </View>
    );
}