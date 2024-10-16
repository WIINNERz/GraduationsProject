import * as Keychain from 'react-native-keychain';
import Aes, {encrypt} from 'react-native-aes-crypto';
import {Alert} from 'react-native';
import {auth, firestore} from '../configs/firebaseConfig';
import {getDoc, doc, updateDoc} from 'firebase/firestore';
import crypto from 'rn-crypto-js';
import axios from 'axios';

const Keymanagement = () => {
  const iterations = 5000,
    keyLength = 256,
    hash = 'sha256';
  const API_URL = 'https://petpaw-six.vercel.app/'; 
  const currentUser = auth.currentUser;
  // used for get user key things
  const decrypthealthdata = async (data) => {
    try {
      const response = await axios.post(`${API_URL}decrypt`, { encryptedText: data });
      const { decrypted } = response.data;
      return decrypted;
    } catch (error) {
      console.error(error);
    }
  };

  async function getuserkey() {
    const currentUser = auth.currentUser;
    try {
      const userRef = doc(firestore, 'Users', currentUser.uid);
      const userDoc = await getDoc(userRef); // Use getDoc to fetch a single document
      const userData = userDoc.data();
      const {masterKey, iv, salt, maskeyforrecovery} = userData;
      return {masterKey, iv, salt, maskeyforrecovery};
    } catch (error) {
      console.error('Could not get key', error);
      return {};
    }
  }
  // used for store key
  async function storeKey(key) {
    if (!key) {
      return;
    }
    try {
      await Keychain.setGenericPassword('maskey', key , { service: 'masterkey' });
      console.log('MKey stored successfully');
    } catch (error) {
      console.log('Could not store key', error);
    }
  }
  // used for clear key
  async function clearKey() {
    try {
      await Keychain.resetGenericPassword ( { service: 'masterkey' });
      console.log('Key cleared successfully');
    } catch (error) {
      console.error('Could not clear key', error);
    }
  }
  // used for retrieve master key from keychain
  async function retrievemasterkey() {
    try {
      const credentials = await Keychain.getGenericPassword({ service: 'masterkey' });
      if (credentials) {
        return credentials.password;
      } else {
        return '';
      }
    } catch (error) {
      console.log('Could not load credentials. ', error);
      return '';
    }
  }
  // used for retrieve master key from firebase ,decrypt it and store it
  async function retrieveandstorekey(password) {
    try {
      const {iv, masterKey} = await getuserkey();
      const passkey = await getpasskey(password);
      const decmaster = await Aes.decrypt(  
        masterKey,
        passkey,
        iv,
        'aes-256-cbc',
      );
      await storeKey(decmaster);
    } catch (error) {
      console.error('Could not retrieve and store key', error);
    }
  }

  // used for get passkey from password and id
  async function getpasskey(password) {
    try {
      const {salt} = await getuserkey();
      const passkey = await Aes.pbkdf2(
        password,
        salt,
        iterations,
        keyLength,
        hash,
      );
      return passkey;
    } catch (error) {
      console.error('Could not get passkey', error);
      return '';
    }
  }
  // used for create recovery key from id
  async function createRecoverykey(id) {
    try {
      const {iv} = await getuserkey();
      const recoverykey = await getpasskey(id);
      const masterKey = await retrievemasterkey();
      const encryptedMasterKeyforRecovery = await Aes.encrypt(
        masterKey,
        recoverykey,
        iv,
        'aes-256-cbc',
      );
      return encryptedMasterKeyforRecovery;
    } catch (error) {
      console.error('Could not create recovery key', error);
      return null;
    }
  }
  // used for create master key and pass keyfrom password and store it in firebase use once when user register
  async function createAndEncryptMasterKey(passwordReg, uid) {
    try {
      const masterKey = await Aes.randomKey(32);
      storeKey(masterKey);
      const salt = await Aes.randomKey(16);
      const passkey = await Aes.pbkdf2(
        passwordReg,
        salt,
        iterations,
        keyLength,
        hash,
      );
      const iv = await Aes.randomKey(16); // 128-bit IV
      const encryptedMasterKey = await Aes.encrypt(
        masterKey,
        passkey,
        iv,
        'aes-256-cbc',
      );
      
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
  // used for reencrypt master key when user change password in app
  async function Reencrpytmaseky(oldPassword, newPassword) {
    const currentUser = auth.currentUser;

    if (!currentUser) {
      Alert.alert('Error', 'No user found. Please sign in again.', [
        {text: 'OK'},
      ]);
      return;
    }
    try {
      const {masterKey, iv, salt} = await getuserkey();
      const iterations = 5000,
        keyLength = 256,
        hash = 'sha256';
      const passkey = await Aes.pbkdf2(
        oldPassword,
        salt,
        iterations,
        keyLength,
        hash,
      );

      try {
        const decryptMasterKey = await Aes.decrypt(
          masterKey,
          passkey,
          iv,
          'aes-256-cbc',
        );
        const newpasskey = await Aes.pbkdf2(
          newPassword,
          salt,
          iterations,
          keyLength,
          hash,
        );
        const reencryptMaskey = await Aes.encrypt(
          decryptMasterKey,
          newpasskey,
          iv,
          'aes-256-cbc',
        );
        const userRef = doc(firestore, 'Users', currentUser.uid);
        await updateDoc(userRef, {
          masterKey: reencryptMaskey,
        });
        console.log('Master key updated successfully!');
      } catch (decryptError) {
        console.error('Error decrypting master key: ', decryptError);
        Alert.alert(
          'Error',
          'Failed to decrypt master key. Please check your old password.',
          [{text: 'OK'}],
        );
      }
    } catch (error) {
      console.error('Error updating masterkey: ', error);
    }
  }

  // used for update master key by id and password when user forget password
  async function recoveryMaskeyByID(id, password) {
    if (!currentUser) {
      Alert.alert('Error', 'No user found. Please sign in again.', [
        {text: 'OK'},
      ]);
      return;
    }
    const userRef = doc(firestore, 'Users', currentUser.uid);
    try {
      const decryptMasterKey = await getRecoverykey(id);
      storeKey(decryptMasterKey);
      const passkey = await getpasskey(password);
      const {iv} = await getuserkey();
      const reencryptMaskey = await Aes.encrypt(
        decryptMasterKey,
        passkey,
        iv,
        'aes-256-cbc',
      );
      await updateDoc(userRef, {
        masterKey: reencryptMaskey,
      });
      console.log('Master key updated successfully!');
    } catch (error) {
      console.error('Error updating masterkey: ', error);
    }
  }
  // used for get recoverymasterkey key by id
  async function getRecoverykey(id) {
    try {
      const {iv, maskeyforrecovery} = await getuserkey();
      const recoverykey = await getpasskey(id);
      const decryptMasterKey = await Aes.decrypt(
        maskeyforrecovery,
        recoverykey,
        iv,
        'aes-256-cbc',
      );
      return decryptMasterKey;
    } catch (error) {
      console.error('Could not get recovery key', error);
      return '';
    }
  }
  
  async function encryptData(data) {
    try {
      const masterKey = await retrievemasterkey();
      const encryptedData = crypto.AES.encrypt(data, masterKey).toString();
      return encryptedData;
    } catch (error) {
      console.error('Could not encrypt data', error);
      return '';
    }
  }

  async function decryptData(data) {
    try {
      const masterKey = await retrievemasterkey();
      const decryptedData = crypto.AES.decrypt(data, masterKey).toString(
        crypto.enc.Utf8,
      );
      return decryptedData;
    } catch (error) {
      console.error('Could not decrypt data', error);
      return '';
    }
  }

  return {
    storeKey,
    getpasskey,
    createAndEncryptMasterKey,
    Reencrpytmaseky,
    retrievemasterkey,
    encryptData,
    decryptData,
    createRecoverykey,
    retrieveandstorekey,
    recoveryMaskeyByID,
    clearKey,
    getRecoverykey,
    decrypthealthdata,

  };
};

export default Keymanagement;
