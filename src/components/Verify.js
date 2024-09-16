import {View, Text, StyleSheet, TextInput, Button, Alert} from 'react-native';
import React from 'react';
import Aes from 'react-native-aes-crypto';
import {useState, useEffect} from 'react';
import {auth, firestore} from '../configs/firebaseConfig';
import {
  getDocs,
  getDoc,
  doc,
  updateDoc,
  collection,
} from 'firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import Keymanagement from './Keymanagement';



const Verify = () => {
  const KeymanagementInstance = Keymanagement();
  const [id, setId] = useState('');
  const navigate = useNavigation();
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const isVerified = async () => {
      const currentUser = auth.currentUser;
      if (currentUser) {
        const userRef = doc(firestore, 'Users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const verified = userDoc.data().verify;
        if (verified === true) {
          setVerified(true);
        }
      }
    };
    isVerified();
  }, []);

  // const test = async () => {

  // };


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
      const recoverykey = await KeymanagementInstance.createRecoverykey(thaiIdInput);
      const hash = await Aes.sha256(thaiIdInput);
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
        const currentUser = auth.currentUser;
        if (currentUser) {
          const userRef = doc(firestore, 'Users', currentUser.uid);
          await updateDoc(userRef, {
            verify: true,
            hashedID: hash,
            maskeyforrecovery: recoverykey,
          });
          Alert.alert('Your account has been verified.');
          setVerified(true);
        } else {
          Alert.alert('No user is currently signed in.');
        }
      }
    } catch (error) {
     console.error('Error verifying Thai ID:', error);  
    }
  };
  if (verified) {
    return (
      <View style={styles.screen}>
        <MaterialCommunityIcons
          style={styles.back}
          name="arrow-left"
          size={35}
          color="#D27C2C"
          onPress={() => navigate.goBack()}
        />
        <View style={styles.verifiedscreen}>
          <Text style={styles.verifiedtitle}>
            Your account has been verified.
          </Text>
        </View>
      </View>
    );
  }

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
          placeholder="Enter your Thai ID card number"
          placeholderTextColor={'gray'}
          onChangeText={text => setId(text)}
          value={id}
          keyboardType="numeric"
          maxLength={13}
          style={{borderBottomWidth: 1, marginTop: 5, marginBottom: 20}}
        />
        <Button title="Verify" onPress={() => validateThaiId(id)} />
        {/* <Button title="test" onPress={() => test()} /> */}
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: 'white',
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
    borderRadius: 20,
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
  verifiedscreen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  verifiedtitle: {
    fontSize: 22,
    fontFamily: 'InterLightItalic',
    color: 'gray',
  },
});
export default Verify;
// Credit https://medium.com/@peatiscoding/validate-thai-citizen-id-7c980454c444