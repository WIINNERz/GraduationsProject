import {
  StyleSheet,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';
import {auth, firestore} from '../configs/firebaseConfig';
import {doc, onSnapshot} from 'firebase/firestore';
import {useNavigation} from '@react-navigation/native';
import {useEffect, useState} from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AccountInfo = () => {
  const navigate = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return;

    const userDoc = doc(firestore, 'Users', user.uid);

    // Set up Firestore listener
    const unsubscribe = onSnapshot(
      userDoc,
      docSnap => {
        if (docSnap.exists()) {
          setUserData(docSnap.data());
          
        } else {
          setUserData(null);
        }
        setLoading(false);
      },
      error => {
        console.error('Error fetching user data:', error);
        setLoading(false);
      },
    );

    // Clean up the listener on component unmount
    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
 
        <MaterialCommunityIcons
          style={styles.back}
          name="arrow-left"
          size={35}
          color="#D27C2C"
          onPress={() => navigate.goBack()}
        />
        <View style={styles.info}>
          <MaterialCommunityIcons
            name="account-circle"
            size={80}
            style={{marginTop: 10}}
            color="#D27C2C"
          />
          <Text style={styles.title}>Account Information</Text>
        </View>
        <View style={styles.inputzone}>
          <Text style={styles.title}>Account Information</Text>
          {userData ? (
            <View>
              <Text style={styles.data}>Username: {userData.username}</Text>
              <Text style={styles.data}>Email: {userData.email}</Text>
              <Text style={styles.data}>
                Veriyfy status: {String(userData.verify)}
              </Text>
            </View>
          ) : (
            <Text>No user data available</Text>
          )}
        </View>
     
    </View>
  );
};

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: 'white',
        alignItems: 'center',
      },
      back: {
        position: 'absolute',
        top: 10,
        left: 10,
      },
      title: {
        fontSize: 28,
        color: '#D27C2C',
        fontFamily: 'InterBold',
      },
      description: {
        marginTop: 20,
        fontSize: 20,
        color: 'black',
        fontFamily: 'InterRegular',
        textAlign: 'center',
        paddingHorizontal: 20,
      },
      info: {
        marginTop: '15%',
        width: '90%',
        height: '20%',
        borderRadius: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        alignItems: 'center',
      },
      inputzone: {
        marginTop: '5%',
        width: '90%',
        height: '25%',
        borderRadius: 20,
        borderColor: '#ccc',
        borderWidth: 1,
        alignItems: 'center',
        paddingTop: 20,
       
      },
      input: {
        width: '90%',
        height: '25%',
        borderColor: 'gray',
        borderWidth: 1,
        borderRadius: 20,
        paddingLeft: 10,
        marginVertical: 5,
      },
        data: {
            fontSize: 20,
            color: 'black',
            fontFamily: 'InterRegular',
            paddingHorizontal: 20,
            
        },
});

export default AccountInfo;
