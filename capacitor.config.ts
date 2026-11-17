import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  // Play Store package name: permanent once the first build is uploaded
  appId: "com.onupm.aham",
  appName: "Aham",
  webDir: "out",
  android: {
    backgroundColor: "#1e2a22",
  },
  plugins: {
    LocalNotifications: {
      smallIcon: "ic_stat_aham",
      iconColor: "#6f8f5e",
    },
  },
};

export default config;
