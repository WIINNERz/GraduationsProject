import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const SignIn = ({ emailLog, setEmailLog, passwordLog, setPasswordLog, isSecureEntry, toggleSecureEntry, handleSignIn, loading, error, navigation }) => {
  return (
    <View style={styles.formContainer}>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputStyle}
          autoCorrect={false}
          placeholder="Email"
          placeholderTextColor={"gray"}
          autoCapitalize='none'
          value={emailLog}
          onChangeText={(value) => setEmailLog(value)}
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
          value={passwordLog}
          onChangeText={(value) => setPasswordLog(value)}
        />
        <MaterialCommunityIcons
          name='lock-outline'
          color='#000'
          size={20}
          style={styles.iconStyle}
        />
        <TouchableOpacity onPress={toggleSecureEntry} style={styles.iconButton}>
          <MaterialCommunityIcons
            name={isSecureEntry ? 'eye-off-outline' : 'eye-outline'}
            color='#000'
            size={20}
          />
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => navigation.navigate('Forgot')}>
        <Text style={styles.forgotPassword}>Forgot Password?</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={handleSignIn}
        style={styles.loginButton}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Sign In</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  formContainer: {
    width: '80%',
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
  forgotPassword: {
    marginVertical: 10,
    textAlign: 'right',
  },
});

export default SignIn;
