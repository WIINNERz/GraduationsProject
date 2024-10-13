import React, {useEffect, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import styles from '../CSS/Petdetail.module.css';
import {
  collection,
  onSnapshot,
  query,
  where,
  doc,
  setDoc,
} from 'firebase/firestore';
import {auth, firestore} from '../firebase-config';

const Home = () => {
  const [petid, setIDtosearch] = React.useState('');
  const [petdata, setPetdata] = React.useState('');
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const [condition, setCondiotion] = React.useState('');
  const [vaccine, setVaccine] = React.useState('');
  const [treatment, setTreatment] = React.useState('');
  const [doctor, setDoctor] = React.useState('');
  const [quantity, setDose] = React.useState('');
  const [Note, setNote] = React.useState('');
  const [weight, setWeight] = React.useState('');
  const [vaccineList, setVaccineList] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const openAddRecordModal = () => {
    setIsAddRecordModalOpen(true);
  };
  const closeAddRecordModal = () => {
    setIsAddRecordModalOpen(false);
  };
  const openModal = record => {
    setSelectedRecord(record);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setIsModalOpen(false);
  };

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
    if (!petid) {
      alert('No pet data found pls search for pet first');
      return;
    }
    const petRef = collection(firestore, 'Pets', petid, 'MedicalHistory');

    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    // Create a timestamp in the format YYYYMMDD
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    const newRecordRef = doc(petRef, timestamp);
    const newRecord = {
      conditions: condition,
      vaccine: vaccineList,
      treatment: treatment,
      doctor: doctor,
      note: Note,
      date: `${day}-${month}-${year}`,
      time: `${hours}:${minutes}:${seconds}`,
    };
    await setDoc(newRecordRef, newRecord);
    setCondiotion('');
    setVaccine('');
    setTreatment('');
    setVaccineList([]);
    setDose('');
    setNote('');
  };
  const handleAddVaccine = () => {
    setVaccineList([...vaccineList, {name: vaccine, quantity: quantity}]);
    setVaccine('');
    setDose('');
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
    const pethealthRef = collection(firestore, 'Pets', petid, 'MedicalHistory');
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
    onSnapshot(pethealthRef, snapshot => {
      if (!snapshot.empty) {
        const medicalHistory = [];
        snapshot.forEach(doc => {
          medicalHistory.push(doc.data());
        });
        setPetdata(prevData => ({...prevData, medicalHistory}));
      }
    });
  };

  const clearpetdata = () => {
    setPetdata('');
    setIDtosearch('');
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
              <h3>table of content</h3>
            </li>
            <li>
              <button
                className={styles.sidemenubtn}
                onClick={() => navigate('/Home', {state: {isDarkMode}})}>
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
            {/* <p>Age: {petdata.age}</p> */}
            <p>type: {petdata.type}</p>
            {/* <p>Gender: {petdata.gender}</p> */}
            <p>Breed: {petdata.breeds}</p>
            {/* <p>Conditions: {petdata.conditions}</p> */}
            {/* <p>Weight: {petdata.weight} gram</p>
            <p>Height: {petdata.height} cm.</p>
            <p>Chronic: {petdata.chronic} </p> */}
          </div>
          <div className={styles.rightcontainer}>
            <div className={styles.medicalhistory}>
              <h1>Medical History</h1>
              <button onClick={openAddRecordModal} className={styles.recordbut}>
                Add New Record
              </button>
              <div className={styles.medicalhistorylist}>
                {petdata.medicalHistory && petdata.medicalHistory.length > 0 ? (
                  petdata.medicalHistory.map((record, index) => (
                    <button
                      key={index}
                      onClick={() => openModal(record)}
                      className={styles.recordbut}>
                      Record {index + 1}
                    </button>
                  ))
                ) : (
                  <p>No medical history records found.</p>
                )}
              </div>
            </div>
            {/* Modal */}
            {isModalOpen && (
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <span className={styles.close} onClick={closeModal}>
                    &times;
                  </span>
                  <h1>Medical Record</h1>
                  <p>Conditions: {selectedRecord.conditions}</p>
                  <p>Treatment: {selectedRecord.treatment}</p>
                  <p>Doctor: {selectedRecord.doctor}</p>
                  <p>Note: {selectedRecord.note}</p>
                  <p>Date: {selectedRecord.date}</p>
                  <p>Time: {selectedRecord.time}</p>
                  <div>
                    <h2>Vaccine</h2>
                    {selectedRecord.vaccine &&
                    selectedRecord.vaccine.length > 0 ? (
                      selectedRecord.vaccine.map((v, index) => (
                        <p key={index}>
                          {index + 1} {v.name} - {v.quantity} ml.
                        </p>
                      ))
                    ) : (
                      <p>No vaccine.</p>
                    )}
                  </div>
                </div>
              </div>
            )}
            {/* Add new record */}

            {isAddRecordModalOpen && (
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <span className={styles.close} onClick={closeAddRecordModal}>
                    &times;
                  </span>
                  <div className={styles.addnewrecord}>
                  <h2>Add new record to {petdata.name} </h2>
                    <form onSubmit={handleaddnewrecord} className={styles.form}>
                      <input
                        className={styles.modalinputnote}
                        type="text"
                        placeholder="health condition"
                        required
                        value={condition}
                        onChange={e => setCondiotion(e.target.value)}></input>
                      <input
                        className={styles.modalinput}
                        type="number"
                        placeholder="Weight (gram)"
                        value={weight}
                        onChange={e => setWeight(e.target.value)}></input>
                      <div className={styles.vaccine}>
                        <input
                          className={styles.modalinput}
                          type="text"
                          placeholder="Vaccine"
                          value={vaccine}
                          onChange={e => setVaccine(e.target.value)}></input>
                        <input
                          className={styles.modalinput}
                          type="number"
                          placeholder="quantity (ml)"
                          value={quantity}
                          onChange={e => setDose(e.target.value)}></input>
                        <button
                          type="button"
                          onClick={handleAddVaccine}
                          className={styles.addvac}>
                          Add Vaccine
                        </button>
                      </div>
                      <input
                        className={styles.modalinputnote}
                        type="text"
                        placeholder="Treatment"
                        value={treatment}
                        onChange={e => setTreatment(e.target.value)}></input>
                      <input
                        className={styles.modalinputnote}
                        type="text"
                        placeholder="Note"
                        value={Note}
                        onChange={e => setNote(e.target.value)}></input>

                      <div className={styles.vaccineList}>
                        <div className={styles.vaccineListTitle}>
                          Vaccine List
                        </div>
                        {vaccineList.map((v, index) => (
                          <div key={index}>
                            <span>
                              {index + 1} {v.name} - {v.quantity} ml.
                            </span>
                            &nbsp;
                            <button
                              onClick={() =>
                                setVaccineList(
                                  vaccineList.filter((_, i) => i !== index),
                                )
                              }>
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                      <button type="submit" className={styles.submitbut}>
                        Add record
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            )}


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
