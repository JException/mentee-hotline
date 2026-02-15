import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 1. VIEWPORT SETTINGS (iOS & Mobile Behavior)
export const viewport: Viewport = {
  themeColor: "#004d4d", // Updated to deep teal from the new logo
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming (Native app feel)
  // 'viewportFit' covers the notch area on iPhones
  viewportFit: "cover",
};

// 2. METADATA & IOS CONFIGURATION
export const metadata: Metadata = {
  title: "HUDDLE", // Updated title
  description: "Instant Academic Support",
  manifest: "/manifest.json", // Link to your PWA manifest

  // iOS Specific Settings (The "Magic" for iPhones)
  appleWebApp: {
    capable: true, // Enables standalone mode (removes browser bars)
    title: "Huddle", // Updated App Title
    statusBarStyle: "black-translucent", // Merges status bar with app bg
  },

  // App Icons
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.png", // ⚠️ You must add a 180x180 PNG in /public for this to work
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        // Added 'pt-[env(safe-area-inset-top)]' to prevent content hiding behind the notch
        className={`${geistSans.variable} ${geistMono.variable} antialiased pt-[env(safe-area-inset-top)] bg-[#004d4d] text-white`}
        suppressHydrationWarning={true}
        style={{
          // Define global CSS variables for the new theme
          "--background": "#004d4d",
          "--foreground": "#ffffff",
          "--primary": "#4fd1c5", // Light teal accent
          "--primary-foreground": "#004d4d",
          "--muted": "#006666", // Slightly lighter teal for muted elements
          "--muted-foreground": "#a0e7e5",
          "--accent": "#4fd1c5",
          "--accent-foreground": "#004d4d",
          "--border": "#006666",
        } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}