import React, {useEffect, useState} from 'react';
import {useNavigate, useLocation} from 'react-router-dom';
import styles from '../CSS/Petdetail.module.css';
import {
  collection,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  getDocs,
} from 'firebase/firestore';
import {onAuthStateChanged} from 'firebase/auth';
import {auth, firestore} from '../firebase-config';
import axios from 'axios';

const PetDetail = () => {
  const [petid, setIDtosearch] = useState('');
  const [petdata, setPetdata] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [userProfile, setUserProfile] = useState('');

  const [condition, setCondiotion] = useState('');
  const [vaccine, setVaccine] = useState('');
  const [treatment, setTreatment] = useState('');
  const [doctor, setDoctor] = useState('');
  const [quantity, setDose] = useState('');
  const [Note, setNote] = useState('');
  const [weight, setWeight] = useState('');
  const [vaccineList, setVaccineList] = useState([]);
  const [drugAllergy, setDrugAllergy] = useState('');
  const [ChronicDisease, setChronicDisease] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isAddRecordModalOpen, setIsAddRecordModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = process.env.REACT_APP_WEB_API_URL;
  const apikey = process.env.REACT_APP_WEB_API_KEY;

  const profilemodaltoggle = () => {
    setIsProfileModalOpen(!isProfileModalOpen);
  };
  const AddrecordModaltoggle = () => {
    setIsAddRecordModalOpen(!isAddRecordModalOpen);
  };

  const openModal = async record => {
    setIsLoading(true);
    setIsModalOpen(true);
    const decryptedData = {
      conditions: record.conditions ? await decrypt(record.conditions) : null,
      vaccine: record.vaccine
        ? await Promise.all(
            record.vaccine.map(async v => ({
              name: v.name ? await decrypt(v.name) : null,
              quantity: v.quantity ? await decrypt(v.quantity) : null,
            })),
          )
        : null,
      treatment: record.treatment ? await decrypt(record.treatment) : null,
      doctor: await decrypt(record.doctor),
      note: record.note ? await decrypt(record.note) : null,
      date: await decrypt(record.date),
      time: await decrypt(record.time),
      drugallergy: record.drugallergy
        ? await decrypt(record.drugallergy)
        : null,
      chronic: record.chronic ? await decrypt(record.chronic) : null,
    };
    setSelectedRecord(decryptedData);
    setIsLoading(false);
  };

  const closeModal = () => {
    setSelectedRecord(null);
    setIsModalOpen(false);
  };

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
    const petid = petdata.id;
    if (!petid) {
      alert('No pet data found pls search for pet first');
      return;
    }
    const petRef = collection(firestore, 'Pets', petdata.id, 'MedicalHistory');
    const currentDate = new Date();
    const year = currentDate.getFullYear().toString();
    const month = (currentDate.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
    const day = currentDate.getDate().toString().padStart(2, '0');
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const seconds = currentDate.getSeconds().toString().padStart(2, '0');

    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    const newRecordRef = doc(petRef, timestamp);
    const encrecord = {
      conditions: condition ? await encrpyt(condition) : null,
      vaccine:
        vaccineList.length > 0
          ? await Promise.all(
              vaccineList.map(async v => ({
                name: await encrpyt(v.name),
                quantity: await encrpyt(v.quantity.toString()),
              })),
            )
          : null,
      treatment: treatment ? await encrpyt(treatment) : null,
      doctor: await encrpyt(doctor),
      note: Note ? await encrpyt(Note) : null,
      date: await encrpyt(`${day}-${month}-${year}`),
      time: await encrpyt(`${hours}:${minutes}:${seconds}`),
      drugallergy: drugAllergy ? await encrpyt(drugAllergy) : null,
      chronic: ChronicDisease ? await encrpyt(ChronicDisease) : null,
    };
    await setDoc(newRecordRef, encrecord);
    await handlesearch(event);
    setCondiotion('');
    setVaccine('');
    setTreatment('');
    setVaccineList([]);
    setDose('');
    setNote('');
    setWeight('');
    setDrugAllergy('');
    setChronicDisease('');
    AddrecordModaltoggle();
  };

  const handleAddVaccine = () => {
    setVaccineList([...vaccineList, {name: vaccine, quantity: quantity}]);
    setVaccine('');
    setDose('');
  };

  const handlelogout = () => {
    navigate('/');
  };

  const handlesearch = async event => {
    event.preventDefault(); // Prevent form submission
    const petRef = collection(firestore, 'Pets');
    const petidNumber = Number(petid); // Ensure petid is a number
    const q = query(petRef, where('nid', '==', petidNumber));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert('No pet found');
      setPetdata('');
    } else {
      querySnapshot.forEach(async doc => {
        const petData = doc.data();
        setPetdata(petData);

        const pethealthRef = collection(
          firestore,
          'Pets',
          doc.id,
          'MedicalHistory',
        );
        const healthSnapshot = await getDocs(pethealthRef);

        if (!healthSnapshot.empty) {
          const medicalHistory = healthSnapshot.docs.map(doc => doc.data());
          setPetdata(prevData => ({...prevData, medicalHistory}));
        }
      });
    }
  };
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        const docRef = doc(firestore, 'Vets', user.uid);
        try {
          getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
              docSnap.data();
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

  const encrpyt = async plaintext => {
    try {
      const response = await axios.post(
        `${API_URL}encrypt`,
        {plaintext},
        {
          headers: {'x-api-key': apikey}
        }
      );
      const {encryptedData} = response.data;
      return encryptedData;
    } catch (error) {
      console.error(
        'Encryption error:',
        error.response ? error.response.data : error.message,
      );
      throw error; // สามารถโยน error กลับเพื่อให้เรียกใช้ฟังก์ชันนี้จัดการได้
    }
  };
  const decrypt = async encryptedText => {
    try {
      const response = await axios.post(`${API_URL}decrypt`,{ encryptedText },{headers: {'x-api-key': apikey}});
      const {decryptedText} = response.data;
      return decryptedText;
    } catch (error) {
      console.error(
        'Decryption error:',
        error.response ? error.response.data : error.message,
      );
      throw error; // สามารถโยน error กลับเพื่อให้เรียกใช้ฟังก์ชันนี้จัดการได้
    }
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
      {isProfileModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <span className={styles.close} onClick={profilemodaltoggle}>
              &times;
            </span>
            <h2>Profile</h2>
            <p>
              Name: {userProfile.firstname} {userProfile.lastname}
            </p>
            <p>Email: {userProfile.email}</p>
            <p>Role: {userProfile.role}</p>
          </div>
        </div>
      )}
      <div className={styles.header}>
        <h2>Search Pet</h2>
        <div onClick={profilemodaltoggle} className={styles.profile}>
          <h4 className={styles.docname}>
            Doctor {userProfile.firstname} {userProfile.lastname}
          </h4>
        </div>
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
            <li>
              <button className={styles.sidemenubtn} onClick={handlelogout}>
                Logout
              </button>
            </li>
            <li></li>
          </ul>
        </div>
        <div className={styles.mainsection}>
          <div className={styles.leftcontainer}>
            <form onSubmit={handlesearch}>
              <h1>Find pet by ID</h1>
              <input
                className={styles.input}
                type="text"
                placeholder="Pet's ID"
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
            <p>type: {petdata.type}</p>
            <p>Breed: {petdata.breeds}</p>
          </div>
          <div className={styles.rightcontainer}>
            <div className={styles.medicalhistory}>
              <h1>Medical History</h1>
              <button
                onClick={AddrecordModaltoggle}
                className={styles.recordbut}>
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
                  {isLoading ? (
                    <div className={styles.loader}></div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>
              </div>
            )}
            {/* Add new record */}

            {isAddRecordModalOpen && (
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <span className={styles.close} onClick={AddrecordModaltoggle}>
                    &times;
                  </span>
                  <div className={styles.addnewrecord}>
                    <h2 style={{paddingLeft: 10}}>
                      Add new record to {petdata.name}{' '}
                    </h2>
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
                      <p style={{paddingLeft: 10}}>
                        **fill only new information**
                      </p>
                      <input
                        className={styles.modalinput}
                        type="text"
                        placeholder=" New Drug Allergy"
                        value={drugAllergy}
                        onChange={e => setDrugAllergy(e.target.value)}
                      />
                      <input
                        className={styles.modalinput}
                        type="text"
                        placeholder="New Chronic Disease"
                        value={ChronicDisease}
                        onChange={e => setChronicDisease(e.target.value)}
                      />

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

export default PetDetail;
