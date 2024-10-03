import React, {useCallback, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import {useNavigation, useFocusEffect} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {auth} from '../configs/firebaseConfig';

export default function MyPet() {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigation = useNavigation();
  const user = auth.currentUser;

  const fetchDogs = async () => {
    if (user) {
      try {
        const db = getFirestore();
        const petsCollection = collection(db, 'Pets');
        const q = query(petsCollection, where('uid', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const petList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setDogs(petList);
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
    }, []),
  );

  const renderDogItem = ({item}) => (
    <TouchableOpacity
      key={item.id}
      style={styles.dogContainer}
      onPress={() => navigation.navigate('MyPetProfile', {id: item.id})}>
      {item.photoURL ? (
        <Image source={{uri: item.photoURL}} style={styles.petPic} />
      ) : (
        <MaterialCommunityIcons name="dog" size={80} color="#E16539" />
      )}
      <Text style={styles.petdetail}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
          <MaterialCommunityIcons
            style={styles.back}
            name="arrow-left"
            size={35}
            color="#D27C2C"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.screentitle}>My Pets</Text>
        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => navigation.navigate('AddPet')}>
          <MaterialCommunityIcons name="plus" size={35} color="#E16539" />
        </TouchableOpacity>
      </View>

      <View style={styles.container}>
        
        {loading ? (
          <Text>Loading...</Text>
        ) : error ? (
          <Text>Error: {error}</Text>
        ) : dogs.length > 0 ? (
          <FlatList
            data={dogs}
            renderItem={renderDogItem}
            keyExtractor={item => item.id}
            numColumns={3}
            contentContainerStyle={styles.flatListContent}
          />
        ) : (
          <Text style={styles.nopets}>No pets available</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  back: {

    backgroundColor: 'white',
    borderRadius: 100,

    zIndex: 1,
  },
  header: {
    width: '100%',
    height: '8%',
    justifyContent: 'space-between',
    paddingHorizontal: '5%',
    flexDirection: 'row',
    alignItems : "center",
    backgroundColor: '#D27C2C',

  },
  container: {
    flex: 1,
    height: '92%',
    padding: '3%',
    marginBottom: 60,
  },
  dogContainer: {
    alignItems: 'center',
    margin: 5,
    padding: 10,
    borderRadius: 10,
    width: '30%',
    backgroundColor: '#F0DFC8',
  },
  plusButton: {
    borderRadius: 100,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',

  },
  petdetail: {
    paddingTop: 5,
    fontSize: 16,
    color: '#E16539',
    textAlign: 'center',
    fontFamily: 'InterBold',
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: 'white',
    backgroundColor: '#D27C2C',
    fontFamily: 'InterSemiBold',
  },
  petPic: {
    width: 80,
    height: 80,
    borderRadius: 50,
  },
  nopets: {
    textAlign: 'center',
    fontSize: 18,
    marginTop: 20,
  },
  flatListContent: {
    justifyContent: 'space-between',
  },
  screentitle: {
    fontSize: 26,
    color: 'white',
    fontFamily: 'InterBold',
    
  },
});
