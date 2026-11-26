import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Modern, warm type: Plus Jakarta Sans for reading, Bricolage Grotesque for headings
const body = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-body" });
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display-face", axes: ["opsz", "wdth"] });

export const metadata: Metadata = {
  title: "Aham",
  description: "Plan your days, build habits and keep simple lists.",
  appleWebApp: { capable: true, title: "Aham", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1e2a22",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
