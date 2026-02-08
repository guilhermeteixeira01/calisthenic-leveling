import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.calisthenicleveling.app',
  appName: 'Calisthenic Leveling',
  webDir: 'build',

  server: {
    url: 'https://guilhermeteixeira01.github.io/calisthenic-leveling/',
    cleartext: false
  }
};

export default config;
