import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const MedicalHistoryModal = ({ visible, record, onClose }) => {
    const formatDate = (dateString) => {
        // สมมติว่า dateString มีรูปแบบเป็น DD-MM-YYYY
        const [day, month, year] = dateString.split('-');
        return `${day}-${month}-${year}`;
      };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Medical History Details</Text>
          {record && (
            <>
              <Text style={styles.modalText}>Date: {formatDate(record.date)}</Text>
              <Text style={styles.modalText}>Time: {record.time}</Text>
              <Text style={styles.modalText}>Conditions: {record.conditions}</Text>
              <Text style={styles.modalText}>Doctor: {record.doctor}</Text>
              <Text style={styles.modalText}>Treatment: {record.treatment}</Text>
              <Text style={styles.modalText}>Vaccine: {'\n'}
                {record.vaccine.map((v, index) => (
                  <Text key={index}>
                    {v.name} - {v.quantity} ml. {'\n'}
                  </Text>
                ))}
              </Text>
            </>
          )}
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
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
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'InterBold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'InterRegular',
    marginBottom: 5,
  },
  closeButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#D27C2C',
    borderRadius: 5,
  },
  closeButtonText: {
    color: 'white',
    fontFamily: 'InterSemiBold',
  },
});

export default MedicalHistoryModal;