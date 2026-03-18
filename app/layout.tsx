
import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import Header from "@/components/layout/header";
import ConditionalFooter from "@/components/layout/conditional-footer";
import { generateOrganizationSchema, generateWebsiteSchema } from "@/lib/seo/schema";
import JsonLd from "@/components/seo/JsonLd";
import Script from "next/script";
import { cookies } from "next/headers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
  title: "StayNest | Hostel Booking Platform",
  description: "Find verified hostels across India with StayNest.",
};

import Providers from "./providers";
import { Toaster } from "sonner";

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
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
      >
        <Providers isAuthenticated={isAuthenticated}>
          <Header />
          {children}
          <ConditionalFooter />
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

