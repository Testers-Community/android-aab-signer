import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StructuredData } from "@/components/structured-data";

// Same pairing as testerscommunity.com: Inter for body, Plus Jakarta Sans for
// headings. Geist Mono stays for code and file names.
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
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
    { media: "(prefers-color-scheme: light)", color: "#054ada" },
    { media: "(prefers-color-scheme: dark)", color: "#054ada" },
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
        className={`${inter.variable} ${jakarta.variable} ${geistMono.variable} antialiased`}
      >
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
