import React from 'react';
import { ViewStyle } from 'react-native';
import { RtcSurfaceView } from 'react-native-agora';

type Props = {
  uid: number;
  style?: ViewStyle;
};

const SurfaceViewWrapper: any = RtcSurfaceView;

export default function VideoFeed({ uid, style }: Props) {
  return <SurfaceViewWrapper canvas={{ uid }} style={style} />;
}
