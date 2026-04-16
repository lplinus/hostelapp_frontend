
import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins, Inter } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Header from "@/components/layout/header";
import ConditionalFooter from "@/components/layout/conditional-footer";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";
import Script from "next/script";
import { cookies } from "next/headers";
import Providers from "./providers";
import { Toaster } from "sonner";
import ChatWidget from "@/components/chat/ChatWidget";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://hostelin.online"
  ),
  title: {
    default: "Hostel In | Affordable Student Hostels Across India",
    template: "%s | Hostel In",
  },
  description: "Find verified and affordable student hostels across India's major cities. Compare prices, explore amenities, and book your perfect hostel with Hostel In.",
  keywords: ["student hostels India", "hostel booking", "affordable hostels", "verified hostels"],
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
  icons: {
    icon: "/images/favicon.webp",
    shortcut: "/images/favicon.webp",
    apple: "/images/favicon.webp",
  },
  alternates: {
    canonical: "/",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Server-side auth check: read the HttpOnly cookies set by Django
  const cookieStore = await cookies();
  const hasRefreshToken = !!cookieStore.get("refresh_token")?.value;
  const hasAccessToken = !!cookieStore.get("access_token")?.value;
  const isAuthenticated = hasRefreshToken || hasAccessToken;

  return (
    <html lang="en">
      <head>
        <JsonLd data={generateOrganizationSchema()} />
        <JsonLd data={generateWebsiteSchema()} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} antialiased font-sans`}
      >
        <Providers isAuthenticated={isAuthenticated}>
          <Header />
          {children}
          <ConditionalFooter />
          <ChatWidget />
          <Toaster position="bottom-right" richColors />
        </Providers>

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}

