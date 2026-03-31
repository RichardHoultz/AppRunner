import { RefObject } from 'react';
import ViewShot from 'react-native-view-shot';
import { ScreenshotUploadResult } from '../types';
import { useAppStore } from '../store/useAppStore';

let intervalHandle: ReturnType<typeof setInterval> | null = null;

export function startScreenshotService(viewShotRef: RefObject<ViewShot>): void {
  stopScreenshotService();

  const tick = async () => {
    const { screenshotEnabled, screenshotServerUrl, screenshotIntervalSeconds } =
      useAppStore.getState();

    if (!screenshotEnabled || !screenshotServerUrl) return;

    await captureAndUpload(viewShotRef);

    // Reschedule with potentially-updated interval
    scheduleNext(viewShotRef, screenshotIntervalSeconds * 1000);
  };

  const scheduleNext = (ref: RefObject<ViewShot>, ms: number) => {
    stopScreenshotService();
    intervalHandle = setTimeout(() => tick(), ms);
  };

  const { screenshotIntervalSeconds } = useAppStore.getState();
  scheduleNext(viewShotRef, screenshotIntervalSeconds * 1000);
}

export function stopScreenshotService(): void {
  if (intervalHandle !== null) {
    clearTimeout(intervalHandle);
    intervalHandle = null;
  }
}

export async function captureAndUpload(
  viewShotRef: RefObject<ViewShot>,
): Promise<ScreenshotUploadResult> {
  const { screenshotServerUrl } = useAppStore.getState();

  if (!screenshotServerUrl) {
    return { success: false, error: 'No screenshot server URL configured' };
  }

  try {
    const uri = await viewShotRef.current?.capture();
    if (!uri) return { success: false, error: 'Capture returned empty' };

    const filename = `screenshot_${Date.now()}.jpg`;
    const formData = new FormData();
    // React Native FormData accepts this object shape for file uploads
    formData.append('screenshot', {
      uri,
      name: filename,
      type: 'image/jpeg',
    } as unknown as Blob);
    formData.append('timestamp', new Date().toISOString());
    formData.append('device', 'AppRunner');

    const response = await fetch(screenshotServerUrl, {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });

    if (!response.ok) {
      return { success: false, error: `Server responded ${response.status}` };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
