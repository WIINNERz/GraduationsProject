import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import { auth, firestore } from "../configs/firebaseConfig";
import { doc, onSnapshot } from 'firebase/firestore';
import { useNavigation } from "@react-navigation/native";
import { useEffect, useState } from "react";

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
            {userData ? (
                <View>
                    <Text>Username: {userData.username}</Text>
                    <Text>Email: {userData.email}</Text>
                    <Text>Type: {userData.type}</Text>
                </View>
            ) : (
                <Text>No user data available</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
});

export default AccountInfo;
