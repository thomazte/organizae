import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.organizae.app",
  appName: "organizaê",
  webDir: "dist",
  android: {
    backgroundColor: "#2563eb",
  },
  server: {
    androidScheme: "https",
  },
  plugins: {
    StatusBar: {
      overlaysWebView: false,
    },
  },
};

export default config;
