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
import { storage } from '../configs/firebaseConfig';
import { launchImageLibrary } from 'react-native-image-picker';

export default function PlusBoxChatRoom({ onImagePicked }) {
  const pickImage = async () => {
    const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 1,
    });

    if (result.didCancel) {
        console.log('User cancelled image picker');
    } else if (result.error) {
        console.log('ImagePicker Error: ', result.error);
    } else {
        const { uri } = result.assets[0];
        onImagePicked(uri);
    }
};
  return (
    <View style={styles.container}>
      <View style={styles.button}>
        <TouchableOpacity
          style={styles.buttonStyle}
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
        <TouchableOpacity style={styles.buttonStyle} onPress={pickImage}>
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
