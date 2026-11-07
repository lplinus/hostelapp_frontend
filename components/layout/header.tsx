"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, User, ChevronDown, HelpCircle, Building2, Zap, Wrench, Home, Hotel, Palmtree, X } from "lucide-react";
import clsx from "clsx";
import { useState, useEffect, useRef } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import Image from "next/image";

// ✅ PREMIUM FONT
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const navLinks = [
  { name: "Hostels", href: "/home", image: "/images/3d-hostel.webp", alt: "Hostels" },
  { name: "Hotels", href: "/hotels", image: "/images/3d-hotel.webp", alt: "Hotels" },
  { name: "Vacation Rentals", href: "/vacanationalrental", image: "/images/3d-vacation.webp", alt: "Vacation Rentals" },
];

const mobileNavLinks = [
  { name: "Home", href: "/home", icon: Home, image: "/images/3d-hostel.webp" },
  { name: "Hotels", href: "/hotels", icon: Hotel, image: "/images/3d-hotel.webp" },
  { name: "Vacation Rentals", href: "/vacanationalrental", icon: Palmtree, image: "/images/3d-vacation.webp" },
  { name: "Trip Boards", href: "/saved", icon: Heart },
];

const mobileFloatingNav = [
  { name: "Hostels", href: "/home", icon: Building2, image: "/images/3d-hostel.webp" },
  { name: "Hotels", href: "/hotels", icon: Hotel, image: "/images/3d-hotel.webp" },
  { name: "Vacation Rentals", href: "/vacanationalrental", icon: Palmtree, image: "/images/3d-vacation.webp" },
];

