import React, { useState } from 'react';
import { View,Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const SavePButton= ({onPress}) => {
    const navigation = useNavigation();
    return (
        <View>
            <TouchableOpacity style={styles.SavePButton}>
                <Text>Save</Text>
            </TouchableOpacity>
        </View>
    );
}
export const CancelPButton= () => {
    const navigation = useNavigation();
    return (
        <View>
            <TouchableOpacity style={styles.CancelPButton} onPress={() => navigation.goBack()}>
                <Text>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    SavePButton :{
        backgroundColor: '#E16539',
        width: 100,
        padding: 10,
        margin: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    CancelPButton :{
        backgroundColor: '#E16539',
        width: 100,
        padding: 10,
        margin: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});



