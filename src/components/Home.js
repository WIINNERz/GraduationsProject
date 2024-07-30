import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { auth } from '../configs/firebaseConfig';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

const Home = () => {
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDogs = async () => {
    const user = auth.currentUser;
    if (user) {
      try {
        const db = getFirestore();
        const petsCollection = collection(db, 'Pets');
        const querySnapshot = await getDocs(petsCollection);

        const petList = querySnapshot.docs
          .filter(doc => doc.data().status === 'dont_have_owner')
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

        setPets(petList);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
      setError('User is not authenticated');
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchDogs();
    }, [])
  );

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
        <View style={styles.panel}>
          <Text style={{ fontSize: 20 }}>Looking for the owner</Text>
          <View>
            {loading ? (
              <Text>Loading...</Text>
            ) : error ? (
              <Text style={styles.error}>{error}</Text>
            ) : pets.length > 0 ? (
              pets.map(dog => (
                <View key={dog.id} style={styles.dogContainer}>
                  <View style={{flexDirection:'row'}}>
                    {dog.photoURL ? (
                      <Image source={{ uri: dog.photoURL }} style={styles.petPic} />
                    ) : (
                      <MaterialCommunityIcons name="dog" size={50} color="#E16539" />
                    )}
                    <Text>{dog.name}</Text>
                    </View>
                    <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('PetDetail', { id: dog.id })}>
                      <Text>รายละเอียด</Text>
                    </TouchableOpacity>
                </View>
              ))
            ) : (
              <Text style={styles.nopets}>No pets available</Text>
            )}
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#fff',
},
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    padding: 10,
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 10,
  },
  dogContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginHorizontal: "auto",
    padding: 10,
    borderRadius: 10,
    width: '90%',
    backgroundColor: '#F0DFC8',
  },
  petPic: {
    width: 50,
    height: 50,
    borderRadius: 40,
  },
  nopets: {
    textAlign: 'center',
    marginTop: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  button: {
    height:40,
    padding: 10,
    borderRadius:10,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    alignContent: 'center',
  }
});

export default Home;
