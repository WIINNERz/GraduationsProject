import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const TermOfService = () => {
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const navigation = useNavigation();

  const handleAccept = async () => {
    const db = getFirestore();
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(db, "Users", user.uid);
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
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.paragraph}>
          Welcome to our application. These terms of service outline the rules and regulations for the use of our app.
        </Text>
        <Text style={styles.paragraph}>
          By accessing this app we assume you accept these terms of service in full. Do not continue to use the app if you do not accept all of the terms of service stated on this page.
        </Text>
        <Text style={styles.heading}>License</Text>
        <Text style={styles.paragraph}>
          Unless otherwise stated, we own the intellectual property rights for all material on the app. All intellectual property rights are reserved. You may view and/or print pages from the app for your own personal use subject to restrictions set in these terms of service.
        </Text>
        <Text style={styles.paragraph}>
          You must not:
          {'\n'}- Republish material from the app
          {'\n'}- Sell, rent or sub-license material from the app
          {'\n'}- Reproduce, duplicate or copy material from the app
        </Text>
        <Text style={styles.heading}>User Comments</Text>
        <Text style={styles.paragraph}>
          This Agreement shall begin on the date hereof.
        </Text>
        <Text style={styles.paragraph}>
          Certain parts of this app offer the opportunity for users to post and exchange opinions, information, material and data ('Comments') in areas of the app. We do not screen, edit, publish or review Comments prior to their appearance on the app and Comments do not reflect our views or opinions.
        </Text>
        <Text style={styles.paragraph}>
          To the extent permitted by applicable laws, we shall not be responsible or liable for the Comments or for any loss cost, liability, damages or expenses caused and or suffered as a result of any use of and/or posting of and/or appearance of the Comments on this app.
        </Text>
        <Text style={styles.heading}>Hyperlinking to our Content</Text>
        <Text style={styles.paragraph}>
          The following organizations may link to our app without prior written approval:
          {'\n'}- Government agencies;
          {'\n'}- Search engines;
          {'\n'}- News organizations;
          {'\n'}- Online directory distributors when they list us in the directory may link to our app in the same manner as they hyperlink to the websites of other listed businesses.
        </Text>
        <Text style={styles.heading}>iFrames</Text>
        <Text style={styles.paragraph}>
          Without prior approval and express written permission, you may not create frames around our app or use other techniques that alter in any way the visual presentation or appearance of our app.
        </Text>
        <Text style={styles.heading}>Reservation of Rights</Text>
        <Text style={styles.paragraph}>
          We reserve the right at any time and in its sole discretion to request that you remove all links or any particular link to our app. You agree to immediately remove all links to our app upon such request. We also reserve the right to amend these terms of service and its linking policy at any time. By continuing to link to our app, you agree to be bound to and abide by these linking terms of service.
        </Text>
        <Text style={styles.heading}>Removal of links from our app</Text>
        <Text style={styles.paragraph}>
          If you find any link on our app or any linked website objectionable for any reason, you may contact us about this. We will consider requests to remove links but will have no obligation to do so or to respond directly to you.
        </Text>
        <Text style={styles.paragraph}>
          Whilst we endeavour to ensure that the information on this app is correct, we do not warrant its completeness or accuracy; nor do we commit to ensuring that the app remains available or that the material on the app is kept up to date.
        </Text>
        <Text style={styles.heading}>Disclaimer</Text>
        <Text style={styles.paragraph}>
          To the maximum extent permitted by applicable law, we exclude all representations, warranties and conditions relating to our app and the use of this app (including, without limitation, any warranties implied by law in respect of satisfactory quality, fitness for purpose and/or the use of reasonable care and skill). Nothing in this disclaimer will:
          {'\n'}- limit or exclude our or your liability for death or personal injury resulting from negligence;
          {'\n'}- limit or exclude our or your liability for fraud or fraudulent misrepresentation;
          {'\n'}- limit any of our or your liabilities in any way that is not permitted under applicable law; or
          {'\n'}- exclude any of our or your liabilities that may not be excluded under applicable law.
        </Text>
        <Text style={[styles.paragraph,{marginBottom:30}]}>
          To the extent that the app and the information and services on the app are provided free of charge, we will not be liable for any loss or damage of any nature.
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
    marginBottom: 10,
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