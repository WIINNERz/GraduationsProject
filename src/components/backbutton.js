import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


export default function BackButton() {
    const navigation = useNavigation();
    return (
        <View>
            <TouchableOpacity style={{ top : 40  , left :'8%'} } onPress={() => navigation.goBack()}>
                <MaterialCommunityIcons name="arrow-left" size={30} color="#000" />
            </TouchableOpacity>
        </View>
    );
}



