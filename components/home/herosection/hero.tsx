"use client";

import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Calendar,
  Users,
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  startOfDay,
  isSameDay,
  isSameMonth,
  addDays,
  getDay,
  getDaysInMonth,
  isBefore,
} from "date-fns";
import { slugify, getCitySEOLink } from "@/lib/utils";
import { getCities, getAreas, type CityItem, type AreaItem } from "@/services/location.service";

// --- Configuration & Constants ---
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

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

interface HeroProps {
  title?: string;
  subtitle?: string;
}

export default function Hero({ title, subtitle }: HeroProps) {
  const router = useRouter();
  const [location, setLocation] = useState<string>("");
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  // [VALIDATION STATE] - Inline location error message state
  const [locationError, setLocationError] = useState<string | null>(null);

  // Date States (Airbnb & Booking.com style)
  const [checkInDate, setCheckInDate] = useState<Date | null>(null);
  const [checkOutDate, setCheckOutDate] = useState<Date | null>(null);
  const [dateSelectingMode, setDateSelectingMode] = useState<"checkIn" | "checkOut">("checkIn");
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState<Date>(startOfMonth(new Date()));

  // Guests States (Strictly optional with valid fallback)
  const [adults, setAdults] = useState<number>(1);
  const [children, setChildren] = useState<number>(0);
  const [rooms, setRooms] = useState<number>(1);

  const [openDropdown, setOpenDropdown] = useState<"location" | "dates" | "guests" | null>(null);
  const [activeField, setActiveField] = useState<"location" | "checkIn" | "checkOut" | "guests" | null>(null);

  const locationRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const guestsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        datePickerRef.current && !datePickerRef.current.contains(target) &&
        guestsRef.current && !guestsRef.current.contains(target) &&
        locationRef.current && !locationRef.current.contains(target)
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

  // Cities and areas lookup for canonical search routing
  const [citiesList, setCitiesList] = useState<CityItem[]>([]);
  const [areasList, setAreasList] = useState<AreaItem[]>([]);

  // Fetch dynamic location data from backend
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const [citiesData, areasData] = await Promise.all([
          getCities(),
          getAreas()
        ]);

        setCitiesList(citiesData);
        setAreasList(areasData);

        const cityNames = citiesData.map(c => c.name);
        const hydCity = citiesData.find(c => c.name.toLowerCase() === "hyderabad");
        const hydAreaNames = hydCity
          ? areasData.filter(a => a.city === hydCity.id).map(a => a.name)
          : [];

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
    const typeSpeed = isDeleting ? 40 : 60;
    const nextWordDelay = 500;

    const timer = setTimeout(() => {
      if (isDeleting) {
        setPlaceholder(currentFullWord.substring(0, charIndex - 1));
        setCharIndex(prev => prev - 1);

        if (charIndex - 1 === 0) {
          setIsDeleting(false);
          setPlaceholderIndex((prev) => (prev + 1) % dynamicWords.length);
          setCharIndex(0);
        }
      } else {
        setPlaceholder(currentFullWord.substring(0, charIndex + 1));
        setCharIndex(prev => prev + 1);

        if (charIndex + 1 === currentFullWord.length) {
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

  // Derived Values - Guests default fallback: strictly optional
  const totalGuests = adults + children;

  const nightsCount = useMemo(() => {
    if (!checkInDate || !checkOutDate) return 0;
    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    if (diffTime <= 0) return 0;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }, [checkInDate, checkOutDate]);

  const guestSummary = useMemo(() => {
    const guests = Math.max(1, totalGuests || 1);
    let str = `${guests} ${guests === 1 ? "Guest" : "Guests"}`;
    if (rooms > 1) {
      str += `, ${rooms} Rooms`;
    }
    return str;
  }, [totalGuests, rooms]);

  const applyDatePreset = (preset: "today" | "tomorrow" | "weekend" | "week" | "month") => {
    const now = startOfDay(new Date());
    if (preset === "today") {
      setCheckInDate(now);
      setCheckOutDate(addDays(now, 1));
    } else if (preset === "tomorrow") {
      const tmrw = addDays(now, 1);
      setCheckInDate(tmrw);
      setCheckOutDate(addDays(tmrw, 1));
    } else if (preset === "weekend") {
      const currentDay = now.getDay();
      const daysUntilFriday = (5 - currentDay + 7) % 7 || 7;
      const friday = addDays(now, daysUntilFriday);
      const sunday = addDays(friday, 2);
      setCheckInDate(friday);
      setCheckOutDate(sunday);
    } else if (preset === "week") {
      setCheckInDate(now);
      setCheckOutDate(addDays(now, 7));
    } else if (preset === "month") {
      setCheckInDate(now);
      setCheckOutDate(addDays(now, 30));
    }
    setOpenDropdown(null);
    setActiveField(null);
  };

  const handleDayClick = (dayDate: Date) => {
    const normalizedDay = startOfDay(dayDate);
    const normalizedToday = startOfDay(new Date());
    if (isBefore(normalizedDay, normalizedToday)) return;

    if (dateSelectingMode === "checkIn") {
      setCheckInDate(normalizedDay);
      if (checkOutDate && isBefore(checkOutDate, normalizedDay)) {
        setCheckOutDate(null);
      }
      setDateSelectingMode("checkOut");
      setActiveField("checkOut");
    } else {
      // selecting checkOut
      if (!checkInDate || isBefore(normalizedDay, checkInDate)) {
        setCheckInDate(normalizedDay);
        setCheckOutDate(null);
        setDateSelectingMode("checkOut");
        setActiveField("checkOut");
      } else if (isSameDay(normalizedDay, checkInDate)) {
        setCheckOutDate(addDays(normalizedDay, 1));
        setOpenDropdown(null);
        setActiveField(null);
      } else {
        setCheckOutDate(normalizedDay);
        setOpenDropdown(null);
        setActiveField(null);
      }
    }
  };

  // [MODIFIED: Target Route & Normalized Query Parameter Synchronization]
  // Corrects navigation route to target canonical listings/search results page (/hostels-in-[city]/)
  // matching the "Popular Cities" workflow and Screenshot 2 view (CityClient with map)
  const handleSearch = useCallback(() => {
    const searchLocation = location.trim();
    if (!searchLocation) {
      setLocationError("Please enter a location/city");
      setActiveField("location");
      setIsExpanded(true); // Automatically expand mobile view so user sees validation feedback
      return;
    }

    // Clear error on valid submission
    setLocationError(null);

    // 1. Resolve keywords and city mapping
    const words_in_loc = searchLocation.split(/\s+/);
    const mapped_words = words_in_loc.map((w) => {
      const lower = w.toLowerCase();
      return KEYWORD_MAPPINGS[lower] || w;
    });
    const mappedLocation = mapped_words.join(" ");
    const cleanQuery = searchLocation.toLowerCase();
    const lowerMapped = mappedLocation.toLowerCase();

    // 2. Identify destination city slug and optional area
    let targetCitySlug = "";
    let matchedAreaName: string | undefined;

    // Check direct major cities or keyword mappings
    if (MAJOR_CITIES.includes(lowerMapped)) {
      targetCitySlug = slugify(lowerMapped);
    } else {
      // Check in fetched cities list
      const cityMatch = citiesList.find(
        (c) =>
          c.name.toLowerCase() === cleanQuery ||
          c.name.toLowerCase() === lowerMapped ||
          slugify(c.name) === slugify(cleanQuery)
      );

      if (cityMatch) {
        targetCitySlug = slugify(cityMatch.name);
      } else {
        // Check in fetched areas list to map to parent city
        const areaMatch = areasList.find(
          (a) =>
            a.name.toLowerCase() === cleanQuery ||
            a.name.toLowerCase() === lowerMapped
        );

        if (areaMatch) {
          const parentCity = citiesList.find((c) => c.id === areaMatch.city);
          if (parentCity) {
            targetCitySlug = slugify(parentCity.name);
            matchedAreaName = areaMatch.name;
          }
        }

        // Common area fallback heuristics
        if (!targetCitySlug) {
          const hydAreas = [
            "kphb", "kphb colony", "gachibowli", "hitech city", "sr nagar", "ecil",
            "madhapur", "ameerpet", "banjaara hills", "kukatpally", "kondapur", "jubilee hills"
          ];
          const blrAreas = [
            "hsr", "hsr layout", "btm", "btm layout", "koramangala", "whitefield",
            "indiranagar", "electronic city", "marathahalli"
          ];
          const cheAreas = ["t nagar", "adyar", "velachery", "anna nagar", "guindy"];
          const punAreas = ["kothrud", "wakad", "hinjewadi", "viman nagar", "baner"];

          if (hydAreas.some((a) => cleanQuery.includes(a))) {
            targetCitySlug = "hyderabad";
            matchedAreaName = searchLocation;
          } else if (blrAreas.some((a) => cleanQuery.includes(a))) {
            targetCitySlug = "bengaluru";
            matchedAreaName = searchLocation;
          } else if (cheAreas.some((a) => cleanQuery.includes(a))) {
            targetCitySlug = "chennai";
            matchedAreaName = searchLocation;
          } else if (punAreas.some((a) => cleanQuery.includes(a))) {
            targetCitySlug = "pune";
            matchedAreaName = searchLocation;
          } else {
            // General fallback
            targetCitySlug = slugify(lowerMapped);
          }
        }
      }
    }

    if (!targetCitySlug) {
      targetCitySlug = "all";
    }

    // 3. Construct canonical destination route matching Popular Cities / CityClient
    const basePath = getCitySEOLink(targetCitySlug);

    // 4. Safely construct query parameters without undefined or redundant defaults
    const effectiveGuests = Math.max(1, totalGuests || 1);
    const effectiveRooms = Math.max(1, rooms || 1);

    const params = new URLSearchParams();
    if (checkInDate) params.append("checkIn", format(checkInDate, "yyyy-MM-dd"));
    if (checkOutDate) params.append("checkOut", format(checkOutDate, "yyyy-MM-dd"));
    if (effectiveGuests > 1) params.append("guests", effectiveGuests.toString());
    if (effectiveRooms > 1) params.append("rooms", effectiveRooms.toString());
    if (matchedAreaName) params.append("area", matchedAreaName);

    const queryString = params.toString();
    const destination = queryString ? `${basePath}?${queryString}` : basePath;

    // Navigate to canonical listings results view (renders CityClient with interactive map)
    router.push(destination);
  }, [
    location,
    checkInDate,
    checkOutDate,
    totalGuests,
    rooms,
    citiesList,
    areasList,
    router,
  ]);

  // [DATE PICKER REDESIGN - Compact Day Grid]
  // Tight padding, minimal typography, and compact button sizes
  const renderCalendarMonth = (monthDate: Date) => {
    const start = startOfMonth(monthDate);
    const daysInMonth = getDaysInMonth(monthDate);
    const startDayOfWeek = getDay(start); // 0 (Sun) - 6 (Sat)
    const normalizedToday = startOfDay(new Date());

    const days = [];
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-7 w-full" />);
    }

    for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
      const dayDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayNum);
      const normalizedDay = startOfDay(dayDate);
      const isPast = isBefore(normalizedDay, normalizedToday);
      const isToday = isSameDay(normalizedDay, normalizedToday);
      const isStart = checkInDate && isSameDay(normalizedDay, startOfDay(checkInDate));
      const isEnd = checkOutDate && isSameDay(normalizedDay, startOfDay(checkOutDate));
      const isInRange = checkInDate && checkOutDate && normalizedDay > startOfDay(checkInDate) && normalizedDay < startOfDay(checkOutDate);
      const isHoverRange = checkInDate && !checkOutDate && hoverDate && normalizedDay > startOfDay(checkInDate) && normalizedDay <= startOfDay(hoverDate);

      days.push(
        <div
          key={`day-${dayNum}`}
          onMouseEnter={() => {
            if (checkInDate && !checkOutDate && !isPast) {
              setHoverDate(normalizedDay);
            }
          }}
          className={`h-7 w-full flex items-center justify-center relative transition-colors ${
            isInRange || isHoverRange ? "bg-indigo-50/90 text-indigo-950 font-medium" : ""
          } ${
            isStart && (checkOutDate || hoverDate) ? "bg-gradient-to-r from-transparent to-indigo-50/90 rounded-l-full" : ""
          } ${
            isEnd ? "bg-gradient-to-l from-transparent to-indigo-50/90 rounded-r-full" : ""
          }`}
        >
          <button
            type="button"
            disabled={isPast}
            onClick={(e) => {
              e.stopPropagation();
              handleDayClick(dayDate);
            }}
            className={`h-6 w-6 rounded-full flex items-center justify-center text-xs transition-all ${
              isStart || isEnd
                ? "bg-[#312E81] text-white shadow-sm scale-105 z-10 font-bold"
                : isPast
                  ? "text-gray-300 cursor-not-allowed pointer-events-none"
                  : isToday
                    ? "border border-[#312E81] text-[#312E81] font-bold hover:bg-indigo-50"
                    : "text-gray-800 hover:bg-gray-100 font-medium"
            }`}
          >
            {dayNum}
          </button>
        </div>
      );
    }

    return (
      <div className="w-full">
        <div className="grid grid-cols-7 gap-y-1 text-center mb-1">
          {DAYS_OF_WEEK.map((d) => (
            <div key={d} className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-y-0.5 place-items-center">
          {days}
        </div>
      </div>
    );
  };

  return (
    // [SEARCH BAR POSITIONING] - Tightened parent section padding to sit higher
    <section className="relative min-h-[460px] md:min-h-[500px] pt-8 pb-10 md:pt-10 md:pb-12 flex items-center justify-center bg-[#0F172A] z-[5]">

      {/* 1. BACKGROUND - Clean modern dark gradient without building image */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-gradient-to-b from-[#0F172A] via-[#111827] to-[#0F172A]">
        {/* Subtle Ambient Radial Glows */}
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-[#6366F1]/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-10 right-10 w-[420px] h-[260px] bg-[#8B5CF6]/10 rounded-full blur-[110px] pointer-events-none" />
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#94A3B8 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      {/* 2. CONTENT CONTAINER (Elevated vertical spacing) */}
      <div className="relative z-10 container mx-auto px-6 py-2 md:py-4 max-w-5xl flex flex-col items-center text-center overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-4xl mx-auto flex flex-col items-center text-center"
        >
          {/* TOP TAG */}
          <div className="inline-flex items-center px-3.5 py-1 bg-white/10 backdrop-blur-md rounded-md mb-2 md:mb-2.5 border border-white/10">
            <span className="text-[10px] md:text-[11px] font-medium tracking-wider uppercase text-white/90">
              Elevated Group Stay
            </span>
          </div>

          {/* HEADLINE */}
          <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-medium text-white leading-[1.15] mb-2 md:mb-2.5 tracking-tight text-center">
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

          {/* SUBTEXT (Tightened margin-bottom to elevate the search bar) */}
          <p className="font-sans text-sm sm:text-base md:text-lg text-gray-300 max-w-xl font-normal leading-relaxed mb-3.5 md:mb-4 text-center mx-auto">
            {subtitle || "Affordable. Comfortable. Verified. Book premium hostels across India in seconds."}
          </p>

          {/* [SEARCH BAR POSITIONING] - Positioned slightly higher via negative margin & tighter flow */}
          <div className="w-full max-w-4xl mx-auto relative z-30 -mt-1 md:-mt-1.5">
            <div className={`relative z-30 bg-white/95 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.35)] border border-black rounded-lg transition-all duration-200 ${isExpanded ? "p-3 md:p-2.5" : "p-1.5 md:p-2"}`}>

              {/* COMPACT TRIGGER (Mobile) */}
              {!isExpanded && (
                <div
                  onClick={() => {
                    setIsExpanded(true);
                    if (locationError) setLocationError(null);
                  }}
                  className={`flex md:hidden items-center justify-between w-full px-4 py-2.5 rounded-lg cursor-pointer transition-colors ${
                    locationError ? "border border-rose-500 bg-rose-50/20" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      locationError ? "bg-rose-100 text-rose-600" : "bg-indigo-50 text-[#312E81]"
                    }`}>
                      {locationError ? <AlertCircle size={16} strokeWidth={2.5} /> : <Search size={16} strokeWidth={2.5} />}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className={`font-semibold text-sm ${locationError ? "text-rose-600" : "text-black"}`}>
                        {locationError ? "Please enter a location/city" : "Where to?"}
                      </span>
                      <span className="text-gray-500 text-xs font-normal">
                        {location ? location : "Location"} • {checkInDate && checkOutDate ? `${format(checkInDate, "MMM d")} - ${format(checkOutDate, "MMM d")}` : "Anytime"} • {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* FULL SEARCH FIELDS */}
              <div className={`${isExpanded ? "flex" : "hidden md:flex"} flex-col md:flex-row items-center gap-2 md:gap-2 h-full`}>

                {/* [LOCATION INPUT WITH INLINE VALIDATION ERROR] */}
                <div
                  ref={locationRef}
                  onClick={() => {
                    setActiveField("location");
                  }}
                  className={`w-full md:flex-[1.4] relative flex items-center px-3.5 md:px-4 py-2 md:py-2 gap-2.5 group rounded-md border transition-all text-left ${
                    locationError
                      ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/10"
                      : activeField === "location" || openDropdown === "location"
                        ? "border-black ring-1 ring-black bg-white"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <MapPin
                    className={
                      locationError
                        ? "text-rose-500 shrink-0"
                        : activeField === "location" || openDropdown === "location"
                          ? "text-black shrink-0"
                          : "text-gray-400 group-hover:text-black transition-colors shrink-0"
                    }
                    size={17}
                  />
                  <div className="flex flex-col w-full text-left">
                    <div className="flex items-center justify-between">
                      <span className="hidden md:block text-[10px] font-semibold text-black uppercase tracking-wider mb-0.5">
                        Location
                      </span>
                      {/* Inline error feedback on desktop */}
                      {locationError && (
                        <span className="hidden md:inline-flex text-[10px] font-semibold text-rose-500 items-center gap-1 animate-in fade-in">
                          {locationError}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      placeholder={locationError ? "Please enter a location/city" : `Search ${placeholder}`}
                      value={location}
                      onChange={(e) => {
                        setLocation(e.target.value);
                        // Clear error immediately when typing starts
                        if (locationError) setLocationError(null);
                        setOpenDropdown("location");
                        setActiveField("location");
                      }}
                      onFocus={() => {
                        setOpenDropdown("location");
                        setActiveField("location");
                      }}
                      className={`w-full py-0.5 text-black text-[14px] md:text-[15px] font-medium focus:outline-none bg-transparent ${
                        locationError ? "placeholder:text-rose-400 font-semibold" : "placeholder:text-gray-400"
                      }`}
                    />
                    {/* Inline error feedback on mobile */}
                    {locationError && (
                      <span className="md:hidden text-[11px] font-semibold text-rose-500 mt-0.5 animate-in fade-in">
                        {locationError}
                      </span>
                    )}
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
                              if (locationError) setLocationError(null);
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

                {/* [COMPACT DATE PICKER POPOVER] */}
                <div ref={datePickerRef} className="w-full md:flex-[1.6] relative flex flex-row items-center gap-2">

                  {/* Check In Box */}
                  <div
                    onClick={() => {
                      setActiveField("checkIn");
                      setOpenDropdown("dates");
                      setDateSelectingMode("checkIn");
                    }}
                    className={`w-1/2 relative flex items-center px-3 py-1.5 md:py-2 gap-2 group rounded-md border transition-all cursor-pointer text-left ${
                      activeField === "checkIn" || (openDropdown === "dates" && dateSelectingMode === "checkIn")
                        ? "border-black ring-1 ring-black bg-white"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <Calendar
                      className={
                        activeField === "checkIn" || (openDropdown === "dates" && dateSelectingMode === "checkIn")
                          ? "text-black shrink-0"
                          : "text-gray-400 group-hover:text-black transition-colors shrink-0"
                      }
                      size={15}
                    />
                    <div className="flex flex-col w-full overflow-hidden text-left">
                      <span className="hidden md:block text-[10px] font-semibold text-black uppercase tracking-wider mb-0.5">
                        Check in
                      </span>
                      <span
                        className={`text-[13px] md:text-[14px] font-medium truncate ${
                          checkInDate ? "text-black font-semibold" : "text-gray-400"
                        }`}
                      >
                        {checkInDate ? format(checkInDate, "dd MMM") : "Add date"}
                      </span>
                    </div>
                  </div>

                  {/* Check Out Box */}
                  <div
                    onClick={() => {
                      setActiveField("checkOut");
                      setOpenDropdown("dates");
                      setDateSelectingMode("checkOut");
                    }}
                    className={`w-1/2 relative flex items-center px-3 py-1.5 md:py-2 gap-2 group rounded-md border transition-all cursor-pointer text-left ${
                      activeField === "checkOut" || (openDropdown === "dates" && dateSelectingMode === "checkOut")
                        ? "border-black ring-1 ring-black bg-white"
                        : "border-gray-200 hover:border-gray-300 bg-white"
                    }`}
                  >
                    <Calendar
                      className={
                        activeField === "checkOut" || (openDropdown === "dates" && dateSelectingMode === "checkOut")
                          ? "text-black shrink-0"
                          : "text-gray-400 group-hover:text-black transition-colors shrink-0"
                      }
                      size={15}
                    />
                    <div className="flex flex-col w-full overflow-hidden text-left">
                      <span className="hidden md:block text-[10px] font-semibold text-black uppercase tracking-wider mb-0.5">
                        Check out
                      </span>
                      <span
                        className={`text-[13px] md:text-[14px] font-medium truncate ${
                          checkOutDate ? "text-black font-semibold" : "text-gray-400"
                        }`}
                      >
                        {checkOutDate ? format(checkOutDate, "dd MMM") : "Add date"}
                      </span>
                    </div>
                  </div>

                  {/* Compact Minimal Calendar Popover */}
                  <AnimatePresence>
                    {openDropdown === "dates" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 lg:left-1/2 lg:-translate-x-1/2 bg-white rounded-xl shadow-[0_20px_45px_rgba(0,0,0,0.2)] border border-gray-100 p-3.5 sm:p-4 z-[100] text-left w-[calc(100vw-32px)] sm:w-[330px]"
                      >
                        {/* Compact Header: Mode & Month Controls */}
                        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-2.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-900">
                              {dateSelectingMode === "checkIn" ? "Check-in" : "Check-out"}
                            </span>
                            {nightsCount > 0 && (
                              <span className="text-[10px] font-semibold bg-indigo-50 text-[#312E81] px-2 py-0.5 rounded-full border border-indigo-100">
                                {nightsCount} {nightsCount === 1 ? "night" : "nights"}
                              </span>
                            )}
                          </div>

                          {/* Month Navigation */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={
                                isSameMonth(currentMonth, startOfMonth(new Date())) ||
                                isBefore(currentMonth, startOfMonth(new Date()))
                              }
                              onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
                              className="p-1 rounded-md border border-gray-200 hover:border-gray-400 disabled:opacity-25 disabled:pointer-events-none transition-all text-gray-700"
                              aria-label="Previous Month"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <span className="text-xs font-bold text-gray-900 min-w-[85px] text-center">
                              {format(currentMonth, "MMM yyyy")}
                            </span>
                            <button
                              type="button"
                              onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
                              className="p-1 rounded-md border border-gray-200 hover:border-gray-400 transition-all text-gray-700"
                              aria-label="Next Month"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Calendar Grid View (Single Month, tight spacing) */}
                        <div className="w-full">
                          {renderCalendarMonth(currentMonth)}
                        </div>

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1.5 flex-wrap pt-2.5 mt-2.5 border-t border-gray-100">
                          <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mr-0.5">Quick:</span>
                          <button
                            type="button"
                            onClick={() => applyDatePreset("today")}
                            className="px-2 py-0.5 text-[11px] font-medium rounded border border-gray-200 hover:border-[#312E81] hover:text-[#312E81] text-gray-700 transition-colors"
                          >
                            Today
                          </button>
                          <button
                            type="button"
                            onClick={() => applyDatePreset("tomorrow")}
                            className="px-2 py-0.5 text-[11px] font-medium rounded border border-gray-200 hover:border-[#312E81] hover:text-[#312E81] text-gray-700 transition-colors"
                          >
                            Tomorrow
                          </button>
                          <button
                            type="button"
                            onClick={() => applyDatePreset("weekend")}
                            className="px-2 py-0.5 text-[11px] font-medium rounded border border-gray-200 hover:border-[#312E81] hover:text-[#312E81] text-gray-700 transition-colors"
                          >
                            Weekend
                          </button>
                          <button
                            type="button"
                            onClick={() => applyDatePreset("week")}
                            className="px-2 py-0.5 text-[11px] font-medium rounded border border-gray-200 hover:border-[#312E81] hover:text-[#312E81] text-gray-700 transition-colors"
                          >
                            1 Week
                          </button>
                          <button
                            type="button"
                            onClick={() => applyDatePreset("month")}
                            className="px-2 py-0.5 text-[11px] font-semibold rounded border border-indigo-200 bg-indigo-50/50 text-[#312E81] hover:bg-indigo-50 transition-colors"
                          >
                            1 Month
                          </button>
                        </div>

                        {/* Footer Actions */}
                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => {
                              setCheckInDate(null);
                              setCheckOutDate(null);
                              setHoverDate(null);
                              setDateSelectingMode("checkIn");
                            }}
                            className="text-[11px] font-semibold text-gray-500 hover:text-black underline underline-offset-2 transition-colors flex items-center gap-1"
                          >
                            <RotateCcw size={11} />
                            Clear
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdown(null);
                              setActiveField(null);
                            }}
                            className="bg-[#312E81] hover:bg-[#1E1B4B] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-md transition-all shadow-sm"
                          >
                            Apply
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* [OPTIONAL GUESTS SECTION] - Strictly optional, defaults to 1 fallback */}
                <div
                  ref={guestsRef}
                  onClick={() => {
                    setActiveField("guests");
                    setOpenDropdown(openDropdown === "guests" ? null : "guests");
                  }}
                  className={`w-full md:flex-1 relative flex items-center px-3.5 md:px-4 py-2 md:py-2 gap-2.5 group rounded-md border transition-all cursor-pointer text-left ${
                    activeField === "guests" || openDropdown === "guests"
                      ? "border-black ring-1 ring-black bg-white"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <Users
                    className={
                      activeField === "guests" || openDropdown === "guests"
                        ? "text-black shrink-0"
                        : "text-gray-400 group-hover:text-black transition-colors shrink-0"
                    }
                    size={16}
                  />
                  <div className="flex flex-col w-full overflow-hidden text-left">
                    <span className="hidden md:block text-[10px] font-semibold text-black uppercase tracking-wider mb-0.5">
                      Guests
                    </span>
                    <span className="text-black text-[13px] md:text-[14px] font-medium truncate">
                      {guestSummary}
                    </span>
                  </div>
                  <ChevronDown
                    className={`ml-auto text-gray-400 transition-transform duration-300 ${
                      openDropdown === "guests" ? "rotate-180" : ""
                    }`}
                    size={14}
                  />

                  {/* Guests Dropdown Popover */}
                  <AnimatePresence>
                    {openDropdown === "guests" && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.99 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.99 }}
                        transition={{ duration: 0.15 }}
                        onClick={(e) => e.stopPropagation()}
                        className="absolute top-[calc(100%+8px)] right-0 w-[calc(100vw-32px)] sm:w-[320px] md:w-[340px] bg-white rounded-xl shadow-[0_20px_45px_rgba(0,0,0,0.2)] border border-gray-100 p-4 z-[100] text-left"
                      >
                        <div className="flex items-center justify-between pb-2.5 border-b border-gray-100 mb-3">
                          <span className="text-sm font-bold text-gray-900">Guests & Rooms</span>
                          <span className="text-xs font-semibold text-[#312E81] bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
                            {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"}
                          </span>
                        </div>

                        <div className="space-y-3.5">
                          {/* Adults */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">Adults</span>
                              <span className="text-xs text-gray-500">Ages 13 or above</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={adults <= 1}
                                onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-black hover:text-black disabled:opacity-25 disabled:pointer-events-none transition-all"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-gray-900">{adults}</span>
                              <button
                                type="button"
                                disabled={adults >= 10}
                                onClick={() => setAdults((prev) => Math.min(10, prev + 1))}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-black hover:text-black disabled:opacity-25 disabled:pointer-events-none transition-all"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Children */}
                          <div className="flex items-center justify-between border-t border-gray-50 pt-2.5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">Children</span>
                              <span className="text-xs text-gray-500">Ages 0–12</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={children <= 0}
                                onClick={() => setChildren((prev) => Math.max(0, prev - 1))}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-black hover:text-black disabled:opacity-25 disabled:pointer-events-none transition-all"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-gray-900">{children}</span>
                              <button
                                type="button"
                                disabled={children >= 6}
                                onClick={() => setChildren((prev) => Math.min(6, prev + 1))}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-black hover:text-black disabled:opacity-25 disabled:pointer-events-none transition-all"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>

                          {/* Rooms */}
                          <div className="flex items-center justify-between border-t border-gray-50 pt-2.5">
                            <div className="flex flex-col">
                              <span className="text-sm font-bold text-gray-900">Rooms</span>
                              <span className="text-xs text-gray-500">Private or sharing unit</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                disabled={rooms <= 1}
                                onClick={() => setRooms((prev) => Math.max(1, prev - 1))}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-black hover:text-black disabled:opacity-25 disabled:pointer-events-none transition-all"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-5 text-center text-sm font-bold text-gray-900">{rooms}</span>
                              <button
                                type="button"
                                disabled={rooms >= 5}
                                onClick={() => setRooms((prev) => Math.min(5, prev + 1))}
                                className="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-700 hover:border-black hover:text-black disabled:opacity-25 disabled:pointer-events-none transition-all"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => {
                              setAdults(1);
                              setChildren(0);
                              setRooms(1);
                            }}
                            className="text-xs font-semibold text-gray-500 hover:text-black underline underline-offset-2 transition-colors"
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setOpenDropdown(null);
                              setActiveField(null);
                            }}
                            className="bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-bold px-3.5 py-1.5 rounded-md transition-all shadow-sm"
                          >
                            Done
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* 🚀 Search Button */}
                <div className="w-full md:w-auto mt-2 md:mt-0 shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSearch();
                    }}
                    className="w-full md:w-auto bg-[#312E81] hover:bg-[#1E1B4B] text-white font-medium h-11 md:h-11 px-6 md:px-7 rounded-md transition-all flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-indigo-950/20"
                  >
                    <Search size={17} strokeWidth={2.5} />
                    <span className="text-sm md:text-[15px] font-medium">Search</span>
                  </button>
                </div>

              </div>
            </div>

            {/* Popular Location Data Chips */}
            <div className="relative z-10 flex items-center justify-center gap-2 flex-wrap mt-3.5 md:mt-4 text-xs">
              <span className="text-gray-300 font-medium">Popular:</span>
              {["Hyderabad", "Bengaluru", "Chennai", "Mumbai", "Pune", "Delhi"].map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setLocation(city);
                    if (locationError) setLocationError(null);
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
        header nav a {
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