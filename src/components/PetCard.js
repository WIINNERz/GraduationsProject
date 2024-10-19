import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import RenderIcon from './RenderIcon';

export default function PetCard({ item }) {
  const navigation = useNavigation();
  const icon = RenderIcon();

  const openPetProfile = () => {
    navigation.navigate('PetProfile', { id: item.id });
  }
  const renderIcon = type => {
    const iconType = icon.geticon(type);
    return (
      <MaterialCommunityIcons name={iconType} size={80} color="#D27C2C" style={styles.dogicon} />
    );
  };

  const formattedDate = item?.updatedAt ? new Date(item.updatedAt.seconds * 1000).toLocaleDateString() : '';

  return (
    <TouchableOpacity style={styles.card} onPress={openPetProfile}>
       <View>
        {item?.photoURL ? ( 
        <Image source={{ uri: item?.photoURL }} style={styles.image} />
        ) : (
        (renderIcon(item?.type))
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
    fontFamily : 'InterRegular',
  },
  name: {
    fontSize: 20,
    color: 'black',
    fontFamily : 'InterRegular',
  },
  label: {
    fontSize: 14,
    color: 'black',
    fontFamily : 'InterSemiBold',
  },
  value: {
    fontSize: 14,
    fontFamily : 'InterRegular',
    color: 'black',
  },
});

const styles = StyleSheet.create({
  card: {
    width: '49%', 
    marginBottom: "2%", 
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