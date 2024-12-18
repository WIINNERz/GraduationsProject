import { Image, StyleSheet, View,Text ,Dimensions } from "react-native";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { auth ,firestore } from "../configs/firebaseConfig";
import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from "react";

function ChatHeader(){
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
            <Text style={styles.title}>Chat</Text>
            
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
const {width} = Dimensions.get('window');
const titleSize = width / 17;
const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: "8%",
        paddingHorizontal: 20,
        flexDirection: 'row',
        backgroundColor: '#D27C2C',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    profileImage: {
        width: 48,
        height: 48,
        borderRadius: 50,
        
    },
    title : {
        fontSize: titleSize,
        color: 'white',
        fontFamily: 'InterSemiBold',
    },
});
export default ChatHeader;