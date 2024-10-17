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
  Keyboard,

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
  const [filterPaddingTop, setFilterPaddingTop] = useState(0); // State for paddingTop
  const [dataPanelPaddingTop, setDataPanelPaddingTop] = useState(0); // State for paddingTop
  const [headerHeight, setHeaderHeight] = useState(0); // State for header height
  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      setFilterPaddingTop('12%'); // Set paddingTop to 20 when keyboard is shown
      setDataPanelPaddingTop('12.5%'); // Set paddingTop to 20 when keyboard is shown
      setHeaderHeight('11.2%'); // Set paddingTop to 20 when keyboard is shown
      navigation.getParent()?.setOptions({
        tabBarStyle: { display: 'none' },
      });
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      setFilterPaddingTop(0);
      setDataPanelPaddingTop(0);
      setHeaderHeight('8%');
      navigation.getParent()?.setOptions({
        tabBarStyle: [styles.tabBar, { backgroundColor: '#F0DFC8' }],
      });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, [navigation]);
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
        <View style={[styles.header,{height: headerHeight}]}>
          <Text
            style={styles.title}>
            Looking for Owner
          </Text>
        </View> 
        <View style={[styles.filterContainer, {paddingTop: filterPaddingTop}]}>
        <PetFilter
          filter={filter}
          setFilter={setFilter}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedField={selectedField}
          setSelectedField={setSelectedField}
        />
        </View>
        <View style={[styles.datapanel, {marginTop: dataPanelPaddingTop}]}>
        {/* <View style={styles.datapanel}> */}
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : pets.length > 0 ? (
          <View style={styles.petList}>
            <PetList  pets={pets} />
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
    backgroundColor: '#fff',
    width: '100%',
    height: '22%',
   
  },
  datapanel: {
    backgroundColor: '#fff',
    width: '100%',
    height: '62%',
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
    fontFamily: 'InterLightItalic',
    fontSize: 18,
    color: '#555',
  },
  petList: {
    width: '100%',
    height: '100%',
    paddingHorizontal : 5,
    
  },
  title : {
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


