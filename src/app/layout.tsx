import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import "./globals.css";
import SessionProvider from "../components/SessionProvider";
import AgeCheckMount from "../components/AgeCheckMount";
import LanguageBootstrap from "../components/LanguageBootstrap";
import LanguageManagerMount from "../components/LanguageManagerMount";
import FooterMount from "../components/FooterMount";

function resolveSiteUrl() {
  const raw = (process.env.NEXTAUTH_URL ?? "").trim();
  if (!raw) return "http://localhost:3000";

  const normalized = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    return new URL(normalized).toString().replace(/\/$/, "");
  } catch {
    return "http://localhost:3000";
  }
}

const siteUrl = resolveSiteUrl();
const siteTitle = "Hot Barcelona";
const siteDescription =
  "Premium escort and companion portal for Barcelona with discreet profiles, verified listings, and elegant private experiences.";

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
    locale: "en_US",
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0d",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="antialiased">
        <SessionProvider>
          {children}
          <FooterMount />
          <AgeCheckMount />
          <LanguageBootstrap />
          <Suspense fallback={null}>
            <LanguageManagerMount />
          </Suspense>
        </SessionProvider>
      </body>
    </html>
  );
}
