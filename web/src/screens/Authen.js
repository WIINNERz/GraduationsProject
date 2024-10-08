import React, { useState } from 'react';
import * as Components from '../component/Authencomponent';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import auth from '../firebase-config'; // Import the initialized Firebase app

function Authen() {
  const navigate = useNavigate();
  const [signIn, toggle] = React.useState(true);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Successful sign-in
      console.log('Signed in successfully');
      navigate('/home');
    } catch (error) {
      // Handle errors
      setError(error.message);
    }
  };

  return (
      // <Components.Screen>
      <Components.Container>
        <Components.SignUpContainer signingIn={signIn}>
          <Components.Form>
            <Components.Title>Create Account</Components.Title>
            <Components.Input type="text" placeholder="Name" />
            <Components.Input type="email" placeholder="Email" />
            <Components.Input type="password" placeholder="Password" />
            <Components.Button>Sign Up</Components.Button>
          </Components.Form>
        </Components.SignUpContainer>
        <Components.SignInContainer signingIn={signIn}>
          <Components.Form>
            <Components.Title>Sign in</Components.Title>
            <Components.Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Components.Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Components.Anchor href="#">Forgot your password?</Components.Anchor>
            <Components.Button onClick={handleSignIn}>Sign In</Components.Button>
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
     // </Components.Screen>
  );
}

export default Authen;