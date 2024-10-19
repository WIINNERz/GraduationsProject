import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Keyboard,
} from 'react-native';
import { onSnapshot, query, where } from 'firebase/firestore';
import { petsRef } from '../configs/firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import PetList from '../components/PetList';
import useAuth from '../hooks/useAuth';
import PetFilter from '../components/PetFilter';

const FindPet = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [state, setState] = useState({
    pets: [],
    loading: true,
    error: null,
    filter: 'all',
    searchQuery: '',
    selectedField: 'name',
    filterPaddingTop: 0,
    dataPanelPaddingTop: 0,
    headerHeight: '8%',
  });

  const handleKeyboardShow = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      filterPaddingTop: '12%',
      dataPanelPaddingTop: '12.5%',
      headerHeight: '11.2%',
    }));
    navigation.getParent()?.setOptions({
      tabBarStyle: { display: 'none' },
    });
  }, [navigation]);

  const handleKeyboardHide = useCallback(() => {
    setState(prevState => ({
      ...prevState,
      filterPaddingTop: 0,
      dataPanelPaddingTop: 0,
      headerHeight: '8%',
    }));
    navigation.getParent()?.setOptions({
      tabBarStyle: [styles.tabBar, { backgroundColor: '#F0DFC8' }],
    });
  }, [navigation]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
    const hideSubscription = Keyboard.addListener('keyboardDidHide', handleKeyboardHide);

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [handleKeyboardShow, handleKeyboardHide]);

  const petQuery = useMemo(() => {
    let q = query(petsRef, where('status', '==', 'dont_have_owner'));
    if (state.filter !== 'all') {
      q = query(q, where('type', '==', state.filter));
    }
    if (state.searchQuery) {
      q = query(
        q,
        where(state.selectedField, '>=', state.searchQuery),
        where(state.selectedField, '<=', state.searchQuery + '\uf8ff')
      );
    }
    return q;
  }, [state.filter, state.searchQuery, state.selectedField]);

  const fetchPets = useCallback(() => {
    setState(prevState => ({ ...prevState, loading: true, error: null }));
    const unsubscribe = onSnapshot(
      petQuery,
      querySnapshot => {
        const data = querySnapshot.docs.map(doc => doc.data());
        setState(prevState => ({ ...prevState, pets: data, loading: false }));
      },
      error => {
        console.error('Error fetching pets: ', error);
        setState(prevState => ({
          ...prevState,
          error: 'Failed to fetch pets. Please try again later.',
          loading: false,
        }));
      }
    );

    return unsubscribe;
  }, [petQuery]);

  useEffect(() => {
    if (user?.uid) {
      const unsubscribe = fetchPets();
      return () => unsubscribe();
    }
  }, [user?.uid, fetchPets]);

  const { pets, loading, error, filter, searchQuery, selectedField, filterPaddingTop, dataPanelPaddingTop, headerHeight } = state;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={[styles.header, { height: headerHeight }]}>
          <Text style={styles.title}>Looking for Owner</Text>
        </View>
        <View style={[styles.filterContainer, { paddingTop: filterPaddingTop }]}>
          <PetFilter
            filter={filter}
            setFilter={filter => setState(prevState => ({ ...prevState, filter }))}
            searchQuery={searchQuery}
            setSearchQuery={searchQuery => setState(prevState => ({ ...prevState, searchQuery }))}
            selectedField={selectedField}
            setSelectedField={selectedField => setState(prevState => ({ ...prevState, selectedField }))}
          />
        </View>
        <View style={[styles.datapanel, { marginTop: dataPanelPaddingTop }]}>
          {loading ? (
            <ActivityIndicator size="large" color="#0000ff" />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : pets.length > 0 ? (
            <View style={styles.petList}>
              <PetList pets={pets} />
            </View>
          ) : (
            <View style={styles.noPetsContainer}>
              <Text style={styles.noPetsText}>No Pets Available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const { width } = Dimensions.get('window');
const titleSize = width / 17;
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    height: '100%',
    width: '100%',
  },
  header: {
    width: '100%',
    height: '8%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    backgroundColor: '#D27C2C',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  filterContainer: {
    backgroundColor: '#fff',
    width: '100%',
    height: '28%',
  },
  datapanel: {
    backgroundColor: '#fff',
    width: '100%',
    height: '56%',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  noPetsContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  noPetsText: {
    fontFamily: 'InterLightItalic',
    fontSize: 18,
    color: '#555',
  },
  petList: {
    width: '100%',
    height: '100%',
    paddingHorizontal: 5,
  },
  title: {
    fontSize: titleSize,
    color: 'white',
    fontFamily: 'InterSemiBold',
  },
  tabBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '8%',
    position: 'absolute',
    overflow: 'hidden',
  },
});

export default FindPet;