
import type { Metadata, Viewport } from "next";
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
import DashboardThemeWatcher from "@/components/theme/DashboardThemeWatcher";


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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://hostelin.online"
  ),
  title: {
    default: "StayNest | Best Hotels & Vacation Rentals Across India",
    template: "%s | StayNest",
  },
  description: "Find verified and luxury hotels, resorts, and vacation rentals across India's premier destinations with StayNest.",
  keywords: ["hotels India", "vacation rentals", "resorts booking", "verified villas"],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <JsonLd data={generateOrganizationSchema()} />
        <JsonLd data={generateWebsiteSchema()} />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const p = window.location.pathname;
                const isDash = p === '/dashboard' || p.startsWith('/dashboard/') || p === '/settings' || p.startsWith('/settings/') || p === '/rooms' || p.startsWith('/rooms/') || p === '/bookings' || p.startsWith('/bookings/') || p === '/hotel' || p.startsWith('/hotel/') || p === '/hostel' || p.startsWith('/hostel/') || p.startsWith('/vacanrentalbooking') || p.startsWith('/subscription') || p.startsWith('/notification') || p.startsWith('/vendordashboard') || p.startsWith('/usermarketplace') || p === '/home/guestprofile' || p.startsWith('/home/guestprofile');
                if (isDash) {
                  const key = p.startsWith('/home/guestprofile') ? 'guest-theme-preference' : 'owner-theme-preference';
                  const saved = localStorage.getItem(key) || 'system';
                  const isDark = saved === 'dark' || (saved === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) document.documentElement.classList.add('dark');
                  else document.documentElement.classList.remove('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} ${inter.variable} antialiased font-sans`}
      >
        <Providers isAuthenticated={isAuthenticated}>
          <DashboardThemeWatcher />
          <Header />
          {children}
          <ConditionalFooter />
          <ChatWidget />
          <Toaster position="bottom-right" richColors closeButton duration={4000} />
        </Providers>

        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}

