import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Linking,
    Alert,
    PermissionsAndroid,
  } from 'react-native';
  import React, { useState } from 'react';
  import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
  import Geolocation from '@react-native-community/geolocation';
  
  export default function PlusBoxChatRoom() {
    const [currentLocation, setCurrentLocation] = useState(null);
  
    // Function to request location permission
    const requestLocationPermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location to show it on the map.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Location permission granted');
          getCurrentLocation(); // Fetch location after permission is granted
        } else {
          console.log('Location permission denied');
          Alert.alert('Permission Denied', 'Location access is required to use this feature.');
        }
      } catch (err) {
        console.warn(err);
      }
    };
  
    // Function to get the current location
    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setCurrentLocation({ latitude, longitude });
            console.log('Current location:', latitude, longitude);
            openMap(latitude, longitude); // Open the map once the location is fetched
          },
          (error) => {
            console.log('Error getting location:', error.message);
            Alert.alert('Error', 'Unable to fetch location.');
          },
          { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 }
        );
      };
  
    // Function to open the location in Google Maps
    const openMap = () => {
      if (currentLocation) {
        const { latitude, longitude } = currentLocation;
        const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
        Linking.openURL(url).catch((err) =>
          console.error('An error occurred while opening the map:', err)
        );
      } else {
        Alert.alert('Location not found', 'Please allow location access and try again.');
      }
    };
  
    return (
      <View style={styles.container}>
        <View style={styles.button}>
          <TouchableOpacity
            style={styles.buttonStyle}
            onPress={requestLocationPermission}
          >
            <MaterialCommunityIcons
              name="map-marker"
              size={30}
              color="#E16539"
            />
          </TouchableOpacity>
          <Text>Location</Text>
        </View>
        <View style={styles.button}>
          <TouchableOpacity style={styles.buttonStyle}>
            <MaterialCommunityIcons name="image" size={30} color="#E16539" />
          </TouchableOpacity>
          <Text>Photo</Text>
        </View>
        <View style={styles.button}>
          <TouchableOpacity style={styles.buttonStyle}>
            <MaterialCommunityIcons name="phone" size={30} color="#E16539" />
          </TouchableOpacity>
          <Text>Telephone</Text>
          <Text>Number</Text>
        </View>
        <View style={styles.button}>
          <TouchableOpacity style={styles.buttonStyle}>
            <MaterialCommunityIcons name="dog-side" size={30} color="#E16539" />
          </TouchableOpacity>
          <Text>Transfer Pet Profile</Text>
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#EDE6E6',
      height: 120,
      borderTopLeftRadius: 30,
      borderTopRightRadius: 30,
      flexDirection: 'row',
    },
    button: {
      height: 100,
      width: 100,
      padding: 15,
      alignItems: 'center',
    },
    buttonStyle: {
      width: 50,
      height: 50,
      borderRadius: 25,
      backgroundColor: '#D9D9D9',
      padding: 10,
    },
  });
  