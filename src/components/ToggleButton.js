import React from 'react';
import { View, TouchableOpacity, Text, Animated, StyleSheet } from 'react-native';

const ToggleButton = ({ isSignIn, setIsSignIn, startAnimation, backgroundAnimation }) => {
  const backgroundInterpolation = backgroundAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E16539', '#E16539'],
  });

  return (
    <View style={styles.buttonContainer}>
      <Animated.View
        style={{
          position: 'absolute',
          width: '50%',
          height: 40,
          borderRadius: 100,
          backgroundColor: backgroundInterpolation,
          left: backgroundAnimation.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '50%'],
          }),
        }}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          startAnimation(0);
          setIsSignIn(true);
        }}
      >
        <Text style={styles.Text}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          startAnimation(1);
          setIsSignIn(false);
        }}
      >
        <Text style={styles.Text}>Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: 200,
    height: 40,
    borderRadius: 100,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    
  },
  button: {
    alignItems: 'center',
    width: '50%',
    height: 40,
    paddingVertical: 10,
    borderRadius: 100,
  },
  Text: {
    color: 'black',
  },
});

export default ToggleButton;
