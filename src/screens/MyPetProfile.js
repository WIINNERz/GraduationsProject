import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, {useCallback, useState, useRef, useEffect, useMemo} from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import {doc, updateDoc, collection, onSnapshot} from 'firebase/firestore';
import {firestore} from '../configs/firebaseConfig';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Keymanagement from '../components/Keymanagement';
import MedicalHistoryModal from '../components/MedicalHistoryModal';

const {width, height} = Dimensions.get('window');

export default function PetProfile() {
  const navigate = useNavigation();
  const route = useRoute();
  const {id} = route.params;
  const [pet, setPet] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [status, setStatus] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  let vaccineCounter = 0;
  let hasVaccines = false;
  
  const flatListRef = useRef(null);
  const KeymanagementInstance = useMemo(() => new Keymanagement(), []);

  useFocusEffect(
    useCallback(() => {
      navigate.getParent()?.setOptions({
        tabBarStyle: {display: 'none'},
      });

      return () => {
        navigate.getParent()?.setOptions({
          tabBarStyle: [styles.tabBar, {backgroundColor: '#F0DFC8'}],
        });
      };
    }, [navigate]),
  );

  useEffect(() => {
    const petDocRef = doc(firestore, 'Pets', id);
    const unsubscribe = onSnapshot(petDocRef, async petDoc => {
      if (petDoc.exists()) {
        const petData = {id: petDoc.id, ...petDoc.data()};
        if (petData.status === 'have_owner') {
          try {
            const decryptedPetData = {
              id: petDoc.id,
              name: petData.name,
              photoURL: petData.photoURL,
              additionalImages: petData.additionalImages || null,
              type: petData.type,
              nid: petData.nid,
              status: petData.status,
              gender: petData.gender
                ? KeymanagementInstance.decryptData(petData.gender)
                : null,
              birthday: petData.birthday
                ? KeymanagementInstance.decryptData(petData.birthday)
                : null,
              height: petData.height
                ? KeymanagementInstance.decryptData(petData.height)
                : null,
              age: petData.age
                ? KeymanagementInstance.decryptData(petData.age)
                : null,
              breeds: petData.breeds
                ? petData.breeds
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
            };
            setPet(decryptedPetData);
            setStatus('My pet');
            setIsFavorite(!!petData.favorite);
          } catch (err) {
            console.error('Error decrypting pet data:', err);
          }
        } else {
          setPet(petData);
          setStatus('Adoptable');
          setIsFavorite(!!petData.favorite);
        }
      } else {
        setPet(null);
        setStatus(null);
      }
    });

    const medicalHistoryRef = collection(
      firestore,
      'Pets',
      id,
      'MedicalHistory',
    );
    const unsubscribeMedicalHistory = onSnapshot(
      medicalHistoryRef,
      snapshot => {
        const medicalHistoryList = snapshot.docs.map(doc => {
          const data = doc.data();
          const date = doc.id;
          return {id: doc.id, date, ...data};
        });
        setMedicalHistory(medicalHistoryList);
      },
    );

    return () => {
      unsubscribe();
      unsubscribeMedicalHistory();
    };
  }, [id, KeymanagementInstance]);

  const formatDate = dateString => {
    const [day, month, year] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };

  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);
    const petRef = doc(firestore, 'Pets', id);
    updateDoc(petRef, {
      favorite: !isFavorite,
    });
  };

  const renderImage = ({item}) => (
    <Image source={{uri: item}} style={styles.image} />
  );

  const imageData = useMemo(
    () =>
      pet?.additionalImages && pet.additionalImages.length > 0
        ? [pet.photoURL, ...pet.additionalImages].filter(url => url)
        : [pet?.photoURL].filter(url => url),
    [pet],
  );

  const handleRecordClick = record => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRecord(null);
  };

  // const vaccineCounts = useMemo(() => {
  //   const counts = {};
  //   medicalHistory.forEach(record => {
  //     const {vaccine} = record;
  //     if (vaccine) {
  //       counts[vaccine] = (counts[vaccine] || 0) + 1;
  //     }
  //   });
  //   return counts;
  // }, [medicalHistory]);

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
            onPress={() => navigate.navigate('PetDetail', {id: pet?.id})}
          />
          <FlatList
            data={imageData}
            renderItem={renderImage}
            keyExtractor={(item, index) => index.toString()}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            pagingEnabled={true}
            snapToAlignment="center"
            snapToInterval={width}
            decelerationRate="fast"
            ref={flatListRef}
            initialScrollIndex={0}
            onMomentumScrollEnd={event => {
              const index = Math.round(
                event.nativeEvent.contentOffset.x / width,
              );
              setCurrentIndex(index);
              flatListRef.current.scrollToIndex({animated: true, index});
            }}
          />
          {pet?.additionalImages && pet.additionalImages.length > 0 && (
            <View style={styles.pagination}>
              {imageData.map((_, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setCurrentIndex(index);
                    flatListRef.current.scrollToIndex({animated: true, index});
                  }}>
                  <View
                    style={[
                      styles.dot,
                      {opacity: index === currentIndex ? 1 : 0.5},
                    ]}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.namesection}>
          <Text style={styles.petName}>{pet?.name}</Text>
          <TouchableOpacity style={styles.favbutton} onPress={toggleFavorite}>
            <MaterialCommunityIcons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={25}
              color="#D27C2C"
            />
          </TouchableOpacity>
        </View>

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
              <Text style={styles.valuePet}>{pet?.birthday}</Text>
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
              <Text style={styles.categoryPet}>Status</Text>
              <Text style={styles.valuePet}>{status}</Text>
            </View>
            <View style={styles.rightcolum}> 
              <Text style={styles.categoryPet}>ID</Text>
              <Text style={styles.valuePet}>{pet?.nid}</Text>
            </View>
          </View>
          <View style={styles.onecolumn}>
            <Text style={styles.categoryPet}>Characteristics</Text>
            <Text style={styles.valuePet}>{pet?.characteristics}</Text>
          </View>
        </View>
        <View style={styles.healtbook}>
          <View style={styles.titlepanel}>
            <Text style={styles.healtbooktitle}>Health Book</Text>
          </View>
          <View style={styles.healtData}>
            <View style={{paddingVertical: 5, paddingBottom: '10%'}}>
              <Text style={styles.categoryPet}>Health Conditions</Text>
              <Text style={styles.valuePet}>
                {medicalHistory.length > 0 &&
                medicalHistory[medicalHistory.length - 1].conditions
                  ? medicalHistory[medicalHistory.length - 1].conditions
                  : 'No conditions available'}{' '}
              </Text>
            </View>
            <View style={styles.row}>
              <View style={styles.leftcolum}>
                <Text style={styles.categoryPet}>Drug allergy</Text>
                <Text style={styles.valuePet}>
                  {pet?.drugAllergy ? pet.drugAllergy : 'No drug allergy'}
                </Text>
              </View>
              <View style={styles.rightcolum}>
                <Text style={styles.categoryPet}>Chronic</Text>
                <Text style={styles.valuePet}>
                  {pet?.chronic ? pet.chronic : 'No chronic'}
                </Text>
              </View>
            </View>
            <View style={{ paddingVertical: 5, paddingTop: '10%' }}>
              <Text style={styles.categoryPet}>Vaccination list</Text>
              {medicalHistory.map((record) => (
                <View key={record.id} >
                  {Array.isArray(record.vaccine) && record.vaccine.length > 0 ? (
                    record.vaccine.map((vaccine) => {
                      hasVaccines = true;
                      vaccineCounter++;
                      return (
                        <View
                          key={vaccineCounter}
                          style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                          }}>
                          <Text style={styles.valuePet}>
                            {vaccineCounter}. {vaccine.name}
                          </Text>
                          <Text style={styles.valuePet}>{vaccine.quantity}</Text>
                        </View>
                      );
                    })
                  ) : null}
                </View>
              ))}
              {!hasVaccines && <Text>No vaccination records found.</Text>}
            </View>
            <View style={styles.paddingVertical}>
              <Text style={styles.categoryPet}>Medical History</Text>
              {medicalHistory.length === 0 ? (
                <Text>No medical history records found.</Text>
              ) : (
                medicalHistory.map((record, index) => {
                  const {id, date} = record;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={styles.medrec}
                      onPress={() => handleRecordClick(record)}>
                      <Text style={styles.valuePet}>Record : {index + 1}</Text>
                      <Text style={styles.date}>Date: {formatDate(date)}</Text>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
            <MedicalHistoryModal
              visible={modalVisible}
              record={selectedRecord}
              onClose={closeModal}
            />
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
    height: height * 0.4,
    width: '100%',
  },
  image: {
    width: width,
    height: '100%',
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
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
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  namesection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  favbutton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 5,
    borderWidth: 1,
    borderColor: '#D27C2C',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#D27C2C',
    marginHorizontal: 5,
  },
  date: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'InterRegular',
    opacity: 0.5,
  },
  petName: {
    fontSize: 24,
    color: 'black',
    paddingVertical: 10,
    paddingLeft: 30,
    fontFamily: 'InterSemiBold',
  },
});
