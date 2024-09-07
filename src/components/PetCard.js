import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PetCard({ item }) {
  const navigation = useNavigation();

  const openPetProfile = () => {
    navigation.navigate('PetProfile', { id: item.id });
  }

  const formattedDate = item?.updatedAt ? new Date(item.updatedAt.seconds * 1000).toLocaleDateString() : '';

  return (
    <TouchableOpacity style={styles.card} onPress={openPetProfile}>
       <View>
        {item?.photoURL ? ( 
        <Image source={{ uri: item?.photoURL }} style={styles.image} />
        ) : (
        <MaterialCommunityIcons name="cat" size={80} style={styles.dogicon} color="#E16539" />
        )}
        <View style={styles.genderIcon}>
          {item?.gender === 'Male' && (
            <MaterialCommunityIcons name="gender-male" size={30} color="#D27C2C" />
          )}
          {item?.gender === 'Female' && (
            <MaterialCommunityIcons name="gender-female" size={30} color="#D27C2C" />
          )}
        </View>
      </View>
      <View style={{ padding: 10 }}>
        <Text style={textStyles.date}>Update status when {formattedDate}</Text>
        <Text style={textStyles.name}>{item?.name}</Text>
        <View style={styles.row}>
          <Text style={textStyles.label}>Breed: </Text>
          <Text style={textStyles.value}>{item?.breeds}</Text>
        </View>
        <View style={styles.row}>
          <Text style={textStyles.label}>Age: </Text>
          <Text style={textStyles.value}>{item?.age}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const textStyles = StyleSheet.create({
  date: {
    fontSize: 10,
    color: 'gray',
  },
  name: {
    fontSize: 20,
    color: 'black',
  },
  label: {
    fontSize: 14,
    color: 'black',
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: 'black',
  },
});

const styles = StyleSheet.create({
  card: {
    width: '45%',
    margin:10,
    marginBottom: 10,
    borderRadius: 10,
    backgroundColor: '#F0DFC8',
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  row: {
    flexDirection: 'row',
    marginTop: 5,
  },
  genderIcon: {
    position: 'absolute',
    right: 5,
    bottom: 5,
    borderRadius:10,
    backgroundColor: 'white',
  },
  dogicon: {
    width: '100%',
    height: 200,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});
