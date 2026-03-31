// Native platform (iOS): use react-native-webview
import React from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface Props {
  uri: string;
}

export default function CrossPlatformWebView({ uri }: Props) {
  return (
    <WebView
      source={{ uri }}
      style={styles.webview}
      javaScriptEnabled
      domStorageEnabled
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      startInLoadingState={false}
    />
  );
}

const styles = StyleSheet.create({
  webview: { flex: 1 },
});
