import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';

export default function MessageItem({ message, currentUser }) {
  const isCurrentUser = message?.userId === currentUser?.uid;
  const profileURL = message?.profileURL || ''; 
  const text = message?.text || '';
  const imageUrl = message?.imageUrl || '';
  const createdAt = message?.createdAt?.toDate().toLocaleTimeString() || '';

  return (
    <View style={styles.container}>
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUser : styles.otherUser]}>
        {!isCurrentUser && profileURL ? (
          <Image source={{ uri: profileURL }} style={styles.profileImage} />
        ) : null}
        <View style={styles.messageContent}>
          {imageUrl ? (
            <Image source={{ uri: imageUrl }} style={styles.messageImage} />
          ) : (
            <Text style={styles.messageText}>{text}</Text>
          )}
          <Text style={styles.timestamp}>{createdAt}</Text>
        </View>
      </View>
    </View>
  );
}

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
});