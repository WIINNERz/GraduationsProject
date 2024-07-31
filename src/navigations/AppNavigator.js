import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PetStack from '../stacks/PetStack';
import ProfileStack from '../stacks/ProfileStack';
import HomeStack from '../stacks/HomeStack';

const Tab = createBottomTabNavigator();

const useProfileImageUrl = () => {
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(db, "Users", user.uid);

      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileImageUrl(data.photoURL || null); // Update profileImageUrl with the new data
        } else {
          console.error("No such document!");
          setProfileImageUrl(null);
        }
      }, (error) => {
        console.error("Error fetching user document:", error);
        setProfileImageUrl(null);
      });

      return () => unsubscribe(); // Cleanup subscription on unmount
    } else {
      console.error("No user is currently signed in.");
      setProfileImageUrl(null);
    }
  }, []);

  return profileImageUrl;
};

function ProfileTabIcon() {
  const profileImageUrl = useProfileImageUrl();

  if (!profileImageUrl) {
    return <MaterialCommunityIcons name="account" size={26} />;
  }

  return (
    <Image
      source={{ uri: profileImageUrl }}
      style={{ width: 26, height: 26, borderRadius: 13 }} // Updated borderRadius to 13 for a circle
    />
  );
}

const AppNavigator = () => {
  return (
    <Tab.Navigator initialRouteName='HomeStack'
      screenOptions={{
        tabBarStyle: {
          borderTopLeftRadius: 50,
          borderTopRightRadius: 50,
          position: 'absolute',
          overflow: 'hidden',
          
        },
        tabBarActiveTintColor: '#E16539',
      }}>
      <Tab.Screen
        name="HomeStack"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          headerShown: false,
        }}
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
