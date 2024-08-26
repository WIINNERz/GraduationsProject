import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, TouchableOpacity, StyleSheet } from 'react-native';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PetStack from '../stacks/PetStack';
import ProfileStack from '../stacks/ProfileStack';
import HomeStack from '../stacks/HomeStack';
import FindPet from '../screens/FindPet';
import { useNavigation } from '@react-navigation/native';
import ChatStack from '../stacks/ChatStack';
import MyPetStack from '../stacks/MyPetStack';

const Tab = createBottomTabNavigator();

const useProfileImageUrl = () => {
  const [profileImageUrl, setProfileImageUrl] = React.useState(null);

  React.useEffect(() => {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(db, "Users", user.uid);

      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileImageUrl(data.photoURL || null);
        } else {
          console.error("No such document!");
          setProfileImageUrl(null);
        }
      }, (error) => {
        console.error("Error fetching user document:", error);
        setProfileImageUrl(null);
      });

      return () => unsubscribe();
    } else {
      console.error("No user is currently signed in.");
      setProfileImageUrl(null);
    }
  }, []);

  return profileImageUrl;
};

const ProfileTabIcon = () => {
  const profileImageUrl = useProfileImageUrl();

  if (!profileImageUrl) {
    return <MaterialCommunityIcons name="account" size={26} />;
  }

  return (
    <Image
      source={{ uri: profileImageUrl }}
      style={[styles.profileImage, { borderColor: '#E16539', borderWidth: 2 }]} // เพิ่ม border เพื่อให้โดดเด่นขึ้น
    />
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName='HomeStack'
      screenOptions={{
        
        tabBarStyle: [styles.tabBar, { backgroundColor:'#F0DFC8' }],
        tabBarActiveTintColor: '#E16539',
        tabBarLabelStyle: { fontSize: 16 }
      }}
    >
      <Tab.Screen
        name="MyPetStack"
        component={MyPetStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={40} />
          ),
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Pet"
        component={PetStack}
        options={{
          tabBarLabel: 'Find Pet',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="paw-outline" color={color} size={40} />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatStack}
        options={{
          tabBarLabel: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="chat" color={color} size={40} />
          ),
          headerShown: false,

        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Profile',
          tabBarIcon: (props) => <ProfileTabIcon {...props} />
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  customTabBarButton: {
    top: 0,
    margin: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabButtonContainer: {
    width: 40,
    height: 40,
    borderRadius: 35,
    backgroundColor: '#E16539',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "8%", 
    position: 'absolute',
    overflow: 'hidden',
  },
});

export default AppNavigator;
