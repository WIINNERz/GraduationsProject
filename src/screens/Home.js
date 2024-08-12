import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import { auth,petsRef } from '../configs/firebaseConfig';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import HomeHeader from '../components/HomeHeader';
import PetList from '../components/PetList';
import useAuth from '../hooks/useAuth';

const Home = () => {
  const { logout, user } = useAuth();
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.uid) {
      fetchDogs();
    }
  }, [user?.uid]);

  const fetchDogs = async () => {
    try {
      const q = query(petsRef, where('status', '==', 'dont_have_owner'));
      const querySnapshot = await getDocs(q);
      let data = [];
      querySnapshot.forEach(doc => {
        data.push({ ...doc.data() });
      });
      setPets(data);
      setLoading(false);
      console.log('Pets fetched successfully:', data);
    } catch (error) {
      console.error("Error fetching pets: ", error);
      setLoading(false);
    }
  }
    return (
      <View>
        <HomeHeader />
        {
          loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : (
            pets.length > 0 ? (
              <PetList pets={pets} />
            ) : (
              <Text>No Pets</Text>
            )
          )
        }
      </View>
    );
  }
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: '#fff',
      },
    });
    export default Home;
