import React, {useMemo, useState} from 'react';
import {View, StyleSheet, TouchableOpacity, TextInput} from 'react-native';
import {Dropdown} from 'react-native-element-dropdown';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const PetFilter = ({
  filter,
  setFilter,
  searchQuery,
  setSearchQuery,
  selectedField,
  setSelectedField,
}) => {
  const [isFocus, setIsFocus] = useState(false);
  const typeData = useMemo(
    () => [
      {label: 'All', value: 'all', icon: 'paw'},
      {label: 'Cat', value: 'Cat', icon: 'cat'},
      {label: 'Dog', value: 'Dog', icon: 'dog'},
      {label: 'Snake', value: 'Snake', icon: 'snake'},
      {label: 'Fish', value: 'Fish', icon: 'fish'},
      {label: 'Sheep', value: 'Sheep', icon: 'sheep'},
      {label: 'Others', value: 'Other', icon: 'dots-horizontal-circle'},
    ],
    [],
  );
  const sort = [
    {label: 'Name', value: 'name'},
    {label: 'Breeds', value: 'breeds'},
    {label: 'Color', value: 'color'},
    {label: 'Gender', value: 'gender'},
    {label: 'Age', value: 'age'},
    {label: 'Location', value: 'location'},
    {label: 'Characteristics', value: 'characteristics'},
    {label: 'Conditions', value: 'conditions'},
    {label: 'Chronic', value: 'chronic'},
  ];

  return (
    <View style={styles.filterContainer}>
      <View style={styles.searchContainer}>
        <View style={styles.searchBoxContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#333" />
          <TextInput
            style={styles.searchBox}
            placeholder="Search pets..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <View style={styles.sortBoxContainer}>
          <Dropdown
            style={styles.picker}
            placeholderStyle={styles.placeholderStyle}
            itemTextStyle={styles.itemTextStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={sort}
            labelField="label"
            valueField="value"
            placeholder={!isFocus ? 'Select Field' : '...'}
            value={selectedField}
            onFocus={() => setIsFocus(true)}
            onBlur={() => setIsFocus(false)}
            onChange={item => {
              setSelectedField(item.value);
              setIsFocus(false);
            }}
          />
        </View>
      </View>
      <View style={styles.CardContainer}>
        {typeData.map(type => (
          <TouchableOpacity
            key={type.value}
            style={[styles.card, filter === type.value && styles.selectedCard]}
            onPress={() => setFilter(type.value)}>
            <MaterialCommunityIcons
              name={type.icon}
              size={30}
              color={filter === type.value ? 'white' : '#333'}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  filterContainer: {
    flexDirection: 'column',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
    height: 50,
    paddingHorizontal: 10,
    marginBottom: 10,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  sortBoxContainer: {
    width: '90%',
    height: 50,
    justifyContent: 'center',
    marginBottom: 10,
    borderRadius: 20,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  picker: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
  },
  searchBox: {
    flex: 1,
    marginLeft: 10,
  },
  card: {
    padding: 10,
    margin: 5,
    borderRadius: 5,
    backgroundColor: '#CCCCCC',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#d27c2c',
  },
  CardContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  searchContainer: {
    width: '100%',
    alignItems: 'center',
    flexDirection: 'column',
  },
  placeholderStyle: {
    fontSize: 14,
    color: 'gray',
  },
  selectedTextStyle: {
    fontSize: 16,
    color: 'gray',
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 16,
    color: 'black',
  },
  itemTextStyle: {
    color: 'gray',
  },
});

export default PetFilter;
