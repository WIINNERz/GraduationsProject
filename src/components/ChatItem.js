import { View, Text, Touchable, TouchableOpacity, Image, StyleSheet } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native';

export default function ChatItem({ item, router, noBorder }) {
    const navigation = useNavigation();

    const openChatRoom = () => {
        navigation.navigate('ChatRoom', { params: item});
    }
    return (
        <TouchableOpacity onPress={openChatRoom} style={styles.list}>
            <View style={{ flexDirection: 'row' }}>
                <Image
                    source={{ uri: item?.photoURL }}
                    style={{ width: 50, height: 50, borderRadius: 50 }} />
                <View style={{justifyContent:'center',paddingHorizontal: 10,}}>
                    <Text>{item?.username}</Text>
                    <Text>{item?.username}</Text>
                </View>

            </View>
            <Text>Time</Text>
        </TouchableOpacity>
    )
}
const styles = StyleSheet.create({
    list: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
    },
})