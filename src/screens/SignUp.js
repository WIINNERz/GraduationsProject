import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const SignUp = ({ username, setUsername, emailReg, setEmailReg, passwordReg, setPasswordReg, confirmPassword, setConfirmPassword, isSecureEntry, handleSignUp, loading, error,isButtonEnabled }) => {
  return (
    <View style={styles.formContainer}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputStyle}
          autoCorrect={false}
          placeholder="Username"
          placeholderTextColor={"gray"}
          autoCapitalize='none'
          value={username}
          onChangeText={(value) => setUsername(value)}
        />
        <MaterialCommunityIcons
          name='account-outline'
          color='#000'
          size={20}
          style={styles.iconStyle}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputStyle}
          autoCorrect={false}
          placeholder="Email"
          placeholderTextColor={"gray"}
          autoCapitalize='none'
          value={emailReg}
          onChangeText={(value) => setEmailReg(value)}
        />
        <MaterialCommunityIcons
          name='email-outline'
          color='#000'
          size={20}
          style={styles.iconStyle}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputStyle}
          autoCorrect={false}
          secureTextEntry={isSecureEntry}
          placeholder="Password"
          placeholderTextColor={"gray"}
          autoCapitalize='none'
          value={passwordReg}
          onChangeText={(value) => setPasswordReg(value)}
        />
        <MaterialCommunityIcons
          name='lock-outline'
          color='#000'
          size={20}
          style={styles.iconStyle}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputStyle}
          autoCorrect={false}
          secureTextEntry={isSecureEntry}
          placeholder="Confirm Password"
          placeholderTextColor={"gray"}
          autoCapitalize='none'
          value={confirmPassword}
          onChangeText={(value) => setConfirmPassword(value)}
        />
        <MaterialCommunityIcons
          name='lock-outline'
          color='#000'
          size={20}
          style={styles.iconStyle}
        />
      </View>
      <TouchableOpacity
        onPress={handleSignUp}
        style={[styles.loginButton,{backgroundColor: isButtonEnabled? '#E16539':'gray'}]}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Sign Up</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '90%',
    marginHorizontal: '5%',

  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  inputStyle: {
    flex: 1,
    height: 40,
    borderColor: 'gray',
    borderRadius: 50,
    borderWidth: 1,
    paddingLeft: 50,
    color: '#000',
  },
  iconStyle: {
    position: 'absolute',
    left: 20,
    top: 10,
  },
  iconButton: {
    position: 'absolute',
    right: 20,
  },
  loginButton: {
    backgroundColor: '#E16539',
    width: '100%',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
  },
  loginButtonText: {
    color: '#fff',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});

export default SignUp;
