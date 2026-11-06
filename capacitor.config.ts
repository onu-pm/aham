import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Play Store package name: permanent once the first build is uploaded
  appId: "com.onupm.aham",
  appName: "Aham",
  webDir: "out",
  android: {
    backgroundColor: "#faf9fc",
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_aham",
      iconColor: "#8f7cf0",
    },
  },
};

export default config;
