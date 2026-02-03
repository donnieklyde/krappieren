import type { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
  appId: 'com.krappieren.app',
  appName: 'krappieren',
  webDir: 'public',
  server: {
    url: 'https://krappieren.com',
    cleartext: false
  },
  backgroundColor: '#000000',
  plugins: {
    GoogleAuth: {
      scopes: ['profile', 'email'],
      serverClientId: '460311552143-tgeaqub4hj0cgevc0nivg1t3ghs2hgj6.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
    },
    Keyboard: {
      resize: KeyboardResize.Native,
    },
    LocalNotifications: {
      smallIcon: "ic_stat_icon_config_sample",
      iconColor: "#488AFF",
      sound: "beep.wav",
    },
  },
};

export default config;
