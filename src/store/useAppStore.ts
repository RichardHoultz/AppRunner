import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppConfig, UrlEntry } from '../types';

const STORAGE_KEY = 'apprunner_config';

const DEFAULT_CONFIG: AppConfig = {
  urls: [],
  activeUrlId: null,
  remoteConfigUrl: '',
  screenshotServerUrl: '',
  screenshotIntervalSeconds: 30,
  screenshotEnabled: false,
};

interface AppStore extends AppConfig {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setActiveUrl: (id: string) => void;
  addUrl: (entry: Omit<UrlEntry, 'id'>) => void;
  updateUrl: (entry: UrlEntry) => void;
  removeUrl: (id: string) => void;
  setRemoteConfigUrl: (url: string) => void;
  setScreenshotServerUrl: (url: string) => void;
  setScreenshotInterval: (seconds: number) => void;
  setScreenshotEnabled: (enabled: boolean) => void;
  applyRemoteConfig: (partial: Partial<AppConfig>) => void;
  persist: () => Promise<void>;
}

export const useAppStore = create<AppStore>((set, get) => ({
  ...DEFAULT_CONFIG,
  hydrated: false,

  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Partial<AppConfig>;
        set({ ...DEFAULT_CONFIG, ...saved, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },

  persist: async () => {
    const { urls, activeUrlId, remoteConfigUrl, screenshotServerUrl,
      screenshotIntervalSeconds, screenshotEnabled } = get();
    const data: AppConfig = {
      urls, activeUrlId, remoteConfigUrl,
      screenshotServerUrl, screenshotIntervalSeconds, screenshotEnabled,
    };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  },

  setActiveUrl: (id) => {
    set({ activeUrlId: id });
    get().persist();
  },

  addUrl: (entry) => {
    const newEntry: UrlEntry = { ...entry, id: Date.now().toString() };
    const urls = [...get().urls, newEntry];
    const activeUrlId = get().activeUrlId ?? newEntry.id;
    set({ urls, activeUrlId });
    get().persist();
  },

  updateUrl: (entry) => {
    const urls = get().urls.map((u) => (u.id === entry.id ? entry : u));
    set({ urls });
    get().persist();
  },

  removeUrl: (id) => {
    const urls = get().urls.filter((u) => u.id !== id);
    const activeUrlId = get().activeUrlId === id
      ? (urls[0]?.id ?? null)
      : get().activeUrlId;
    set({ urls, activeUrlId });
    get().persist();
  },

  setRemoteConfigUrl: (url) => { set({ remoteConfigUrl: url }); get().persist(); },
  setScreenshotServerUrl: (url) => { set({ screenshotServerUrl: url }); get().persist(); },
  setScreenshotInterval: (seconds) => { set({ screenshotIntervalSeconds: seconds }); get().persist(); },
  setScreenshotEnabled: (enabled) => { set({ screenshotEnabled: enabled }); get().persist(); },

  applyRemoteConfig: (partial) => {
    set((state) => ({ ...state, ...partial }));
    get().persist();
  },
}));
