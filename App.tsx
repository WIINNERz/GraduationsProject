import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import useAuth from './src/hooks/useAuth';
import 'react-native-gesture-handler';
import AuthNavigator from './src/navigations/AuthNavigator';
import AppNavigator from './src/navigations/AppNavigator';
import './src/configs/firebaseConfig';

const App = () => {
  const { user, loading, userDocExists } = useAuth();
  const [initialRouteName, setInitialRouteName] = useState<'MyPetStack' | 'WaitVerifyStack' | null>(null);

  useEffect(() => {
    if (initialRouteName === null) {
      setInitialRouteName(userDocExists ? 'MyPetStack' : 'WaitVerifyStack');
    }
  }, [userDocExists, initialRouteName]);

  if (loading || initialRouteName === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppNavigator initialRouteName={initialRouteName} userDocExists={userDocExists} />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(App);