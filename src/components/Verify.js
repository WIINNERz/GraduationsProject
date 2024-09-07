import {View, Text, StyleSheet, TextInput, Button, Alert} from 'react-native';
import React from 'react';
import Aes from 'react-native-aes-crypto';
import {useState} from 'react';
import {auth, firestore} from '../configs/firebaseConfig';
import {getDocs, doc, updateDoc, collection} from 'firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import VerifyAlert from './VerifyAlert';
const Verify = () => {
  const [id, setId] = useState('');
  const navigate = useNavigation();
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
      const usersSnapshot = await getDocs(collection(firestore, 'Users'));
      let hashExists = false;

      usersSnapshot.forEach(userDoc => {
        const userData = userDoc.data();
        if (userData.hashedID === hash) {
          hashExists = true;
        }
      });

      if (hashExists) {
        Alert.alert('This ID card number has already been used');
      } else {
        // const auth = getAuth();
        const currentUser = auth.currentUser;

        if (currentUser) {
          const userRef = doc(firestore, 'Users', currentUser.uid);
          await updateDoc(userRef, {
            verify: true,
            hashedID: hash,
          });
          Alert('Your account has been verified.');
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
                <MaterialCommunityIcons
            style={styles.back}
            name="arrow-left"
            size={35}
            color="#D27C2C"
            onPress={() => navigate.goBack()}
          />
          
            <View style={styles.content}>
          <Text style={styles.title}>Verify Your Account</Text>
          <TextInput
            placeholder="Enter Thai ID"
            onChangeText={text => setId(text)}
            value={id}
            keyboardType="numeric"
            maxLength={13}
            style={{borderBottomWidth: 1, marginBottom: 20}}
          />
          <Button title="Verify" onPress={() => validateThaiId(id)} />
         <VerifyAlert />
        </View>
        </View>
  );
};
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'gray',
    justifyContent: 'center',
  },
    title: {
        fontSize: 20,
        textAlign: 'center',
        margin: 10,
    },
    content: {
        padding: 40,
        justifyContent: 'center',
        margin: 20,
        borderRadius: 30,
        backgroundColor: '#F0DFC8',
    },
    back: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'white',
        borderRadius: 100,
        zIndex: 1,
      },

});

// Credit https://medium.com/@peatiscoding/validate-thai-citizen-id-7c980454c444
export default Verify;
