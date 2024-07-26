import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import {auth} from '@react-native-firebase/auth';

export default function MyPet() {
    const [dogs, setDogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // State สำหรับเก็บข้อผิดพลาด
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
            <View >
                <TouchableOpacity style={styles.plusButton} onPress={() => navigation.navigate('AddPet')}>        
                    <MaterialCommunityIcons name="plus" size={20} color="#F0DFC8" />
                </TouchableOpacity>
            </View>
            <Text style={styles.title}>My Pets</Text>
            <View style={styles.container} >
                {loading ? (
                    <Text>Loading...</Text>
                ) : error ? (
                    <Text>Error: {error}</Text>
                ) : (
                    <View>
                        {dogs.length > 0 ? (
                            dogs.map(dog => (
                                <View key={dog.id} style={styles.dogContainer}>
                                    <Text>Name: {dog.name}</Text>
                                    <Text>Type: {dog.type}</Text>
                                    <Text>Age: {dog.age}</Text>
                                    <Text>Species: {dog.species}</Text>
                                </View>
                            ))
                        ) : (
                            <Text style={styles.nopets}> No pets available</Text>
                        )}
                    </View>
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
        marginTop: "20%",
        width: '100%',
        justifyContent: 'center',
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
        marginVertical: 10,
        marginHorizontal: "5%",
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        width: '90%',
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
    }

});
