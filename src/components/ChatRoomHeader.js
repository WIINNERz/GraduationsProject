import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function ChatRoomHeader({ user }) {
    const navigation = useNavigation();

    const handleBackPress = () => {
        navigation.goBack(); // กลับไปยังหน้าก่อนหน้า
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <MaterialCommunityIcons name="chevron-left" size={30} style={styles.backText} />
            </TouchableOpacity>
            <View style={styles.profileContainer}>
                <Image
                    source={{ uri: user?.photoURL }}
                    style={styles.image}
                />
                <Text style={styles.username}>{user?.username || 'No Username'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        position:'relative',
        top: 0,
        left: 0,
        right: 0,
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1, // ทำให้แน่ใจว่า header อยู่เหนือเนื้อหาอื่น
    },
    backButton: {
        padding: 10,
    },
    profileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginLeft: 10,
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    username: {
        marginLeft: 10,
        fontSize: 18,
        fontWeight: 'bold',
    },
});
