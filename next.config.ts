import type { NextConfig } from "next";

// BUILD_TARGET=app makes a fully static, offline bundle for the Android app (Capacitor).
// Server-only files are named *.api.ts so they're left out of that build.
const isApp = process.env.BUILD_TARGET === "app";

const nextConfig: NextConfig = {
  devIndicators: false,
  // Lets phones on the same Wi-Fi load the dev server (with live reload)
  allowedDevOrigins: ["192.168.*.*", "10.*.*.*", "*.local"],
  pageExtensions: isApp ? ["tsx", "ts"] : ["tsx", "ts", "api.ts"],
  ...(isApp && { output: "export", images: { unoptimized: true } }),
};

export default nextConfig;
