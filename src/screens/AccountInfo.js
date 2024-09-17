import { StyleSheet, View, Text, ActivityIndicator , ScrollView } from "react-native";
import { auth, firestore } from "../configs/firebaseConfig";
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";


const AccountInfo = () => {
    const navigation = useNavigation();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = auth.currentUser;
  
    useEffect(() => {
        if (!user) return;

        const userDoc = doc(firestore, 'Users', user.uid);

        // Set up Firestore listener
        const unsubscribe = onSnapshot(userDoc, (docSnap) => {
            if (docSnap.exists()) {
                setUserData(docSnap.data());
                console.log('User data found:', docSnap.data());
            } else {
                console.log('No matching user data found');
                setUserData(null);
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching user data:', error);
            setLoading(false);
        });

        // Clean up the listener on component unmount
        return () => unsubscribe();
    }, [user]);

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
        <ScrollView>
        <MaterialCommunityIcons
          style={styles.back}
          name="arrow-left"
          size={35}
          color="#D27C2C"
          onPress={() => navigation.goBack()}
        />
            <View style={styles.content}>
            <Text style={styles.headerText}>Account Information</Text>
            {userData ? (
                <View>
                    <Text style={styles.info}>Username: {userData.username}</Text>
                    <Text style={styles.info}>Email: {userData.email}</Text>
                    <Text style={styles.info}>Veriyfy status: {String(userData.verify)}</Text>
                </View>
            ) : (
                <Text>No user data available</Text>
            )}
            </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        fontFamily : 'InterRegular',
    },
    content: {
        marginTop: 50,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    headerText: {
        fontSize: 24,
        fontFamily:'InterBold',
        marginBottom: 10,
    },
    info: {
        fontSize: 20,
        fontFamily:'InterRegular',
        marginBottom: 5,
    },
    back: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'white',
        borderRadius: 100,
        zIndex: 1,
      },
});

export default AccountInfo;
