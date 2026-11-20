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
    // Connects the Android APK to your hosted Express + Gemini backend.
    // Update this URL if you deploy to a custom domain.
    url: 'https://ais-pre-tfyd6uw46ik6ing4sagju4-120834169464.europe-west2.run.app',
    androidScheme: 'https',
  },
};

export default config;
