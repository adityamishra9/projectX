import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,            // ← import Alert
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Credentials'>;

export default function CredentialsScreen({ navigation }: Props) {
  const [appId, setAppId] = useState('');
  const [token, setToken] = useState('');
  const [channelName, setChannelName] = useState('');

  const onJoin = () => {
    if (!appId || !token || !channelName) {
      Alert.alert('Missing fields', 'Please fill all fields');  // ← use Alert.alert
      return;
    }
    navigation.navigate('LiveStream', { appId, token, channelName });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.label}>Agora App ID</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your App ID"
        value={appId}
        onChangeText={setAppId}
      />

      <Text style={styles.label}>Temporary Token</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your Temp Token"
        value={token}
        onChangeText={setToken}
      />

      <Text style={styles.label}>Channel Name</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Channel Name"
        value={channelName}
        onChangeText={setChannelName}
      />

      <Button title="Join Channel" onPress={onJoin} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, justifyContent: 'center' },
  label: { marginTop: 12, marginBottom: 4, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 8,
  },
});
