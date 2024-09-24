import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation} from '@react-navigation/native';


const Location = () => {
    const navigation = useNavigation();
    return (
    <View style={styles.screen}>
      <MaterialCommunityIcons
        style={styles.back}
        name="arrow-left"
        size={35}
        color="#D27C2C"
        onPress={() => navigation.goBack()}
      />
      <Text style={styles.text}>Location Screen</Text>
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
});

export default Location;
