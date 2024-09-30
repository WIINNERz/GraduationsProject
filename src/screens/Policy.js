import { StyleSheet, View, Text, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";

const AccountInfo = () => {
    const navigate = useNavigation();
  
    return (
        <View style={styles.container}>
            <MaterialCommunityIcons
                style={styles.back}
                name="arrow-left"
                size={35}
                color="#D27C2C"
                onPress={() => navigate.goBack()}
            />
            <ScrollView contentContainerStyle={styles.scrollContainer}>
                <Text style={styles.header}>Privacy Policy</Text>
                <Text style={styles.paragraph}>
                    At PetPal, we are committed to safeguarding your privacy. This privacy policy explains how we collect, use, and protect your personal information when you use our mobile app.
                </Text>
                <Text style={styles.subHeader}>What Information Do We Collect?</Text>
                <Text style={styles.paragraph}>
                    We collect your email address and basic profile details when you create an account. We also collect information about your pets, such as their name, age, and health records, to improve your app experience.
                </Text>
                <Text style={styles.subHeader}>Why Do We Collect This Information?</Text>
                <Text style={styles.paragraph}>
                    Your data helps us personalize your experience, send you reminders about your pets, and make it easier for your pet data management.
                </Text>
                <Text style={styles.subHeader}>How Do We Protect Your Information?</Text>
                <Text style={styles.paragraph}>
                    We use advanced encryption techniques to protect your data and ensure that only authorized personnel can access it.
                </Text>
                <Text style={styles.subHeader}>How Can You Manage Your Data?</Text>
                <Text style={styles.paragraph}>
                    You can request to view, edit, or delete your personal information at any time by visiting the "Account Settings" section of the app.
                </Text>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#fff',
    },
    scrollContainer: {
        paddingBottom: 20,
    },
    back: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'white',
        borderRadius: 100,
        zIndex: 1,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 16,
        textAlign: 'center',
    },
    subHeader: {
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 16,
        marginBottom: 8,
    },
    paragraph: {
        fontSize: 16,
        lineHeight: 24,
        marginBottom: 8,
    },
});

export default AccountInfo;
