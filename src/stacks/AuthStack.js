import * as React from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import {auth , firestore} from '../configs/firebaseConfig';
import {getFirestore, setDoc ,doc , updateDoc} from '@react-native-firebase/firestore';
import ToggleButton from '../components/ToggleButton';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
import Forgot from '../screens/Forgot';
import Keymanagement from '../components/Keymanagement';
import { Colors } from 'react-native/Libraries/NewAppScreen';
const AuthStack = () => {
  const navigation = useNavigation();
  const [isSignIn, setIsSignIn] = React.useState(true);
  const [username, setUsername] = React.useState('');
  const [emailLog, setEmailLog] = React.useState('');
  const [emailReg, setEmailReg] = React.useState('');
  const [passwordLog, setPasswordLog] = React.useState('');
  const [passwordReg, setPasswordReg] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isSecureEntry, setIsSecureEntry] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const isButtonEnabled =
    username && emailReg && passwordReg && confirmPassword;
  const [error, setError] = React.useState('');
  const db = getFirestore();
  const backgroundAnimation = React.useRef(new Animated.Value(0)).current;



  const validatePassword = password => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(password);
  };
  const handleSignIn = async () => {
    if (emailLog && passwordLog) {
      setLoading(true);
      setError('');
      try {
        await signInWithEmailAndPassword(auth, emailLog, passwordLog);
        const KeymanagementInstance = Keymanagement();
        await KeymanagementInstance.retrieveandstorekey(passwordLog);
        // const passkey = await KeymanagementInstance.getpasskey(passwordLog);
        // let decmasterkey =  await KeymanagementInstance.getmasterkey(passkey);
        // await KeymanagementInstance.storeKey(decmasterkey);
        // decmasterkey = null;
        navigation.navigate('MyPets');
        setEmailLog('');
        setPasswordLog('');
      } catch (err) {
        console.error('Error signing in:', err);
        setError('Failed to sign in. Please check your email and password.');
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please fill in both fields.');
    }
  };

  const handleSignUp = async () => {
    if (emailReg && passwordReg && passwordReg === confirmPassword) {
      if (!validatePassword(passwordReg)) {
        setError(
          'Password must be at least 6 characters long, include letters and numbers, and contain at least one uppercase letter.',
        );
        return;
      }
      setLoading(true);
      setError('');
      try {
        const tempUser = await createUserWithEmailAndPassword(
          auth,
          emailReg,
          passwordReg,
        );

        // Send verification email
        if (tempUser && tempUser.user) {
          // Send verification email
          await sendEmailVerification(tempUser.user);

          // Inform the user to verify their email
          setError(
            'A verification email has been sent. Please verify your email to complete registration.',
          );

          // Navigate to WaitVerify screen
          navigation.navigate('WaitVerify', {uid: tempUser.user.uid});

          // Poll for email verification
          const checkVerificationInterval = setInterval(async () => {
            await tempUser.user.reload(); // Reload user data
            if (tempUser.user.emailVerified) {
              clearInterval(checkVerificationInterval); // Stop checking when verified

              // Save user data to Firestore
              const {uid} = tempUser.user;
              const photoURL =
                'https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account.png';
              await setDoc(doc(db, 'Users', uid), {
                username,
                email: emailReg,
                uid,
                photoURL,
              });

              const KeymanagementInstance = Keymanagement();
              await KeymanagementInstance.createAndEncryptMasterKey(passwordReg , uid);
              // Clear form fields and stop loading
              setUsername('');
              setEmailReg('');
              setPasswordReg('');
              setConfirmPassword('');
              setLoading(false);
            }
          }, 3000); // Check every 3 seconds
        } else {
          throw new Error('User object is undefined');
        }
      } catch (err) {
        setError('Failed to register. Please try again.');
        console.error('Error registering:', err);
        setLoading(false);
      }
    } else {
      setError('Please fill in all fields and make sure passwords match.');
    }
  };

  const startAnimation = index => {
    Animated.timing(backgroundAnimation, {
      toValue: index,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };
  const toggleSecureEntry = () => {
    setIsSecureEntry(!isSecureEntry);
  };

  return (
    <View style={styles.container}>
      <View style={{marginTop: '75%'}}>
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
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    color: "black",
  },
});

export default AuthStack;
