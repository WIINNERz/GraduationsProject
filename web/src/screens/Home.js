import React, { useEffect } from 'react';
import {useNavigate , useLocation} from 'react-router-dom';
import styles from '../CSS/Home.module.css';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {auth, firestore} from '../firebase-config';

const Home = () => {

  const [isDarkMode, setIsDarkMode] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [doctor, setDoctor] = React.useState('');

  useEffect(() => {
    if (location.state && location.state.isDarkMode !== undefined) {
      setIsDarkMode(location.state.isDarkMode);
    } else {
      const savedTheme = localStorage.getItem('isDarkMode');
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    }

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setDoctor(user.displayName);
      } else {
        navigate('/');
      }
    });

    return () => unsubscribe();
  }, [location.state, navigate]);

  const handlelogout = () => {
    navigate('/');
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('isDarkMode', JSON.stringify(newTheme));
  };

  return (
    <div
      className={`${styles.screen} ${isDarkMode ? styles.dark : styles.light}`}>
      <div className={styles.header}>
        <h2>PetPaw for Vet</h2>
      </div>
      <div className={styles.section}>
        <div className={styles.nav}>
          <ul>
            <li>
              <h3>table of content</h3>

            </li>
            <li>
              <button
                className={styles.sidemenubtn}
                onClick={() => navigate('/user-form')}>
                {' '}
                form
              </button>
            </li>
            <li>
              <button className={styles.sidemenubtn} onClick={() => navigate('/petdetail' , {state: {isDarkMode}})}>Search Pet</button>
            </li>
            <li>
              <button onClick={toggleTheme} className={styles.sidemenubtn}>
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </button>
            </li>
            <li>
              <button className={styles.sidemenubtn} onClick={handlelogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
        <div className={styles.panel}>
          <h1>Welcome Docter {doctor}</h1>
         
          </div>
        </div>
        <div className={styles.footer}>
        <p>Powered by We have only Seaweed(™)</p>
      </div>
    </div>
  );
};

export default Home;
