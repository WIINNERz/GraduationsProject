import * as Keychain from 'react-native-keychain';
import Aes from 'react-native-aes-crypto';
import { Alert } from 'react-native';
import {auth, firestore} from '../configs/firebaseConfig';
import { getDoc, doc , updateDoc } from 'firebase/firestore';


const Keymanagement = () => {
  const iterations = 5000, keyLength = 256, hash = 'sha256';
  const currentUser = auth.currentUser;
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
  async function retrievekey() {
    try {
      const credentials = await Keychain.getGenericPassword();
      if (credentials) {
        console.log('Credentials successfully loaded for' + credentials.username);
        return credentials.password;
      } else {
        console.log('No credentials stored');
        return null;
      }
    } catch (error) {
      console.error('Could not load credentials. ', error);
      return null;
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
  async function createAndEncryptMasterKey(passwordReg ,uid) {
    try {
      // 1. Generate a random master key
      const masterKey = await Aes.randomKey(32); // 256-bit master key
      // 2. Generate a salt and derive a key from the password
      const salt = await Aes.randomKey(16); // 128-bit salt
      const passkey = await Aes.pbkdf2(
        passwordReg,
        salt,
        iterations,
        keyLength,
        hash,
      );
      // 3. Generate a random IV for encryption
      const iv = await Aes.randomKey(16); // 128-bit IV
      // 4. Encrypt the master key using AES-256-CBC with the derived key
      const encryptedMasterKey = await Aes.encrypt(
        masterKey,
        passkey,
        iv,
        'aes-256-cbc',
      );
      // 5. Save the encrypted master key, salt, and IV to Firestore
        const userRef = doc(firestore, 'Users', uid);
        await updateDoc(userRef, {
          masterKey: encryptedMasterKey,
          salt,
          iv,
        });
        console.log('Master key created and encrypted successfully!');
    } catch (error) {
      console.error('Error during master key creation and encryption:', error);
      throw error;
    }
  }
  async function Reencrpytmaseky(oldPassword, newPassword) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
        Alert.alert('Error', 'No user found. Please sign in again.', [{ text: 'OK' }]);
        return;
    }
    try {
            const { masterKey, iv, salt } = await getuserkey();
            const iterations = 5000, keyLength = 256, hash = 'sha256';
            const passkey = await Aes.pbkdf2(oldPassword, salt, iterations, keyLength, hash);

            try {
                const decryptMasterKey = await Aes.decrypt(masterKey, passkey, iv, 'aes-256-cbc');
                const newpasskey = await Aes.pbkdf2(newPassword, salt, iterations, keyLength, hash);
                const reencryptMaskey = await Aes.encrypt(decryptMasterKey, newpasskey, iv, 'aes-256-cbc');
                const userRef = doc(firestore, 'Users', currentUser.uid);
                await updateDoc(userRef, {
                    masterKey: reencryptMaskey
                });
                console.log('Master key updated successfully!');
            } catch (decryptError) {
                console.error('Error decrypting master key: ', decryptError);
                Alert.alert('Error', 'Failed to decrypt master key. Please check your old password.', [{ text: 'OK' }]);
            }
        
    } catch (error) {
        console.error('Error updating masterkey: ', error);
    }
}
  async function encryptData(data) {
    // https://www.npmjs.com/package/aes-ecb
  }


  return {
    storeKey,
    getpasskey,
    getmasterkey,
    createAndEncryptMasterKey,
    Reencrpytmaseky,
    retrievekey,
  };
};

export default Keymanagement;