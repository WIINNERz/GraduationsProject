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


  return {
    validateThaiId,
    generateKeyPair,
  };
};

export default securedFunction;
