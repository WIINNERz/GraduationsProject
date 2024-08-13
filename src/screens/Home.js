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
  const navigation = useNavigation();

    return (
      <View>

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
