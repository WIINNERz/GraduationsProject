import { Image, StyleSheet, View,Text } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth ,storage,firestore } from "../configs/firebaseConfig";
import { doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from "react";

function HomeHeader(){
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
            <View>
            <Text style={{fontSize:20}}>HomeHeader</Text>
            
            </View>
            <View>
                {userData?.photoURL ? (
                    <Image 
                        source={{uri:userData.photoURL} }
                        style={styles.profileImage} 
                    />
                ) : (
                    <MaterialCommunityIcons 
                        name="account" 
                        size={50} 
                        style={styles.profileImagePlaceholder} 
                    />
                )}
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
        backgroundColor: '#F0DFC8',
        borderBottomLeftRadius: 40,
        borderBottomRightRadius: 40,
    },
    profileImage: {
        width: 26,
        height: 26,
        borderRadius: 13,
        
    },
});
export default HomeHeader;