import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { getFirestore, doc, getDoc, updateDoc, deleteDoc, setDoc } from 'firebase/firestore';
import { auth, firestore, storage } from '../configs/firebaseConfig';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import AdoptBar from '../components/AdoptBar';

export default function PetProfile() {
    const navigate = useNavigation();
    const [pet, setPet] = useState(null);
    const route = useRoute();
    const { id } = route.params;
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useFocusEffect(
        useCallback(() => {
            navigate.getParent()?.setOptions({
                tabBarStyle: { display: 'none' }
            });

            return () => {
                navigate.getParent()?.setOptions({
                    tabBarStyle: [styles.tabBar, { backgroundColor: '#F0DFC8' }], // Reset tabBarStyle to default
                });
            };
        }, [navigate])
    );

    useEffect(() => {
        const fetchPet = async () => {
            try {
                const petDoc = await getDoc(doc(firestore, 'Pets', id));
                if (petDoc.exists()) {
                    const petData = { id: petDoc.id, ...petDoc.data() };
                    setPet(petData);
                } else {
                    setError('Pet not found');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchPet();
    }, [id]);
    return (
        <ScrollView style={styles.container}>
            <View style={styles.panel}>
                <MaterialCommunityIcons style={styles.back} name="arrow-left" size={30} color="#D27C2C" onPress={() => navigate.goBack()} />
                {pet?.photoURL ? (
                    <Image source={{ uri: pet.photoURL }} style={styles.image} />
                ) : (
                    <MaterialCommunityIcons name="account" size={50} color="gray" />
                )}
            </View>
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'black', paddingVertical: 10, paddingHorizontal: 30 }}>{pet?.name}</Text>
            <View style={styles.panelData}>
                <Text style={{ fontSize: 20, color: 'black', fontWeight: 'bold' }}>Information</Text>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.categoryPet}>Breed: </Text>
                    <Text style={{ fontSize: 18, color: 'black' }}> {pet?.breeds}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.categoryPet}>Sex: </Text>
                    <Text style={{ fontSize: 18, color: 'black' }}> {pet?.gender}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.categoryPet}>Type: </Text>
                    <Text style={{ fontSize: 18, color: 'black' }}> {pet?.type}</Text>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={styles.categoryPet}>Age: </Text>
                    <Text style={{ fontSize: 18, color: 'black' }}> {pet?.age}</Text>
                </View>
            </View>
            <AdoptBar uid={pet?.uid} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1
    },
    panel: {
        height: 350,
        backgroundColor: 'white',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        alignItems: 'center',
        justifyContent: 'center',
    },
    panelData: {
        flex: 1,
        padding: 20,
        borderWidth: 1,
        marginHorizontal: 20,
        borderRadius: 20,
        borderColor: '#D27C2C',
    },
    back: {
        position: 'absolute',
        top: 20,
        left: 20,
        backgroundColor: 'white',
        borderRadius: 100,
        zIndex: 1,
    },
    image: {
        width: '100%',
        height: '100%',
        borderBottomLeftRadius: 50,
        borderBottomRightRadius: 50,
        backgroundColor: 'gray',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    categoryPet: {
        fontWeight: 'bold',
        fontSize: 18,
        color: 'gray',
    },
    tabBar: {
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: "8%",
        position: 'absolute',
        overflow: 'hidden',
    },
});