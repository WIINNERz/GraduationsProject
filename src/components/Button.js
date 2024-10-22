import React from 'react';
import { View,Text, StyleSheet, TouchableOpacity} from 'react-native';
import { useNavigation } from '@react-navigation/native';

export const SavePButton = ({ onPress }) => {
    return (
      <TouchableOpacity style={styles.SavePButton} onPress={onPress}>
        <Text style={styles.SavebuttonText}>Save</Text>
      </TouchableOpacity>
    );
  };
export const CancelPButton= () => {
    const navigation = useNavigation();
    return (
        <View>
            <TouchableOpacity style={styles.CancelPButton} onPress={() => navigation.goBack()}>
                <Text style={styles.CancelbuttonText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}
const styles = StyleSheet.create({
    SavePButton :{
        backgroundColor: '#34A853',
        borderWidth: 1,
        borderColor: '#34A853',
        width: 100,
        padding: 10,
        margin: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    CancelPButton :{
        backgroundColor: '#E16539',
        borderWidth: 1,
        borderColor: '#E16539',
        width: 100,
        padding: 10,
        margin: 10,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },

    SavebuttonText: {
        color: 'white',
        fontFamily: 'InterRegular',
    },
    CancelbuttonText: {
        color: 'white',
        fontFamily: 'InterRegular',
    },
    
});



