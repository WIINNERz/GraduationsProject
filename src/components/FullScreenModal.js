import React, { useEffect } from 'react';
import { Modal, View, Image, TouchableOpacity, StyleSheet, Text } from 'react-native';

const FullScreenModal = ({ imageUri, thumbnailStyle, modalVisible, setModalVisible }) => {
  const closeModal = () => setModalVisible(false);
  return (
    <>
      <Modal visible={modalVisible} transparent={true}>
        <View style={styles.modalBackground}>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>X</Text>
          </TouchableOpacity>
          <View style={styles.modalContainer}>
            <Image source={{ uri: imageUri }} style={styles.fullscreenImage} resizeMode="contain" />
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    width: 40,
    height: 40,
    top: 40,
    right: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 10,
    zIndex: 1,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#D27C2C',
  },
});

export default FullScreenModal;