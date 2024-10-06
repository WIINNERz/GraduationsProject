import 'react-native-get-random-values';
import nacl from 'tweetnacl';
import { encodeBase64, decodeBase64 } from 'tweetnacl-util';
import { TextEncoder, TextDecoder } from 'text-encoding';
import * as Keychain from 'react-native-keychain';
import {auth, firestore} from '../configs/firebaseConfig';
import {getDoc, doc, updateDoc} from 'firebase/firestore';
import Keymanagement from './Keymanagement';


const E2EE = () => {
  const KeymanagementInstance = Keymanagement();
  
  
  const generateKeyPair = async (uid) => {
  
    try {
      const keyPairA = nacl.box.keyPair();
      const publicKeyA = encodeBase64(keyPairA.publicKey);
      const secretKeyA = encodeBase64(keyPairA.secretKey);
      await Keychain.setGenericPassword('Private key', secretKeyA , { service : 'privatekey' });
      const userDocRef = doc(firestore, 'Users', uid);
      const encryptedPrivateKey = await KeymanagementInstance.encryptData(secretKeyA);
      await updateDoc(userDocRef, {
        publicKey: publicKeyA,
        encPrivateKey: encryptedPrivateKey,
      });

    } catch (error) {
      console.log('Could not generate key pair', error);
    }
  };
  async function storeSecretKey() {
    const currentUser = auth.currentUser;
    try {
      const userRef = doc(firestore, 'Users', currentUser.uid);
      const userDoc = await getDoc(userRef); // Use getDoc to fetch a single document
      const userData = userDoc.data();
      const { encPrivateKey } = userData;
      const decryptedPrivateKey = await KeymanagementInstance.decryptData(encPrivateKey);
      if (!decryptedPrivateKey) {
        throw new Error('Decrypted private key is empty or null');
      }

      await Keychain.setGenericPassword('privatekey', decryptedPrivateKey, { service: 'privatekey' });
      console.log('Secret key stored successfully');
    } catch (error) {
      console.error('Could not get key', error);
      return {};
    }
  }
  const clearSecretKey = async () => {
    try {
      await Keychain.resetGenericPassword({service:'privatekey'});
      console.log('SKey cleared successfully');
    } 
    catch (error) {
      console.error('Could not clear key', error);
    }
  }

  const getMySecretKey = async () => {
    try {
      const credentials = await Keychain.getGenericPassword({service:'privatekey'});
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

  const computeSharedSecret = (mySecretKey, theirPublicKey) => {
    const secretKey = decodeBase64(mySecretKey);
    const publicKey = decodeBase64(theirPublicKey);
    const sharedSecret = nacl.box.before(publicKey, secretKey);
    return encodeBase64(sharedSecret);
  };

  const encryptMessage = (sharedSecret, field) => {
    const nonce = nacl.randomBytes(nacl.box.nonceLength);
    const secret = decodeBase64(sharedSecret);
    const fieldString = field.toString(); // Convert field to string
    const fieldUint8 = new TextEncoder().encode(fieldString);
    const encrypted = nacl.box.after(fieldUint8, nonce, secret);
    return {
      cipherText: encodeBase64(encrypted),
      nonce: encodeBase64(nonce),
    };
  };

  const decryptMessage = (sharedSecret, cipherText, nonce) => {
    const secret = decodeBase64(sharedSecret);
    const message = decodeBase64(cipherText);
    const nonceUint8 = decodeBase64(nonce);
    const decrypted = nacl.box.open.after(message, nonceUint8, secret);
    if (!decrypted) {
      throw new Error('Decryption failed');
    }
    const decryptedString = new TextDecoder().decode(decrypted);
    return decryptedString;
  };

  return {
    generateKeyPair,
    computeSharedSecret,
    encryptMessage,
    decryptMessage,
    getMySecretKey,
    storeSecretKey,
    clearSecretKey,
  };
};

export default E2EE;