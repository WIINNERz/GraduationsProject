import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import MapView, { Marker, UrlTile } from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import { request, PERMISSIONS, RESULTS } from 'react-native-permissions';

const Location = () => {
  const navigation = useNavigation();
  const [region, setRegion] = useState(null); // จัดเก็บตำแหน่งของผู้ใช้
  const [hospitals, setHospitals] = useState([]);

  const requestLocationPermission = async () => {
    const result = await request(
      Platform.OS === 'ios'
        ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
        : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    );

    if (result === RESULTS.GRANTED) {
       getCurrentLocation();
       
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        });

        fetchNearbyPlaces(latitude, longitude); // ค้นหาสถานที่ใกล้เคียง
      },
      error => console.log(error),
     { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  };


  const fetchNearbyPlaces = async (latitude, longitude) => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=สัตว์เลี้ยง&limit=10&lat=${latitude}&lon=${longitude}&language=th`,
    );
    const data = await response.json();
    setHospitals(data);
 };

  // เรียกใช้เมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    requestLocationPermission(); // ขอสิทธิ์ตำแหน่งเมื่อเปิดแอป
  }, []);

  if (!region) {
    return <Text>Loading map...</Text>; // รอการโหลดตำแหน่ง
  }

  return (
    <View style={styles.screen}>
      <MaterialCommunityIcons
        style={styles.back}
        name="arrow-left"
        size={35}
        color="#D27C2C"
        onPress={() => navigation.goBack()}
      />
      <Text style={styles.text}>Nearby Veterinary Hospitals</Text>
      <Text style={styles.hos}>
        {hospitals.map((hospital, index) => (
          <Text key={index}>
            {hospital.display_name}
            {'\n'}
          </Text>
        ))}
      </Text>

       {/* <MapView
        style={{ flex: 1 }}
        region={region}
        showsUserLocation={true}
        provider={null}
      >
        {hospitals.map((hospital, index) => (
          <Marker
            key={index}
            coordinate={{
              latitude: parseFloat(hospital.lat),
              longitude: parseFloat(hospital.lon),
            }}
            title={hospital.display_name}
          />
        ))}
        <UrlTile
          urlTemplate="https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maximumZ={19}
        />
      </MapView>  */}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    color: '#000',
  },
  back: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 100,
    zIndex: 1,
  },
  hos: {
    fontSize: 15,
    color: '#000',
  },
});

export default Location;