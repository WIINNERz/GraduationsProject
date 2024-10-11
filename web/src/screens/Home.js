import React from 'react';
import {useNavigate} from 'react-router-dom';
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
  const [petid, setIDtosearch] = React.useState('');
  const [petdata, setPetdata] = React.useState('');
  const navigate = useNavigate();

  const handlelogout = () => {
    navigate('/');
  };

  const handlesearch = event => {
    event.preventDefault(); // Prevent form submission
    const petRef = query(
      collection(firestore, 'Pets'),
      where('id', '==', petid),
    );
    onSnapshot(petRef, snapshot => {
      if (snapshot.empty) {
        alert('No pet found');
        setPetdata('');
      } else {
        snapshot.forEach(doc => {
          setPetdata(doc.data());
        });
      }
    });
  };
  const clearpetdata = () => {
    setPetdata('');
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
              <p className={styles.headtext}>table of content</p>
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
              <button className={styles.sidemenubtn}>Blank</button>
            </li>
            <li>
              <button className={styles.sidemenubtn}>Blank</button>
            </li>
            <li>
              <button className={styles.sidemenubtn} onClick={handlelogout}>
                Logout
              </button>
            </li>
          </ul>
        </div>
        <div className={styles.article}>
          <form onSubmit={handlesearch}>
            <h1>Find pet by name</h1>
            <input
              className={styles.input}
              type="text"
              placeholder="Pet's name"
              required
              value={petid}
              onChange={e => setIDtosearch(e.target.value)}></input>
              
            <button type="submit" className={styles.Searchbut}>
              Search
            </button>
            <button type="cancel" className={styles.Clearbut} onClick={clearpetdata}>
              Clear
            </button>
          </form>
        </div>
        <div className={styles.article}>
          <h1>Pet data</h1>
          <p>Name: {petdata.id}</p>
          <p>Owner: {petdata.username}</p>
          <p>Age: {petdata.age}</p>
          <p>type: {petdata.type}</p>
          <p>Gender: {petdata.gender}</p>
          <p>Breed: {petdata.breeds}</p>
          <p>Conditions: {petdata.conditions}</p>
          <p>Weight: {petdata.weight} gram</p>
          <p>Height: {petdata.height} cm.</p>
          <p>Chronic: {petdata.chronic} </p>
        </div>
      </div>
      <div className={styles.footer}>
        <p>Powered by We have only Seaweed(™)</p>
      </div>
    </div>
  );
};

export default Home;
