import { TouchableOpacity, Text, View, Image } from 'react-native';
import React from 'react';
import { useNavigation } from '@react-navigation/native';

const ChatItem = ({ item }) => {
    const navigation = useNavigation();

    const handlePress = () => {
        console.log("item",item);
        navigation.navigate('ChatRoomScreen', {
            uid: item.uid,
            username: item.username,
            photoURL: item.photoURLURL,
            // Add other parameters as needed
        });
    };

    return (
        <TouchableOpacity onPress={handlePress}>
            <View style={{ flexDirection: 'row', padding: 10 }}>
                <Image source={{ uri: item.photoURL }} style={{ width: 50, height: 50, borderRadius: 25 }} />
                <View style={{ marginLeft: 10 }}>
                    <Text>{item.username}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

export default ChatItem;