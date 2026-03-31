import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import BrowserScreen from '../screens/BrowserScreen';
import ConfigScreen from '../screens/ConfigScreen';

export type RootStackParamList = {
  Browser: undefined;
  Config: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Browser"
        screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
      >
        <Stack.Screen name="Browser" component={BrowserScreen} />
        <Stack.Screen name="Config" component={ConfigScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
