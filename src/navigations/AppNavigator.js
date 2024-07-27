import React,{useState,useEffect} from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import Home from '../screens/Home';
import MyPet from '../components/MyPet';
import PetStack from '../screens/PetStack';
import ProfileStack from '../screens/ProfileStack';

const Tab = createBottomTabNavigator();
const getProfileImageUrl = async () => {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  if (user) {
    const userDocRef = doc(db, "Users", user.uid); // ใช้ UID ของผู้ใช้ปัจจุบัน
    try {
      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return data.photoURL; // ดึงค่าจากฟิลด์ photourl
      } else {
        console.error("No such document!");
        return null;
      }
    } catch (error) {
      console.error("Error fetching user document:", error);
      return null;
    }
  } else {
    console.error("No user is currently signed in.");
    return null;
  }
};
function ProfileTabIcon() {
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    const fetchProfileImage = async () => {
      const url = await getProfileImageUrl();
      setProfileImageUrl(url);
    };

    fetchProfileImage();
  }, []);

  if (!profileImageUrl) {
    return <MaterialCommunityIcons name="account" size={26} />;
  }

  return (
    <Image
      source={{ uri: profileImageUrl }}
      style={{ width: 26, height: 26, borderRadius: 100 }}
    />
  );
}
const AppNavigator = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Home"
        component={Home}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          headerShown: false }}
      />
      <Tab.Screen
        name="MyPet"
        component={PetStack}
        options={{
          tabBarLabel: 'My Pets',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dog" color={color} size={size} />
          ),
          headerShown: false
        }} />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          headerShown: false,
          tabBarIcon: (props) => <ProfileTabIcon {...props} />
         }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
