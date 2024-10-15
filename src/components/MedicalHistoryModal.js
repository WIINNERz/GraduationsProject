import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';

const MedicalHistoryModal = ({ visible, record, onClose }) => {
    const formatDate = (dateString) => {
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
              <Text style={styles.modalText}><Text style={styles.boldText}>Date:</Text> {formatDate(record.date)}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Time:</Text> {record.time}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Conditions:</Text> {record.conditions}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Doctor:</Text> {record.doctor}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Treatment:</Text> {record.treatment}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Note:</Text> {record.note}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>New Drug Allergy:</Text> {record.drugallergy}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>New Chronic Disease:</Text> {record.chronic}</Text>
              <Text style={styles.modalText}><Text style={styles.boldText}>Vaccine:</Text> {'\n'}
                {record.vaccine && record.vaccine.length > 0 ? (
                  record.vaccine.map((v, index) => (
                    <Text key={index}>
                      {v.name} - {v.quantity} ml. {'\n'}
                    </Text>
                  ))
                ) : (
                  <Text>No vaccine record</Text>
                )}
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
  boldText: {
    fontWeight: 'bold',
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