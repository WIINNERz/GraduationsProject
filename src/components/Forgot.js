import React, { useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, TextInput, TouchableOpacity } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../config/firebaseconfig";

const Forgot = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleForgot = async () => {
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            alert("Reset email sent to " + email);
        } catch (e) {
            console.log(e);
            alert("Error sending reset email: " + e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={{ paddingTop: 50 }}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    accessible={true}
                    accessibilityLabel="Back Button"
                >
                    <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
                </TouchableOpacity>
            </View>
            <View style={styles.formContainer}>
            <Text style={{opacity:0.6}}>    Please Enter your email and we will send you instructions on how to reset your password.</Text>
                <View style={styles.inputContainer}>
                    <TextInput
                        style={styles.inputStyle}
                        autoCorrect={false}
                        placeholder="Email"
                        autoCapitalize='none'
                        value={email}
                        onChangeText={(value) => setEmail(value)}
                    />
                    <MaterialCommunityIcons
                        name='email-outline'
                        color='#000'
                        size={20}
                        style={styles.iconStyle}
                    />
                </View>
                <TouchableOpacity
                    onPress={handleForgot}
                    style={styles.loginButton}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.loginButtonText}> Reset Password</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        marginLeft:20,
        marginBottom: 20,
    },
    formContainer: {
        width: '80%',
        margin: 'auto',
        paddingTop:'70%'
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    inputStyle: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderRadius: 50,
        borderWidth: 1,
        paddingLeft: 50,
    },
    iconStyle: {
        position: 'absolute',
        left: 20,
        top: 10,
    },
    iconButton: {
        position: 'absolute',
        right: 20,
    },
    loginButton: {
        backgroundColor: '#E16539',
        width: '100%',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 50,
    },
    loginButtonText: {
        color: '#fff',
    },
    errorText: {
        color: 'red',
        marginBottom: 10,
        textAlign: 'center',
    },
    forgotPassword: {
        marginVertical: 10,
        textAlign: 'right',
    },
});
export default Forgot;
