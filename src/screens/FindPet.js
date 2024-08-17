import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TextInput } from 'react-native';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { petsRef } from '../configs/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import HomeHeader from '../components/HomeHeader';
import PetList from '../components/PetList';
import useAuth from '../hooks/useAuth';

const FindPet = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;  // flag to track if the component is mounted

    const fetchDogs = async () => {
      try {
        const q = query(petsRef, where('status', '==', 'dont_have_owner'));
        const querySnapshot = await getDocs(q);
        let data = [];
        querySnapshot.forEach(doc => {
          data.push({ ...doc.data() });
        });
        if (isMounted) {
          setPets(data);
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching pets: ", error);
        if (isMounted) {
          setError('Failed to fetch pets. Please try again later.');
          setLoading(false);
        }
      }
    };

    if (user?.uid) {
      fetchDogs();
    } return () => {
      isMounted = false;  // cleanup function to prevent setting state on unmounted component
    };
  }, [user?.uid]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={{ color: 'white',  fontFamily: 'InterSemiBold', fontSize: 28 }}>Looking for Owner</Text>
        <MaterialCommunityIcons style={styles.searchIcon} name="magnify" size={30} color="black" />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : pets.length > 0 ? (
        <View style={styles.petList}>
          <PetList style={styles.petList} pets={pets} />
        </View>

      ) : (
        <View style={styles.noPetsContainer}>
          <Text style={styles.noPetsText}>No Pets Available</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex : 1,
    height: '100%',
    width: '100%',
  },
  header: {
    width: '100%',
    height: "8%",
    padding: 20,
    flexDirection: 'row',
    backgroundColor: '#D27C2C',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  searchIcon: {
    position: 'absolute',
    right: 10,
    backgroundColor: 'white',
    borderRadius: 50,
  },
  noPetsContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  noPetsText: {
    fontSize: 18,
    color: '#555',
  },
  petList: {
    marginBottom: 150,
    
  },
});

export default FindPet;
