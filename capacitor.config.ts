import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.krappieren.app',
  appName: 'krappieren',
  webDir: 'public',
  server: {
    url: 'https://hypsographical-joseph-enticingly.ngrok-free.dev',
    cleartext: true
  },
  backgroundColor: '#000000',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '460311552143-tgeaqub4hj0cgevc0nivg1t3ghs2hgj6.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
  },
};

export default config;
