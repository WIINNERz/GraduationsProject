import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import React, {useCallback, useEffect, useState} from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from 'firebase/firestore';
import {auth, firestore, storage} from '../configs/firebaseConfig';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Keymanagement from '../components/Keymanagement';

export default function PetProfile() {
  const navigate = useNavigation();
  const [pet, setPet] = useState(null);
  const route = useRoute();
  const {id} = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const KeymanagementInstance = new Keymanagement();
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      navigate.getParent()?.setOptions({
        tabBarStyle: {display: 'none'},
      });

      return () => {
        navigate.getParent()?.setOptions({
          tabBarStyle: [styles.tabBar, {backgroundColor: '#F0DFC8'}], // Reset tabBarStyle to default
        });
      };
    }, [navigate]),
  );

  useEffect(() => {
    const fetchPet = async () => {
      try {
        const petDoc = await getDoc(doc(firestore, 'Pets', id));
        if (petDoc.exists()) {
          const petData = {id: petDoc.id, ...petDoc.data()};

          try {
            const decryptedPetData = {
              id: petDoc.id,
              name: petData.name,
              photoURL: petData.photoURL,
              gender: petData.gender
                ? KeymanagementInstance.decryptData(petData.gender)
                : null,
              height: petData.height
                ? KeymanagementInstance.decryptData(petData.height)
                : null,
              age: petData.age
                ? KeymanagementInstance.decryptData(petData.age)
                : null,
              breeds: petData.breeds
                ? KeymanagementInstance.decryptData(petData.breeds)
                : null,
              characteristics: petData.characteristics
                ? KeymanagementInstance.decryptData(petData.characteristics)
                : null,
              chronic: petData.chronic
                ? KeymanagementInstance.decryptData(petData.chronic)
                : null,
              color: petData.color
                ? KeymanagementInstance.decryptData(petData.color)
                : null,
              weight: petData.weight
                ? KeymanagementInstance.decryptData(petData.weight)
                : null,
              type: petData.type,
            };

            setPet(decryptedPetData);
          } catch (err) {
            console.log(err);
          }
        } else {
          setError('Pet not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPet();
  }, [id]);
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.panel}>
          <MaterialCommunityIcons
            style={styles.back}
            name="arrow-left"
            size={35}
            color="#D27C2C"
            onPress={() => navigate.goBack()}
          />
          <MaterialCommunityIcons
            key={pet?.id}
            style={styles.edit}
            name="circle-edit-outline"
            size={35}
            color="#D27C2C"
            onPress={() => navigation.navigate('PetDetail', {id: pet?.id})}
          />
          {pet?.photoURL ? (
            <Image source={{uri: pet.photoURL}} style={styles.image} />
          ) : (
            <MaterialCommunityIcons name="account" size={150} color="gray" />
          )}
        </View>
        <Text
          style={{
            fontSize: 24,
            color: 'black',
            paddingVertical: 10,
            paddingHorizontal: 30,
            fontFamily: 'InterBold',
          }}>
          {pet?.name}
        </Text>
        <View style={styles.panelData}>
          <View style={styles.row}>
            <View style={styles.leftcolum}>
              <Text style={styles.categoryPet}>Breed</Text>
              <Text style={styles.valuePet}>{pet?.breeds}</Text>
            </View>
            <View style={styles.rightcolum}>
              <Text style={styles.categoryPet}>Sex</Text>
              <Text style={styles.valuePet}>{pet?.gender}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.leftcolum}>
              <Text style={styles.categoryPet}>Type</Text>
              <Text style={styles.valuePet}>{pet?.type}</Text>
            </View>
            <View style={styles.rightcolum}>
              <Text style={styles.categoryPet}>Color</Text>
              <Text style={styles.valuePet}>{pet?.color}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.leftcolum}>
              <Text style={styles.categoryPet}>Age</Text>
              <Text style={styles.valuePet}>{pet?.age}</Text>
            </View>
            <View style={styles.rightcolum}>
              <Text style={styles.categoryPet}>Birthday</Text>
              <Text style={styles.valuePet}>{pet?.brithday}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.leftcolum}>
              <Text style={styles.categoryPet}>Weight</Text>
              <Text style={styles.valuePet}>{pet?.weight}</Text>
            </View>
            <View style={styles.rightcolum}>
              <Text style={styles.categoryPet}>Height</Text>
              <Text style={styles.valuePet}>{pet?.height}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={styles.leftcolum}>
              <Text style={styles.categoryPet}>Characteristics</Text>
              <Text style={styles.valuePet}>{pet?.characteristics}</Text>
            </View>
            <View style={styles.rightcolum}>
              <Text style={styles.categoryPet}>Status</Text>
              <Text style={styles.valuePet}>wait for update</Text>
            </View>
          </View>
        </View>
        <View style={styles.healtbook}>
          <View style={styles.titlepanel}>
            <Text style={styles.healtbooktitle}>Health Book</Text>
          </View>
          <View style={styles.healtData}>
            <View style={{paddingVertical: 5, paddingBottom: '10%'}}>
              <Text style={styles.categoryPet}>Health Conditions</Text>
              <Text style={styles.valuePet}>All good </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.leftcolum}>
                <Text style={styles.categoryPet}>Drug allergy</Text>
                <Text style={styles.valuePet}>None ja baby</Text>
              </View>
              <View style={styles.rightcolum}>
                <Text style={styles.categoryPet}>Chronic</Text>
                <Text style={styles.valuePet}>{pet?.chronic}</Text>
              </View>
            </View>
            <View style={{paddingVertical: 5, paddingTop: '10%'}}>
              <Text style={styles.categoryPet}>Vaccination list</Text>
              <Text style={styles.valuePet}> 1. Mapping list </Text>
              <Text style={styles.valuePet}> 2. Wait for Update </Text>
              <Text style={styles.valuePet}> 3. </Text>
              <Text style={styles.valuePet}> 4. </Text>
            </View>
            <View style={{paddingVertical: 5}}>
              <Text
                style={{
                  fontSize: 18,
                  color: 'gray',
                  fontFamily: 'InterSemiBold',
                  paddingBottom: 10,
                }}>
                Medical History
              </Text>
              <TouchableOpacity style={styles.medrec}>
                <Text>Record 1 </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.medrec}>
                <Text>Record 2 </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  panel: {
    height: 350,
    backgroundColor: 'white',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healtbook: {
    marginTop: 20,
    width: '100%',
    flex: 1,
    height: '100%',
    backgroundColor: '#F0DFC8',
    borderRadius: 30,
    paddingHorizontal: 40,
    paddingVertical: 30,
  },
  healtbooktitle: {
    fontSize: 24,
    fontFamily: 'InterBold',
    color: '#D27C2C',
  },
  titlepanel: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-end',
  },
  healtData: {
    flexDirection: 'column',
    flex: 1,
  },
  panelData: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginHorizontal: 20,
    borderRadius: 20,
    borderColor: '#D27C2C',
    borderWidth: 1,
  },
  back: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 100,

    zIndex: 1,
  },
  edit: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 100,
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    backgroundColor: 'gray',
    alignContent: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryPet: {
    fontSize: 18,
    color: 'gray',
    fontFamily: 'InterSemiBold',
  },
  valuePet: {
    fontSize: 20,
    color: 'black',
    fontFamily: 'InterRegular',
  },
  tabBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '8%',
    position: 'absolute',
    overflow: 'hidden',
  },
  adoptbar: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
  },
  leftcolum: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-start',
  },
  rightcolum: {
    flexDirection: 'column',
    flex: 1,
    alignItems: 'flex-end',
  },
  medrec: {
    width: '100%',
    height: 60,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
});
