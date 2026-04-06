"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, IndianRupee, Users, Search, ChevronDown } from "lucide-react";
import { slugify, getCitySEOLink } from "@/lib/utils";
import { getCities, getAreas } from "@/services/location.service";

// --- Configuration & Constants ---
const budgetOptions = [
  { value: "", label: "Any Budget" },
  { value: "5000", label: "Below ₹5,000" },
  { value: "10000", label: "Below ₹10,000" },
  { value: "15000", label: "Below ₹15,000" },
  { value: "20000", label: "Below ₹20,000" },
  { value: "25000", label: "Below ₹25,000" },
];

const genderOptions = [
  { value: "", label: "Any Gender" },
  { value: "male", label: "Male Only" },
  { value: "female", label: "Female Only" },
  { value: "unisex", label: "Unisex / All" },
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
  "hyderabad", "bengaluru", "mumbai", "chennai", "kolkata", "visakhapatnam",
  "delhi", "pune", "gurugram", "noida", "ahmedabad",
];

interface HeroProps {
  title?: string;
  subtitle?: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [gender, setGender] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const budgetRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (budgetRef.current && !budgetRef.current.contains(event.target as Node) &&
        genderRef.current && !genderRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [placeholder, setPlaceholder] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIndex, setCharIndex] = useState(0);

  const [dynamicWords, setDynamicWords] = useState([
    "Hyderabad", "Bengaluru", "Mumbai", "Chennai", "Delhi", "Pune",
    "KPHB Colony", "Gachibowli", "Hitech City", "SR Nagar", "Banjaara Hills"
  ]);

  // Fetch dynamic location data from backend
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [citiesData, areasData] = await Promise.all([
          getCities(),
          getAreas()
        ]);

        const cityNames = citiesData.map(c => c.name);
        
        // Find Hyderabad city by name
        const hydCity = citiesData.find(c => c.name.toLowerCase() === "hyderabad");
        
        // Filter areas to include only those in Hyderabad
        const hydAreaNames = hydCity 
          ? areasData.filter(a => a.city === hydCity.id).map(a => a.name)
          : [];

        // Combine all city names with Hyderabad-specific area names
        const combined = [...new Set([...cityNames, ...hydAreaNames])];

