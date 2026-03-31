import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Switch,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppStore } from '../store/useAppStore';
import { UrlEntry } from '../types';
import { fetchRemoteConfig } from '../services/configService';

export default function ConfigScreen() {
  const navigation = useNavigation();
  const store = useAppStore();
  const { width } = useWindowDimensions();
  const isPhone = width < 768;

  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [editingEntry, setEditingEntry] = useState<UrlEntry | null>(null);
  const [remoteConfigDraft, setRemoteConfigDraft] = useState(store.remoteConfigUrl);
  const [screenshotServerDraft, setScreenshotServerDraft] = useState(store.screenshotServerUrl);
  const [intervalDraft, setIntervalDraft] = useState(String(store.screenshotIntervalSeconds));

  const handleAddUrl = () => {
    const trimmedName = newName.trim();
    const trimmedUrl = newUrl.trim();
    if (!trimmedName || !trimmedUrl) {
      Alert.alert('Validation', 'Please enter both a name and a URL.');
      return;
    }
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      Alert.alert('Validation', 'URL must start with http:// or https://');
      return;
    }
    store.addUrl({ name: trimmedName, url: trimmedUrl });
    setNewName('');
    setNewUrl('');
  };

  const handleSaveEdit = () => {
    if (!editingEntry) return;
    const trimmedName = editingEntry.name.trim();
    const trimmedUrl = editingEntry.url.trim();
    if (!trimmedName || !trimmedUrl) {
      Alert.alert('Validation', 'Name and URL cannot be empty.');
      return;
    }
    store.updateUrl({ ...editingEntry, name: trimmedName, url: trimmedUrl });
    setEditingEntry(null);
  };

  const handleRemove = (id: string) => {
    Alert.alert('Remove URL', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => store.removeUrl(id) },
    ]);
  };

  const handleSaveSettings = () => {
    store.setRemoteConfigUrl(remoteConfigDraft.trim());
    store.setScreenshotServerUrl(screenshotServerDraft.trim());
    const parsed = parseInt(intervalDraft, 10);
    if (!isNaN(parsed) && parsed > 0) store.setScreenshotInterval(parsed);
    Alert.alert('Saved', 'Settings saved.');
  };

  const handleFetchRemote = async () => {
    store.setRemoteConfigUrl(remoteConfigDraft.trim());
    const ok = await fetchRemoteConfig();
    Alert.alert(ok ? 'Success' : 'Failed', ok ? 'Remote config applied.' : 'Could not fetch remote config. Check the URL.');
  };

  const renderUrlItem = ({ item }: { item: UrlEntry }) => {
    const isActive = store.activeUrlId === item.id;
    if (editingEntry?.id === item.id) {
      return (
        <View style={styles.editRow}>
          <TextInput
            style={[styles.input, styles.editInput]}
            value={editingEntry.name}
            onChangeText={(t) => setEditingEntry({ ...editingEntry, name: t })}
            placeholder="Name"
            placeholderTextColor="#666"
          />
          <TextInput
            style={[styles.input, styles.editInput]}
            value={editingEntry.url}
            onChangeText={(t) => setEditingEntry({ ...editingEntry, url: t })}
            placeholder="https://..."
            placeholderTextColor="#666"
            autoCapitalize="none"
            keyboardType="url"
          />
          <View style={styles.editActions}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveEdit}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditingEntry(null)}>
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    return (
      <View style={[styles.urlRow, isActive && styles.urlRowActive]}>
        <TouchableOpacity style={styles.urlInfo} onPress={() => store.setActiveUrl(item.id)}>
          <Text style={[styles.urlName, isActive && styles.urlNameActive]}>{item.name}</Text>
          <Text style={styles.urlText} numberOfLines={1}>{item.url}</Text>
        </TouchableOpacity>
        <View style={styles.urlActions}>
          {isActive && <Text style={styles.activeBadge}>ACTIVE</Text>}
          <TouchableOpacity onPress={() => setEditingEntry(item)} style={styles.iconBtn}>
            <Text style={styles.iconBtnText}>✎</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleRemove(item.id)} style={styles.iconBtn}>
            <Text style={[styles.iconBtnText, styles.deleteIcon]}>✕</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.doneBtn}>
          <Text style={styles.doneBtnText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={[styles.body, isPhone && styles.bodyPhone]}>
        {/* URL List */}
        <Text style={styles.sectionHeader}>URLs</Text>
        <Text style={styles.hint}>Tap a URL to set it as the active view.</Text>
        <FlatList
          data={store.urls}
          keyExtractor={(item) => item.id}
          renderItem={renderUrlItem}
          scrollEnabled={false}
          ListEmptyComponent={<Text style={styles.emptyList}>No URLs added yet.</Text>}
        />

        {/* Add URL */}
        <Text style={styles.sectionHeader}>Add URL</Text>
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          placeholderTextColor="#666"
          value={newName}
          onChangeText={setNewName}
        />
        <TextInput
          style={styles.input}
          placeholder="https://example.com"
          placeholderTextColor="#666"
          value={newUrl}
          onChangeText={setNewUrl}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TouchableOpacity style={styles.addBtn} onPress={handleAddUrl}>
          <Text style={styles.addBtnText}>+ Add URL</Text>
        </TouchableOpacity>

        {/* Remote Config */}
        <Text style={styles.sectionHeader}>Remote Config (optional)</Text>
        <Text style={styles.hint}>JSON endpoint to fetch URL list remotely.</Text>
        <TextInput
          style={styles.input}
          placeholder="https://your-server.com/config.json"
          placeholderTextColor="#666"
          value={remoteConfigDraft}
          onChangeText={setRemoteConfigDraft}
          autoCapitalize="none"
          keyboardType="url"
        />
        <TouchableOpacity style={styles.fetchBtn} onPress={handleFetchRemote}>
          <Text style={styles.fetchBtnText}>Fetch Remote Config</Text>
        </TouchableOpacity>

        {/* Screenshot Settings */}
        <Text style={styles.sectionHeader}>Screenshot Monitoring (optional)</Text>
        <View style={styles.toggleRow}>
          <Text style={styles.label}>Enable Screenshots</Text>
          <Switch
            value={store.screenshotEnabled}
            onValueChange={store.setScreenshotEnabled}
            trackColor={{ false: '#333', true: '#0a84ff' }}
            thumbColor="#fff"
          />
        </View>
        {store.screenshotEnabled && (
          <>
            <TextInput
              style={styles.input}
              placeholder="https://your-server.com/upload"
              placeholderTextColor="#666"
              value={screenshotServerDraft}
              onChangeText={setScreenshotServerDraft}
              autoCapitalize="none"
              keyboardType="url"
            />
            <Text style={styles.label}>Interval (seconds)</Text>
            <TextInput
              style={styles.input}
              placeholder="30"
              placeholderTextColor="#666"
              value={intervalDraft}
              onChangeText={setIntervalDraft}
              keyboardType="number-pad"
            />
          </>
        )}

        <TouchableOpacity style={styles.saveSettingsBtn} onPress={handleSaveSettings}>
          <Text style={styles.saveSettingsBtnText}>Save Settings</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#111' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 12,
    backgroundColor: '#1c1c1e',
    borderBottomWidth: 1,
    borderBottomColor: '#2c2c2e',
  },
  headerTitle: { color: '#fff', fontSize: 20, fontWeight: '700' },
  doneBtn: { paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#0a84ff', borderRadius: 8 },
  doneBtnText: { color: '#fff', fontWeight: '600' },
  body: { padding: 20 },
  bodyPhone: { padding: 14 },
  sectionHeader: { color: '#0a84ff', fontSize: 13, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginTop: 24, marginBottom: 8 },
  hint: { color: '#888', fontSize: 13, marginBottom: 8 },
  emptyList: { color: '#555', fontStyle: 'italic', marginBottom: 8 },
  urlRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1c1c1e', borderRadius: 10, marginBottom: 8, padding: 12 },
  urlRowActive: { borderWidth: 1, borderColor: '#0a84ff' },
  urlInfo: { flex: 1 },
  urlName: { color: '#fff', fontSize: 15, fontWeight: '600' },
  urlNameActive: { color: '#0a84ff' },
  urlText: { color: '#888', fontSize: 12, marginTop: 2 },
  urlActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  activeBadge: { color: '#0a84ff', fontSize: 10, fontWeight: '700', marginRight: 4 },
  iconBtn: { padding: 6 },
  iconBtnText: { color: '#aaa', fontSize: 18 },
  deleteIcon: { color: '#ff453a' },
  editRow: { backgroundColor: '#1c1c1e', borderRadius: 10, padding: 12, marginBottom: 8 },
  editInput: { marginBottom: 8 },
  editActions: { flexDirection: 'row', gap: 8 },
  saveBtn: { flex: 1, backgroundColor: '#0a84ff', padding: 10, borderRadius: 8, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '600' },
  cancelBtn: { flex: 1, backgroundColor: '#2c2c2e', padding: 10, borderRadius: 8, alignItems: 'center' },
  cancelBtnText: { color: '#aaa', fontWeight: '600' },
  input: { backgroundColor: '#1c1c1e', color: '#fff', borderRadius: 10, padding: 14, fontSize: 15, marginBottom: 10, borderWidth: 1, borderColor: '#2c2c2e' },
  addBtn: { backgroundColor: '#0a84ff', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  addBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  fetchBtn: { backgroundColor: '#2c2c2e', padding: 14, borderRadius: 10, alignItems: 'center', marginBottom: 8 },
  fetchBtnText: { color: '#0a84ff', fontWeight: '600' },
  toggleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#1c1c1e', borderRadius: 10, padding: 14, marginBottom: 10 },
  label: { color: '#fff', fontSize: 15, marginBottom: 6 },
  saveSettingsBtn: { backgroundColor: '#30d158', padding: 16, borderRadius: 10, alignItems: 'center', marginTop: 16 },
  saveSettingsBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
