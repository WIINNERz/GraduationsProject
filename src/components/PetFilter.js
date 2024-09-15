import React, { useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PetFilter = ({ filter, setFilter, searchQuery, setSearchQuery }) => {
  const typeData = useMemo(() => [
    { label: 'All', value: 'all', icon: 'paw' },
    { label: 'Cat', value: 'Cat', icon: 'cat' },
    { label: 'Dog', value: 'Dog', icon: 'dog' },
    { label: 'Snake', value: 'Snake', icon: 'snake' },
    { label: 'Fish', value: 'Fish', icon: 'fish' },
    { label: 'Sheep', value: 'Sheep', icon: 'sheep' },
    { label: 'Others', value: 'Other', icon: 'dots-horizontal-circle' },
  ], []);

  return (
    <View style={styles.filterContainer}>
      <View style={styles.searchBoxContainer}>
        <MaterialCommunityIcons name="magnify" size={20} color="#333" />
        <TextInput
          style={styles.searchBox}
          placeholder="Search pets..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      {typeData.map((type) => (
        <TouchableOpacity
          key={type.value}
          style={[
            styles.card,
            filter === type.value && styles.selectedCard,
          ]}
          onPress={() => setFilter(type.value)}
        >
          <MaterialCommunityIcons
            name={type.icon}
            size={30}
            color={filter === type.value ? 'white' : '#333'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  searchBox: {
    flex: 1,
    marginLeft: 10,
  },
  card: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#d27c2c',
  },
});

export default PetFilter;