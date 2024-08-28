import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function PlusBoxChatRoom() {
    return (
        <View style={styles.container}>
            <View style={styles.button}>
                <TouchableOpacity style={styles.buttonStyle}>
                    <MaterialCommunityIcons name="map-marker" size={30} color="#E16539" />
                </TouchableOpacity>
                <Text>Location</Text>
            </View>
            <View style={styles.button}>
                <TouchableOpacity style={styles.buttonStyle}>
                    <MaterialCommunityIcons name="image" size={30} color="#E16539" />
                </TouchableOpacity>
                <Text>Photo</Text>
            </View>
            <View style={styles.button}>
                <TouchableOpacity style={styles.buttonStyle}>
                    <MaterialCommunityIcons name="phone" size={30} color="#E16539" />
                </TouchableOpacity>
                <Text>Telephone </Text>
                <Text>Number</Text>
            </View>
            <View style={styles.button}>
                <TouchableOpacity style={styles.buttonStyle}>
                    <MaterialCommunityIcons name="dog-side" size={30} color="#E16539" />
                </TouchableOpacity>
                <Text>Transfer Pet Profile </Text>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EDE6E6',
        height: 120,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        flexDirection: 'row',
    },
    button: {
        height:100,
        width: 100,
        padding:15,
        alignItems: 'center',
    },
    buttonStyle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: '#D9D9D9',
        padding:10
    },
});