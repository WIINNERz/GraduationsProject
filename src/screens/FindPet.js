import React, {useEffect, useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,

} from 'react-native';
import {
  getFirestore,
  collection,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import {petsRef} from '../configs/firebaseConfig';
import {useNavigation} from '@react-navigation/native';
import PetList from '../components/PetList';
import useAuth from '../hooks/useAuth';
import PetFilter from '../components/PetFilter';

const FindPet = () => {
  const {user} = useAuth();
  const navigation = useNavigation();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedField, setSelectedField] = useState('name'); // Default to 'name'

  const petQuery = useMemo(() => {
    let q = query(petsRef, where('status', '==', 'dont_have_owner'));
    if (filter !== 'all') {
      q = query(q, where('type', '==', filter));
    }
    if (searchQuery) {
      q = query(
        q,
        where(selectedField, '>=', searchQuery),
        where(selectedField, '<=', searchQuery + '\uf8ff')
      );
    }
      return q;
    }, [filter, searchQuery, selectedField]); 

  const fetchPets = () => {
    setLoading(true);
    setError(null);
    const unsubscribe = onSnapshot(
      petQuery,
      querySnapshot => {
        const data = querySnapshot.docs.map(doc => doc.data());
        setPets(data);
        setLoading(false);
      },
      error => {
        console.error('Error fetching pets: ', error);
        setError('Failed to fetch pets. Please try again later.');
        setLoading(false);
      },
    );

    return unsubscribe;
  };

  useEffect(() => {
    let isMounted = true;

    if (user?.uid) {
      const unsubscribe = fetchPets();
      return () => {
        isMounted = false;
        unsubscribe();
      };
    }
  }, [user?.uid, petQuery]);

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
       <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text
            style={styles.title}>
            Looking for Owner
          </Text>
        </View> 
       <View style={styles.filterContainer}>
        <PetFilter
          filter={filter}
          setFilter={setFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
        />
        </View>
        <View style={styles.datapanel}>
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
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
const {width} = Dimensions.get('window');
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
    height : '8%',
    paddingHorizontal: 20,
    flexDirection: 'row',
    backgroundColor: '#D27C2C',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  filterContainer: {
    justifyContent : 'flex-start',
    backgroundColor: '#fff',
    width: '100%',
    height: '22%',
   
  },
  datapanel: {
    backgroundColor: '#fff',
    width: '100%',
    marginBottom: '8%',
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
    marginBottom: 300,
  },
  title : {
    fontSize: titleSize,
    color: 'white',
    fontFamily: 'InterSemiBold',
  },
});

export default FindPet;


