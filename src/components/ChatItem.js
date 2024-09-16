import { TouchableOpacity, Text, View, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { getAuth } from 'firebase/auth';

const ChatItem = ({ item, latestMessage }) => {
    const navigation = useNavigation();
    const auth = getAuth();
    const currentUser = auth.currentUser;

    const handlePress = () => {
        navigation.navigate('ChatRoomScreen', {
            uid: item.uid,
            username: item.username,
            photoURL: item.photoURL,
        });
    };

    const renderLatestMessage = () => {
        if (latestMessage.text === "") {
            if (Array.isArray(latestMessage.selectedPets) && latestMessage.selectedPets.length > 0) {
                return `Send Pet : ${latestMessage.selectedPets.map(pet => pet.name).join(', ')}`;
            } else if (latestMessage.imageURL === "") {
                return "No content";
            } else {
                return `Image : ${latestMessage.imageURL}`;
            }
        } else {
            return latestMessage.text;
        }
    };

    if (!item || !item.photoURL) {
        return null; 
    }

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={{ flexDirection: 'row', padding: 10, borderBottomWidth: 1, borderColor: 'rgba(0, 0, 0, 0.2)' }}>
                <Image source={{ uri: item.photoURL }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                <View style={{ marginLeft: 10 }}>
                    <Text>{item.username}</Text>
                    {latestMessage && (
                        <Text style={{ color: 'gray' }}>
                            {latestMessage.userId === currentUser.uid ? 'You: ' : ''}
                            {renderLatestMessage()}
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ChatItem;