import { ScrollView } from 'react-native';
import React, { useRef, useEffect } from 'react';
import MessageItem from './MessageItem';

export default function MessageList({ messages, currentUser, roomId }) {
  const scrollViewRef = useRef();

  useEffect(() => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: false });
    }
  }, [messages]);

  return (
    <ScrollView
      ref={scrollViewRef}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingTop: 10 }}
    >
      {messages.map((message, index) => (
        <MessageItem
          key={index}
          message={message}
          messageId={message.id}
          currentUser={currentUser}
          roomId={roomId}
        />
      ))}
    </ScrollView>
  );
}