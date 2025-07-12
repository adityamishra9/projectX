// src/screens/LiveStreamScreen.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Button,
  StyleSheet,
  PermissionsAndroid,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  AudienceLatencyLevelType,
  IRtcEngineEventHandler,
} from 'react-native-agora';
import VideoFeed from '../components/VideoFeed';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'LiveStream'>;

export default function LiveStreamScreen({ route }: Props) {
  const { appId, token, channelName } = route.params;
  const agoraEngineRef = useRef<any>(null);
  const [joined, setJoined] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [status, setStatus] = useState('Initializing...');

  // ask permissions
  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }
  }, []);

  // initialize engine once
  const initEngine = async () => {
    const engine = createAgoraRtcEngine();
    agoraEngineRef.current = engine;
    await engine.initialize({ appId });

    const handler: IRtcEngineEventHandler = {
      onJoinChannelSuccess: (_, uid) => {
        setStatus(`Joined as ${uid}`);
        engine.enableVideo();
        engine.startPreview();
        setJoined(true);
      },
      onUserJoined: (_, uid) => {
        setStatus(`User joined: ${uid}`);
        setRemoteUid(uid);
      },
      onUserOffline: (_, uid) => {
        setStatus(`User left: ${uid}`);
        setRemoteUid(null);
      },
    };

    engine.registerEventHandler(handler);
  };

  const toggleJoin = async () => {
    if (!agoraEngineRef.current) {
      await initEngine();
    }
    const engine = agoraEngineRef.current;

    if (!joined) {
      engine.joinChannel(
        token,
        channelName,
        0,
        {
          channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
          clientRoleType: isHost
            ? ClientRoleType.ClientRoleBroadcaster
            : ClientRoleType.ClientRoleAudience,
          publishCameraTrack: isHost,
          publishMicrophoneTrack: isHost,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
          audienceLatencyLevel:
            AudienceLatencyLevelType.AudienceLatencyLevelUltraLowLatency,
        }
      );
    } else {
      engine.leaveChannel();
      setJoined(false);
      setRemoteUid(null);
      setStatus('Left channel');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.controls}>
        <Text style={styles.status}>{status}</Text>
        <View style={styles.buttons}>
          <Button
            title={`Mode: ${isHost ? 'Host' : 'Audience'}`}
            onPress={() => setIsHost((h) => !h)}
          />
          <Button
            title={joined ? 'Leave' : `Join as ${isHost ? 'Host' : 'Audience'}`}
            onPress={toggleJoin}
          />
        </View>
      </View>

      <View style={styles.videoWrapper}>
        {joined && isHost && <VideoFeed uid={0} style={styles.video} />}
        {joined && remoteUid !== null && (
          <VideoFeed uid={remoteUid} style={styles.video} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  controls: { padding: 16 },
  status: { textAlign: 'center', marginBottom: 12 },
  buttons: { flexDirection: 'row', justifyContent: 'space-around' },
  videoWrapper: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  video: {
    width: '100%',
    height: 240,
    backgroundColor: '#000',
    marginBottom: 12,
  },
});
