type AppRuntimeConfig = {
  API_BASE_URL?: string;
};

declare global {
  interface Window {
    __APP_CONFIG__?: AppRuntimeConfig;
  }
}

const runtimeConfig = window.__APP_CONFIG__ ?? {};

export const RUNTIME_CONFIG = {
  API_BASE_URL: runtimeConfig.API_BASE_URL?.trim() || '/api',
} as const;
