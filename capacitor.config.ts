import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'uk.nlptherapies.davechalton',
  appName: 'NLP Therapies Dave Chalton',
  webDir: 'dist',
  backgroundColor: '#F7F8F7',
  android: {
    backgroundColor: '#F7F8F7',
  },
  server: {
    androidScheme: 'https',
  },
};

export default config;
