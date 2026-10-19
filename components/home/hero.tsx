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
  const [activeField, setActiveField] = useState<"location" | "budget" | "gender" | null>(null);

  const locationRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);
  const genderRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        budgetRef.current && !budgetRef.current.contains(event.target as Node) &&
        genderRef.current && !genderRef.current.contains(event.target as Node) &&
        locationRef.current && !locationRef.current.contains(event.target as Node)
      ) {
        setOpenDropdown(null);
        setActiveField(null);
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

  const filteredLocations = location.trim()
    ? dynamicWords.filter((w) =>
      w.toLowerCase().includes(location.toLowerCase().trim())
    ).slice(0, 8)
    : dynamicWords.slice(0, 8);

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
    <section className="relative min-h-[480px] md:min-h-[520px] py-10 md:py-14 flex items-center justify-center bg-[#0F172A] z-[5]">

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

      {/* 2. CONTENT (CENTERED & COMPACT) */}
      <div className="relative z-10 container mx-auto px-6 py-4 md:py-6 max-w-5xl flex flex-col items-center text-center overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl mx-auto flex flex-col items-center text-center"
        >
          {/* TOP TAG */}
          <div className="inline-flex items-center px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-md mb-2.5 md:mb-3 border border-white/10">
            <span className="text-[10px] md:text-[11px] font-medium tracking-wider uppercase text-white/90">
              Elevated Group Stay
            </span>
          </div>

          {/* HEADLINE */}
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-medium text-white leading-[1.15] mb-2.5 md:mb-3 tracking-tight text-center">
            {title ? (
              title
            ) : (
              <>
                Find Your Perfect <br className="hidden sm:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-emerald-100 to-indigo-200">
                  Hostel Stay
                </span>
              </>
            )}
          </h1>

          {/* SUBTEXT */}
          <p className="font-sans text-sm sm:text-base md:text-lg text-gray-300 max-w-xl font-normal leading-relaxed mb-5 md:mb-6 text-center mx-auto">
            {subtitle || "Affordable. Comfortable. Verified. Book premium hostels across India in seconds."}
          </p>

          {/* 4. SEARCH BAR (CENTERED, RECTANGULAR WITH LESS SOFT CORNERS) */}
          <div className="w-full max-w-4xl mx-auto relative z-30">
            <div className={`relative z-30 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-black rounded-lg transition-all duration-200 ${isExpanded ? "p-3 md:p-2.5" : "p-1.5 md:p-2"}`}>

              {/* COMPACT TRIGGER (Mobile) */}
              {!isExpanded && (
                <div
                  onClick={() => setIsExpanded(true)}
                  className="flex md:hidden items-center justify-between w-full px-4 py-2.5 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-[#312E81]">
                      <Search size={16} strokeWidth={2.5} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-black font-medium text-sm">Where to?</span>
                      <span className="text-gray-600 text-xs font-normal">Location • Budget • Gender</span>
                    </div>
                  </div>
                </div>
              )}

              {/* FULL SEARCH FIELDS */}
              <div className={`${isExpanded ? "flex" : "hidden md:flex"} flex-col md:flex-row items-center gap-2 md:gap-2.5 h-full`}>

                {/* 📍 Location with Dropdown Suggestions */}
                <div
                  ref={locationRef}
                  onClick={() => {
                    setActiveField("location");
                  }}
                  className={`w-full md:flex-[1.8] relative flex items-center px-3.5 md:px-4 py-2 md:py-2 gap-2.5 group rounded-md border transition-all text-left ${
                    activeField === "location" || openDropdown === "location"
                      ? "border-black ring-1 ring-black bg-white"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <MapPin className={activeField === "location" || openDropdown === "location" ? "text-black shrink-0" : "text-gray-400 group-hover:text-black transition-colors shrink-0"} size={17} />
                  <div className="flex flex-col w-full text-left">
                    <span className="hidden md:block text-[10px] font-semibold text-black uppercase tracking-wider mb-0.5">Location</span>
                    <input
                      type="text"
                      placeholder={`Search ${placeholder}`}
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        setOpenDropdown("location");
                        setActiveField("location");
                      }}
                      onFocus={() => {
                        setOpenDropdown("location");
                        setActiveField("location");
                      }}
                      className="w-full py-0.5 text-black text-[15px] md:text-[16px] font-medium placeholder:text-gray-400 focus:outline-none bg-transparent"
                    />
                  </div>

                  {/* Location Suggestions Dropdown */}
                  <AnimatePresence>
                    {openDropdown === "location" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[240px] bg-white rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-gray-100 p-2 z-[100] text-left max-h-60 overflow-y-auto"
                      >
                        <div className="text-[10px] font-semibold text-gray-400 uppercase px-3 py-1.5 tracking-wider border-b border-gray-100 mb-1">
                          Popular Locations & Areas
                        </div>
                        {filteredLocations.map((item) => (
                          <div
                            key={item}
                            onClick={(e) => {
                              e.stopPropagation();
                              setLocation(item);
                              setOpenDropdown(null);
                              setActiveField("location");
                            }}
                            className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${
                              location.toLowerCase() === item.toLowerCase()
                                ? "bg-indigo-50 text-indigo-950 font-semibold"
                                : "text-gray-800 hover:bg-gray-50"
                            }`}
                          >
                            <MapPin size={14} className="text-gray-400 shrink-0" />
                            <span>{item}</span>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 💰 Budget (Custom Dropdown) */}
                <div
                  ref={budgetRef}
                  onClick={() => {
                    setActiveField("budget");
                    setOpenDropdown(openDropdown === "budget" ? null : "budget");
                  }}
                  className={`w-full md:flex-1 relative flex items-center px-3.5 md:px-4 py-2 md:py-2 gap-2.5 group rounded-md border transition-all cursor-pointer text-left ${
                    activeField === "budget" || openDropdown === "budget"
                      ? "border-black ring-1 ring-black bg-white"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <IndianRupee className={activeField === "budget" || openDropdown === "budget" ? "text-black shrink-0" : "text-gray-400 group-hover:text-black transition-colors shrink-0"} size={16} />
                  <div className="flex flex-col w-full overflow-hidden text-left">
                    <span className="hidden md:block text-[10px] font-semibold text-black uppercase tracking-wider mb-0.5">Budget</span>
                    <span className="text-black text-[15px] md:text-[16px] font-medium truncate">
                      {budget ? budgetOptions.find(o => o.value === budget)?.label : "Any Budget"}
                    </span>
                  </div>
                  <ChevronDown className={`ml-auto text-gray-400 transition-transform duration-300 ${openDropdown === "budget" ? "rotate-180" : ""}`} size={14} />

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {openDropdown === "budget" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[200px] bg-white rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-gray-100 p-1.5 z-[100] text-left"
                      >
                        {budgetOptions.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              setBudget(opt.value);
                              setOpenDropdown(null);
                              setActiveField("budget");
                            }}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${budget === opt.value ? "bg-indigo-50 text-indigo-950 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
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
                  onClick={() => {
                    setActiveField("gender");
                    setOpenDropdown(openDropdown === "gender" ? null : "gender");
                  }}
                  className={`w-full md:flex-1 relative flex items-center px-3.5 md:px-4 py-2 md:py-2 gap-2.5 group rounded-md border transition-all cursor-pointer text-left ${
                    activeField === "gender" || openDropdown === "gender"
                      ? "border-black ring-1 ring-black bg-white"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <Users className={activeField === "gender" || openDropdown === "gender" ? "text-black shrink-0" : "text-gray-400 group-hover:text-black transition-colors shrink-0"} size={16} />
                  <div className="flex flex-col w-full overflow-hidden text-left">
                    <span className="hidden md:block text-[10px] font-semibold text-black uppercase tracking-wider mb-0.5">Gender</span>
                    <span className="text-black text-[15px] md:text-[16px] font-medium truncate">
                      {gender ? genderOptions.find(o => o.value === gender)?.label : "Any"}
                    </span>
                  </div>
                  <ChevronDown className={`ml-auto text-gray-400 transition-transform duration-300 ${openDropdown === "gender" ? "rotate-180" : ""}`} size={14} />

                  {/* Dropdown Menu */}
                  <AnimatePresence>
                    {openDropdown === "gender" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-[calc(100%+8px)] left-0 w-full min-w-[190px] bg-white rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.25)] border border-gray-100 p-1.5 z-[100] text-left"
                      >
                        {genderOptions.map((opt) => (
                          <div
                            key={opt.value}
                            onClick={(e) => {
                              e.stopPropagation();
                              setGender(opt.value);
                              setOpenDropdown(null);
                              setActiveField("gender");
                            }}
                            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer ${gender === opt.value ? "bg-indigo-50 text-indigo-950 font-semibold" : "text-gray-700 hover:bg-gray-50"}`}
                          >
                            {opt.label}
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 🚀 Search Button (Rectangular with less soft corner) */}
                <div className="w-full md:w-auto mt-2 md:mt-0 shrink-0">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleSearch(); }}
                    className="w-full md:w-auto bg-[#312E81] hover:bg-[#1E1B4B] text-white font-medium h-12 md:h-12 px-6 md:px-8 rounded-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-indigo-950/20"
                  >
                    <Search size={18} strokeWidth={2.5} />
                    <span className="text-sm md:text-base font-medium">Search</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Popular Location Data Chips */}
            <div className="relative z-10 flex items-center justify-center gap-2 flex-wrap mt-4 text-xs">
              <span className="text-gray-300 font-medium">Popular:</span>
              {["Hyderabad", "Bengaluru", "Chennai", "Mumbai", "Pune", "Delhi"].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setLocation(city);
                    setIsExpanded(true);
                  }}
                  className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md backdrop-blur-sm border border-white/10 transition-all font-medium text-xs active:scale-95"
                >
                  {city}
                </button>
              ))}
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
          border-bottom: 2px solid #312E81 !important;
          border-radius: 0 !important;
        }
      ` }} />

    </section>
  );
}