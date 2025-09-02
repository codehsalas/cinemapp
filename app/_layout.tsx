
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootStackParamList } from '../src/types/navigation.types';
import { TabNavigator } from '../src/navigation/TabNavigator';
import { MovieDetailScreen } from '../src/screens/MovieDetailScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" backgroundColor="#fff" />
      <Stack.Navigator
        initialRouteName="TabNavigator"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="TabNavigator"
          component={TabNavigator}
        />
        <Stack.Screen
          name="MovieDetail"
          component={MovieDetailScreen}
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
      </Stack.Navigator>
    </SafeAreaProvider>
  );
}