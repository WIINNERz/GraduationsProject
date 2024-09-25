import { View, Text, PermissionsAndroid, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import React, { useState } from 'react';
import Geolocation from '@react-native-community/geolocation';

const Location1 = () => {
    const [currentLocation, setCurrentLocation] = useState(null);

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
                console.log('You can use the location');
                getCurrentLocation();
            } else {
                console.log('Location permission denied');
            }
        } catch (err) {
            console.warn(err);
        }
    };

    const getCurrentLocation = () => {
        Geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                setCurrentLocation({
                    latitude,
                    longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                });
            },
            error => console.log(error),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
    };

    const openMaps = () => {
        const { latitude, longitude } = currentLocation;
        if (latitude && longitude) {
            const query = 'animal hospital';
            const url = `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${latitude},${longitude}`;
            Linking.openURL(url);
        } else {
            alert('Location not found');
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerText}>Location1</Text>
            </View>
            {currentLocation ? (
                <TouchableOpacity style={styles.button} onPress={openMaps}>
                    <Text style={styles.buttonText}>Open Maps</Text>
                </TouchableOpacity>
            ) : (
                <TouchableOpacity style={styles.button} onPress={requestLocationPermission}>
                    <Text style={styles.buttonText}>Get Location</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    header: {
        marginBottom: 20,
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    button: {
        backgroundColor: '#007BFF',
        padding: 10,
        borderRadius: 5,
        marginTop: 10,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});

export default Location1;