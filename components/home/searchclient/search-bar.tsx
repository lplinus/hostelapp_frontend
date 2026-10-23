"use client";

// ─────────────────────────────────────────────────────────────────────────────
// [OLD SEARCH BAR - DEPRECATED / COMMENTED OUT]
// The primary search bar is now unified in @/components/home/herosection/hero.tsx
// which routes directly to the canonical /hostels-in-[city]/ view with interactive map.
// ─────────────────────────────────────────────────────────────────────────────

export default function SearchBar({ variant }: { variant?: "default" | "header" }) {
  // Deprecated component — primary search bar is in Hero (@/components/home/herosection/hero.tsx)
  return null;
}

/*
================================================================================
[OLD CODE COMMENTED OUT BELOW]
================================================================================

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
        className="w-full px-6 py-4 rounded-full border border-gray-200 focus:ring-2 focus:ring-[#10B981] focus:outline-none text-[#1E1B4B] text-base bg-white text-left flex items-center justify-between gap-2 shadow-sm transition-all"
      >
        <span className={value ? "text-[#1E1B4B] font-medium" : "text-gray-400"}>
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
                  ? "bg-[#10B981]/5 text-[#10B981] font-bold"
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
================================================================================
*/