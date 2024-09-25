import React, { useState, useEffect } from 'react';
import { View, Text, PermissionsAndroid, TouchableOpacity, StyleSheet } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import MapView, { Marker } from 'react-native-maps';
import axios from 'axios';
import { WebView } from 'react-native-webview';

const Location1 = () => {
    const [currentLocation, setCurrentLocation] = useState(null);
    const [animalHospital, setAnimalHospital] = useState(null);
    const [region, setRegion] = useState(null);
    const [webViewUrl, setWebViewUrl] = useState(null);

    useEffect(() => {
        requestLocationPermission();
    }, []);

    useEffect(() => {
        if (animalHospital) {
            console.log('Animal Hospital:', animalHospital);
        }
    }, [animalHospital]);

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
                const initialRegion = {
                    latitude,
                    longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05,
                };
                setCurrentLocation(initialRegion);
                setRegion(initialRegion);
                fetchAnimalHospital(latitude, longitude);
            },
            error => console.log(error),
            { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
        );
    };

    const fetchAnimalHospital = async (latitude, longitude) => {
        try {
            const query = 'Animal hospital';
            const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=veterinary_care&keyword=${query}&key=YOUR_API_KEY`;
            const response = await axios.get(url);
            if (response.data.results.length > 0) {
                const hospital = response.data.results[0];
                const hospitalLocation = {
                    latitude: hospital.geometry.location.lat,
                    longitude: hospital.geometry.location.lng,
                };
                console.log("Fetched", hospitalLocation);
                setAnimalHospital(hospitalLocation);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const openMaps = () => {
        const { latitude, longitude } = currentLocation;
        if (latitude && longitude) {
            const query = 'Animal hospital';
            const url = `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${latitude},${longitude}`;
            setWebViewUrl(url);
        } else {
            alert('Location not found');
        }
    };

    return (
        <View style={{ flex: 1 }}>
            {webViewUrl ? (
                <WebView source={{ uri: webViewUrl }} style={{ flex: 1 }} />
            ) : (
                <>
                    <View>
                        <Text>latitude: {currentLocation ? currentLocation.latitude : 'Loading ...'}</Text>
                        <Text>longitude: {currentLocation ? currentLocation.longitude : 'Loading ...'}</Text>
                    </View>
                    {currentLocation ? (
                        <>
                            <MapView
                                style={styles.map}
                                region={region}
                                onRegionChangeComplete={setRegion}
                            >
                                {animalHospital && (
                                    <Marker
                                        coordinate={{
                                            latitude: animalHospital.latitude,
                                            longitude: animalHospital.longitude,
                                        }}
                                        title="Animal Hospital"
                                        description="Nearest animal hospital"
                                    />
                                )}
                            </MapView>
                            {/* <View style={styles.zoomButtons}>
                                <TouchableOpacity onPress={zoomIn} style={styles.zoomButton}>
                                    <Text>Zoom In</Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={zoomOut} style={styles.zoomButton}>
                                    <Text>Zoom Out</Text>
                                </TouchableOpacity>
                            </View> */}
                            <TouchableOpacity onPress={openMaps} style={styles.openMapsButton}>
                                <Text>Open Maps</Text>
                            </TouchableOpacity>
                        </>
                    ) : (
                        <TouchableOpacity onPress={requestLocationPermission}>
                            <Text>Get Location</Text>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    map: {
        ...StyleSheet.absoluteFillObject,
    },
    zoomButtons: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        flexDirection: 'column',
    },
    zoomButton: {
        backgroundColor: 'white',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        alignItems: 'center',
    },
    openMapsButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'white',
        padding: 10,
        borderRadius: 5,
        alignItems: 'center',
    },
});

export default Location1;