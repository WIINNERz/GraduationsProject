import {useState, useEffect} from 'react';



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
      

    return {
        validateThaiId,
    };
};

export default securedFunction;