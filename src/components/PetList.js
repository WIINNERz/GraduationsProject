import { ScrollView, StyleSheet } from 'react-native';
import React from 'react';
import PetCard from './PetCard';
import { useNavigation } from '@react-navigation/native';

export default function PetList({ pets }) {
    const navigation = useNavigation();
    
    return (
        <ScrollView contentContainerStyle={styles.container}>
            {pets.map((item, index) => (
                <PetCard
                key={item.id || `${item.someProperty}-${index}`}
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
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 3, // Add padding to account for the margin
    },
});