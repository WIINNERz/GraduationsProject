import React, {useState} from 'react';
import * as Components from '../component/Authencomponent';
import {useNavigate} from 'react-router-dom';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import {getDoc, doc, collection, setDoc,getDocs} from 'firebase/firestore';
import {auth, firestore} from '../firebase-config';
import styles from '../CSS/Authen.module.css';
import CryptoJS from 'crypto-js'; 

function Authen() {
  const navigate = useNavigate();
  const [signIn, toggle] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = useState('');
  const [firstname, setFirstname] = React.useState('');
  const [lastname, setLastname] = React.useState('');
  const [id, setID] = React.useState('');


  const validatePassword = password => {
    const regex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return regex.test(password);
  };
  const validateThaiId = async id => {
    const thaiIdInput = id;
    const m = thaiIdInput.match(/(\d{12})(\d)/);
    if (!m) {
       alert('Thai ID must be 13 digits');
      return;
    }
    const digits = m[1].split('');
    const sum = digits.reduce((total, digit, i) => {
      return total + (13 - i) * +digit;
    }, 0);
    const lastDigit = `${(11 - (sum % 11)) % 10}`;
    const inputLastDigit = m[2];
    if (lastDigit !== inputLastDigit) {
        alert('Thai ID is invalid');
      return;
    }
    return true;
  };
  const handleSignIn = async e => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(
        doc(firestore, 'Vets', auth.currentUser.uid),
      );
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.role !== 'Veterinarian') {
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
      navigate('/petdetail');
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
      alert(error);
      return;
    }
    try {
      const idcheck = await validateThaiId(id); // Await the validateThaiId function
      if (idcheck) {
        const hash = CryptoJS.SHA256(id).toString();
        const usersSnapshot = await getDocs(collection(firestore, 'Vets'));
        let hashExists = false;
    
        usersSnapshot.forEach(userDoc => {
          const userData = userDoc.data();
          if (userData.hashedID === hash) {
            hashExists = true;
          }
        });
    
        if (hashExists) {
          console.log('This ID card number has already been used');
          alert('This ID card number has already been used');
          return;
        } else {
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
    
          await setDoc(doc(firestore, 'Vets', uid), {
            firstname: firstname,
            lastname: lastname,
            email: email,
            hashedID: hash,
            uid,
            role: 'Veterinarian',
          });
          alert('Signed up successfully');
          navigate('/petdetail');
        }
      }
    } catch (error) {
      console.log(error.message);
      alert('Error: ' + error.message);
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
              <Components.GhostButton onClick={() => toggle(true)}>
                Sign In
              </Components.GhostButton>
            </Components.LeftOverlayPanel>
            <Components.RightOverlayPanel signingIn={signIn}>
              <Components.Title>Pet Pal </Components.Title>
              <Components.Title>for Vet!</Components.Title>
              <Components.Paragraph>
                To keep connected with us please login with your personal info
              </Components.Paragraph>
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
