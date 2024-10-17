import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, View, StyleSheet, Keyboard, Text } from 'react-native';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigationState } from '@react-navigation/native';
import PetStack from '../stacks/PetStack';
import ProfileStack from '../stacks/ProfileStack';
import ChatStack from '../stacks/ChatStack';
import MyPetStack from '../stacks/MyPetStack'; // Ensure this import is correct
import WaitVerifyStack from '../stacks/WaitVerifyStack';
import TermStack from '../stacks/TermStack'; // Ensure this import is correct

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
    return <MaterialCommunityIcons name="account" size={40} />;
  }

  return (
    <Image
      source={{ uri: profileImageUrl }}
      style={[styles.profileImage, { borderColor: '#E16539', borderWidth: 2 }]}
    />
  );
};

const AppNavigator = ({ initialRouteName }) => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [userDocExists, setUserDocExists] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const state = useNavigationState(state => state);
  const currentRouteName = state?.routes[state.index]?.name;

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => setKeyboardVisible(true));
    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => setKeyboardVisible(false));

    return () => {
      keyboardDidHideListener.remove();
      keyboardDidShowListener.remove();
    };
  }, []);

  useEffect(() => {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(db, "Users", user.uid);

      const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
        if (docSnap.exists()) {
          setUserDocExists(true);
          const data = docSnap.data();
          setTermsAccepted(data.termsAccepted || false);
        } else {
          setUserDocExists(false);
        }
      }, (error) => {
        console.error("Error fetching user document:", error);
        setUserDocExists(false);
      });

      return () => unsubscribe();
    } else {
      setUserDocExists(false);
    }
  }, []);

  useEffect(() => {
    if (currentRouteName) {
      console.log(`Current screen: ${currentRouteName}`);
    }
  }, [currentRouteName]);

  return (
    <Tab.Navigator
      initialRouteName={initialRouteName}
      screenOptions={{
        tabBarStyle: [
          styles.tabBar,
          { backgroundColor: '#F0DFC8', display: isKeyboardVisible || currentRouteName === 'PetDetail' ? 'none' : 'flex' }
        ],
        tabBarActiveTintColor: '#E16539',
        tabBarLabelStyle: { fontSize: 16 }
      }}
    >
      {userDocExists ? (
        termsAccepted ? (
          <>
            <Tab.Screen
              name="MyPetStack"
              component={MyPetStack}
              options={{
                tabBarLabel: ({ color }) => (
                  <Text style={{ fontFamily: 'InterRegular', fontSize: 16 , color: color }}>
                    Home
                  </Text>
                ),
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
                tabBarLabel: ({ color }) => (
                  <Text style={{ fontFamily: 'InterRegular', fontSize: 16 , color: color }}>
                    Find Pet
                  </Text>
                ),
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
                tabBarLabel: ({ color }) => (
                  <Text style={{ fontFamily: 'InterRegular', fontSize: 16 , color: color }}>
                    Chat
                  </Text>
                ),
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
                tabBarLabel: ({ color }) => (
                  <Text style={{ fontFamily: 'InterRegular', fontSize: 16 , color: color }}>
                    Settings
                  </Text>
                ),
                tabBarIcon: (props) => <ProfileTabIcon {...props} />
              }}
            />
          </>
        ) : (
          <Tab.Screen
            name="TermStack"
            component={TermStack}
            options={{
              tabBarButton: () => null, 
              headerShown: false,
            }}
          />
        )
      ) : (
        <Tab.Screen
          name="WaitVerifyStack"
          component={WaitVerifyStack}
          options={{
            tabBarButton: () => null, 
            headerShown: false,
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 50,
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