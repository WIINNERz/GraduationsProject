import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Notiverify = ({ onClose }) => {
    const handleConfirm = () => {
        // Add your confirm logic here
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <MaterialCommunityIcons name="close" color="black" size={30} />
            </TouchableOpacity>
            <View style={styles.panelIcon}>
                <MaterialCommunityIcons name="file-document-outline" color="black" size={50} />
            </View>
            <Text style={styles.title}>ยืนยันตัวตนก่อนสร้างโพสต์</Text>
            <Text style={styles.description}>การยืนยันตัวตนก่อนสร้างโพสต์</Text>
            <Text style={styles.description}>ช่วยให้คุณสามารถโพสต์หาบ้านให้สัตว์เลี้ยงได้</Text>
            <View style={styles.separator} />
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={onClose} style={[styles.button, styles.cancelButton]}>
                    <Text style={styles.buttonText}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleConfirm} style={[styles.button, styles.confirmButton]}>
                    <Text style={styles.buttonText}>ตกลง</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
        position: 'relative'
    },
    closeIcon: {
        position: 'absolute',
        top: 20,
        right: 20,
    },
    panelIcon: {
        backgroundColor: '#D27C2C',
        borderRadius: 10,
        padding: 5,
        marginBottom: 20
    },
    title: {
        fontWeight: 'bold',
        fontSize: 20,
        marginBottom: 10,
        color: 'black'
    },
    description: {
        fontSize: 16,
        textAlign: 'center',
        fontWeight: '500',
        marginVertical: 5,
        color: '#3D3C3C'
    },
    separator: {
        borderBottomWidth: 1,
        borderBottomColor: '#000',
        width: '100%',
        marginVertical: 10
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20
    },
    button: {
        width: 150,
        padding: 10,
        borderRadius: 20,
        marginHorizontal: 10
    },
    cancelButton: {
        backgroundColor: '#D27C2C'
    },
    confirmButton: {
        backgroundColor: 'gray'
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center'
    }
});

export default Notiverify;
