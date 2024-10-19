import {useState, useEffect} from 'react';
import nacl from 'tweetnacl';
import {encodeBase64, decodeBase64} from 'tweetnacl-util';
const securedFunction = () => {
  const validateThaiId = async id => {
    const thaiIdInput = id;
    const m = thaiIdInput.match(/(\d{12})(\d)/);
    if (!m) {
      //   Alert.alert('Thai ID must be 13 digits');
      return;
    }
    const digits = m[1].split('');
    const sum = digits.reduce((total, digit, i) => {
      return total + (13 - i) * +digit;
    }, 0);
    const lastDigit = `${(11 - (sum % 11)) % 10}`;
    const inputLastDigit = m[2];
    if (lastDigit !== inputLastDigit) {
      //   Alert.alert('Thai ID is invalid');
      return;
    }
    return true;
  };
const generateKeyPair = async () => {
  const keyPairA = nacl.box.keyPair();
  const publicKey = encodeBase64(keyPairA.publicKey);
  const secretKey = encodeBase64(keyPairA.secretKey);
  return { publicKey, secretKey };
}
const computeSharedSecret = (mySecretKey, theirPublicKey) => {
  const secretKey = decodeBase64(mySecretKey);
  const publicKey = decodeBase64(theirPublicKey);
  const sharedSecret = nacl.box.before(publicKey, secretKey);
  return encodeBase64(sharedSecret);
};
const encryptData = async (data, sharekey) => {
  const nonce = nacl.randomBytes(24);
  const secret = decodeBase64(sharekey);
  const dataUint8 = new TextEncoder().encode(data);
  const encrypted = nacl.secretbox(dataUint8, nonce, secret);
  return {
    cipherText: encodeBase64(encrypted),
    nonce: encodeBase64(nonce),
  };
}
const decryptData = async (cipherText, nonce, sharekey) => {
  const secret = decodeBase64(sharekey);
  const message = decodeBase64(cipherText);
  const nonceUint8 = decodeBase64(nonce);
  const decrypted = nacl.secretbox.open(message, nonceUint8, secret);
  if (!decrypted) {
    throw new Error('Decryption failed');
  }
  const decryptedString = new TextDecoder().decode(decrypted);
  return decryptedString;
}
  return {
    validateThaiId,
    generateKeyPair,
    computeSharedSecret,
    encryptData,
    decryptData,
  };
};
export default securedFunction;