import { View, Text, StyleSheet, Image, Button, TouchableOpacity } from 'react-native';
import React, { memo, useEffect, useState } from 'react';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';

const MessageItem = ({ message, currentUser }) => {
  const [username, setUsername] = useState('');
  const {
    userId,
    profileURL = '',
    text = '',
    imageUrl = '',
    createdAt,
    senderName='',
    selectedPets = [],
  } = message || {};
  const isCurrentUser = userId === currentUser?.uid;
  const formattedCreatedAt = createdAt?.toDate().toLocaleTimeString() || '';
  
  const handleAdopt = async (petId,petUid) => {
    if (petUid === currentUser.uid) {
      console.log('uid same');
      return;
    }
    try {
      const db = getFirestore(); 
      const petDoc = doc(db, 'Pets', petId);
      await updateDoc(petDoc, {
        uid: currentUser.uid,
      });
      console.log('Pet adopted successfully');
    } catch (error) {
      console.error('Error adopting pet: ', error);
    }
  };
  return (
    <View style={styles.container}>
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUser : styles.otherUser]}>
        {!isCurrentUser && profileURL && (
          <Image source={{ uri: profileURL }} style={styles.profileImage} />
        )}
        <View style={styles.messageContent}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.messageImage} />
          ) : (
            <Text style={styles.messageText}>{text}</Text>
          )}
             {selectedPets.length > 0 && (
            <View style={styles.petsContainer}>
              {selectedPets.map((pet, index) => (
                <View key={index} style={styles.petItem}>
                  <Image source={{ uri: pet.photoURL }} style={styles.petImage} />
                  <Text style={styles.petName}>
                    {senderName} wants to pass {pet.name} to you for further care.
                  </Text>
                  <View>
              {!isCurrentUser && (
                <TouchableOpacity style={styles.AdoptButton}  onPress={() => handleAdopt(pet.id)} >
                  <Text style={styles.petName}>Adopt</Text>
                </TouchableOpacity>
              )}
              </View>
                </View>
                
              ))}
              
            </View>
          )}
          <Text style={styles.timestamp}>{formattedCreatedAt}</Text>
       
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 5,
  },
  currentUser: {
    justifyContent: 'flex-end',
  },
  otherUser: {
    justifyContent: 'flex-start',
  },
  messageContent: {
    maxWidth: '70%',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#f1f1f1',
  },
  messageText: {
    fontSize: 16,
  },
  messageImage: {
    width: 200,
    height: 200,
    borderRadius: 5,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  petsContainer: {
    width: '100%',
    backgroundColor: '#D9D9D9',
    borderRadius:20
  },
  petItem: {
    width: '100%',
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  petImage: {
    width: 100,
    height: 100,
    borderRadius: 100,
  },
  petName: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  AdoptButton: {
    padding: 10,
    backgroundColor: '#D27C2C',
    borderRadius: 5,
    margin: 10
  },
});

export default memo(MessageItem);