import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/structured-data";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteConfig = {
  name: "AAB Signer",
  title: "Sign AAB Online Free - Android App Bundle Signer | No Android Studio Required",
  description: "Free online AAB signer for Android developers. Sign your Android App Bundle for Google Play in seconds. Open source, secure, powered by GitHub Actions. No installation required.",
  url: "https://aab.testerscommunity.com",
  ogImage: "https://aab.testerscommunity.com/og-image.png",
  author: "Testers Community",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#09090b" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    // Primary keywords (high intent)
    "sign aab online",
    "android aab signer",
    "sign android app bundle",
    "jarsigner online",
    "free aab signing tool",
    // Secondary keywords
    "google play aab signing",
    "sign unsigned aab",
    "android keystore signing",
    "app bundle signing tool",
    "open source aab signer",
    // Long-tail keywords
    "sign aab without android studio",
    "sign aab file for google play",
    "free android app signing tool",
    "online jarsigner for aab",
    // Technical keywords
    "android app bundle",
    "aab",
    "keystore",
    "google play",
  ],
  authors: [{ name: siteConfig.author, url: "https://testerscommunity.com" }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteConfig.url,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "AAB Signer - Sign Android App Bundles Online Free",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
    images: [siteConfig.ogImage],
    creator: "@TestersCommunty",
    site: "@TestersCommunty",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  category: "developer tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
