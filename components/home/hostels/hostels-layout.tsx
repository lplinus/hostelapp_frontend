"use client";

import { useState, useMemo, useEffect } from "react";
import FiltersSidebar from "./filters-sidebar";
import HostelGrid from "./hostel-grid";
import { HostelListItem } from "@/types/hostel.types";
import { ChevronDown, Search, X } from "lucide-react";

interface HostelsLayoutProps {
  readonly hostels: readonly HostelListItem[];
}

export default function HostelsLayout({ hostels }: HostelsLayoutProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<readonly HostelListItem[]>(hostels);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults(hostels);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
        const response = await fetch(`${baseUrl}/api/locations/inner-search/?q=${encodeURIComponent(searchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.results);
        }
      } catch (error) {
        console.error("Inner search failed:", error);
      } finally {
        setIsSearching(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery, hostels]);

  const displayedHostels = searchQuery ? searchResults : hostels;

  return (
    <div className="container mx-auto px-4 sm:px-6 pt-14 lg:pt-10 pb-20">
      <div className="grid grid-cols-12 gap-8 lg:gap-10">

        {/* LISTINGS SECTION (70%) */}
        <div className="col-span-12 lg:col-span-8 order-2 lg:order-1">
          <div className="flex flex-col gap-6">

            {/* Search Bar Section */}
            <div className="relative group max-w-2xl">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-teal-600 transition-colors pointer-events-none">
                <Search size={22} />
              </div>
              <input
                type="text"
                placeholder="Search by name, area or address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-12 py-4 rounded-[1.25rem] border border-slate-200 bg-white/70 backdrop-blur-sm focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 focus:outline-none text-slate-900 font-medium placeholder:text-slate-400 transition-all shadow-sm hover:border-slate-300"
              />
              {isSearching && (
                <div className="absolute right-12 top-1/2 -translate-y-1/2">
                  <div className="w-5 h-5 border-2 border-slate-200 border-t-teal-600 rounded-full animate-spin"></div>
                </div>
              )}
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                  title="Clear search"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <div className="flex items-center justify-between mb-2">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Available Hostels</h1>
                <p className="text-slate-500 text-sm mt-1">{displayedHostels.length} accommodations available</p>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                <span>Sort by: Recommended</span>
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
            <HostelGrid hostels={displayedHostels} />
          </div>
        </div>

        {/* FILTER SIDEBAR (30%) */}
        <div className="col-span-12 lg:col-span-4 order-1 lg:order-2">
          <div className="sticky top-[100px]">
            <FiltersSidebar />
          </div>
        </div>

      </div>
    </div>
  );
}