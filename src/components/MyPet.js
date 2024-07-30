import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { auth } from '../configs/firebaseConfig';


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
        }, [])
    );

    return (
        <SafeAreaView style={styles.screen}>
            <View>
                <TouchableOpacity style={styles.plusButton} onPress={() => navigation.navigate('AddPet')}>
                    <MaterialCommunityIcons name="plus" size={20} color="#F0DFC8" />
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>My Pets</Text>
            <View style={styles.container}>
                {loading ? (
                    <Text>Loading...</Text>
                ) : error ? (
                    <Text>Error: {error}</Text>
                ) : (
                        dogs.length > 0 ? (
                            dogs.map(dog => (
                                <TouchableOpacity style={styles.dogContainer} onPress={() => navigation.navigate('PetDetail', { id: dog.id })}>
                                <View key={dog.id}>
                                        {dog.photoURL ? (
                                            <Image source={{ uri: dog.photoURL }} style={styles.petPic} />
                                        ) : (
                                            <MaterialCommunityIcons name="dog" size={80} color="#E16539" />
                                        )}
                                        <Text style={{textAlign:'center',paddingVertical:10}}>{dog.name}</Text>
                                </View>
                                </TouchableOpacity>
                            ))
                        ) : (
                            <Text style={styles.nopets}> No pets available</Text>
                        )
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#fff',

    },
    container: {
        marginTop: '20%',
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    plusButton: {
        backgroundColor: '#E16539',
        alignItems: 'center',
        justifyContent: 'right',
        position: 'absolute',
        top: 50,
        right: 15,
        width: 75,
        borderRadius: 20,
        padding: 5,
    },
    dogContainer: {
        alignItems: 'center',
        alignContent: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
        marginHorizontal: "auto",
        padding: 10,
        borderRadius: 10,
        width: '40%',
        backgroundColor: '#F0DFC8',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        position: 'absolute',
        top: 50,
        left: 15,
        color: '#E16539',
    },
    nopets: {
        textAlign: 'center',
        marginTop: "70%",
        justifyContent: 'center',
        fontSize: 20,
        fontStyle: 'italic',
        color: "gray",
    },
    petPic: {
        width: 80,
        height: 80,
        borderRadius: 50,
    },
});