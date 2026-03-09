import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import {
  Cinzel,
  JetBrains_Mono,
  Playfair_Display,
  Space_Grotesk,
} from "next/font/google";
import "./globals.css";
import SessionProvider from "../components/SessionProvider";
import AgeCheckMount from "../components/AgeCheckMount";
import LanguageManager from "../components/LanguageManager";
import Footer from "../components/Footer";

const siteUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
const siteTitle = "Hot Barcelona";
const siteDescription =
  "Premium escort and companion portal for Barcelona with discreet profiles, verified listings, and elegant private experiences.";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | ${siteTitle}`,
  },
  description: siteDescription,
  applicationName: siteTitle,
  keywords: [
    "Barcelona escorts",
    "Barcelona companions",
    "premium escort portal",
    "escort profiles Barcelona",
    "trans escorts Barcelona",
    "VIP companions Barcelona",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: siteTitle,
    title: siteTitle,
    description: siteDescription,
    locale: "es_ES",
    images: [
      {
        url: "/images/added%20logo.png",
        width: 1200,
        height: 1200,
        alt: siteTitle,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/images/added%20logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [{ url: "/images/added%20logo.png", type: "image/png" }],
    shortcut: ["/images/added%20logo.png"],
    apple: [{ url: "/images/added%20logo.png", type: "image/png" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${spaceGrotesk.variable} ${playfairDisplay.variable} ${cinzel.variable} ${jetBrainsMono.variable} antialiased`}
      >
        <Script id="hb-language-init" strategy="beforeInteractive">
          {`
            (function () {
              try {
                var key = "hb_site_language";
                var stored = localStorage.getItem(key);
                var supported = ["es", "en", "de", "fr", "it", "nl", "pt", "zh-CN", "ru", "ja", "da", "sv", "no"];
                var lang = supported.indexOf(stored) >= 0 ? stored : "es";
                if (!stored) {
                  localStorage.setItem(key, lang);
                }
                var value = "/auto/" + lang;
                document.cookie = "googtrans=" + value + ";path=/;max-age=31536000";
                document.cookie = "googtrans=" + value + ";path=/";
              } catch (error) {
                document.cookie = "googtrans=/auto/es;path=/;max-age=31536000";
                document.cookie = "googtrans=/auto/es;path=/";
              }
            })();
          `}
        </Script>
        <SessionProvider>
          {children}
          <Footer />
          <AgeCheckMount />
          <Suspense fallback={null}>
            <LanguageManager />
          </Suspense>
        </SessionProvider>
      </body>
    </html>
  );
}
