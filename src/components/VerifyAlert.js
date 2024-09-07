import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet } from 'react-native';

const VerifyAlert = ({ visible, onCancel, onGoVerify }) => {
    return (
        <Modal
            transparent={true}
            animationType="slide"
            visible={visible}
            onRequestClose={onCancel}
        >
            <View style={styles.modalContainer}>
                <View style={styles.alertBox}>
                    <Text style={styles.title}>Notice</Text>
                    <Text style={styles.message}>Your Account aren't verified</Text>
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity style={styles.button} onPress={onCancel}>
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.button} onPress={onGoVerify}>
                            <Text style={styles.buttonText}>Go Verify</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    alertBox: {
        width: 300,
        padding: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        alignItems: 'center',
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    message: {
        fontSize: 16,
        marginBottom: 20,
        textAlign: 'center',
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    button: {
        flex: 1,
        padding: 10,
        marginHorizontal: 5,
        backgroundColor: '#D27C2C',
        borderRadius: 5,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
    },
});

export default VerifyAlert;

// const [alertVisible, setAlertVisible] = useState(false);
// const navigation = useNavigation();
{/* <VerifyAlert
visible={alertVisible}
onCancel={handleCancel}
onGoVerify={handleGoVerify}
/> */}
// const handleCancel = () => {
//     setAlertVisible(false);
// };

// const handleGoVerify = () => {
//     setAlertVisible(false);
//     navigation.navigate('Verify'); // Navigate to the Verify screen
// };
// setAlertVisible(true);