export default function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { isAuthenticated, isLoggingOut } = useAuth();
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const loginTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const helpTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cancelLoginClose = () => {
    if (loginTimeoutRef.current) {
      clearTimeout(loginTimeoutRef.current);
      loginTimeoutRef.current = null;
    }
  };

  const scheduleLoginClose = () => {
    cancelLoginClose();
    loginTimeoutRef.current = setTimeout(() => {
      setIsLoginOpen(false);
    }, 300);
  };

  const cancelHelpClose = () => {
    if (helpTimeoutRef.current) {
      clearTimeout(helpTimeoutRef.current);
      helpTimeoutRef.current = null;
    }
  };

  const scheduleHelpClose = () => {
    cancelHelpClose();
    helpTimeoutRef.current = setTimeout(() => {
      setIsHelpOpen(false);
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (loginTimeoutRef.current) clearTimeout(loginTimeoutRef.current);
      if (helpTimeoutRef.current) clearTimeout(helpTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      const scrolled = window.scrollY > 25;
      setIsScrolled((prev) => (prev !== scrolled ? scrolled : prev));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
    (pathname.startsWith("/hotel") &&
      !pathname.startsWith("/hotels")) ||
    pathname === "/rooms" ||
    pathname.startsWith("/rooms/") ||
    pathname === "/bookings" ||
    pathname.startsWith("/bookings/") ||
    pathname === "/hotelbooking" ||
    pathname.startsWith("/hotelbooking/") ||
    pathname === "/vacanrentalbooking" ||
    pathname.startsWith("/vacanrentalbooking/") ||
    pathname.startsWith("/vendordashboard") ||
    pathname.startsWith("/usermarketplace") ||
    pathname === "/login" ||
    pathname === "/register";

  if (isDashboardRoute) return null;
  if (isMounted && (isAuthenticated || isLoggingOut)) return null;

  const isHotelListing = pathname === "/hotels" || pathname === "/home/hotels";
  const isVacationRentalListing = pathname === "/vacanationalrental" || pathname === "/home/vacanationalrental";

  const hasHero =
    pathname === "/home" ||
    isHotelListing ||
    isVacationRentalListing;

  const isTransparent = hasHero && !isScrolled;

  return (
    <>
      <header
      className={clsx(
        `w-full sticky top-0 z-50 transition-all duration-500 ease-in-out ${inter.variable} font-sans`,
        hasHero && "-mb-16",
        isTransparent
          ? "bg-white/0 border-b border-transparent shadow-none"
          : "bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between gap-4 relative">

        {/* LEFT: BRAND LOGO */}
        <div className="flex items-center shrink-0 z-10">
          <Link href="/" className="flex items-center gap-2 md:gap-2.5 group shrink-0">
            <div
              className={clsx(
                "relative w-8 h-8 rounded-lg overflow-hidden border group-hover:scale-105 transition-all duration-500 ease-in-out shrink-0 bg-white",
                isTransparent ? "border-white/40 shadow-xs" : "border-slate-200/80"
              )}
            >
              <Image
                src="/images/icon.webp"
                alt="Logo"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <span
              className={clsx(
                "hidden md:block text-[16px] font-semibold tracking-tight transition-colors duration-500 ease-in-out whitespace-nowrap",
                isTransparent
                  ? "text-white hover:text-white drop-shadow-sm"
                  : "text-slate-900 group-hover:text-black"
              )}
            >
              Hostel In
            </span>
          </Link>
        </div>

        {/* MIDDLE: NAVIGATION (Shifted slightly left of center for optical balance and zero overlap) */}
        <nav className="hidden lg:flex items-center gap-2.5 xl:gap-3.5 whitespace-nowrap absolute left-[calc(50%-100px)] xl:left-[calc(50%-80px)] -translate-x-1/2 top-1/2 -translate-y-1/2 z-10">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/home" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={clsx(
                  "group inline-flex items-center gap-2 px-3 xl:px-3.5 py-1.5 text-[13px] xl:text-[14px] tracking-normal rounded-full transition-all duration-200 ease-out whitespace-nowrap active:scale-95 select-none",
                  isTransparent
                    ? isActive
                      ? "text-white font-bold bg-white/20 border border-white/35 backdrop-blur-md shadow-[0_2px_12px_rgba(255,255,255,0.2),inset_0_1px_1px_rgba(255,255,255,0.65)] hover:bg-white/35 hover:border-white/50 hover:shadow-[0_4px_20px_rgba(255,255,255,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]"
                      : "text-white/90 font-medium border border-transparent hover:border-white/40 hover:bg-white/25 hover:text-white hover:backdrop-blur-md hover:shadow-[0_3px_15px_rgba(255,255,255,0.25),inset_0_1px_1px_rgba(255,255,255,0.7)] drop-shadow-sm"
                    : isActive
                      ? "text-slate-950 font-bold bg-slate-100 border border-slate-200/80 shadow-xs hover:bg-slate-200/80"
                      : "text-slate-700 font-medium border border-transparent hover:border-slate-200/80 hover:bg-slate-100 hover:text-black hover:shadow-xs"
                )}
              >
                {link.image && (
                  <div className="relative w-[19px] h-[19px] xl:w-[21px] xl:h-[21px] rounded-[5px] overflow-hidden shrink-0 transition-transform duration-300 group-hover:scale-120 group-hover:-translate-y-0.5 filter drop-shadow-xs">
                    <Image
                      src={link.image}
                      alt={link.alt || link.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* RIGHT - Vrbo Refined Aesthetic (Strictly one line, whitespace-nowrap, never wrapping/cut) */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-2.5 shrink-0 whitespace-nowrap z-10 ml-auto">

          {/* TRIP BOARDS */}
          <Link
            href="/saved"
            className={clsx(
              "hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[13px] font-medium transition-colors duration-500 ease-in-out whitespace-nowrap shrink-0",
              isTransparent
                ? "text-white/90 hover:text-white drop-shadow-sm"
                : "text-slate-800 hover:text-black"
            )}
          >
            <Heart
              className={clsx(
                "w-[17px] h-[17px] shrink-0 transition-colors duration-500 ease-in-out",
                isTransparent ? "text-white" : "text-slate-700"
              )}
              strokeWidth={1.5}
            />
            <span className="hidden xl:inline whitespace-nowrap">Trip Boards</span>
          </Link>

          {/* LOG IN DROPDOWN */}
          {isMounted && !isAuthenticated && !isLoggingOut && (
            <div
              className="relative shrink-0 whitespace-nowrap"
              onMouseEnter={cancelLoginClose}
              onMouseLeave={() => {
                if (isLoginOpen) scheduleLoginClose();
              }}
            >
              <DropdownMenu modal={false} open={isLoginOpen} onOpenChange={setIsLoginOpen}>
                <DropdownMenuTrigger
                  className={clsx(
                    "flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-[13px] font-medium transition-colors duration-500 ease-in-out focus:outline-none cursor-pointer whitespace-nowrap shrink-0",
                    isTransparent
                      ? "text-white/90 hover:text-white drop-shadow-sm"
                      : "text-slate-800 hover:text-black"
                  )}
                >
                  <User
                    className={clsx(
                      "w-[17px] h-[17px] shrink-0 transition-colors duration-500 ease-in-out",
                      isTransparent ? "text-white" : "text-slate-700"
                    )}
                    strokeWidth={1.5}
                  />
                  <span className="whitespace-nowrap">Log in</span>
                  <ChevronDown
                    className={clsx(
                      "w-3.5 h-3.5 transition-transform duration-300 shrink-0",
                      isTransparent ? "text-white/80" : "text-slate-600",
                      isLoginOpen && "rotate-180"
                    )}
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 p-1 bg-white rounded-sm shadow-xl border border-slate-200"

                  onMouseEnter={cancelLoginClose}
                  onMouseLeave={scheduleLoginClose}
                >
                  <DropdownMenuItem
                    asChild
                    className="rounded-sm cursor-pointer focus:bg-[#1E1B4B] focus:text-white data-[highlighted]:bg-[#1E1B4B] data-[highlighted]:text-white hover:bg-[#1E1B4B] hover:text-white data-[highlighted]:[&_svg]:!text-white focus:[&_svg]:!text-white hover:[&_svg]:!text-white transition-colors"
                  >
                    <Link
                      href="/login"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 hover:text-white focus:text-white data-[highlighted]:text-white transition-colors"
                    >
                      <User className="w-4 h-4 text-slate-500 transition-colors" />
                      <span>Guest Login</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-sm cursor-pointer focus:bg-[#1E1B4B] focus:text-white data-[highlighted]:bg-[#1E1B4B] data-[highlighted]:text-white hover:bg-[#1E1B4B] hover:text-white data-[highlighted]:[&_svg]:!text-white focus:[&_svg]:!text-white hover:[&_svg]:!text-white transition-colors"
                  >
                    <Link
                      href="/login"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 hover:text-white focus:text-white data-[highlighted]:text-white transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-slate-500 transition-colors" />
                      <span>Owner Login</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-sm cursor-pointer focus:bg-[#1E1B4B] focus:text-white data-[highlighted]:bg-[#1E1B4B] data-[highlighted]:text-white hover:bg-[#1E1B4B] hover:text-white data-[highlighted]:[&_svg]:!text-white focus:[&_svg]:!text-white hover:[&_svg]:!text-white transition-colors"
                  >
                    <Link
                      href="/login"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 hover:text-white focus:text-white data-[highlighted]:text-white transition-colors"
                    >
                      <Zap className="w-4 h-4 text-slate-500 transition-colors" />
                      <span>Vendor Login</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="rounded-sm cursor-pointer focus:bg-[#1E1B4B] focus:text-white data-[highlighted]:bg-[#1E1B4B] data-[highlighted]:text-white hover:bg-[#1E1B4B] hover:text-white data-[highlighted]:[&_svg]:!text-white focus:[&_svg]:!text-white hover:[&_svg]:!text-white transition-colors"
                  >
                    <Link
                      href="/login"
                      className="flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-slate-800 hover:text-white focus:text-white data-[highlighted]:text-white transition-colors"
                    >
                      <Wrench className="w-4 h-4 text-slate-500 transition-colors" />
                      <span>Service Login</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="my-1 border-slate-100" />
                  <DropdownMenuItem
                    asChild
                    className="rounded-sm cursor-pointer focus:bg-[#1E1B4B] focus:text-white data-[highlighted]:bg-[#1E1B4B] data-[highlighted]:text-white hover:bg-[#1E1B4B] hover:text-white transition-colors"
                  >
                    <Link
                      href="/register"
                      className="flex items-center px-3 py-2 text-sm font-semibold text-slate-950 hover:text-white focus:text-white data-[highlighted]:text-white transition-colors"
                    >
                      Create an account
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          {/* HELP DROPDOWN */}
          <div
            className="relative hidden md:block shrink-0 whitespace-nowrap"
            onMouseEnter={cancelHelpClose}
            onMouseLeave={() => {
              if (isHelpOpen) scheduleHelpClose();
            }}
          >
            <DropdownMenu modal={false} open={isHelpOpen} onOpenChange={setIsHelpOpen}>
              <DropdownMenuTrigger
                className={clsx(
                  "flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-[13px] font-medium transition-colors duration-500 ease-in-out focus:outline-none cursor-pointer whitespace-nowrap shrink-0",
                  isTransparent
                    ? "text-white/90 hover:text-white drop-shadow-sm"
                    : "text-slate-800 hover:text-black"
                )}
              >
                <HelpCircle
                  className={clsx(
                    "w-[17px] h-[17px] shrink-0 transition-colors duration-500 ease-in-out",
                    isTransparent ? "text-white" : "text-slate-700"
                  )}
                  strokeWidth={1.5}
                />
                <span className="whitespace-nowrap">Help</span>
                <ChevronDown
                  className={clsx(
                    "w-3.5 h-3.5 transition-transform duration-300 shrink-0",
                    isTransparent ? "text-white/80" : "text-slate-600",
                    isHelpOpen && "rotate-180"
                  )}
                />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-52 p-1 bg-white rounded-sm shadow-xl border border-slate-200"
                onMouseEnter={cancelHelpClose}
                onMouseLeave={scheduleHelpClose}
              >
                <DropdownMenuItem
                  asChild
                  className="rounded-sm cursor-pointer focus:bg-[#1E1B4B] focus:text-white data-[highlighted]:bg-[#1E1B4B] data-[highlighted]:text-white hover:bg-[#1E1B4B] hover:text-white transition-colors"
                >
                  <Link href="/faqs" className="flex items-center px-3 py-2 text-sm text-slate-800 hover:text-white focus:text-white data-[highlighted]:text-white font-medium transition-colors">
                    Help &amp; FAQs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="rounded-sm cursor-pointer focus:bg-[#1E1B4B] focus:text-white data-[highlighted]:bg-[#1E1B4B] data-[highlighted]:text-white hover:bg-[#1E1B4B] hover:text-white transition-colors"
                >
                  <Link href="/contact-us" className="flex items-center px-3 py-2 text-sm text-slate-800 hover:text-white focus:text-white data-[highlighted]:text-white font-medium transition-colors">
                    Contact Support
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="rounded-sm cursor-pointer focus:bg-[#1E1B4B] focus:text-white data-[highlighted]:bg-[#1E1B4B] data-[highlighted]:text-white hover:bg-[#1E1B4B] hover:text-white transition-colors"
                >
                  <Link href="/Terms&Conditions" className="flex items-center px-3 py-2 text-sm text-slate-800 hover:text-white focus:text-white data-[highlighted]:text-white font-medium transition-colors">
                    Terms &amp; Policies
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* LIST YOUR PROPERTY BUTTON - Translucent on Hero, Solid White on Scroll */}
          {isMounted && !isAuthenticated && !isLoggingOut && (
            <Link
              href="/register"
              className={clsx(
                "px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-[13px] font-medium tracking-normal transition-all duration-500 ease-in-out active:scale-95 inline-flex items-center justify-center whitespace-nowrap shrink-0 ml-0.5 sm:ml-1",
                isTransparent
                  ? "text-white bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md shadow-xs"
                  : "text-slate-900 bg-white border border-slate-700 hover:bg-[#1E1B4B] hover:text-white hover:border-[#1E1B4B] shadow-none hover:shadow-md"
              )}
            >
              <span className="whitespace-nowrap">List your property</span>
            </Link>
          )}

          {/* MOBILE MENU */}
          <div className="lg:hidden shrink-0">
            {!isMounted ? (
              <div className="w-10 h-10" />
            ) : (
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    className={clsx(
                      "p-2 transition-colors duration-500 ease-in-out",
                      isTransparent ? "text-white hover:text-white/80" : "text-slate-800 hover:text-black"
                    )}
                    aria-label="Open mobile navigation"
                  >
                    <Menu className="w-6 h-6" />
                  </button>
                </SheetTrigger>

                <SheetContent
                  side="right"
                  showCloseButton={false}
                  className="w-full sm:max-w-sm h-full h-dvh p-0 bg-white border-l border-slate-200/80 shadow-2xl flex flex-col justify-between overflow-y-auto no-scrollbar"
                >
                  <div className="flex flex-col">
                    {/* Branded Header: Logo + Title + Styled Close Button */}
                    <SheetHeader className="px-5 py-4 border-b border-slate-100 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200/80 shadow-xs shrink-0">
                          <Image
                            src="/images/icon.webp"
                            alt="Hostel In"
                            fill
                            className="object-cover"
                          />
                        </div>
                        <SheetTitle className="font-bold text-lg text-slate-900 tracking-tight flex items-center">
                          Hostel <span className="text-[#312E81] ml-1">In</span>
                        </SheetTitle>
                      </div>

                      <SheetClose className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors cursor-pointer outline-none focus:outline-none focus:ring-0">
                        <X className="w-4 h-4" />
                        <span className="sr-only">Close</span>
                      </SheetClose>
                    </SheetHeader>

                    {/* Navigation Links */}
                    <div className="flex flex-col p-4 gap-1.5">
                      <p className="px-3 mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Explore
                      </p>
                      {mobileNavLinks.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href || (link.href !== "/home" && pathname.startsWith(link.href));
                        return (
                          <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={clsx(
                              "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all",
                              isActive
                                ? "bg-[#312E81]/10 text-[#312E81] font-bold"
                                : "text-slate-700 hover:bg-slate-100 hover:text-slate-950"
                            )}
                          >
                            {link.image ? (
                              <div className="relative w-6 h-6 rounded-md overflow-hidden shrink-0 shadow-2xs">
                                <Image src={link.image} alt={link.name} fill className="object-cover" />
                              </div>
                            ) : (
                              <Icon className={clsx("w-4 h-4 shrink-0", isActive ? "text-[#312E81]" : "text-slate-500")} />
                            )}
                            <span>{link.name}</span>
                          </Link>
                        );
                      })}

                      <div className="h-px bg-slate-100 my-2" />

                      {/* Support */}
                      <p className="px-3 mb-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Support
                      </p>

                      <Link
                        href="/faqs"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Help &amp; FAQs</span>
                      </Link>
                    </div>
                  </div>

                  {/* Bottom Footer Note */}
                  <div className="p-4 border-t border-slate-100 bg-slate-50/60 flex items-center justify-center">
                    <p className="text-[11px] text-center text-slate-400 font-medium">
                      Hostel In • Verified Stay Network
                    </p>
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* MOBILE FLOATING BOTTOM BAR (Native app-style floating category switcher) */}
    {hasHero && (
      <nav
        aria-label="Mobile category switcher"
        className={clsx(
          "fixed bottom-4 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 lg:hidden flex items-center p-1.5 sm:p-2 gap-1 sm:gap-1.5 max-w-[calc(100vw-1rem)]",
          "bg-white/80 backdrop-blur-2xl border border-white/90 shadow-[0_16px_36px_rgba(15,23,42,0.12),0_4px_12px_rgba(15,23,42,0.06),inset_0_1px_2px_rgba(255,255,255,0.95)] rounded-full transition-all duration-300",
          isMobileMenuOpen && "opacity-0 pointer-events-none translate-y-4"
        )}
      >
        {mobileFloatingNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={clsx(
                "flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-full text-[12.5px] sm:text-[13.5px] font-semibold tracking-tight whitespace-nowrap transition-all duration-200 active:scale-95 select-none",
                isActive
                  ? "bg-gradient-to-b from-white via-white to-slate-50/95 text-slate-900 font-bold border border-slate-200/90 shadow-[0_4px_14px_rgba(15,23,42,0.09),0_1px_2px_rgba(15,23,42,0.04),inset_0_1px_2px_rgba(255,255,255,1)]"
                  : "text-slate-600 hover:text-slate-900 font-medium border border-transparent hover:bg-white/50"
              )}
            >
              {item.image ? (
                <div
                  className={clsx(
                    "relative w-5 h-5 sm:w-5.5 sm:h-5.5 rounded-[6px] overflow-hidden shrink-0 transition-transform duration-200 filter drop-shadow-xs",
                    isActive && "scale-105"
                  )}
                >
                  <Image src={item.image} alt={item.name} fill className="object-cover" />
                </div>
              ) : (
                <Icon
                  className={clsx(
                    "w-4 h-4 shrink-0 transition-colors",
                    isActive ? "text-slate-900" : "text-slate-500"
                  )}
                />
              )}
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    )}
  </>
  );
}
