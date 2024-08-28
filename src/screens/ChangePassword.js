import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { auth } from '../configs/firebaseConfig';
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from 'firebase/auth';

const ChangePassword = ({ navigation }) => {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

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

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Error', 'No user found. Please sign in again.', [{ text: 'OK' }]);
            return;
        }

        if (newPassword !== confirmPassword) {
            Alert.alert('Error', 'New passwords do not match. Please try again.', [{ text: 'OK' }]);
            return;
        }

        const credential = EmailAuthProvider.credential(user.email, oldPassword);

        try {
            await reauthenticateWithCredential(user, credential);
            await updatePassword(user, newPassword);
            Alert.alert('Success', 'Password updated successfully!', [{ text: 'OK' }]);
            navigation.navigate('Profiles');
        } catch (error) {
            Alert.alert('Error', error.message, [{ text: 'OK' }]);
        }
    };

    return (
        <View style={{ backgroundColor: 'rgba(210, 124, 44, 0.5)', }}>
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <TouchableOpacity style={styles.topic} onPress={() => navigation.navigate('Profiles')}>
                        <Text style={styles.topic}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={styles.topic}>Password Change</Text>
                    <TouchableOpacity style={styles.topic} onPress={handleSave}>
                        <Text style={styles.topic}>Save</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.panel}>
                    <Text style={styles.header}>Old Password</Text>
                    <TextInput
                        placeholder='Old Password'
                        style={styles.input}
                        secureTextEntry
                        value={oldPassword}
                        onChangeText={setOldPassword}
                    />
                    <Text style={styles.header}>New Password</Text>
                    <TextInput
                        placeholder='New Password'
                        style={styles.input}
                        secureTextEntry
                        value={newPassword}
                        onChangeText={setNewPassword}
                    />
                    <Text style={styles.header}>Confirm New Password</Text>
                    <TextInput
                        placeholder='Confirm New Password'
                        style={styles.input}
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: '100%',
        marginTop: '10%',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        overflow: 'hidden',
        backgroundColor: '#F0DFC8',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 20,
        backgroundColor: '#D27C2C',
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
    },
    topic: {
        color: 'black',
        fontWeight: 'bold',
    },
    input: {
        backgroundColor: 'white',
        borderRadius: 10,
        marginVertical: 20,
        paddingHorizontal: 10,
    },
    panel: {
        backgroundColor: '#F0DFC8',
        padding: 20,
        margin: 10,
        borderRadius: 15,
        justifyContent: 'center',
        alignContent: 'center',
    },
    header: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
    },
    tabBar: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: "8%", 
        position: 'absolute',
        overflow: 'hidden',
      },
});

export default ChangePassword;
