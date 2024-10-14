import React ,{useState} from 'react';
import {View, Text, StyleSheet, Button} from 'react-native';
import 'react-native-get-random-values';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { TextEncoder, TextDecoder } from 'text-encoding';
import Keymanagement from '../components/Keymanagement';

const Pond = () => {
    const KeymanagementInstance = Keymanagement();
    const [number, setNumber] = useState(0);
    const [randomNumber, setRandomNumber] = useState(0);
    const generateKeyPair = async () => {
        try {
            const keyPairA = nacl.box.keyPair();
            const publicKeyA = encodeBase64(keyPairA.publicKey);
            const secretKeyA = encodeBase64(keyPairA.secretKey);
            console.log('Public Key:', publicKeyA);
            console.log('Secret Key:', secretKeyA);    
          } catch (error) {
            console.log('Could not generate key pair', error);
          }
    }
 

      
    return (
        <View style={styles.container}>
            <Button title="Generate Key Pair" onPress={readom6digit} />
            <Button title="Generate Secure Random ID" onPress={generateSecureRandomId} />
            <Text style={styles.text}>{number}</Text>
            <Text style={styles.text}>{randomNumber}</Text>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f8ff',
    },
    text: {
        fontSize: 20,
        color: '#333',
    },
});

export default Pond;