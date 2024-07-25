import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import ToggleButton from '../components/ToggleButton';
import SignIn from '../components/SignIn';
import SignUp from '../components/SignUp';

export default function Auth() {
  const navigation = useNavigation();
  const [isSignIn, setIsSignIn] = useState(true);
  const [username, setUsername] = useState('');
  const [emailLog, setEmailLog] = useState('');
  const [emailReg, setEmailReg] = useState('');
  const [passwordLog, setPasswordLog] = useState('');
  const [passwordReg, setPasswordReg] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSecureEntry, setIsSecureEntry] = useState(true);
  const [loading, setLoading] = useState(false);
  const isButtonEnabled = username && emailReg && passwordReg && confirmPassword;
  const [error, setError] = useState('');

  const handleSignIn = () => {
    // Add sign-in logic here
    console.log('Sign In button pressed');
  };

  const handleSignUp = () => {
    // Add sign-up logic here
    console.log('Sign Up button pressed');
  };

  const toggleSecureEntry = () => {
    setIsSecureEntry(!isSecureEntry);
  };

  const backgroundAnimation = useRef(new Animated.Value(0)).current;

  const startAnimation = (index) => {
    Animated.timing(backgroundAnimation, {
      toValue: index,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={{marginTop:'75%'}}>
        <ToggleButton 
          isSignIn={isSignIn} 
          setIsSignIn={setIsSignIn} 
          startAnimation={startAnimation} 
          backgroundAnimation={backgroundAnimation} 
        />
      </View>
      {isSignIn ? (
        <SignIn 
          emailLog={emailLog} 
          setEmailLog={setEmailLog} 
          passwordLog={passwordLog} 
          setPasswordLog={setPasswordLog} 
          isSecureEntry={isSecureEntry} 
          toggleSecureEntry={toggleSecureEntry} 
          isButtonEnabled={isButtonEnabled}
          handleSignIn={handleSignIn} 
          loading={loading} 
          error={error} 
          navigation={navigation}
        />
      ) : (
        <SignUp
          username={username} 
          setUsername={setUsername} 
          emailReg={emailReg} 
          setEmailReg={setEmailReg} 
          passwordReg={passwordReg} 
          setPasswordReg={setPasswordReg} 
          confirmPassword={confirmPassword} 
          setConfirmPassword={setConfirmPassword} 
          isSecureEntry={isSecureEntry} 
          toggleSecureEntry={toggleSecureEntry} 
          handleSignUp={handleSignUp} 
          loading={loading} 
          error={error} 
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
});
