import React, {useCallback, useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
  Linking,
  PermissionsAndroid,
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
import Geolocation from '@react-native-community/geolocation';
import RenderIcon from '../components/RenderIcon';

const Home = () => {
  const [dogs, setDogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const navigation = useNavigation();
  const user = auth.currentUser;
  const pawsize = Dimensions.get('window').width / 13; //40
  const favsize = Dimensions.get('window').width / 5; //80
  const [currentLocation, setCurrentLocation] = useState(null);
  const icon = RenderIcon();

  const fetchDogs = async () => {
    if (user) {
      try {
        const db = getFirestore();
        const petsCollection = collection(db, 'Pets');
        const q = query(petsCollection, where('uid', '==', user.uid),where('favorite', '==', true));
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

  const banner = [
    {
      uri: 'https://firebasestorage.googleapis.com/v0/b/graduationspj.appspot.com/o/Banner%2Fbanner.jpg?alt=media&token=9eb59c7a-e39e-4a59-8dd3-1991fcb5d91e',
    },
    {
      uri: 'https://firebasestorage.googleapis.com/v0/b/graduationspj.appspot.com/o/Banner%2Fbanner2.png?alt=media&token=c67804a8-93dc-4351-9162-b4d0e487864e',
    },
    {
      uri: 'https://firebasestorage.googleapis.com/v0/b/graduationspj.appspot.com/o/Banner%2Fbanner3.png?alt=media&token=877e8dc9-1ccd-413a-bfbb-8091aaa9cd57',
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prevIndex => {
        const nextIndex = prevIndex === banner.length - 1 ? 0 : prevIndex + 1;
        flatListRef.current.scrollToIndex({
          animated: true,
          index: nextIndex,
          viewPosition: 0.5, // Center the item
        });
        return nextIndex;
      });
    }, 3000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, []);
  const renderIcon = type => {
    const iconType = icon.geticon(type);
    return (
      <MaterialCommunityIcons name={iconType} size={favsize} color="#E16539" />
    );
  };

  const renderDogItem = ({item}) => (
    <TouchableOpacity
      key={item.id}
      style={styles.dogContainer}
      onPress={() => navigation.navigate('MyPetProfile', {id: item.id})}>
      {item.photoURL ? (
        <Image source={{uri: item.photoURL}} style={styles.petPic} />
      ) : (
        <View style={styles.petIcon} >
          {renderIcon(item.type)}
        </View>
        
      )}
      <Text style={styles.petdetail}>{item.name}</Text>
    </TouchableOpacity>
  );
  const requestLocationPermission = async () => {
    try {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: 'Location Permission',
                message: 'This App needs access to your location',
                buttonNeutral: 'Ask Me Later',
                buttonNegative: 'Cancel',
                buttonPositive: 'OK',
            },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
           getCurrentLocation();
        }
    } catch (err) {
        console.warn(err);
    }
};

const getCurrentLocation = (callback) => {
    Geolocation.getCurrentPosition(
        position => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({
                latitude,
                longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
            });
            if (callback) callback({ latitude, longitude });
        },
        error => console.log(error),
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 1000 },
    );
};

const openMaps = () => {
    const { latitude, longitude } = currentLocation || {};
    if (latitude && longitude) {
        const query = 'animal hospital';
        const url = `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${latitude},${longitude}`;
        Linking.openURL(url);
    } else {
        requestLocationPermission();
        getCurrentLocation(({ latitude, longitude }) => {
            const query = 'animal hospital';
            const url = `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${latitude},${longitude}`;
            Linking.openURL(url);
        });
    }
};

  return (
    <View style={styles.screen}>
      <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="paw-outline" size={pawsize} color="white" />
          <Text style={styles.title}>PetPal</Text>
        </View>
      </View>
      <View style={styles.maincontainer}>
      <FlatList
          data={banner}
          renderItem={({ item }) => (
            <Image source={{ uri: item.uri }} style={styles.banner} />
          )}
          keyExtractor={item => item.uri}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
          pagingEnabled={true}
          ref={flatListRef}
          snapToAlignment="center"
          snapToInterval={Dimensions.get('window').width}
          onScroll={event => {
            const index = Math.round(
              event.nativeEvent.contentOffset.x /
                Dimensions.get('window').width,
            );
            setCurrentIndex(index);
          }}
        />
        <View style={styles.pagination}>
          {banner.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                { opacity: index === currentIndex ? 1 : 0.5 },
              ]}
            />
          ))}
        </View>
      </View>
      <View style={styles.petcontainer}>
        <Text style={styles.sectiontitle}>Favorite Pets</Text>
        {loading ? (
          <View style={styles.loading}>
          <Text >Loading...</Text>
          </View>
        ) : error ? (
          <Text>Error: {error}</Text>
        ) : dogs.length > 0 ? (
          <FlatList
            data={dogs}
            renderItem={renderDogItem}
            keyExtractor={item => item.id}
            horizontal={true}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.flatListContent}
          />
        ) : (
          <View style={styles.nopetview}>
            <Text style={styles.nopettext}>Add your favorite pets!</Text>
          </View>
        )}
      </View>
      <View style={styles.menucontainer}>
        <Text style={styles.sectiontitle}>Menu</Text>
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('MyPets')}>
            <MaterialCommunityIcons name="paw" size={pawsize} color="#D27C2C" />
            <Text style={styles.menuText}>My Pets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AddPet')}>
            <MaterialCommunityIcons name="plus" size={pawsize} color="#D27C2C" />
            <Text style={styles.menuText}>Add new pet</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={openMaps}>
            <MaterialCommunityIcons name="map-marker" size={pawsize} color="#D27C2C" />
            <Text style={styles.menuText}>Pet's hospital</Text>
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </View>
  );
};

const {width} = Dimensions.get('window');
const itemSize = width / 4;
const titleSize = width / 17;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#fff',
    flex: 1,
    width: '100%',
    height: '100%',
  },
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
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
  maincontainer: {
    height: '45%',
    padding :"3%",
  },
  title: {
    fontSize: titleSize,
    color: 'white',
    backgroundColor: '#D27C2C',
    fontFamily: 'InterSemiBold',
  },
  menu: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  menuItem: {
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#D27C2C',
    padding: 5,
    width: '32%',
    margin: 5,
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'InterRegular',
  },

  petcontainer: {
    height: '22%',
    paddingHorizontal: '3%',
  },
  menucontainer: {
    height: '8%',
    paddingHorizontal: '3%',
  },
  banner: {
    width: width - 40,
    height: '100%',
    borderRadius: 20,
    marginHorizontal: 20,
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
  nopettext: {
    fontSize: 20,
    color: '#E16539',
    textAlign: 'center',
    fontFamily: 'InterLightItalic',
  },
  nopetview: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectiontitle: {
    fontSize: 18,
    marginLeft: 10,
    marginBottom: 5,
    color: '#E16539',
    fontFamily: 'InterSemiBold',
  },
  dogContainer: {
    alignItems: 'center',
    margin: 5,
    borderRadius: 10,
    width: itemSize,
    height: itemSize,

  },
  petdetail: {
    paddingTop: 2,
    fontSize: 16,
    color: '#E16539',
    textAlign: 'center',
    fontFamily: 'InterBold',
  },
  petPic: {
    width: "80%",
    height: "80%",
    borderRadius: 50,
  },
  petIcon: {
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  flatListContent: {
    paddingHorizontal: 5,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Home;
