import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CredentialsScreen from '../screens/CredentialsScreen';
import LiveStreamScreen from '../screens/LiveStreamScreen';

export type RootStackParamList = {
  Credentials: undefined;
  LiveStream: { appId: string; token: string; channelName: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerTitleAlign: 'center' }}>
      <Stack.Screen
        name="Credentials"
        component={CredentialsScreen}
        options={{ title: 'Connect to Agora' }}
      />
      <Stack.Screen
        name="LiveStream"
        component={LiveStreamScreen}
        options={{ title: 'Live Stream' }}
      />
    </Stack.Navigator>
  );
}
