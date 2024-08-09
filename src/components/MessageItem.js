import { View, Text, StyleSheet, Image } from 'react-native';
import React from 'react';

export default function MessageItem({ message, currentUser }) {
  const isCurrentUser = message?.userId === currentUser?.uid;

  return (
    <View style={styles.container}>
      <View style={[styles.messageContainer, isCurrentUser ? styles.currentUser : styles.otherUser]}>
        {!isCurrentUser && message?.profileURL && (
          <Image source={{ uri: message.profileURL }} style={styles.profileImage} />
        )}
        <View style={styles.messageContent}>
          <Text style={styles.messageText}>{message?.text}</Text>
          <Text style={styles.timestamp}>
            {/* Display a timestamp if available */}
            {message?.createdAt?.toDate().toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
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
  timestamp: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right', // Align timestamp text to the right
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
});
