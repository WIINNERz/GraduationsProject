import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function AdoptBar() {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Contact to Adopt</Text>
            </TouchableOpacity>
            <View style={{flexDirection:'row',alignItems:'center'}}>
                <TouchableOpacity>
                    <MaterialCommunityIcons name="heart" size={30} color="#D27C2C" />
                </TouchableOpacity>
                <Text>1</Text>
            </View>
            <TouchableOpacity style={styles.button}>
                <Text style={styles.text}>Add to Favorite</Text>
            </TouchableOpacity>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        position: 'relative',
        bottom: 0,
        padding: 20,
        backgroundColor: 'white',
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
    }
})