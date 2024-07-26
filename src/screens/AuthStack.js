import * as React from 'react';
import { View, StyleSheet ,Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword} from '@react-native-firebase/auth';
import { auth } from '../configs/firebaseConfig';
import { getFirestore, setDoc, doc } from '@react-native-firebase/firestore';
import ToggleButton from '../components/ToggleButton';
import SignIn from '../components/SignIn'; 
import SignUp from '../components/SignUp'; 
import Forgot from '../components/Forgot';


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
  const isButtonEnabled = username && emailReg && passwordReg && confirmPassword;
  const [error, setError] = React.useState('');
  const db = getFirestore();
  const backgroundAnimation = React.useRef(new Animated.Value(0)).current;

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(password);
  };
  const handleSignIn = async () => {
    if (emailLog && passwordLog) {
      setLoading(true);
      setError('');
      try {
        await signInWithEmailAndPassword(auth, emailLog, passwordLog);
        navigation.navigate('Home');
        setEmailLog('');
        setPasswordLog('');
      } catch (err) {
        console.log(err);
        console.log(emailLog)
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
        setError('Password must be at least 6 characters long, include letters and numbers, and start with an uppercase letter.');
        return;
      }
      setLoading(true);
      setError('');
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, emailReg, passwordReg);
        const { uid } = userCredential.user;
        await setDoc(doc(db, 'Users', uid), {
          username,
          email:emailReg,
          uid
        });
        navigation.navigate('Home');
        setUsername('');
        setEmailReg('');
        setPasswordReg('');
        setConfirmPassword('');
      } catch (err) {
        setError('Failed to register. Please try again.');
        console.log(err);
      } finally {
        setLoading(false);
      }
    } else {
      setError('Please fill in all fields and make sure passwords match.');
    }
  };
  const startAnimation = (index) => {
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
          isButtonEnabled ={isButtonEnabled}
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
  },
});

export default AuthStack;
