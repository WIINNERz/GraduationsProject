import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { auth } from '../configs/firebaseConfig';

const WaitVerify = ({ route }) => {
    const navigation = useNavigation();

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
                await user.reload();
                if (user.emailVerified) {
                    clearInterval(checkVerificationInterval);
                }
            }
        }, 3000);

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