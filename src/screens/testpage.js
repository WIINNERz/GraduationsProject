import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, TextInput, Alert } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import E2EE from '../components/E2EE';
import { auth, firestore } from '../configs/firebaseConfig';
import { getDoc, doc } from 'firebase/firestore';
import Keymanagement from '../components/Keymanagement';

const Testpage = ({ navigation }) => {
  const sharedSecret = 'b3SIJ9NIA4KsRU/bDSusIBfO+1YaOFWdn8q0nQzdkfY=';
  const [error, setError] = useState('');
  const KeymanagementInstance = Keymanagement();
  const [id, setId] = useState('');
  const [encryptedPetData, setEncryptedPetData] = useState(null);

  const fetchPet = async id => {
    try {
      const petDoc = await getDoc(doc(firestore, 'Pets', id));
      if (petDoc.exists()) {
        const petData = { id: petDoc.id, ...petDoc.data() };
        try {
          const encryptedPetData = {
            gender: petData.gender
              ? await KeymanagementInstance.encryptData(petData.gender)
              : null,
            birthday: petData.birthday
              ? await KeymanagementInstance.encryptData(petData.birthday)
              : null,
            height: petData.height
              ? await KeymanagementInstance.encryptData(petData.height.toString())
              : null,
            age: petData.age
              ? await KeymanagementInstance.encryptData(petData.age.toString())
              : null,
            breeds: petData.breeds
              ? await KeymanagementInstance.encryptData(petData.breeds)
              : null,
            characteristics: petData.characteristics
              ? await KeymanagementInstance.encryptData(petData.characteristics)
              : null,
            chronic: petData.chronic
              ? await KeymanagementInstance.encryptData(petData.chronic)
              : null,
            color: petData.color
              ? await KeymanagementInstance.encryptData(petData.color)
              : null,
            weight: petData.weight
              ? await KeymanagementInstance.encryptData(petData.weight.toString())
              : null,
          };
          console.log('Encrypted pet data:', encryptedPetData);
          setEncryptedPetData(encryptedPetData);
        } catch (err) {
          console.error('Error encrypting pet data:', err);
        }
      } else {
        setError('Pet not found');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPet(id);
    }
  }, [id]);

  return (
    <View style={styles.screen}>
      <MaterialCommunityIcons
        name="arrow-left"
        size={30}
        style={styles.back}
        onPress={() => navigation.goBack()}
      />
      <TextInput
        onChangeText={text => setId(text)}
        placeholder="Enter pet id"
      />
      <Button title="Fetch Pet Data" onPress={() => fetchPet(id)} />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  back: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  error: {
    color: 'red',
  },
});

export default Testpage;