export interface UrlEntry {
  id: string;
  name: string;
  url: string;
}

export interface AppConfig {
  urls: UrlEntry[];
  activeUrlId: string | null;
  remoteConfigUrl: string;
  screenshotServerUrl: string;
  screenshotIntervalSeconds: number;
  screenshotEnabled: boolean;
}

export interface RemoteConfigResponse {
  urls?: UrlEntry[];
  screenshotServerUrl?: string;
  screenshotIntervalSeconds?: number;
  screenshotEnabled?: boolean;
}

export interface ScreenshotUploadResult {
  success: boolean;
  error?: string;
}