        if (combined.length > 0) {
          setDynamicWords(combined);
        }
      } catch (error) {
        console.error("Failed to fetch locations for dynamic search:", error);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (dynamicWords.length === 0) return;

    const currentFullWord = dynamicWords[placeholderIndex % dynamicWords.length];
    const typeSpeed = isDeleting ? 40 : 60; // Faster speeds
    const nextWordDelay = 500; // Shorter pause at the end

    const timer = setTimeout(() => {
      if (isDeleting) {
        // Deleting
        setPlaceholder(currentFullWord.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);

        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % dynamicWords.length);
          setCharIndex(0);
        }
      } else {
        // Typing
        setPlaceholder(currentFullWord.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);

        if (charIndex + 1 === currentFullWord.length) {
          // Finished typing, wait before deleting
          setTimeout(() => setIsDeleting(true), nextWordDelay);
        }
      }
    }, typeSpeed);

    return () => clearTimeout(timer);
  }, [charIndex, isDeleting, placeholderIndex, dynamicWords]);

  const handleSearch = useCallback(() => {
    const searchLocation = location.trim();
    if (!searchLocation) return;

    const words_in_loc = searchLocation.split(/\s+/);
    const mapped_words = words_in_loc.map((w) => {
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

  return (
    <section className="relative min-h-[80vh] md:min-h-[85vh] flex items-center justify-start bg-[#0F172A] z-[5]">

      {/* 1. BACKGROUND */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/hero1.webp"
          alt="Modern hostel interior"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-100"
        />
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* 2. CONTENT */}
      <div className="relative z-10 container mx-auto px-6 pt-16 pb-24 md:pt-20 md:pb-40 lg:px-24 overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl text-left"
        >
          {/* TOP TAG */}
          <div className="inline-flex items-center px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full mb-6 md:mb-8 border border-white/5">
            <span className="text-[10px] md:text-[12px] font-bold tracking-wider uppercase text-white/90">
              Elevated Group Stay
            </span>
          </div>

          {/* HEADLINE */}
          <h1 className="font-sans text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Find Your Perfect <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-100 to-blue-200">
              Hostel Stay
            </span>
          </h1>

          {/* SUBTEXT */}
          <p className="font-sans text-base md:text-xl text-gray-300 max-w-xl font-medium leading-relaxed mb-10 md:mb-14">
            {subtitle || "Affordable. Comfortable. Verified. Book premium hostels across India in seconds."}
          </p>

          {/* 4. SEARCH BAR (RESPONSIVE EXAPNDABLE) */}
          <div className="w-full max-w-4xl">
            <div className={`bg-white/95 backdrop-blur-md shadow-[0_25px_60px_rgba(0,0,0,0.4)] border border-white/20 transition-all duration-300 ${isExpanded ? "rounded-3xl p-6 md:p-4" : "rounded-full p-1.5"
              }`}>

              {/* COMPACT TRIGGER (Mobile) */}
              {!isExpanded && (
                <div
                  onClick={() => setIsExpanded(true)}
                  className="flex md:hidden items-center justify-between w-full px-5 py-3 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-[#1E3A8A]">
                      <Search size={18} strokeWidth={3} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-gray-900 font-bold text-sm">Where to?</span>
                      <span className="text-gray-400 text-xs font-semibold">Location • Budget • Gender</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FULL SEARCH FIELDS */}
              <div className={`${isExpanded ? "flex" : "hidden md:flex"} flex-col md:flex-row items-center gap-2 h-full`}>

                {/* 📍 Location */}
                <div className="w-full md:flex-[1.8] relative flex items-center px-6 gap-3 group border-b md:border-b-0 md:border-r border-gray-100 pb-3 md:pb-0 h-full">
                  <MapPin className="text-gray-400 group-focus-within:text-indigo-600 transition-colors shrink-0" size={18} />
                  <div className="flex flex-col w-full">
                    <span className="hidden md:block text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Search</span>
                    <input
                      type="text"
                      placeholder={`Search ${placeholder}`}
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      onFocus={() => setOpenDropdown(null)}
                      className="w-full py-2 md:py-0 text-gray-800 text-[16px] font-bold placeholder:text-gray-400 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                {/* 💰 Budget (Custom Dropdown) */}
                <div
                  ref={budgetRef}
                  className="w-full md:flex-1 relative flex items-center px-6 gap-3 group border-b md:border-b-0 md:border-r border-gray-100 py-3 md:py-0 cursor-pointer h-full"
                  onClick={() => setOpenDropdown(openDropdown === "budget" ? null : "budget")}
                >
                  <IndianRupee className="text-gray-400 group-hover:text-indigo-600 shrink-0" size={16} />
                  <div className="flex flex-col w-full overflow-hidden">
                    <span className="hidden md:block text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Budget</span>
                    <span className="text-gray-800 text-[16px] font-bold truncate">
                      {budget ? budgetOptions.find(o => o.value === budget)?.label : "Any Budget"}
                    </span>
                  </div>
                  <ChevronDown className={`ml-auto text-gray-400 transition-transform duration-300 ${openDropdown === "budget" ? "rotate-180" : ""}`} size={14} />

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {openDropdown === "budget" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-[105%] left-0 w-full min-w-[220px] bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-gray-100 p-2 z-[60]"
                      >
                        {budgetOptions.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={(e) => { e.stopPropagation(); setBudget(opt.value); setOpenDropdown(null); }}
                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${budget === opt.value ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 👥 Gender (Custom Dropdown) */}
                <div
                  ref={genderRef}
                  className="w-full md:flex-1 relative flex items-center px-6 gap-3 group py-3 md:py-0 cursor-pointer h-full"
                  onClick={() => setOpenDropdown(openDropdown === "gender" ? null : "gender")}
                >
                  <Users className="text-gray-400 group-hover:text-indigo-600 shrink-0" size={16} />
                  <div className="flex flex-col w-full overflow-hidden">
                    <span className="hidden md:block text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-0.5">Gender</span>
                    <span className="text-gray-800 text-[16px] font-bold truncate">
                      {gender ? genderOptions.find(o => o.value === gender)?.label : "Any"}
                    </span>
                  </div>
                  <ChevronDown className={`ml-auto text-gray-400 transition-transform duration-300 ${openDropdown === "gender" ? "rotate-180" : ""}`} size={14} />

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {openDropdown === "gender" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-[105%] left-0 w-full min-w-[200px] bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.2)] border border-gray-100 p-2 z-[60]"
                      >
                        {genderOptions.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={(e) => { e.stopPropagation(); setGender(opt.value); setOpenDropdown(null); }}
                            className={`px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${gender === opt.value ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-50"}`}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 🚀 Search Button */}
                <div className="w-full md:w-auto mt-4 md:mt-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                    className="w-full bg-[#1E3A8A] hover:bg-[#1E40AF] text-white font-bold h-14 md:h-16 md:px-10 rounded-2xl md:rounded-full transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-blue-900/20"
                  >
                    <Search size={22} strokeWidth={3} />
                    <span className="md:hidden lg:inline text-lg">Search</span>
                  </button>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* 5. NAVBAR INTEGRATION */}
      <style dangerouslySetInnerHTML={{
        __html: `
        header {
          background-color: white !important;
          border-bottom: 1px solid #F1F5F9 !important;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05) !important;
        }
        header span, header a {
          color: #1E293B !important;
          font-weight: 600 !important;
        }
        /* Active Link Underline */
        header nav a.active, header nav a:hover {
          border-bottom: 2px solid #1E3A8A !important;
          border-radius: 0 !important;
        }
      ` }} />

    </section>
  );
}