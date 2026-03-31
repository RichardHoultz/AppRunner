import React, { useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import ViewShot from 'react-native-view-shot';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { startScreenshotService, stopScreenshotService } from '../services/screenshotService';
import { fetchRemoteConfig } from '../services/configService';

export default function BrowserScreen() {
  const navigation = useNavigation();
  const { urls, activeUrlId, screenshotEnabled } = useAppStore();
  const viewShotRef = useRef<ViewShot>(null);
  const { width } = useWindowDimensions();
  const isPhone = width < 768;

  const activeEntry = urls.find((u) => u.id === activeUrlId);

  // Fetch remote config on mount
  useEffect(() => {
    fetchRemoteConfig();
  }, []);

  // Manage screenshot service lifecycle
  useEffect(() => {
    if (screenshotEnabled) {
      startScreenshotService(viewShotRef);
    } else {
      stopScreenshotService();
    }
    return () => stopScreenshotService();
  }, [screenshotEnabled]);

  const openConfig = useCallback(() => {
    navigation.navigate('Config' as never);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <StatusBar hidden />
      <ViewShot ref={viewShotRef} style={styles.webviewContainer} options={{ format: 'jpg', quality: 0.8 }}>
        {activeEntry?.url ? (
          <WebView
            source={{ uri: activeEntry.url }}
            style={styles.webview}
            javaScriptEnabled
            domStorageEnabled
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            startInLoadingState={false}
          />
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No URL configured.</Text>
            <TouchableOpacity style={styles.setupBtn} onPress={openConfig}>
              <Text style={styles.setupBtnText}>Open Settings</Text>
            </TouchableOpacity>
          </View>
        )}
      </ViewShot>

      {/* Floating gear button */}
      <TouchableOpacity
        style={[styles.fab, isPhone && styles.fabPhone]}
        onPress={openConfig}
        accessibilityLabel="Open Settings"
      >
        <Text style={styles.fabIcon}>⚙</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webviewContainer: { flex: 1 },
  webview: { flex: 1 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  emptyText: { color: '#aaa', fontSize: 18, marginBottom: 20 },
  setupBtn: { backgroundColor: '#0a84ff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8 },
  setupBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fabPhone: { bottom: 16, right: 16, width: 40, height: 40, borderRadius: 20 },
  fabIcon: { fontSize: 24, color: '#fff' },
});
