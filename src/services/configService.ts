import { RemoteConfigResponse } from '../types';
import { useAppStore } from '../store/useAppStore';

export async function fetchRemoteConfig(): Promise<boolean> {
  const { remoteConfigUrl, applyRemoteConfig } = useAppStore.getState();

  if (!remoteConfigUrl) return false;

  try {
    const response = await fetch(remoteConfigUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) return false;

    const data: RemoteConfigResponse = await response.json();
    applyRemoteConfig(data);
    return true;
  } catch {
    return false;
  }
}
