import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function Home({navigation}) {
  return (
    <View style={styles.container}>
      <Text>Home Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
