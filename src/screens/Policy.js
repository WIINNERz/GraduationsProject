import {StyleSheet, View, Text, ScrollView, Dimensions} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AccountInfo = () => {
  const navigate = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialCommunityIcons
          style={styles.back}
          name="arrow-left"
          size={35}
          color="#D27C2C"
          onPress={() => navigate.goBack()}
        />
        <Text style={styles.screenTitle}>Privacy Policy</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <Text style={styles.paragraph}>
          At PetPal, we are committed to safeguarding your privacy. This privacy
          policy explains how we collect, use, and protect your personal
          information when you use our mobile app.
        </Text>
        <Text style={styles.subHeader}>What Information Do We Collect?</Text>
        <Text style={styles.paragraph}>
          We collect your email address and basic profile details when you
          create an account. We also collect information about your pets, such
          as their name, age, and health records, to improve your app
          experience.
        </Text>
        <Text style={styles.subHeader}>
          Why Do We Collect This Information?
        </Text>
        <Text style={styles.paragraph}>
          Your data helps us personalize your experience, send you reminders
          about your pets, and make it easier for your pet data management.
        </Text>
        <Text style={styles.subHeader}>
          How Do We Protect Your Information?
        </Text>
        <Text style={styles.paragraph}>
          We use advanced encryption techniques to protect your data and ensure
          that only authorized personnel can access it.
        </Text>
        <Text style={styles.subHeader}>How Can You Manage Your Data?</Text>
        <Text style={styles.paragraph}>
          You can request to view, edit, or delete your personal information at
          any time by visiting the "Settings" section of the app.
        </Text>
      </ScrollView>
    </View>
  );
};
const {width} = Dimensions.get('window');
const titleSize = width / 16 ;
const subHeader = width / 18;
const paragraph = width / 20;
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  header: {
    width: '100%',
    height: '8%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  back: {
    position: 'absolute',
    left: 20,
  },
  scrollViewContent: {
    width: '100%',
    paddingVertical: '20%',
    paddingHorizontal: 16,
  },
  screenTitle: {
    fontSize: titleSize,
    fontFamily: 'InterBold',
    color: '#D27C2C',
    paddingTop: 5,
  },
  paragraph: {
    fontSize: paragraph,
    fontFamily: 'InterRegular',
    lineHeight: 24,
    marginBottom: 8,
  },
  subHeader: {
    fontSize: subHeader,
    fontFamily: 'InterBold',
    marginTop: 20,
    marginBottom: 10,
  },
});

export default AccountInfo;
