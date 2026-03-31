// Web platform: render an iframe instead of WebView
import React from 'react';
import { View, StyleSheet } from 'react-native';

interface Props {
  uri: string;
}

export default function CrossPlatformWebView({ uri }: Props) {
  return (
    <View style={styles.container}>
      <iframe
        src={uri}
        style={iframeStyle}
        allow="autoplay; fullscreen; camera; microphone"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation"
        title="AppRunner"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});

const iframeStyle: React.CSSProperties = {
  flex: 1,
  width: '100%',
  height: '100%',
  border: 'none',
  display: 'block',
};
