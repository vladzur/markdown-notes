import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.notes-app.mobile',
  appName: 'Notes',
  webDir: '../web/.output/public',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    Filesystem: {
      androidPermissions: ['READ_EXTERNAL_STORAGE', 'WRITE_EXTERNAL_STORAGE'],
    },
    Keyboard: {
      resize: 'body',
    },
  },
}

export default config
