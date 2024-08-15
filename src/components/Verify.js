import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


export default function Verify() {
    return (
        <View style={styles.container}>
            <View>
                <MaterialCommunityIcons name="close-circle" size={30} color="black" />
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {

    }
})