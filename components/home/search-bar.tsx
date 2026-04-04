"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { MapPin, IndianRupee, Users, Search, ChevronDown, Heart, Moon } from "lucide-react";
import { slugify, getCitySEOLink } from "@/lib/utils";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

interface DropdownOption {
  value: string;
  label: string;
}

/* Custom dropdown used ONLY on mobile to avoid native <select> overflow */
function MobileSelect({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selectedLabel =
    options.find((o) => o.value === value)?.label || placeholder;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative w-full md:hidden">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full px-6 py-4 rounded-full border border-gray-200 focus:ring-2 focus:ring-[#8B5CF6] focus:outline-none text-[#0F172A] text-base bg-white text-left flex items-center justify-between gap-2 shadow-sm transition-all"
      >
        <span className={value ? "text-[#0F172A] font-medium" : "text-gray-400"}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 right-0 top-full mt-2 bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 max-h-60 overflow-auto scrollbar-hide py-2"
          >
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    onChange(opt.value);
                    setOpen(false);
                  }
                }}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`px-6 py-3 cursor-pointer text-[15px] hover:bg-[#F8FAFC] transition-colors ${value === opt.value
                  ? "bg-[#8B5CF6]/5 text-[#8B5CF6] font-bold"
                  : "text-[#64748B]"
                  }`}
              >
                {opt.label}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

const budgetOptions: DropdownOption[] = [
  { value: "", label: "Select Budget" },
  { value: "5000", label: "Below ₹5,000" },
  { value: "10000", label: "Below ₹10,000" },
  { value: "15000", label: "Below ₹15,000" },
  { value: "20000", label: "Below ₹20,000" },
  { value: "25000", label: "Below ₹25,000" },
];

const genderOptions: DropdownOption[] = [
  { value: "", label: "Select Gender" },
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "unisex", label: "Unisex" },
];

const KEYWORD_MAPPINGS: Record<string, string> = {
  hyd: "hyderabad",
  ben: "bengaluru",
  bang: "bengaluru",
  mum: "mumbai",
  che: "chennai",
  kol: "kolkata",
  viz: "visakhapatnam",
  del: "delhi",
  pun: "pune",
  gur: "gurugram",
  gurgaon: "gurugram",
  vzg: "visakhapatnam",
  kphb: "KPHB Colony",
  hsr: "HSR Layout",
  btm: "BTM Layout",
  srnagar: "SR Nagar",
  ecil: "ECIL",
};

const MAJOR_CITIES = [
  "hyderabad",
  "bengaluru",
  "mumbai",
  "chennai",
  "kolkata",
  "visakhapatnam",
  "delhi",
  "pune",
  "gurugram",
  "noida",
  "ahmedabad",
];

