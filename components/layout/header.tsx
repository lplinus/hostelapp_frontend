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

const navLinks = [
  { name: "Home", href: "/" },
  // { name: "Hostels", href: "/hostels" },
  { name: "Pricing", href: "/pricing" },
  { name: "Blog", href: "/blog" },
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
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/hostel" ||
    pathname.startsWith("/hostel/") ||
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
    <header className="w-full border-b border-gray-100 bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between lg:grid lg:grid-cols-3 items-center">

        {/* LEFT - Logo */}
        <div className="flex justify-start">
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white font-bold text-lg">
              S
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              StayNest
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
                  "px-4 py-2 rounded-lg text-[15px] font-medium transition-all",
                  isActive
                    ? "bg-[#EFF6FF] text-[#2563EB]"
                    : "text-gray-500 hover:text-gray-900"
                )}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* RIGHT - Actions (Icons + Both Buttons) */}
        <div className="flex items-center justify-end gap-4">
          <div className="hidden sm:flex items-center gap-4 text-gray-400 mr-2">
            <Heart className="w-5 h-5 cursor-pointer hover:text-gray-600 transition" strokeWidth={1.5} />
            <Moon className="w-5 h-5 cursor-pointer hover:text-gray-600 transition" strokeWidth={1.5} />
          </div>

          <div className="hidden md:flex items-center gap-3">
            {isMounted && !isAuthenticated && !isLoggingOut && (
              <>
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
                >
                  Owner Login
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition shadow-sm"
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