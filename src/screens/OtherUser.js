import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Image, FlatList} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import {firestore} from '../configs/firebaseConfig';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Keymanagement from '../components/Keymanagement';

export default function OtherUser() {
  const route = useRoute();
  const navigate = useNavigation();
  const {username, uid} = route.params;
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pets, setPets] = useState([]);
  const KeymanagementInstance = new Keymanagement();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(firestore, 'Users', uid));
        if (userDoc.exists()) {
          const {firstname, lastname} = {
            firstname: userDoc.data().firstname
              ? await KeymanagementInstance.decryptviaapi(
                  userDoc.data().firstname,
                )
              : null,
            lastname: userDoc.data().lastname
              ? await KeymanagementInstance.decryptviaapi(
                  userDoc.data().lastname,
                )
              : null,
          };

          setUser({ ...userDoc.data(), firstname, lastname });
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserPets = async () => {
      try {
        const petsQuery = query(
          collection(firestore, 'Pets'),
          where('uid', '==', uid),
        );
        const petsSnapshot = await getDocs(petsQuery);
        const petsList = petsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPets(petsList);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchUserData();
    fetchUserPets();
  }, [username, uid]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        style={styles.back}
        name="arrow-left"
        size={30}
        color="#D27C2C"
        onPress={() => navigate.goBack()}
      />
      <View style={styles.content}>
        <Image source={{uri: user?.photoURL}} style={styles.profileImage} />
        <View style={styles.userInfo}>
          <Text style={styles.username}>{user?.username}</Text>
          <View style={styles.nameContainer}>
            {/* <Text style={styles.nameText}>WAIIYAWAT </Text>
                        <Text style={styles.nameText}>SAELEE</Text> */}
            <Text style={styles.nameText}>{user?.firstname} </Text> 
            <Text style={styles.nameText}>{user?.lastname}</Text>
          </View>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Pets</Text>
      <FlatList
        data={pets}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <View style={styles.petItem}>
            <Image source={{uri: item.photoURL}} style={styles.petImage} />
            <View>
              <Text style={styles.petName}>{item.name}</Text>
              <Text>{item.breeds}</Text>
            </View>
          </View>
        )}
        contentContainerStyle={styles.container}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontFamily: 'InterBold',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: 'red',
    fontFamily: 'InterBold',
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 20,
  },
  username: {
    fontSize: 24,
    fontFamily: 'InterBold',
    marginBottom: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(210, 124, 44, 0.5)',
    padding: 20,
    paddingTop: 50,
    width: '100%',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    marginBottom: 10,
  },
  userInfo: {
    alignItems: 'center',
  },
  nameContainer: {
    flexDirection: 'row',
  },
  nameText: {
    fontSize: 18,
    fontFamily: 'InterRegular',
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: 'InterBold',
    marginVertical: 20,
  },
  petItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 10,
    borderRadius: 25,
    backgroundColor: '#F0DFC8',
    width: '90%',
  },
  petImage: {
    width: 75,
    height: 75,
    borderRadius: 50,
    marginRight: 10,
  },
  petName: {
    fontSize: 18,
    fontFamily: 'InterRegular',
    fontWeight: 'bold',
  },
  back: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 100,
    zIndex: 1,
  },
});
