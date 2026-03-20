"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MapPin, IndianRupee, Users, Search, ChevronDown } from "lucide-react";
import { slugify, getCitySEOLink } from "@/lib/utils";

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
        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 text-base bg-white text-left flex items-center justify-between gap-2"
      >
        <span className={value ? "text-gray-800" : "text-gray-500"}>
          {selectedLabel}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 shrink-0 transition-transform ${open ? "rotate-180" : ""
            }`}
        />
      </button>

      {open && (
        <ul className="absolute left-0 right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-60 overflow-auto">
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`px-4 py-2.5 cursor-pointer text-sm hover:bg-blue-50 transition-colors ${value === opt.value
                  ? "bg-blue-50 text-blue-600 font-medium"
                  : "text-gray-700"
                } first:rounded-t-xl last:rounded-b-xl`}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
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

export default function SearchBar() {
  const router = useRouter();

  const [location, setLocation] = useState<string>("");
  const [budget, setBudget] = useState<string>("");
  const [gender, setGender] = useState<string>("");

  const handleSearch = () => {
    // SEO Optimization: If only location is specified, redirect to keyword-rich URL
    if (location && !budget && !gender) {
      const citySlug = slugify(location);
      router.push(getCitySEOLink(citySlug));
      return;
    }

    const params = new URLSearchParams();

    if (location) params.append("location", location);
    if (budget) params.append("budget", budget);
    if (gender) params.append("gender", gender);

    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto border border-black">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
        {/* Location */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gray-500" />
            Location
          </label>
          <input
            type="text"
            placeholder="e.g. Koramangala"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 text-base"
          />
        </div>

        {/* Budget */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-gray-500" />
            Budget
          </label>
          {/* Desktop: native select */}
          <select
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            className="hidden md:block w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 text-base"
          >
            <option value="">Select Budget</option>
            <option value="5000">Below ₹5,000</option>
            <option value="10000">Below ₹10,000</option>
            <option value="15000">Below ₹15,000</option>
            <option value="20000">Below ₹20,000</option>
            <option value="25000">Below ₹25,000</option>
          </select>
          {/* Mobile: custom dropdown */}
          <MobileSelect
            options={budgetOptions}
            value={budget}
            onChange={setBudget}
            placeholder="Select Budget"
          />
        </div>

        {/* Gender */}
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
            <Users className="w-4 h-4 text-gray-500" />
            Gender
          </label>
          {/* Desktop: native select */}
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="hidden md:block w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 text-base"
          >
            <option value="">Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="unisex">Unisex</option>
          </select>
          {/* Mobile: custom dropdown */}
          <MobileSelect
            options={genderOptions}
            value={gender}
            onChange={setGender}
            placeholder="Select Gender"
          />
        </div>

        {/* Search Button */}
        <div className="flex">
          <button
            onClick={handleSearch}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 text-white font-semibold px-6 py-3 rounded-xl transition"
          >
            <Search className="w-4 h-4" />
            Search
          </button>
        </div>
      </div>
    </div>
  );
}