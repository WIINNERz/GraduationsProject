import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import React from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';

export default function ChatRoomHeader({ user }) {
    const navigation = useNavigation();
    const defaultImage ='https://www.kindpng.com/picc/m/78-785827_user-profile-avatar-login-account.png';; 

    const handleBackPress = () => {
        navigation.goBack(); 
    };

    return (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
                <MaterialCommunityIcons name="chevron-left" size={30} style={styles.backText} />
            </TouchableOpacity>
            <View style={styles.profileContainer}>
                <Image
                    source={{ uri: user?.photoURL || defaultImage }}
                    style={styles.image}
                />
                <Text style={styles.username}>{user?.username || 'No Username'}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        position: 'relative',
        top: -20,
        padding: 10,
        backgroundColor: '#f8f8f8',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        flexDirection: 'row',
        zIndex: 1,
    },
    backButton: {
        position: 'relative',
        right: 30,
        padding: 10,
    },
    profileContainer: {
        position: 'relative',
        right: 30,
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    username: {
        marginLeft: 10,
        fontSize: 18,
        fontFamily : 'InterBold',
        paddingLeft: 10,
    },
});