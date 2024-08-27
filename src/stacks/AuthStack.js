import * as React from 'react';
import {View, StyleSheet, Animated} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification 
} from 'firebase/auth';
import {auth} from '../configs/firebaseConfig';
import {getFirestore, setDoc, doc} from '@react-native-firebase/firestore';
import ToggleButton from '../components/ToggleButton';
import SignIn from '../screens/SignIn';
import SignUp from '../screens/SignUp';
import Forgot from '../screens/Forgot';

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
  

//     if (emailReg && passwordReg && passwordReg === confirmPassword) {
//         if (!validatePassword(passwordReg)) {
//             setError(
//                 'Password must be at least 6 characters long, include letters and numbers, and contain at least one uppercase letter.',
//             );
//             return;
//         }
//         setLoading(true);
//         setError('');
//         try {
//             const tempUser = await createUserWithEmailAndPassword(
//                 auth,
//                 emailReg,
//                 passwordReg,
//             );

//             // ส่งอีเมลยืนยัน
//             await tempUser.user.sendEmailVerification();

//             // แจ้งให้ผู้ใช้ตรวจสอบอีเมลเพื่อยืนยัน
//             setError('A verification email has been sent. Please verify your email to complete registration.');
            
//             // หยุดแสดง loading indicator
//             setLoading(false);
            
//             // นำทางไปยังหน้า WaitVerify
//             console.log('Navigating to WaitVerify with uid:', tempUser.user.uid);
//             navigation.navigate('WaitVerify', { uid: tempUser.user.uid });

//             // วนลูปรอการยืนยันอีเมล
//             const checkVerificationInterval = setInterval(async () => {
//                 await tempUser.user.reload(); // รีโหลดข้อมูลผู้ใช้
//                 if (tempUser.user.emailVerified) {
//                     clearInterval(checkVerificationInterval); // หยุดการตรวจสอบเมื่อยืนยันแล้ว

//                     // สร้างผู้ใช้ที่สมบูรณ์และบันทึกข้อมูลใน Firestore
//                     const { uid } = tempUser.user;
//                     const photoURL =
//                         'https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account.png';

//                     await setDoc(doc(db, 'Users', uid), {
//                         username,
//                         email: emailReg,
//                         uid,
//                         photoURL,
//                     });

//                     setUsername('');
//                     setEmailReg('');
//                     setPasswordReg('');
//                     setConfirmPassword('');

//                     // นำผู้ใช้ไปยังหน้าหลักหลังจากยืนยันเสร็จ
//                     navigation.navigate('Home');
//                 }
//             }, 3000); // เช็คสถานะทุกๆ 3 วินาที

//         } catch (err) {
//             setError('Failed to register. Please try again.');
//             console.log(err);
//             setLoading(false);
//         }
//     } else {
//         setError('Please fill in all fields and make sure passwords match.');
//     }
// };

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
      const tempUser = await createUserWithEmailAndPassword(auth, emailReg, passwordReg);

      // Send verification email
      if (tempUser && tempUser.user) {
        // Send verification email
        await sendEmailVerification(tempUser.user);
        
        // Inform the user to verify their email
        setError('A verification email has been sent. Please verify your email to complete registration.');
        
        // Navigate to WaitVerify screen
        navigation.navigate('WaitVerify', { uid: tempUser.user.uid });
        
        // Poll for email verification
        const checkVerificationInterval = setInterval(async () => {
          await tempUser.user.reload(); // Reload user data
          if (tempUser.user.emailVerified) {
            clearInterval(checkVerificationInterval); // Stop checking when verified
            
            // Save user data to Firestore
            const { uid } = tempUser.user;
            const photoURL = 'https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account.png';
            
            await setDoc(doc(db, 'Users', uid), {
              username,
              email: emailReg,
              uid,
              photoURL,
            });
            
            // Clear form fields and stop loading
            setUsername('');
            setEmailReg('');
            setPasswordReg('');
            setConfirmPassword('');
            setLoading(false);
          }
        }, 3000); // Check every 3 seconds
      }else{
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
  },
});

export default AuthStack;
