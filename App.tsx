import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAppStore } from './src/store/useAppStore';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const hydrate = useAppStore((s) => s.hydrate);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0a84ff" />
      </View>
    );
  }

  return <AppNavigator />;
}

const styles = StyleSheet.create({
  loading: { flex: 1, backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' },
});
