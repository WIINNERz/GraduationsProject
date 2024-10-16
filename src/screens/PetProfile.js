import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';
import { getFirestore, doc, getDoc, collection, onSnapshot } from 'firebase/firestore';
import { firestore } from '../configs/firebaseConfig';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AdoptBar from '../components/AdoptBar';
import MedicalHistoryModal from '../components/MedicalHistoryModal';
import Keymanagement from '../components/Keymanagement';

const { width } = Dimensions.get('window');

export default function PetProfile() {
  const navigate = useNavigation();
  const [pet, setPet] = useState(null);
  const [medicalHistory, setMedicalHistory] = useState([]);
  const route = useRoute();
  const { id } = route.params;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [ishloading, sethLoading] = useState(false);
  const flatListRef = useRef(null);
  let vaccineCounter = 0;
  let chroniccounter = 0;
  let drugallergycounter = 0;
  let hasVaccines = false;
  let hasChronic = false;
  let hasDrugAllergy = false;
  const keyman = Keymanagement();

  useFocusEffect(
    useCallback(() => {
      navigate.getParent()?.setOptions({
        tabBarStyle: { display: 'none' },
      });

      return () => {
        navigate.getParent()?.setOptions({
          tabBarStyle: [styles.tabBar, { backgroundColor: '#F0DFC8' }],
        });
      };
    }, [navigate]),
  );

  const fetchPetData = useCallback(async () => {
    try {
      const petDoc = await getDoc(doc(firestore, 'Pets', id));
      if (petDoc.exists()) {
        const petData = { id: petDoc.id, ...petDoc.data() };
        setPet(petData);
      } else {
        setError('Pet not found');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const subscribeToMedicalHistory = useCallback(() => {
    const medicalHistoryRef = collection(firestore, 'Pets', id, 'MedicalHistory');
    const unsubscribeMedicalHistory = onSnapshot(
      medicalHistoryRef,
      async snapshot => {
        sethLoading(true);
        const medicalHistoryList = await Promise.all(
          snapshot.docs.map(async doc => {
            const data = doc.data();
            return {
              id: doc.id,
              conditions: data.conditions
                ? await keyman.decrypthealthdata(data.conditions)
                : null,
              vaccine: data.vaccine
                ? await Promise.all(
                  data.vaccine.map(async v => ({
                    name: v.name
                      ? await keyman.decrypthealthdata(v.name)
                      : null,
                    quantity: v.quantity
                      ? await keyman.decrypthealthdata(v.quantity)
                      : null,
                  })),
                )
                : null,
              treatment: data.treatment
                ? await keyman.decrypthealthdata(data.treatment)
                : null,
              doctor: data.doctor
                ? await keyman.decrypthealthdata(data.doctor)
                : null,
              note: data.note
                ? await keyman.decrypthealthdata(data.note)
                : null,
              date: data.date
                ? await keyman.decrypthealthdata(data.date)
                : null,
              time: data.time
                ? await keyman.decrypthealthdata(data.time)
                : null,
              drugallergy: data.drugallergy
                ? await keyman.decrypthealthdata(data.drugallergy)
                : null,
              chronic: data.chronic
                ? await keyman.decrypthealthdata(data.chronic)
                : null,
            };
          }),
        );

        setMedicalHistory(medicalHistoryList);
        sethLoading(false);
      }
    );
    return unsubscribeMedicalHistory;
  }, [id]);

  useEffect(() => {
    fetchPetData();
    const unsubscribe = subscribeToMedicalHistory();
    return () => unsubscribe();
  }, [fetchPetData, subscribeToMedicalHistory]);

  const formatDate = dateString => {
    const [day, month, year] = dateString.split('-');
    return `${day}-${month}-${year}`;
  };
  const renderImage = useCallback(({ item }) => {
    return <Image source={{ uri: item }} style={styles.image} />;
  }, []);
  const handleRecordClick = record => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRecord(null);
  };
  const imageData = pet?.additionalImages && pet.additionalImages.length > 0
    ? [pet.photoURL, ...pet.additionalImages].filter(url => url)
    : [pet?.photoURL].filter(url => url);
  const handleOwnerPress = () => {
    navigate.navigate('OtherUser', { username: pet?.username,uid:pet?.uid });
    console.log(pet?.uid);
  };
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.panel}>
          <MaterialCommunityIcons
            style={styles.back}
            name="arrow-left"
            size={30}
            color="#D27C2C"
            onPress={() => navigate.goBack()}
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
              const index = Math.round(event.nativeEvent.contentOffset.x / width);
              setCurrentIndex(index);
            }}
          />
          {pet?.additionalImages && pet.additionalImages.length > 0 && (
            <View style={styles.pagination}>
              {imageData.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    { opacity: index === currentIndex ? 1 : 0.5 },
                  ]}
                />
              ))}
            </View>
          )}
        </View>
        <Text style={styles.petName}>{pet?.name}</Text>
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
          <View style={styles.onecolumn}>
            <Text style={styles.categoryPet}>Characteristics</Text>
            <Text style={styles.valuePet}>{pet?.characteristics}</Text>
          </View>
          <View style={styles.row}>
            <View style={styles.leftcolum}>
              <Text style={styles.categoryPet}>Current Owner</Text>
              <TouchableOpacity onPress={handleOwnerPress} style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: 'gray', padding: 8, borderRadius: 20 }}>
                <Text style={styles.valuePet}>{pet?.username}</Text>
                <MaterialCommunityIcons name="account" size={30} color="#D27C2C" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        <View style={styles.healtbook}>

          {ishloading ? (
            <View style={styles.Loading}>
              <Text style={styles.loadingtext}>Loading....</Text>
            </View>
          ) : (
            <>
              <View style={styles.titlepanel}>
                <Text style={styles.healtbooktitle}>Health Book</Text>
              </View>
              <View style={styles.healtData}>
                <View style={{ paddingVertical: 5, paddingBottom: '10%' }}>
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
                      {medicalHistory.map(record => {
                        if (record.drugallergy) {
                          hasDrugAllergy = true;
                          drugallergycounter++;
                          return (
                            <Text key={drugallergycounter} style={styles.row2}>
                              {drugallergycounter}. {record.drugallergy}
                            </Text>
                          );
                        }
                      }
                      )}
                      {!hasDrugAllergy && <Text style={styles.row2}>No drug allergy records found</Text>}
                    </Text>
                  </View>
                  <View style={styles.rightcolum}>
                    <Text style={styles.categoryPet}>Chronic</Text>
                    <Text style={styles.valuePet}>
                      {medicalHistory.map(record => {
                        if (record.chronic) {
                          hasChronic = true;
                          chroniccounter++;
                          return (
                            <Text key={chroniccounter} style={styles.row2}>
                              {chroniccounter}. {record.chronic}
                            </Text>
                          );
                        }
                      }
                      )}
                      {!hasChronic && <Text style={styles.row2} >No chronic{'\n'}records found</Text>}
                    </Text>
                  </View>
                </View>
                <View style={{ paddingVertical: 5, paddingTop: '10%' }}>
                  <Text style={styles.categoryPet}>Vaccination list</Text>
                  {medicalHistory.map(record => (
                    <View key={record.id}>
                      {Array.isArray(record.vaccine) &&
                        record.vaccine.length > 0
                        ? record.vaccine.map(vaccine => {
                          hasVaccines = true;
                          vaccineCounter++;
                          return (
                            <View
                              key={vaccineCounter}
                              style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                              }}>
                              <Text style={styles.row2}>
                                {vaccineCounter}. {vaccine.name}
                              </Text>
                              <Text style={styles.row2}>
                                {vaccine.quantity}
                              </Text>
                            </View>
                          );
                        })
                        : null}
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
                      const { id, date } = record;
                      return (
                        <TouchableOpacity
                          key={id}
                          style={styles.medrec}
                          onPress={() => handleRecordClick(record)}>
                          <Text style={styles.valuePet}>
                            Record : {index + 1}
                          </Text>
                          <Text style={styles.date}>
                            Date: {formatDate(date)}
                          </Text>
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
            </>
          )}
        </View>
        <AdoptBar style={styles.AdoptBar} uid={pet?.uid} />
      </ScrollView>
    </View>
  );
}

const height = Dimensions.get('window').height;
const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  Loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingtext: {
    fontSize: 18,
    fontFamily: 'InterBold',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  panel: {
    height: height * 0.4,
    width: '100%',
  },
  image: {
    width: width,
    height: "100%",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    backgroundColor: 'gray',
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
    marginBottom: 20,
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
  row2: {
    fontSize: 18,
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  AdoptBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: '8%',
    position: 'absolute',
    overflow: 'hidden',
  },
  petName: {
    fontSize: 24,
    color: 'black',
    paddingVertical: 10,
    paddingHorizontal: 30,
    fontFamily: 'InterSemiBold',
  },
  medicalHistoryTitle: {
    fontSize: 18,
    color: 'gray',
    fontFamily: 'InterSemiBold',
    paddingBottom: 10,
  },
  date: {
    fontSize: 16,
    color: 'black',
    fontFamily: 'InterRegular',
    opacity: 0.5,
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
});