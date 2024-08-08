import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, TouchableOpacity, StyleSheet } from 'react-native';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PetStack from '../stacks/PetStack';
import ProfileStack from '../stacks/ProfileStack';
import HomeStack from '../stacks/HomeStack';
import AddPet from '../screens/AddPet';
import { useNavigation } from '@react-navigation/native';
import Chat from '../screens/Chat';

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
      style={styles.profileImage}
    />
  );
};

const CustomTabBarButton = ({ children }) => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      style={styles.customTabBarButton}
      onPress={() => navigation.navigate('AddPet')}
    >
      <View style={styles.tabButtonContainer}>
        {children}
      </View>
    </TouchableOpacity>
  );
};

const AppNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName='HomeStack'
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#E16539',
      }}
    >
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
        name="Pet"
        component={PetStack}
        options={{
          tabBarLabel: 'Pets',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dog" color={color} size={size} />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name="AddPost"
        component={AddPet} // Use a dummy component for tab button
        options={{
          tabBarButton: (props) => (
            <CustomTabBarButton>
              <MaterialCommunityIcons name="plus" color="#fff" size={20} />
            </CustomTabBarButton>
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Chat"
        component={Chat}
        options={{
          tabBarLabel: 'My Pets',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dog" color={color} size={size} />
          ),
          headerShown: false
        }}
      />
      {/* <Tab.Screen
        name="MyPet"
        component={PetStack}
        options={{
          tabBarLabel: 'My Pets',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="dog" color={color} size={size} />
          ),
          headerShown: false
        }}
      /> */}
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

const styles = StyleSheet.create({
  profileImage: {
    width: 26,
    height: 26,
    borderRadius: 13,
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
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    position: 'absolute',
    overflow: 'hidden',
  },
});

export default AppNavigator;
