import React from 'react';
import {useNavigate} from 'react-router-dom';
import styles from '../CSS/Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const handlelogout = () => {
    navigate('/');
  };
  return (
    <div className={styles.screen}>

        <div className={styles.header}>
          <h2>PetPaw for Vet</h2>
        </div>
        <div className={styles.section}>
          <div className={styles.nav}>
            <ul>
              <li>
                <h2>table of content</h2>
              </li>
              <li>
                <button onClick={() => navigate('/user-form')}> form</button>
              </li>
              <li>
                <button onClick={handlelogout}>Logout</button>
              </li>
            
            </ul>
          </div>
          <div className={styles.article}>
            <h1>Welcome to the Home Page</h1>
            <p>
              Got confused about the pet's health? Don't worry, we are here to
              help you. PetPaw for Vet is a platform where you can get the
              solution to your pet's health problems. We have a team of
              experienced veterinarians who are always ready to help you. You can
              ask your queries and get the solution from our experts. We also
              provide the facility to book an appointment with our veterinarians.
              So, what are you waiting for? Just sign in and get the solution to
              your pet's health problems.  
            </p>
            

          </div>
        </div>
        <div className={styles.footer}>
          <p>Powered by We have only Seaweed(™)</p>
        </div>
      </div>

  );
};

export default Home;
