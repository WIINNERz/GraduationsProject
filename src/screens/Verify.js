import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Keyboard,
} from 'react-native';
import React from 'react';
import Aes from 'react-native-aes-crypto';
import {useState, useEffect} from 'react';
import {auth, firestore} from '../configs/firebaseConfig';
import {getDocs, getDoc, doc, updateDoc, collection} from 'firebase/firestore';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';
import Keymanagement from '../components/Keymanagement';

const Verify = () => {
  const KeymanagementInstance = Keymanagement();
  const [id, setId] = useState('');
  const navigate = useNavigation();
  const [verified, setVerified] = useState(false);
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      navigate.getParent()?.setOptions({
        tabBarStyle: { display: 'none' },
      });
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      navigate.getParent()?.setOptions({
        tabBarStyle: [styles.tabBar, { backgroundColor: '#F0DFC8' }],
      });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [navigate]);
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
      const recoverykey = await KeymanagementInstance.createRecoverykey(
        thaiIdInput,
      );
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
        <View style={styles.info}>
          <MaterialCommunityIcons
            name="account-check"
            size={80}
            style={{marginTop: 10}}
            color="#D27C2C"
          />
          <Text style={styles.title}>Verify Account</Text>
          <Text style={styles.description}>
            Verify account for unlock adoption and recovery account feature,
            {'\n'}
            Use your Thai ID card number to verify.
          </Text>
        </View>
        <View style={styles.verified}>
          <View style={styles.verifiedscreen}>
            <Text style={styles.verifiedtitle}>
              Your account has been verified.
            </Text>
          </View>
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
      <View style={styles.info}>
        <MaterialCommunityIcons
          name="account-check"
          size={80}
          style={{marginTop: 10}}
          color="#D27C2C"
        />
        <Text style={styles.title}>Verify Account</Text>
        <Text style={styles.description}>
          Verify account for unlock adoption and recovery account feature,{'\n'}
          Use your Thai ID card number to verify.
        </Text>
      </View>
      <View style={styles.inputzone}>
        <TextInput
          placeholder="Enter your Thai ID card number"
          style={styles.input}
          placeholderTextColor={'gray'}
          onChangeText={text => setId(text)}
          value={id}
          keyboardType="numeric"
          maxLength={13}
        />

        <TouchableOpacity
          style={styles.Button}
          onPress={() => validateThaiId(id)}>
          <View>
            <Text style={{color: 'white', fontSize: 20, textAlign: 'center'}}>
              Verify
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
    justifyContent: 'center',
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
  verified: {
    marginTop: '5%',
    width: '90%',
    height: '25%',
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '8%',
    position: 'absolute',
    overflow: 'hidden',
  },
});
export default Verify;
// Credit https://medium.com/@peatiscoding/validate-thai-citizen-id-7c980454c444
