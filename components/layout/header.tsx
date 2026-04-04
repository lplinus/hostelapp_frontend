"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Moon, Menu } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

// ✅ PREMIUM FONT
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const navLinks = [
  { name: "Home", href: "/home" },
  { name: "Blog", href: "/blog" },
  { name: "Faqs", href: "/faqs" },
  { name: "About", href: "/about-us" },
  { name: "Contact", href: "/contact-us" },
];

export default function Header() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthenticated, isLoggingOut } = useAuth();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isDashboardRoute =
    pathname === "/" ||
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    (pathname.startsWith("/hostel") &&
      !pathname.startsWith("/hostels") &&
      !pathname.startsWith("/hostel-type")) ||
    pathname === "/rooms" ||
    pathname.startsWith("/rooms/") ||
    pathname === "/bookings" ||
    pathname.startsWith("/bookings/") ||
    pathname.startsWith("/vendordashboard") ||
    pathname.startsWith("/usermarketplace");

  if (isDashboardRoute) return null;
  if (isMounted && (isAuthenticated || isLoggingOut)) return null;

  return (
    <header
      className={`w-full border-b border-white/20 bg-white/70 backdrop-blur-lg sticky top-0 z-50 transition-all duration-300 ${inter.variable} font-sans`}
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between lg:grid lg:grid-cols-3 items-center">
        
        {/* LOGO */}
        <div className="flex justify-start">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-md group-hover:scale-105 transition">
              <Image
                src="/images/icon.webp"
                alt="Logo"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <span className="text-[18px] font-semibold tracking-tight text-slate-900">
              Hostel In
            </span>
          </Link>
        </div>

        {/* NAVIGATION */}
        <nav className="hidden lg:flex items-center justify-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "px-4 py-2 rounded-lg text-[14px] font-medium tracking-tight transition-all duration-200",
                  isActive
                    ? "text-black bg-blue-100"
                    : "text-slate-600 hover:text-black hover:bg-blue-100 hover:shadow-md hover:shadow-blue-200/50"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT */}
        <div className="flex items-center justify-end gap-4">

          {/* ICONS */}
          <div className="hidden sm:flex items-center gap-4 text-slate-500 mr-2">
            <Heart className="w-5 h-5 cursor-pointer hover:text-black transition" strokeWidth={1.5} />
            <Moon className="w-5 h-5 cursor-pointer hover:text-black transition" strokeWidth={1.5} />
          </div>

          {/* BUTTONS */}
          <div className="hidden md:flex items-center gap-3">
            {isMounted && !isAuthenticated && !isLoggingOut && (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-xl text-sm font-medium tracking-tight text-slate-700 hover:bg-blue-100 hover:shadow-md hover:shadow-blue-200/50 transition-all duration-200"
                >
                  Owner Login
                </Link>

                <Link
                  href="/register"
                  className="px-5 py-2 rounded-xl text-sm font-semibold tracking-tight text-black bg-white border border-slate-200 hover:bg-blue-100 transition-all duration-200 shadow-sm hover:shadow-md hover:shadow-blue-200/50"
                >
                  Owner Register
                </Link>
              </>
            )}
          </div>

          {/* MOBILE MENU */}
          <div className="lg:hidden">
            {!isMounted ? (
              <div className="w-10 h-10" />
            ) : (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 text-slate-500">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>

                <SheetContent side="right" className="bg-white/90 backdrop-blur-xl">
                  <SheetHeader>
                    <SheetTitle className="font-semibold tracking-tight">
                      Menu
                    </SheetTitle>
                  </SheetHeader>

                  <div className="flex flex-col gap-4 mt-8 px-4 pb-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={clsx(
                          "text-[15px] font-medium tracking-tight",
                          pathname === link.href
                            ? "text-black"
                            : "text-slate-600"
                        )}
                      >
                        {link.name}
                      </Link>
                    ))}

                    <hr className="my-2" />

                    {isMounted && !isAuthenticated && !isLoggingOut && (
                      <>
                        <Link href="/login" className="text-[15px] font-medium text-slate-700">
                          Owner Login
                        </Link>
                        <Link href="/register" className="text-[15px] font-medium text-slate-700">
                          Owner Register
                        </Link>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

