import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import E2EE from '../components/E2EE';

const TermOfService = () => {
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const navigation = useNavigation();
  const ee2e = E2EE();

  const handleAccept = async () => {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(db, "Users", user.uid);
      await ee2e.generateKeyPair(user.uid);
      await updateDoc(userDocRef, { termsAccepted: true });
      Alert.alert('Accepted', 'You have accepted the terms of service.');
      navigation.navigate('MyPetStack');
    } else {
      Alert.alert('Error', 'No user is currently signed in.');
    }
  };

  const handleScroll = (event) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isEndReached = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
    setIsScrolledToEnd(isEndReached);
  };

  useFocusEffect(
    useCallback(() => {
      navigation.getParent()?.setOptions({ tabBarStyle: { display: 'none' } });

      return () => {
        navigation.getParent()?.setOptions({ tabBarStyle: { display: 'flex' } });
      };
    }, [navigation])
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} onScroll={handleScroll} scrollEventThrottle={16}>
      <Text style={styles.title}>PetPal Terms of Service</Text>
        <Text style={styles.paragraph}>
          Welcome to PetPal! These Terms of Service ("Terms") govern your use of our mobile application ("App") and services provided through the App ("Services"). By accessing or using the PetPal App, you agree to comply with and be bound by these Terms. If you do not agree to these Terms, please do not use the App.
        </Text>

        <Text style={styles.heading}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By creating an account or using PetPal, you acknowledge that you have read, understood, and agree to be bound by these Terms, along with our Privacy Policy.
        </Text>

        <Text style={styles.heading}>2. Use of the App</Text>
        <Text style={styles.paragraph}>
          You must be at least 13 years old to use PetPal. You agree to use the App for its intended purpose of pet care management and adoption services, and to abide by all applicable laws and regulations.
        </Text>

        <Text style={styles.heading}>3. User Accounts</Text>
        <Text style={styles.paragraph}>
          You are responsible for keeping your account credentials confidential. Any activity that occurs under your account is your responsibility, and you agree to notify us immediately of any unauthorized use.
        </Text>

        <Text style={styles.heading}>4. Managing Pet Information</Text>
        <Text style={styles.paragraph}>
          PetPal allows you to add and manage information about your pets. You are responsible for the accuracy and appropriateness of the content you post, including health and adoption status of pets.
        </Text>

        <Text style={styles.heading}>5. Veterinary and Adoption Services</Text>
        <Text style={styles.paragraph}>
          PetPal offers access to veterinary visit place and pet adoption management. PetPal does not guarantee the availability or accuracy of veterinary services or the outcome of any adoption process facilitated through the App.
        </Text>

        <Text style={styles.heading}>6. Prohibited Activities</Text>
        <Text style={styles.paragraph}>
          You agree not to engage in any of the following activities while using PetPal:
          {'\n'}- Violating any local, state, or national law.
          {'\n'}- Providing false information about pets, including health conditions or adoption eligibility.
          {'\n'}- Misusing the App to harm animals or deceive users.
        </Text>

        <Text style={styles.heading}>7. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          PetPal retains ownership of all content and material on the App, including text, images, logos, and trademarks. Users are not allowed to copy, distribute, or modify any material without prior consent from PetPal.
        </Text>

        <Text style={styles.heading}>8. Termination</Text>
        <Text style={styles.paragraph}>
          PetPal reserves the right to terminate or suspend your account if you violate these Terms or misuse the App. Upon termination, your right to access the App will cease immediately.
        </Text>

        <Text style={styles.heading}>9. Disclaimer of Warranties</Text>
        <Text style={styles.paragraph}>
          The App is provided "AS IS" without warranties of any kind. We do not guarantee that the App will meet your requirements or be available without interruption or error. 
        </Text>

        <Text style={styles.heading}>10. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          In no event shall PetPal be liable for any damages (including indirect or consequential damages) arising out of the use or inability to use the App.
        </Text>

        <Text style={styles.heading}>11. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          PetPal reserves the right to modify these Terms at any time. We will notify users of any changes via the App, and continued use after such changes implies acceptance of the new Terms.
        </Text>

        <Text style={styles.heading}>12. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms are governed by and construed in accordance with the laws PDPA of Thailand. Any disputes arising from these Terms will be subject to the exclusive jurisdiction of the courts in [Your Country/State].
        </Text>

        <Text style={styles.heading}>13. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have any questions or concerns about these Terms, please contact us at support@petpal.com.
        </Text>
      </ScrollView>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, !isScrolledToEnd && styles.buttonDisabled]} onPress={handleAccept} disabled={!isScrolledToEnd}>
          <Text style={styles.buttonText}>Accept the terms</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    padding: 20,
    marginBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderColor: '#ccc',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default TermOfService;