import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../configs/firebaseConfig';
import { style } from 'twrnc';

export default function MyPet() {
    const [dogs, setDogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigation = useNavigation();
    const user = auth.currentUser;

    const fetchDogs = async () => {
        const user = auth.currentUser;
        if (user) {
            try {
                const db = getFirestore();
                const petsCollection = collection(db, 'Pets');
                const q = query(petsCollection, where('uid', '==', user.uid));
                const querySnapshot = await getDocs(q);

                const petList = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setDogs(petList);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
            setError('User is not authenticated');
        }
    };

    useFocusEffect(
        useCallback(() => {
            setLoading(true);
            fetchDogs();
            console.log(dogs);
        }, [])
    );
    
    return (
        <ScrollView contentContainerStyle ={styles.screen}>
            <View style={styles.header}>
                <View style={{flexDirection:'row',alignItems:'center'}}>
                    <MaterialCommunityIcons name='paw-outline' size={40} color='white' />
                    <Text style={styles.title}> PetPal</Text>
                </View>
                <TouchableOpacity style={styles.plusButton} onPress={() => navigation.navigate('AddPet')}>
                    <MaterialCommunityIcons name="plus" size={30} color="#E16539" />
                </TouchableOpacity>
            </View>

            <View style={styles.container}>
                {loading ? (
                    <Text>Loading...</Text>
                ) : error ? (
                    <Text>Error: {error}</Text>
                ) : (
                    dogs.length > 0 ? (
                        dogs.map(dog => (
                            <TouchableOpacity key={dog.id} style={styles.dogContainer} onPress={() => navigation.navigate('PetDetail', { id: dog.id })}>
                                <View  >
                                    {dog.photoURL ? (
                                        <Image source={{ uri: dog.photoURL }} style={styles.petPic} />
                                    ) : (
                                        <MaterialCommunityIcons name="dog" size={80} color="#E16539" />
                                    )}
                                    <Text style={styles.petdetail}>{dog.name}</Text>
                          
                                </View>
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={styles.nopets}> No pets available</Text>
                    )
                )}
                
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    screen: {
        backgroundColor: '#fff',
        flex: 1,
        height: '100%',
        width: '100%',
    },
    header: {
        width: '100%',
        height: "8%",
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#D27C2C',
        padding: 10,
        borderBottomLeftRadius:20,
        borderBottomRightRadius:20,

    },
    container: {
        width: '100%',
        padding: "3%",
        justifyContent: 'flex-start',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'flex-start',


    },
    dogContainer: {
        alignItems: 'center',
        alignContent: 'center',
        margin: 5,
        padding : 10,
        borderRadius: 10,
        width: '30%',
        backgroundColor: '#F0DFC8',
    },
    plusButton: {
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'right',
        width: 75,
        borderRadius: 10,
   
    },
 
    petdetail : {
        paddingTop: 5,
        fontFamily: 'InterBold',
        fontSize: 16,
        color: '#E16539',
        textAlign: 'center',

          
    },
    title: {
        fontSize: 32,
        fontWeight: '600',
        color: 'white',
        backgroundColor: '#D27C2C', 
        fontFamily: 'InterSemiBold',

    },
    petPic: {
        width: 80,
        height: 80,
        borderRadius: 50,
    
    },
    
});