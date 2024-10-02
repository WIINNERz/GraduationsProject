import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Button,
  TextInput,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import E2EE from '../components/E2EE';

const Location = ({navigation}) => {
  const [tel, setTel] = useState('');
  const [encryptedTel, setEncryptedTel] = useState('');
  const [telNonce, setTelNonce] = useState('');
  const [decryptedTel, setDecryptedTel] = useState('');
  const ee2e = E2EE();
  const sharedSecret = 'b3SIJ9NIA4KsRU/bDSusIBfO+1YaOFWdn8q0nQzdkfY=';
  // const test = async () => {
  //   try {
  //   const ee2e = E2EE();
  //   await ee2e.generateKeyPair();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }
  const enc = async () => {
    try {
      const encrypted = ee2e.encryptMessage(sharedSecret, tel);
      setEncryptedTel(encrypted.cipherText);
      setTelNonce(encrypted.nonce);
     
    } catch (error) {
      console.log(error);
    }
  };
  const dec = async () => {
    try {
      const decrypted = ee2e.decryptMessage(
        sharedSecret,
        encryptedTel,
        telNonce,
      );
      setDecryptedTel(decrypted);
    } catch (error) {
      console.log(error);
    }
  }
  return (
    <View style={styles.screen}>
      <MaterialCommunityIcons
        name="arrow-left"
        size={30}
        style={styles.back}
        onPress={() => navigation.goBack()}
      />
      <View>
        <TextInput
          onChangeText={text => setTel(text)}
          placeholder="Enter tel key"
        />
        <Button title="test enc" onPress={enc} />
        <Button title="test dec" onPress={dec} />
        <Text>Encrypted Telephone Number: {encryptedTel}</Text>
        <Text>Nonce: {telNonce}</Text>
        <Text>Decrypted Telephone Number: {decryptedTel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  back: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
});

export default Location;
