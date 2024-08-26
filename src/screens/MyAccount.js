import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const MyAccount = () => {
    const navigation = useNavigation();
    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>My Account</Text>
            <View style={styles.tabButton}>
                <TouchableOpacity onPress={() => navigation.navigate('AccountInfo')}>
                    <View style={styles.tabContent}>
                        <MaterialCommunityIcons name="account" size={30} color="gray" />
                        <View style={styles.tabText}>
                            <Text style={styles.titleText}>Account Information</Text>
                            <Text style={styles.descriptionText}>See your account information like your phone number and email address.</Text>
                        </View>
                        <MaterialCommunityIcons name="chevron-right" size={30} color="gray" />
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
         padding: '5%'
    },
    headerText: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    tabButton: {
        backgroundColor: '#fff',
        paddingHorizontal: 15,
    },
    tabContent: {
        flexDirection: 'row',
        justifyContent:'space-between',
        alignItems: 'center',
    },
    tabText: {
        marginLeft: 10,
    },
    titleText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    descriptionText: {
        fontSize: 14,
        color: 'gray',
        marginTop: 5,
    },
});

export default MyAccount;
