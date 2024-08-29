import * as Keychain from 'react-native-keychain';
import Aes from 'react-native-aes-crypto';
import {auth, firestore} from '../configs/firebaseConfig';
import {getDoc, doc } from 'firebase/firestore';

const Keymanagement = () => {
  const iterations = 5000, keyLength = 256, hash = 'sha256';

  async function getuserkey() {
    const currentUser = auth.currentUser;
    try {
      const userRef = doc(firestore, 'Users', currentUser.uid );
      const userDoc = await getDoc(userRef); // Use getDoc to fetch a single document
      const userData = userDoc.data();
      const { masterKey, iv, salt } = userData;
      return { masterKey, iv, salt };
    } catch (error) {
      console.error('Could not get key', error);
      return {};
    }
  }

  async function storeKey(key) {
    try {
      await Keychain.setGenericPassword('maskey', key);
      console.log('Key stored successfully');
    } catch (error) {
      console.error('Could not store key', error);
    }
  }

  async function getpasskey(password) {
    try {
      const { salt } = await getuserkey();
      const passkey = await Aes.pbkdf2(password, salt, iterations, keyLength, hash);
      return passkey;
    } catch (error) {
      console.error('Could not get passkey', error);
      return null;
    }
  }

  async function getmasterkey(passkey) { 
    try {
      const {  iv , masterKey } = await getuserkey();
      const decryptMasterKey = await Aes.decrypt(masterKey, passkey, iv, 'aes-256-cbc');
      return decryptMasterKey;
    } catch (error) {
      console.error('Could not get masterkey', error);
      return null;
    }
  }

  return {
    storeKey,
    getpasskey,
    getmasterkey,
  };
};

export default Keymanagement;