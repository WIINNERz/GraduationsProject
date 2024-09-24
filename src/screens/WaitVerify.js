import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { auth } from '../configs/firebaseConfig';

const WaitVerify = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const { uid } = route.params || {};

    useFocusEffect(
        useCallback(() => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: 'none' }
            });

            return () => {
                navigation.getParent()?.setOptions({
                    tabBarStyle: [styles.tabBar, { backgroundColor: '#F0DFC8' }],
                });
            };
        }, [navigation])
    );

    useEffect(() => {
        const checkVerificationInterval = setInterval(async () => {
            const user = auth.currentUser;
            if (user) {
                await user.reload(); // Reload user data
                if (user.emailVerified) {
                    clearInterval(checkVerificationInterval); // Stop checking when verified
                    navigation.navigate('MyPetStack'); // Navigate to MyPetStack
                }
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(checkVerificationInterval); // Cleanup on unmount
    }, [navigation]);

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Please verify your email to continue.</Text>
            <ActivityIndicator size="large" color="#0000ff" />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        marginBottom: 20,
    },
});

export default WaitVerify;