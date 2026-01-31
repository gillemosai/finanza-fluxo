import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.b3fbd5f817704b37bde3cd1d8ecbe0db',
  appName: 'finanza-fluxo',
  webDir: 'dist',
  server: {
    url: 'https://b3fbd5f8-1770-4b37-bde3-cd1d8ecbe0db.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  ios: {
    contentInset: 'automatic'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
