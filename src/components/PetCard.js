import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';

export default function PetCard({ item }) {
  const navigation = useNavigation();
  const openPetProfile = () => {
    navigation.navigate('PetProfile', { id: item.id });
  }

  return (
    <TouchableOpacity style={styles.list} onPress={openPetProfile}>
      <View style={styles.card}>
        <Image
          source={{ uri: item?.photoURL }} style={styles.image} />
        <Text style={{ fontSize: 24, color: 'black' }}>{item?.name}</Text>
        <View style={{ flexDirection: 'row', }}>
          <Text>Breed : </Text>
          <Text style={{ color: 'black' }}>{item?.breeds}</Text>
        </View>
        <View style={{ flexDirection: 'row', }}>
          <Text>Age : </Text>
          <Text style={{ color: 'black' }}>{item?.age}</Text>
        </View>

      </View>
    </TouchableOpacity>
  )
}
const styles = StyleSheet.create({
  list: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    width: '100%'
  },
  card: {
    alignItems: 'center',
    alignContent: 'center',
    justifyContent: 'space-between',
    marginVertical: 10,
    marginHorizontal: "auto",
    padding: 10,
    borderRadius: 10,
    width: '60%',
    backgroundColor: '#F0DFC8',

  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },

})