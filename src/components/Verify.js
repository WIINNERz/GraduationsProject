import {View, Text, StyleSheet, TextInput, Button, Alert} from 'react-native';
import React from 'react';
import Aes from 'react-native-aes-crypto';
import {useState} from 'react';
import {auth, firestore} from '../configs/firebaseConfig';
import {getDocs, doc, updateDoc , collection } from 'firebase/firestore';

import * as Keychain from 'react-native-keychain';
import Keymanagement from './Keymanagement';


const Verify = () => {
    const [id, setId] = useState('');
    

    // retrieve key example
    // async function retrievekey() {
    //     try {
    //     const KeymanagementInstance = Keymanagement();
    //     const key = await KeymanagementInstance.retrievekey();
    //     }
    //     catch (error) {
    //         console.error(error);
    //         return null;
    //     }
    //   }


    const validateThaiId = async id => {
        const thaiIdInput = id;
        const m = thaiIdInput.match(/(\d{12})(\d)/);
        if (!m) {
            Alert.alert('Thai ID must be 13 digits');
            return;
        }
        const digits = m[1].split('');
        const sum = digits.reduce((total, digit, i) => {
            return total + (13 - i) * +digit;
        }, 0);
        const lastDigit = `${(11 - (sum % 11)) % 10}`;
        const inputLastDigit = m[2];
        if (lastDigit !== inputLastDigit) {
            Alert.alert('Thai ID is invalid');
            return;
        }
        try {
            const hash = await Aes.sha256(thaiIdInput);
            console.log('hash=', hash);
            const encryptedHash = Crypto.AES.encrypt(hash , 'secret key 123').toString();

            const usersSnapshot = await getDocs(collection(firestore, 'Users'));
            let hashExists = false;

            usersSnapshot.forEach(userDoc => {
                const userData = userDoc.data();
                if (userData.hashedID === hash) {
                    hashExists = true;
                }
            });

            if (hashExists) {
                Alert.alert('This ID card number has already been used.');
            } else {
                // const auth = getAuth();
                const currentUser = auth.currentUser;

                if (currentUser) {
                    const userRef = doc(firestore, 'Users', currentUser.uid);
                    await updateDoc(userRef, {
                        verify: true,
                        hashedID: hash
                    });
                    console.log(`Updated user ${currentUser.uid}`);
                } else {
                    Alert.alert('No user is currently signed in.');
                }
            }
        } catch (error) {
            Alert.alert(error.message);
        }
    };

    return (
        <View style={styles.screen}>
            <View style={styles.container}>
                <Text style={styles.title}>Verify Your Account</Text>
                <TextInput
                    placeholder="Enter Thai ID"
                    onChangeText={text => setId(text)}
                />
                 <Button title="Submit" onPress={() => validateThaiId(id)} /> 
                 <Button title="getkey" onPress={() => retrievekey()}/> 
                
            </View>
        </View>
    );
};
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#D27C2C',
    justifyContent: 'center',
  },
    container: {
        margin: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 10,
        elevation: 4,
    },
    title: {
        fontSize: 20,
        fontFamily: 'InterBold',
        color: '#000',
        marginBottom: 20,
        textAlign: 'center',
    },
});

// Credit https://medium.com/@peatiscoding/validate-thai-citizen-id-7c980454c444
export default Verify;