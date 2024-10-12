import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from '../CSS/Petdetail.module.css';
import { collection, onSnapshot, query, where, doc, setDoc } from 'firebase/firestore';
import { auth, firestore } from '../firebase-config';

const Home = () => {
  const [petid, setIDtosearch] = React.useState('');
  const [petdata, setPetdata] = React.useState('');
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const [condition, setCondiotion] = React.useState('');
  const [vaccine, setVaccine] = React.useState('');
  const [treatment, setTreatment] = React.useState('');
  const [doctor, setDoctor] = React.useState('');

  const navigate = useNavigate();
  const location = useLocation();
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

  const handleaddnewrecord = async event => {
    event.preventDefault(); // Prevent form submission
    const petRef = collection(firestore, 'Pets', petid, 'MedicalHistory');

    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = currentDate.getDate().toString().padStart(2, '0');

    // Create a timestamp in the format YYYYMMDD
    const timestamp = `${year}${month}${day}`;
    const newRecordRef = doc(petRef, timestamp);
    const newRecord = {
      conditions: condition,
      vaccine: vaccine,
      treatment: treatment,
      doctor: doctor,
      date: `${day}-${month}-${year}`, // Add date in DD-MM-YYYY format
    };
    await setDoc(newRecordRef, newRecord);
    setCondiotion('');
    setVaccine('');
    setTreatment('');
    setPetdata('');
    setIDtosearch('');
  };

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
          <h4>Doctor {doctor}</h4>
          <ul>
            <li>
              <p className={styles.headtext}>table of content</p>
            </li>
            <li>
              <button
                className={styles.sidemenubtn}
                onClick={() => navigate('/Home', { state: { isDarkMode } })}>
                Home
              </button>
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
        <div className={styles.mainsection}>
          <div className={styles.leftcontainer}>
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
              <button
                type="cancel"
                className={styles.Clearbut}
                onClick={clearpetdata}>
                Clear
              </button>
            </form>

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
          <div className={styles.rightcontainer}>
            <div className={styles.medicalhistory}>
              <h1>Medical History</h1>
            </div>
            <div className={styles.formaddnewrecord}>
              <h1>Add new record</h1>
              <form onSubmit={handleaddnewrecord} className={styles.form}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="health condition"
                  required
                  value={condition}
                  onChange={e => setCondiotion(e.target.value)}></input>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Vaccine"
                  required
                  value={vaccine}
                  onChange={e => setVaccine(e.target.value)}></input>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="Treatment"
                  required
                  value={treatment}
                  onChange={e => setTreatment(e.target.value)}></input>
                <button type="submit" className={styles.submitbut}>
                  Add record
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.footer}>
        <p>Powered by We have only Seaweed(™)</p>
      </div>
    </div>
  );
};

export default Home;
