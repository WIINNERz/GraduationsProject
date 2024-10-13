import React, {useState} from 'react';
import * as Components from '../component/Authencomponent';
import {useNavigate} from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {getDoc, doc, updateDoc, collection, setDoc} from 'firebase/firestore';
import {auth, firestore} from '../firebase-config';
import styles from '../CSS/Authen.module.css';
import securedFunction from '../Function/securefunction';
import CryptoJS from 'crypto-js'; // ใช้อย่นะจ๊ะ

function Authen() {
  const navigate = useNavigate();
  const [signIn, toggle] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = useState('');
  const [firstname, setFirstname] = React.useState('');
  const [lastname, setLastname] = React.useState('');
  const [id, setID] = React.useState('');
  const sec = securedFunction();

  const validatePassword = password => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(password);
  };
  const handleSignIn = async e => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(firestore, 'Users', auth.currentUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== 'vet') {
          await auth.signOut();
          alert('Access denied. Only vets are allowed.');
          return;
        }
      } else {
        await auth.signOut();
        alert('User data not found.');
        return;
      }
      // Successful sign-in
      navigate('/home');
    } catch (error) {
      alert('Failed to sign in. Please check your email and password.');
    }
  };
  const handleSignUp = async e => {
    e.preventDefault();
    if (!validatePassword(password)) {
      setError(
        'Password must be at least 6 characters long, include letters and numbers, and contain at least one uppercase letter.',
      );
      return;
    }
    try {
      // const idcheck = await sec.validateThaiId(id);
      // if (idcheck === true) {
      //   const hash = CryptoJS.SHA256(id).toString();
      //   const usersSnapshot = await getDocs(collection(firestore, 'Users'));
      //   let hashExists = false;

      //   usersSnapshot.forEach(userDoc => {
      //     const userData = userDoc.data();
      //     if (userData.hashedID === hash) {
      //       hashExists = true;
      //     }
      //   });
      //   if (hashExists) {
      //     console.log('This ID card number has already been used');
      //   } else {
      const tempUser = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const uid = tempUser.user.uid;
      await updateProfile(tempUser.user, {
        displayName: `${firstname} ${lastname}`,
      });
      // Successful sign-up
      const { publicKey, secretKey } = await sec.generateKeyPair();

      await setDoc(doc(firestore, 'Users', uid), {
        firstname: firstname,
        lastname: lastname,
        email: email,
        // hashedID: hash,
        uid,
        publicKey: publicKey,
        encPrivateKey: secretKey,
        role: 'vet',
      });
      console.log('Signed up successfully');
      navigate('/home');
    } catch (error) {
      // } else {
      //   console.log('Thai ID is invalid');
      //   return;
      // }
      //}
      alert('Error', error.message);
    }
  };

  return (
    <div className={styles.screen}>
      <Components.Container>
        <Components.SignUpContainer signingIn={signIn}>
          <Components.Form>
            <Components.Title>Create Account</Components.Title>
            <Components.Input
              type="text"
              placeholder="Firstname"
              value={firstname}
              onChange={e => setFirstname(e.target.value)}
            />
            <Components.Input
              type="text"
              placeholder="Lastname"
              value={lastname}
              onChange={e => setLastname(e.target.value)}
            />
            <Components.Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Components.Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Components.Input
              type="number"
              placeholder="Thai ID number"
              value={id}
              onChange={e => setID(e.target.value)}
            />
            <Components.Button onClick={handleSignUp}>
              Sign Up
            </Components.Button>
          </Components.Form>
        </Components.SignUpContainer>
        <Components.SignInContainer signingIn={signIn}>
          <Components.Form>
            <Components.Title>Sign in</Components.Title>
            <Components.Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Components.Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <Components.Anchor href="#">
              Forgot your password?
            </Components.Anchor>
            <Components.Button onClick={handleSignIn}>
              Sign In
            </Components.Button>
          </Components.Form>
        </Components.SignInContainer>
        <Components.OverlayContainer signingIn={signIn}>
          <Components.Overlay signingIn={signIn}>
            <Components.LeftOverlayPanel signingIn={signIn}>
              <Components.Title>Hello, Friend!</Components.Title>
              <Components.Paragraph>
                Enter your personal details and start journey with us
              </Components.Paragraph>
              {/* <Components.Accounttext>Already have an account?</Components.Accounttext> */}
              <Components.GhostButton onClick={() => toggle(true)}>
                Sign In
              </Components.GhostButton>
            </Components.LeftOverlayPanel>
            <Components.RightOverlayPanel signingIn={signIn}>
              <Components.Title>Pet Paw </Components.Title>
              <Components.Title>for Vet!</Components.Title>
              <Components.Paragraph>
                To keep connected with us please login with your personal info
              </Components.Paragraph>
              {/* <Components.Accounttext>Don't have an account?</Components.Accounttext> */}
              <Components.GhostButton onClick={() => toggle(false)}>
                Sign Up
              </Components.GhostButton>
            </Components.RightOverlayPanel>
          </Components.Overlay>
        </Components.OverlayContainer>
      </Components.Container>
    </div>
  );
}

export default Authen;
