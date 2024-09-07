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
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="heart" size={30} color="#D27C2C" />
                </TouchableOpacity>
                <Text>1</Text>
            </View>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Add to Favorite</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',
        bottom: 0,
        padding: 20,
        backgroundColor: 'black',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        flexDirection: 'row',
        zIndex: 1,
        justifyContent: 'space-between',
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