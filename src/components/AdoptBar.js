import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import React, { useCallback } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { auth } from '../configs/firebaseConfig';

const AdoptBar = ({ uid}) => {
    const navigation = useNavigation();
    const currentUserUid = auth.currentUser?.uid;
    useFocusEffect(
        useCallback(() => {
            navigation.getParent()?.setOptions({
                tabBarStyle: { display: 'none' }
            });

            return () => {
                navigation.getParent()?.setOptions({
                    tabBarStyle: [styles.tabBar, { backgroundColor: '#F0DFC8' }],
                });
            };
        }, [navigation])
    );

    const handleContactPress = () => {
        if (currentUserUid === uid) {
            Alert.alert('Notice', 'You cannot contact yourself.');
        } else {
            navigation.navigate('Chat', {
                screen: 'ChatRoomScreen',
                params: { uid }
            });
        }
    };
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button} onPress={handleContactPress}>
                <Text style={styles.text}>Contact to Adopt</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        bottom: 0,
        padding: 20,
        backgroundColor: '#F0DFC8',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'row',
        zIndex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    button: {
        backgroundColor: '#D27C2C',
        padding: 10,
        borderRadius: 10,
    },
    text: {
        color: 'white',
        fontWeight: 'bold',
    },
    tabBar: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: "8%", 
        position: 'absolute',
        overflow: 'hidden',
      },
});
export default AdoptBar;