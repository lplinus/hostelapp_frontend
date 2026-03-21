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

const navLinks = [
  { name: "Home", href: "/home" },
  // { name: "Hostels", href: "/hostels" },
  // { name: "Pricing", href: "/pricing" },
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
    (pathname.startsWith("/hostel") && !pathname.startsWith("/hostels") && !pathname.startsWith("/hostel-type")) ||
    pathname === "/rooms" ||
    pathname.startsWith("/rooms/") ||
    pathname === "/bookings" ||
    pathname.startsWith("/bookings/");

  if (isDashboardRoute) {
    return null;
  }

  if (isMounted && (isAuthenticated || isLoggingOut)) {
    return null;
  }

  return (
    <header className="w-full border-b border-white/20 bg-white/70 backdrop-blur-lg sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between lg:grid lg:grid-cols-3 items-center">
        {/* LEFT - Logo */}
        <div className="flex justify-start">
          <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Image
                src="/images/icon.webp"
                alt="Logo"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <span className="text-xl font-bold text-[#0F172A] tracking-tight">
              Hostel In
            </span>
          </Link>
        </div>

        {/* CENTER - Navigation (Perfectly Centered) */}
        <nav className="hidden lg:flex items-center justify-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "px-4 py-2 rounded-lg text-[15px] font-bold transition-all duration-200",
                  isActive
                    ? "bg-[#0F172A]/5 text-black"
                    : "text-black hover:text-[#8B5CF6] hover:bg-white/50"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT - Actions (Icons + Both Buttons) */}
        <div className="flex items-center justify-end gap-4">
          <div className="hidden sm:flex items-center gap-4 text-black mr-2">
            <Heart className="w-5 h-5 cursor-pointer hover:text-[#8B5CF6] transition-colors" strokeWidth={1.5} />
            <Moon className="w-5 h-5 cursor-pointer hover:text-[#8B5CF6] transition-colors" strokeWidth={1.5} />
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isMounted && !isAuthenticated && !isLoggingOut && (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-xl text-sm font-bold text-black hover:bg-white/50 transition-all duration-200 shadow-sm border border-transparent hover:border-gray-200"
                >
                  Owner Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-black hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md hover:scale-105"
                >
                  Owner Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            {!isMounted ? (
              <div className="w-10 h-10" />
            ) : (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 text-gray-500">
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="flex flex-col gap-4 mt-8 px-4 pb-4">
                    {navLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={clsx(
                          "text-lg font-medium",
                          pathname === link.href ? "text-blue-600" : "text-gray-600"
                        )}
                      >
                        {link.name}
                      </Link>
                    ))}
                    <hr className="my-2" />
                    {isMounted && !isAuthenticated && !isLoggingOut && (
                      <>
                        <Link href="/login" className="text-lg font-medium text-gray-700">Owner Login</Link>
                        <Link href="/register" className="text-lg font-medium text-gray-700">Owner Register</Link>
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