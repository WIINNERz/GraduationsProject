import { Image, StyleSheet, View, Text } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth, storage, firestore } from "../configs/firebaseConfig";
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from "react";

function HomeHeader() {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [image, setImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const user = auth.currentUser;
    useEffect(() => {
        if (!user) return;

        const userDoc = doc(firestore, 'Users', user.uid);

        // Set up Firestore listener
        const unsubscribe = onSnapshot(userDoc, (docSnap) => {
            if (docSnap.exists() && docSnap.data().email === user.email) {
                setUserData(docSnap.data());
            } else {
                console.log('No matching user data found');
            }
            setLoading(false);
        }, (error) => {
            console.error('Error fetching user data:', error);
            setLoading(false);
        });

        // Clean up the listener on component unmount
        return () => unsubscribe();
    }, [user]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <MaterialCommunityIcons name="paw" size={50} color='#000' />
                <Text style={{fontSize:24,fontWeight:'bold',color:'#fff'}}> PetPal</Text>
            </View>
            <View style={{backgroundColor:'#fff',borderRadius:100}}>
                <MaterialCommunityIcons name="magnify" size={50} color='#000' />
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 25,
        backgroundColor: '#E16539',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 26,
        height: 26,
        borderRadius: 13,

    },
});
export default HomeHeader;