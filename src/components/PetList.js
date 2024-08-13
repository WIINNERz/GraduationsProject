import { View, Text, ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import PetCard from './PetCard';
import { useNavigation } from '@react-navigation/native';

export default function PetList({ pets }) {
    const navigation = useNavigation();
    
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {pets.map((item, index) => (
                <PetCard
                    key={item.id}  // Ensure item.id is unique
                    noBorder={index + 1 === pets.length}
                    item={item}
                    index={index}
                    navigation={navigation}
                />
            ))}
        </ScrollView>
    );  
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
});
