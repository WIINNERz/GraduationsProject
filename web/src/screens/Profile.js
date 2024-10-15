import React, {useEffect} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import styles from '../CSS/Profile.module.css';
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
} from 'firebase/firestore';
import {onAuthStateChanged} from 'firebase/auth';
import {auth, firestore} from '../firebase-config';
import axios from 'axios';

const Profile = () => {
  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const [userProfile, setUserProfile] = React.useState('');
  const [plaintext, setPlaintext] = React.useState('');
  const [ciphertext, setCiphertext] = React.useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const user = auth.currentUser;
  useEffect(() => {
    if (location.state && location.state.isDarkMode !== undefined) {
      setIsDarkMode(location.state.isDarkMode);
    } else {
      const savedTheme = localStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    }
  }, [location.state, navigate]);
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('isDarkMode', JSON.stringify(newTheme));
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        const docRef = doc(firestore, 'Users', user.uid);
        try {
          getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
              setUserProfile(docSnap.data());
            } else {
              console.log('No such document!');
            }
          });
        } catch (error) {
          console.log('Error getting document:', error);
        }
      } else {
        console.log('No user is signed in');
        navigate('/login'); // Redirect to login if no user is signed in
      }
    });
    return () => unsubscribe();
  }, [navigate]);
  const API_URL = 'https://petpaw-six.vercel.app/';
  
  const testenc = async event => {
    event.preventDefault(); // Prevent form submission
    try {
      const response = await axios.post(`${API_URL}encrypt`, { plaintext });
      const { encryptedData } = response.data; // Extract encryptedData from response
      setCiphertext(encryptedData); // Set ciphertext state
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div
      className={`${styles.screen} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.header}>
        <h2>Profile</h2>
      </div>
      <div className={styles.section}>
        <div className={styles.nav}>
          <ul>
            <li>
              <h3>table of content</h3>
            </li>
            <li>
              <button onClick={toggleTheme} className={styles.sidemenubtn}>
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>
            </li>
            <button
              onClick={() => navigate('/petdetail')}
              className={styles.sidemenubtn}>
              Pet Detail
            </button>
          </ul>
        </div>
        <div className={styles.panel}>
          <div className={styles.profile}>
            <form className={styles.form} onSubmit={testenc}>
              <input
                className={styles.input}
                type="text"
                placeholder="plaintext"
                required
                value={plaintext}
                onChange={e => setPlaintext(e.target.value)}></input>
              <button className={styles.button} type="submit" />
            </form>
            <p>{ciphertext}</p>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <p>Powered by We have only Seaweed(™)</p>
      </div>
    </div>
  );
};

export default Profile;
