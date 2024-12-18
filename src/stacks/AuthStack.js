import * as React from 'react';
import { View, StyleSheet, Animated, Image, KeyboardAvoidingView, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, firestore } from '../configs/firebaseConfig';
import { getFirestore, setDoc, doc, updateDoc } from '@react-native-firebase/firestore';
import ToggleButton from '../components/ToggleButton';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
// import Forgot from '../screens/Forgot';
import Keymanagement from '../components/Keymanagement';
import E2EE from '../components/E2EE';

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
  const [isButtonEnabled, setIsButtonEnabled] = React.useState(false);
  const [error, setError] = React.useState('');
  const db = getFirestore();
  const backgroundAnimation = React.useRef(new Animated.Value(0)).current;
  const ee2e = E2EE();

  const validatePassword = password => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{8,}$/;
    return regex.test(password);
  };
  const validateEmail = (email) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSignIn = async () => {
    if (!validateEmail(emailLog)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (emailLog && passwordLog) {
      setLoading(true);
      setError('');
      try {
        await signInWithEmailAndPassword(auth, emailLog, passwordLog);
        if(signInWithEmailAndPassword){
          const KeymanagementInstance = Keymanagement();
          await KeymanagementInstance.retrieveandstorekey(passwordLog);
          await ee2e.storeSecretKey();
        }
        navigation.navigate('MyPets');
        setEmailLog('');
        setPasswordLog('');
      } catch (err) {
        
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
      if (!validateEmail(emailReg)) {
        setError('Please enter a valid email address.');
        return;
      }
      if (!validatePassword(passwordReg)) {
        setError(
          'Password must be at least 8 characters long, include letters and numbers, and contain at least one uppercase letter.',
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
        if (tempUser && tempUser.user) {
          await sendEmailVerification(tempUser.user);
          setError(
            'A verification email has been sent. Please verify your email to complete registration.',
          );
          navigation.navigate('WaitVerify', { uid: tempUser.user.uid });

          const checkVerificationInterval = setInterval(async () => {
            await tempUser.user.reload();
            if (tempUser.user.emailVerified) {
              clearInterval(checkVerificationInterval); 

              const { uid } = tempUser.user;
              const photoURL =
                'https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account.png';
              await setDoc(doc(db, 'Users', uid), {
                username,
                email: emailReg,
                uid,
                photoURL,
              });
              const KeymanagementInstance = Keymanagement();
              await KeymanagementInstance.createAndEncryptMasterKey(passwordReg, uid);
              setUsername('');
              setEmailReg('');
              setPasswordReg('');
              setConfirmPassword('');
              setLoading(false);
            }
          }, 3000); 
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 20}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.container}>
          <Image source={require('../assets/image.png')} style={styles.logo} />
          <ToggleButton
            isSignIn={isSignIn}
            setIsSignIn={setIsSignIn}
            startAnimation={startAnimation}
            backgroundAnimation={backgroundAnimation}
          />
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
              isButtonEnabled={isButtonEnabled}
      setIsButtonEnabled={setIsButtonEnabled}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    color: 'black',
  },
  logo: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
});

export default AuthStack;