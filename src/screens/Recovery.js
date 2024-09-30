import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Button,
  Alert,
  TouchableOpacity,
} from 'react-native';
import React, { useState } from 'react';
import { auth, firestore } from '../configs/firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import Keymanagement from '../components/Keymanagement';
import Aes from 'react-native-aes-crypto';
const Recovery = () => {
  const navigate = useNavigation();
  const [passwordLog, setPasswordLog] = useState('');
  const [id, setId] = useState('');

  const recovery = async (id, passwordLog) => {
    const thaiIdInput = id;
    const m = thaiIdInput.match(/(\d{12})(\d)/);
    if (!m) {
      Alert.alert('Error', 'Thai ID must be 13 digits');
      return;
    }
    const digits = m[1].split('');
    const sum = digits.reduce((total, digit, i) => {
      return total + (13 - i) * +digit;
    }, 0);
    const lastDigit = `${(11 - (sum % 11)) % 10}`;
    const inputLastDigit = m[2];
    if (lastDigit !== inputLastDigit) {
      Alert.alert('Error', 'Thai ID is invalid');
      return;
    }
    try {
      const keyinstance = Keymanagement();
      const currentUser = auth.currentUser;
      const hash = await Aes.sha256(id);
      const userRef = doc(firestore, 'Users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();
      if (userData.hashedID === hash) {

      await keyinstance.recoveryMaskeyByID(id , passwordLog);
      }
      // Alert.alert('Success', 'Key recovered successfully', [{ text: 'OK' }]);
    } catch (error) {
      console.error('Could not recover key', error);
      // Alert.alert('Error', 'Could not recover key. Please try again.', [{ text: 'OK' }]);
    }
  };

  return (
    <View style={styles.screen}>
      <MaterialCommunityIcons
        style={styles.back}
        name="arrow-left"
        size={35}
        color="#D27C2C"
        onPress={() => navigate.goBack()}
      />
      <View style={styles.info}>
        <MaterialCommunityIcons
          name="account-reactivate"
          size={80}
          style={{ marginTop: 10 }}
          color="#D27C2C"
        />
        <Text style={styles.title}>Recovery encrypted data</Text>
        <Text style={styles.description}>
          If you have forgotten your password,{'\n'}
          After you reset password use this function to recover your encrypted
          data.
        </Text>
      </View>
      <View style={styles.inputzone}>
        <TextInput
          style={styles.input}
          autoCorrect={false}
          placeholder="Current password"
          placeholderTextColor={'gray'}
          autoCapitalize="none"
          secureTextEntry={true}
          required={true}
          value={passwordLog}
          onChangeText={value => setPasswordLog(value)}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your Thai ID"
          placeholderTextColor={'gray'}
          keyboardType="numeric"
          value={id}
          required={true}
          onChangeText={value => setId(value)}
        />
        <TouchableOpacity
          style={styles.Button}
          onPress={() => recovery(id, passwordLog)}>
          <View>
            <Text style={{ color: 'white', fontSize: 20, textAlign: 'center' }}>
              Recovery
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  back: {
    position: 'absolute',
    top: 10,
    left: 10,
  },
  title: {
    fontSize: 28,
    color: '#D27C2C',
    fontFamily: 'InterBold',
  },
  description: {
    marginVertical: 20,
    fontSize: 20,
    color: 'black',
    fontFamily: 'InterRegular',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  info: {
    marginTop: '15%',
    width: '90%',
    height: 'auto',
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    alignItems: 'center',
  },
  inputzone: {
    marginTop: '5%',
    width: '90%',
    height: '25%',
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    alignItems: 'center',
    paddingTop: 20,
  },
  input: {
    width: '90%',
    height: '25%',
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 20,
    paddingLeft: 10,
    marginVertical: 5,
  },
  Button: {
    backgroundColor: '#D27C2C',
    width: '70%',
    height: '20%',
    borderRadius: 20,
    marginTop: 20,
    justifyContent: 'center',
  },
});

export default Recovery;