export default function SearchBar({ variant }: { variant?: "default" | "header" }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, isLoggingOut } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  const [location, setLocation] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const isHeaderMode = variant === "header";
  const [isStickyState, setIsSticky] = useState(false);

  // If variant is header, it's always "sticky" (compact)
  const isSticky = isHeaderMode || isStickyState;

  useEffect(() => {
    setIsMounted(true);
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sticky = window.scrollY > 50;
          if (sticky !== isStickyState) {
            setIsSticky(sticky);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isStickyState]);

  const handleSearch = useCallback(() => {
    const searchLocation = location.trim();
    if (!searchLocation) return;

    const words = searchLocation.split(/\s+/);
    const mapped_words = words.map((w) => {
      const lower = w.toLowerCase();
      return KEYWORD_MAPPINGS[lower] || w;
    });
    const mappedLocation = mapped_words.join(" ");
    const lowerLocation = mappedLocation.toLowerCase();

    const isOnlyCity = MAJOR_CITIES.includes(lowerLocation);

    if (isOnlyCity && !budget && !gender) {
      const citySlug = slugify(mappedLocation);
      router.push(getCitySEOLink(citySlug));
      return;
    }

    const params = new URLSearchParams();
    params.append("location", mappedLocation);
    if (budget) params.append("budget", budget);
    if (gender) params.append("gender", gender);

    router.push(`/search?${params.toString()}`);
  }, [location, budget, gender, router]);

  const springConfig = {
    type: "spring",
    stiffness: 100,
    damping: 24,
    mass: 1.2,
    restDelta: 0.001
  } as const;

  return (
    <div className={clsx(
      isHeaderMode ? "w-full" : "w-full transition-all duration-700 ease-in-out",
      !isHeaderMode && (isSticky ? "fixed top-0 left-0 right-0 z-[60]" : "relative px-4 sm:px-6")
    )}>
      <motion.div
        layout
        transition={springConfig}
        className={clsx(
          "font-inter will-change-[transform,max-width,padding]",
          isHeaderMode
            ? "bg-transparent border-none p-0 w-full"
            : clsx(
              "bg-white/95 backdrop-blur-2xl mx-auto border",
              isSticky
                ? "w-full max-w-none shadow-sm border-b border-slate-200 rounded-none h-20 flex items-center"
                : "p-4 md:p-5 max-w-5xl border-[#0F172A]/10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(15,23,42,0.15)]"
            )
        )}
      >
        <div className={clsx(
          "mx-auto w-full flex items-center transition-all duration-500",
          (isSticky || isHeaderMode) ? "max-w-7xl px-0 justify-between gap-4 sm:gap-8" : "max-w-none grid grid-cols-1 md:grid-cols-4 gap-3"
        )}>
          {/* Logo (Sticky Only & Not in header variant) */}
          {(isSticky && !isHeaderMode) && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex items-center gap-3 shrink-0"
            >
              <Link href="/" className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-lg overflow-hidden shadow-sm">
                  <Image src="/images/icon.webp" alt="Logo" fill className="object-contain p-0.5" />
                </div>
                <span className="text-[16px] font-bold tracking-tight text-slate-900">Hostel In</span>
              </Link>
            </motion.div>
          )}

          <motion.div layout className={clsx(
            "transition-all duration-200 ease-in-out",
            (isSticky || isHeaderMode)
              ? "w-full flex items-center justify-between rounded-full bg-white border border-slate-200 shadow-sm hover:shadow-md hover:bg-slate-50 px-4 py-1.5 md:px-5 md:py-2 gap-0"
              : "w-full grid grid-cols-1 md:grid-cols-4 gap-3 items-center"
          )}>
            {/* Location */}
            <motion.div layout className={clsx("relative group", (isSticky || isHeaderMode) ? "flex-1 min-w-[130px]" : "col-span-1")}>
              <div className={clsx(
                "absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-10 transition-colors pointer-events-none",
                "text-gray-400 group-focus-within:text-[#8B5CF6]"
              )}>
                <MapPin size={(isSticky || isHeaderMode) ? 16 : 20} />
              </div>
              <input
                type="text"
                placeholder="Location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={clsx(
                  "w-full pl-8 md:pl-10 pr-2 focus:outline-none text-[#0F172A] font-medium placeholder:text-gray-400 transition-all",
                  (isSticky || isHeaderMode) ? "h-10 text-sm bg-transparent rounded-full focus:bg-transparent focus:ring-0" : "h-[58px] text-base rounded-full border border-slate-300 bg-white focus:ring-2 focus:ring-[#8B5CF6]"
                )}
              />
            </motion.div>

            {/* Budget */}
            <motion.div layout className={clsx("relative group", (isSticky || isHeaderMode) ? "hidden md:flex flex-1 min-w-[130px] relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:border-l before:border-slate-200" : "block")}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors pointer-events-none">
                <IndianRupee size={(isSticky || isHeaderMode) ? 14 : 18} />
              </div>
              <select
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className={clsx(
                  "hidden md:block w-full pl-10 pr-8 focus:outline-none text-[#0F172A] font-medium appearance-none transition-all cursor-pointer",
                  (isSticky || isHeaderMode) ? "h-10 text-sm bg-transparent focus:ring-0 rounded-full" : "h-[58px] text-base rounded-full border border-slate-300 bg-white focus:ring-2 focus:ring-[#8B5CF6]"
                )}
              >
                <option value="">Budget</option>
                {budgetOptions.slice(1).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className={clsx("hidden md:block absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400", (isSticky || isHeaderMode) && "right-3")}>
                <ChevronDown size={(isSticky || isHeaderMode) ? 14 : 18} />
              </div>
              <MobileSelect options={budgetOptions} value={budget} onChange={setBudget} placeholder="Budget" />
            </motion.div>

            {/* Gender */}
            <motion.div layout className={clsx("relative group", (isSticky || isHeaderMode) ? "hidden md:flex flex-1 min-w-[130px] relative before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-6 before:border-l before:border-slate-200" : "block")}>
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors pointer-events-none">
                <Users size={(isSticky || isHeaderMode) ? 14 : 18} />
              </div>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className={clsx(
                  "hidden md:block w-full pl-10 pr-8 focus:outline-none text-[#0F172A] font-medium appearance-none transition-all cursor-pointer",
                  (isSticky || isHeaderMode) ? "h-10 text-sm bg-transparent focus:ring-0 rounded-full" : "h-[58px] text-base rounded-full border border-slate-300 bg-white focus:ring-2 focus:ring-[#8B5CF6]"
                )}
              >
                <option value="">Gender</option>
                {genderOptions.slice(1).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <div className={clsx("hidden md:block absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400", (isSticky || isHeaderMode) && "right-3")}>
                <ChevronDown size={(isSticky || isHeaderMode) ? 14 : 18} />
              </div>
              <MobileSelect options={genderOptions} value={gender} onChange={setGender} placeholder="Gender" />
            </motion.div>

            {/* Search Button */}
            <motion.div layout className={clsx("flex", (isSticky || isHeaderMode) && "ml-2 shrink-0")}>
              <button
                onClick={handleSearch}
                className={clsx(
                  "flex items-center justify-center gap-2 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-full transition-all active:scale-95 group/btn",
                  (isSticky || isHeaderMode) ? "w-9 h-9 md:w-10 md:h-10" : "w-full h-[58px] px-8"
                )}
              >
                <Search className={clsx("transition-transform group-hover/btn:scale-110", (isSticky || isHeaderMode) ? "w-4 h-4 shrink-0" : "w-5 h-5")} />
                <motion.span layout className={clsx((isSticky || isHeaderMode) ? "hidden" : "inline", "text-lg")}>
                  Search
                </motion.span>
              </button>
            </motion.div>
          </motion.div>

          {/* Right Icons (Sticky Only & Not in header variant) */}
          {(isSticky && !isHeaderMode) && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden lg:flex items-center gap-4 shrink-0"
            >
              <div className="flex items-center gap-4 text-slate-500 mr-2">
                <Heart className="w-5 h-5 cursor-pointer hover:text-black transition" strokeWidth={1.5} />
                <Moon className="w-5 h-5 cursor-pointer hover:text-black transition" strokeWidth={1.5} />
              </div>
              {isMounted && !isAuthenticated && !isLoggingOut && (
                <Link
                  href="/login"
                  className="px-5 py-2 rounded-xl text-sm font-bold tracking-tight text-black hover:bg-blue-100 transition-all duration-200"
                >
                  Login
                </Link>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}