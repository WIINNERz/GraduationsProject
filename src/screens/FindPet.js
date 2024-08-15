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
    }

    return () => {
      isMounted = false;  // cleanup function to prevent setting state on unmounted component
    };
  }, [user?.uid]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.ownerButton}>
          <Text style={{ color: 'white' }}>Looking for Owner</Text>
        </View>
        <View style={styles.searchContainer}>
          <TextInput style={styles.searchInput} placeholder='Find pet name' />
          <MaterialCommunityIcons style={styles.searchIcon} name="magnify" size={30} color="black" />
        </View>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : pets.length > 0 ? (
        <PetList pets={pets} />
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
    paddingBottom: 20,
    height: '100%',
  },
  header: {
    justifyContent: 'space-between',
    alignItems: '',
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  ownerButton: {
    backgroundColor: '#E16539',
    alignContent:'flex-end',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginRight: 10,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0DFC8',
    borderRadius: 10,
    paddingLeft: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  searchIcon: {
    paddingHorizontal: 10,
  },


  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  search: {
    backgroundColor: '#F0DFC8',
    padding: 10,
    margin: 10,
    borderRadius: 10,
    width: '80%'
  },
  noPetsContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  noPetsText: {
    fontSize: 18,
    color: '#555',
  },
});

export default FindPet;
