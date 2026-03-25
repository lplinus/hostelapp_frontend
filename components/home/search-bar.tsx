"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { MapPin, IndianRupee, Users, Search, ChevronDown } from "lucide-react";
import { slugify, getCitySEOLink } from "@/lib/utils";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";

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

export default function SearchBar() {
  const router = useRouter();

  const [location, setLocation] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [isSticky, setIsSticky] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const sticky = window.scrollY > 200;
          if (sticky !== isSticky) {
            setIsSticky(sticky);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSticky]);

  const handleSearch = useCallback(() => {
    const searchLocation = location.trim();
    if (!searchLocation) return;

    // Word mapping for multi-word search like "hyd hostels" -> "hyderabad hostels"
    const words = searchLocation.split(/\s+/);
    const mapped_words = words.map((w) => {
      const lower = w.toLowerCase();
      return KEYWORD_MAPPINGS[lower] || w;
    });
    const mappedLocation = mapped_words.join(" ");
    const lowerLocation = mappedLocation.toLowerCase();

    // Check if it's purely a major city search to use SEO city pages
    const isOnlyCity = MAJOR_CITIES.includes(lowerLocation);

    if (isOnlyCity && !budget && !gender) {
      const citySlug = slugify(mappedLocation);
      router.push(getCitySEOLink(citySlug));
      return;
    }

    // Default to search results page which handles areas, hostel names, etc.
    const params = new URLSearchParams();
    params.append("location", mappedLocation);
    if (budget) params.append("budget", budget);
    if (gender) params.append("gender", gender);

    router.push(`/search?${params.toString()}`);
  }, [location, budget, gender, router]);

  // Optimized spring for "very very smooth" transition
  const springConfig = { 
    type: "spring", 
    stiffness: 260, 
    damping: 32, 
    mass: 0.5,
    restDelta: 0.001 
  } as const;

  return (
    <>
      <motion.div 
        layout
        transition={springConfig}
        className={clsx(
          "bg-white/95 backdrop-blur-2xl mx-auto border z-[40] font-inter will-change-[transform,width,max-width,padding]",
          isSticky 
            ? "p-2 max-w-4xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border-slate-200 rounded-full" 
            : "p-4 md:p-5 max-w-5xl border-[#0F172A]/10 rounded-[2.5rem] shadow-[0_30px_70px_rgba(15,23,42,0.15)]"
        )}
      >
        <motion.div layout className={clsx(
          "grid items-center",
          isSticky 
            ? "grid-cols-[1fr_auto] md:grid-cols-5 gap-2" 
            : "grid-cols-1 md:grid-cols-4 gap-3"
        )}>
          {/* Location */}
          <motion.div layout className={clsx(
            "relative group", 
            isSticky ? "md:col-span-2" : "col-span-1"
          )}>
            <div className={clsx(
              "absolute left-5 top-1/2 -translate-y-1/2 z-10 transition-colors pointer-events-none",
              "text-gray-400 group-focus-within:text-[#8B5CF6]"
            )}>
              <MapPin size={isSticky ? 18 : 20} />
            </div>
            <input
              type="text"
              placeholder="Search Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={clsx(
                "w-full pl-12 pr-6 rounded-full border border-slate-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] focus:bg-white focus:outline-none text-[#0F172A] font-medium placeholder:text-gray-400 transition-all group-hover:border-[#8B5CF6]/50",
                isSticky ? "py-2.5 text-sm h-[48px]" : "py-4 text-base h-[58px]"
              )}
            />
          </motion.div>

          {/* Budget */}
          <motion.div layout className={clsx(
            "relative group",
            isSticky ? "hidden md:block" : "block"
          )}>
            <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors pointer-events-none">
              <IndianRupee size={isSticky ? 16 : 18} />
            </div>
            <select
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className={clsx(
                "hidden md:block w-full pl-12 pr-10 rounded-full border border-slate-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] focus:bg-white focus:outline-none text-[#0F172A] font-medium appearance-none transition-all group-hover:border-[#8B5CF6]/50 cursor-pointer",
                isSticky ? "py-2.5 text-sm h-[48px]" : "py-4 text-base h-[58px]"
              )}
            >
              <option value="">Budget</option>
              {budgetOptions.slice(1).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="hidden md:block absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#8B5CF6]">
              <ChevronDown size={isSticky ? 16 : 18} />
            </div>
            <MobileSelect
              options={budgetOptions}
              value={budget}
              onChange={setBudget}
              placeholder="Budget"
            />
          </motion.div>

          {/* Gender */}
          <motion.div layout className={clsx(
            "relative group",
            isSticky ? "hidden md:block" : "block"
          )}>
            <div className="absolute left-5 top-1/2 -translate-y-1/2 z-10 text-gray-400 group-focus-within:text-[#8B5CF6] transition-colors pointer-events-none">
              <Users size={isSticky ? 16 : 18} />
            </div>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className={clsx(
                "hidden md:block w-full pl-12 pr-10 rounded-full border border-slate-300 bg-white focus:ring-2 focus:ring-[#8B5CF6] focus:bg-white focus:outline-none text-[#0F172A] font-medium appearance-none transition-all group-hover:border-[#8B5CF6]/50 cursor-pointer",
                isSticky ? "py-2.5 text-sm h-[48px]" : "py-4 text-base h-[58px]"
              )}
            >
              <option value="">Gender</option>
              {genderOptions.slice(1).map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <div className="hidden md:block absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-focus-within:text-[#8B5CF6]">
              <ChevronDown size={isSticky ? 16 : 18} />
            </div>
            <MobileSelect
              options={genderOptions}
              value={gender}
              onChange={setGender}
              placeholder="Gender"
            />
          </motion.div>

          {/* Search Button */}
          <motion.div layout className="flex">
            <button
              onClick={handleSearch}
              className={clsx(
                "w-full flex items-center justify-center gap-3 bg-[#0F172A] hover:bg-[#1E293B] text-white font-bold rounded-full transition-all shadow-xl shadow-[#0F172A]/20 active:scale-95 group/btn",
                isSticky ? "h-[48px] px-4 md:px-6" : "h-[58px] px-8"
              )}
            >
              <Search className={clsx("transition-transform group-hover/btn:scale-110", isSticky ? "w-4 h-4" : "w-5 h-5")} />
              <motion.span layout className={clsx(isSticky ? "hidden md:inline" : "inline", isSticky ? "text-sm" : "text-lg")}>
                Search
              </motion.span>
            </button>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}