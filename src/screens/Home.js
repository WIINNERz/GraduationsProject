import React, {useCallback, useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  Dimensions,
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
      uri: 'https://i.pinimg.com/564x/9d/4a/49/9d4a49b2b2b9392d3f844c4dbcff52d6.jpg',
    },
    {
      uri: 'https://uploads.dailydot.com/2023/12/crying-cat-meme.jpg?auto=compress&fm=pjpg',
    },
    {
      uri: 'https://i.pinimg.com/236x/d5/6a/f7/d56af787f81df07a9d5bcd8ecad7ff3f.jpg',
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

  const renderDogItem = ({item}) => (
    <TouchableOpacity
      key={item.id}
      style={styles.dogContainer}
      onPress={() => navigation.navigate('MyPetProfile', {id: item.id})}>
      {item.photoURL ? (
        <Image source={{uri: item.photoURL}} style={styles.petPic} />
      ) : (
        <View style={styles.petIcon} >
        <MaterialCommunityIcons name="dog" size={favsize} color="#E16539" />
        </View>
      )}
      <Text style={styles.petdetail}>{item.name}</Text>
    </TouchableOpacity>
  );

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
          <Text>Loading...</Text>
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
            <MaterialCommunityIcons name="dog" size={pawsize} color="#D27C2C" />
            <Text style={styles.menuText}>My Pets</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('AddPet')}>
            <MaterialCommunityIcons name="plus" size={pawsize} color="#D27C2C" />
            <Text style={styles.menuText}>Add new pet</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Location1')}>
            <MaterialCommunityIcons name="file-question" size={pawsize} color="#D27C2C" />
            <Text style={styles.menuText}>Something</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('Location')}>
            <MaterialCommunityIcons
              name="map-marker"
              size={pawsize}
              color="#D27C2C"
            />
            <Text style={styles.menuText}>Pet's hospital near you</Text>
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
    marginBottom: "3%",
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
    fontWeight: '600',
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
    width: '50%',
    margin: 5,
  },

  petcontainer: {
    height: '17%',
    paddingHorizontal: '3%',
  },
  menucontainer: {
    height: '23%',
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
});

export default Home;
