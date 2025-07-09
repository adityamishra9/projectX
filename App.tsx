import React, { useEffect, useRef, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Button,
  StyleSheet,
  Platform,
  PermissionsAndroid,
  StatusBar,
} from 'react-native';
import {
  createAgoraRtcEngine,
  ChannelProfileType,
  ClientRoleType,
  AudienceLatencyLevelType,
  IRtcEngineEventHandler,
  RtcSurfaceView,
} from 'react-native-agora';

// TS workaround to accept JSX props
const SurfaceView: any = RtcSurfaceView;

const APP_ID = '5d332d31fce7464784bb084b94f3d991';
const TOKEN = '007eJxTYFhyd8tNJ8WCPfNO2J2sMXX4GMWxpSPiZmpQ7PmuqasZl4UrMJimGBsbpRgbpiWnmpuYmZhbmCQlGQAJS5M04xRLS8MFM/IyGgIZGfZNOszKyACBID4HQ0FRflZqckkEAwMAJ0siOg==';
const CHANNEL_NAME = 'projectX';

export default function App() {
  const agoraEngineRef = useRef<ReturnType<typeof createAgoraRtcEngine> | null>(null);
  const eventHandlerRef = useRef<IRtcEngineEventHandler | null>(null);

  const [isJoined, setIsJoined] = useState(false);
  const [isHost, setIsHost] = useState(true);
  const [remoteUid, setRemoteUid] = useState<number | null>(null);
  const [message, setMessage] = useState('Not connected');
  const [engineInitialized, setEngineInitialized] = useState(false);

  // Ask for permissions once
  useEffect(() => {
    if (Platform.OS === 'android') {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        PermissionsAndroid.PERMISSIONS.CAMERA,
      ]);
    }
  }, []);

  // Create Agora engine and handlers
  const initializeEngine = async () => {
    const engine = createAgoraRtcEngine();
    agoraEngineRef.current = engine;
    await engine.initialize({ appId: APP_ID });

    const handler: IRtcEngineEventHandler = {
      onJoinChannelSuccess: (_conn, _uid) => {
        setMessage(`✅ Joined ${CHANNEL_NAME}`);
        engine.enableVideo();
        engine.startPreview();
        setIsJoined(true);
      },
      onUserJoined: (_conn, uid) => {
        setMessage(`🚀 User joined: ${uid}`);
        setRemoteUid(uid);
      },
      onUserOffline: (_conn, uid) => {
        setMessage(`❌ User left: ${uid}`);
        setRemoteUid(null);
      },
    };
    eventHandlerRef.current = handler;
    engine.registerEventHandler(handler);
    setEngineInitialized(true);
  };

  // Join or leave channel (init engine on first join)
  const toggleJoin = async () => {
    if (!engineInitialized) {
      await initializeEngine();
    }
    const engine = agoraEngineRef.current!;

    if (!isJoined) {
      engine.joinChannel(
        TOKEN,
        CHANNEL_NAME,
        0,
        {
          channelProfile: ChannelProfileType.ChannelProfileLiveBroadcasting,
          clientRoleType: isHost
            ? ClientRoleType.ClientRoleBroadcaster
            : ClientRoleType.ClientRoleAudience,
          publishMicrophoneTrack: isHost,
          publishCameraTrack: isHost,
          autoSubscribeAudio: true,
          autoSubscribeVideo: true,
          audienceLatencyLevel:
            AudienceLatencyLevelType.AudienceLatencyLevelUltraLowLatency,
        }
      );
    } else {
      engine.leaveChannel();
      setIsJoined(false);
      setRemoteUid(null);
      setMessage('Left channel');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />

      {/* Controls */}
      <View style={styles.controlsContainer}>
        <Text style={styles.status}>{message}</Text>
        <View style={styles.buttonRow}>
          <Button
            title={`Mode: ${isHost ? 'Host' : 'Audience'}`}
            onPress={() => setIsHost((h) => !h)}
          />
          <Button
            title={isJoined ? 'Leave' : `Join as ${isHost ? 'Host' : 'Audience'}`}
            onPress={toggleJoin}
          />
        </View>
      </View>

      {/* Video feeds below */}
      <View style={styles.videoContainer}>
        {isJoined && isHost && (
          <SurfaceView canvas={{ uid: 0 }} style={styles.localVideo} />
        )}
        {isJoined && remoteUid !== null && (
          <SurfaceView canvas={{ uid: remoteUid }} style={styles.remoteVideo} />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  controlsContainer: { padding: 16 },
  status: { textAlign: 'center', marginBottom: 8 },
  buttonRow: { flexDirection: 'row', justifyContent: 'space-around' },
  videoContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  localVideo: { width: '100%', height: 200, backgroundColor: '#000', marginBottom: 12 },
  remoteVideo: { width: '100%', height: 200, backgroundColor: '#000' },
});
