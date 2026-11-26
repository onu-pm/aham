import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, DM_Sans, Yatra_One } from "next/font/google";
import "./globals.css";

// Light, airy reading type (DM Sans) with characterful headings (Bricolage Grotesque)
const body = DM_Sans({ subsets: ["latin"], variable: "--font-body", axes: ["opsz"] });
// The wordmark: Latin letters drawn in a Devanagari calligraphic style
const vedic = Yatra_One({ subsets: ["latin", "devanagari"], weight: "400", variable: "--font-vedic" });
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
    <html lang="en" className={`${body.variable} ${display.variable} ${vedic.variable}`}>
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
