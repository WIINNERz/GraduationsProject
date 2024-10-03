import React, { useState } from 'react';
import { View,Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export const SavePButton = ({ onPress }) => {
    return (
      <TouchableOpacity style={styles.SavePButton} onPress={onPress}>
        <Text style={styles.buttonText}>Save</Text>
      </TouchableOpacity>
    );
  };
export const CancelPButton= () => {
    const navigation = useNavigation();
    return (
        <View>
            <TouchableOpacity style={styles.CancelPButton} onPress={() => navigation.goBack()}>
                <Text style={styles.buttonText}>Cancel</Text>
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
    buttonText: {
        color: 'white',
        fontFamily: 'InterRegular',
    },
});



