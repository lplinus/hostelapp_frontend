"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, MapPin, Grid, ListIcon, Search, X } from "lucide-react";
import HostelCard from "@/components/home/hostels/hostel-card";
import HostelListingMap from "@/components/home/hostels/hostelmaping/hostel-listing-map";
import { CityHostelResponse, CityHostel } from "@/types/hostel.types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Card,
    CardHeader,
    CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { getHostelCoordinates } from "@/components/home/hostels/hostelmaping/hostel-coordinates";
import type L from "leaflet";
import { toLocalMediaPath } from "@/lib/utils";

interface Props {
    readonly data: CityHostelResponse;
    readonly initialAllHostels?: readonly CityHostel[];
}

const DEFAULT_FILTERS = {
    selectedArea: "All Areas",
    priceRange: "All Prices",
    sortBy: "Recommended",
    hostelType: "All Types",
    roomType: "All Room Types",
    sharingType: "All Sharing Types",
};

export default function CityClient({ data, initialAllHostels }: Props) {
    const router = useRouter();

    // All network hostels across all cities for map roaming (Airbnb style)
    const [allNetworkHostels, setAllNetworkHostels] = useState<readonly CityHostel[]>(() => {
        if (initialAllHostels && initialAllHostels.length > 0) {
            return initialAllHostels;
        }
        return data.results;
    });

    useEffect(() => {
        if (initialAllHostels && initialAllHostels.length > 0) {
            setAllNetworkHostels(initialAllHostels);
            return;
        }
        // Client-side fallback to ensure map always contains all hostels across India
        const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        fetch(`${baseUrl}/api/locations/cities/all/hostels/`)
            .then((res) => {
                if (res.ok) return res.json();
                return null;
            })
            .then((resData) => {
                if (resData?.results && Array.isArray(resData.results) && resData.results.length > 0) {
                    setAllNetworkHostels(resData.results);
                }
            })
            .catch((err) => {
                console.error("Failed to load all hostels for map:", err);
            });
    }, [initialAllHostels]);

    // Current city slug derived from data
    const currentCitySlug = data.city === "All Cities" ? "all" : data.city.toLowerCase();

    // Pending city slug (only navigates on Apply)
    const [pendingCitySlug, setPendingCitySlug] = useState(currentCitySlug);

    // Applied filters (what actually drives the results)
    const [appliedFilters, setAppliedFilters] = useState(DEFAULT_FILTERS);

    // Pending/draft filters (what the user is currently selecting)
    const [pendingFilters, setPendingFilters] = useState(DEFAULT_FILTERS);

    // Filter drawer & map interaction states
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [mobileView, setMobileView] = useState<"list" | "map">("list");
    const [hoveredHostelId, setHoveredHostelId] = useState<number | string | null>(null);

    const updatePending = useCallback((key: string, value: string) => {
        setPendingFilters((prev) => ({ ...prev, [key]: value }));
    }, []);

    const handleApplyFilters = useCallback(() => {
        // If city changed, navigate to the new city page
        if (pendingCitySlug !== currentCitySlug) {
            setIsFilterOpen(false);
            router.push(`/city/${pendingCitySlug}`);
            return;
        }
        setAppliedFilters({ ...pendingFilters });
        setIsFilterOpen(false);
    }, [pendingFilters, pendingCitySlug, currentCitySlug, router]);

    const handleFilterByMapBounds = useCallback((bounds: L.LatLngBounds) => {
        const pool = allNetworkHostels.length > 0 ? allNetworkHostels : data.results;
        const visibleHostels = pool.filter((hostel) => {
            const coords = getHostelCoordinates(hostel, hostel.city_name || data.city);
            return bounds.contains(coords);
        });
        if (visibleHostels.length > 0) {
            setSearchResults(visibleHostels);
            setCurrentPage(1);
        }
    }, [allNetworkHostels, data.results, data.city]);

    const handleResetFilters = useCallback(() => {
        setPendingCitySlug(currentCitySlug);
        setPendingFilters(DEFAULT_FILTERS);
        setAppliedFilters(DEFAULT_FILTERS);
    }, [currentCitySlug]);

    const CITIES = [
        { value: "all", label: "All Cities" },
        { value: "hyderabad", label: "Hyderabad" },
        { value: "bangalore", label: "Bangalore" },
        { value: "pune", label: "Pune" },
        { value: "mumbai", label: "Mumbai" },
        { value: "delhi", label: "Delhi" },
        { value: "chennai", label: "Chennai" },
        { value: "kolkata", label: "Kolkata" },
        { value: "ahmedabad", label: "Ahmedabad" },
    ];

    // Extract unique areas from results
    const areas = useMemo(() => {
        const allAreas = data.results
            .map((hostel) => hostel.area_name)
            .filter(Boolean) as string[];
        return ["All Areas", ...Array.from(new Set(allAreas)).sort()];
    }, [data.results]);

    // Extract unique hostel types from results
    const hostelTypes = useMemo(() => {
        const allTypes = data.results
            .map((hostel) => hostel.hostel_type)
            .filter(Boolean) as string[];
        return ["All Types", ...Array.from(new Set(allTypes))];
    }, [data.results]);

    // Check if pending filters differ from applied filters
    const hasUnappliedChanges = useMemo(() => {
        return pendingCitySlug !== currentCitySlug || JSON.stringify(pendingFilters) !== JSON.stringify(appliedFilters);
    }, [pendingFilters, appliedFilters, pendingCitySlug, currentCitySlug]);

    // Count active filters
    const activeFilterCount = useMemo(() => {
        return [
            appliedFilters.selectedArea !== "All Areas",
            appliedFilters.hostelType !== "All Types",
            appliedFilters.roomType !== "All Room Types",
            appliedFilters.sharingType !== "All Sharing Types",
            appliedFilters.priceRange !== "All Prices",
            appliedFilters.sortBy !== "Recommended",
        ].filter(Boolean).length;
    }, [appliedFilters]);

    // Search and loading states
    const [currentPage, setCurrentPage] = useState<number>(1);
    const itemsPerPage = 6;
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<readonly CityHostel[]>(data.results);
    const [isSearching, setIsSearching] = useState(false);

    // Inner search effect
    useEffect(() => {
        if (!searchQuery.trim() && appliedFilters.roomType === "All Room Types" && appliedFilters.sharingType === "All Sharing Types") {
            setSearchResults([...data.results]);
            setIsSearching(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsSearching(true);
            try {
                const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                const cityParam = `&city=${encodeURIComponent(data.city)}`;
                const typeParam = appliedFilters.hostelType !== "All Types" ? `&type=${encodeURIComponent(appliedFilters.hostelType)}` : "";
                const roomTypeParam = appliedFilters.roomType !== "All Room Types" ? `&room_type=${encodeURIComponent(appliedFilters.roomType)}` : "";
                const sharingParam = appliedFilters.sharingType !== "All Sharing Types" ? `&sharing=${encodeURIComponent(appliedFilters.sharingType)}` : "";

                const response = await fetch(`${baseUrl}/api/locations/inner-search/?q=${encodeURIComponent(searchQuery)}${cityParam}${typeParam}${roomTypeParam}${sharingParam}`);
                if (response.ok) {
                    const searchData = await response.json();
                    setSearchResults(searchData.results);
                }
            } catch (error) {
                console.error("Inner search failed:", error);
            } finally {
                setIsSearching(false);
            }
        }, 400);

        return () => clearTimeout(timer);
    }, [searchQuery, data.results, data.city, appliedFilters.hostelType, appliedFilters.roomType, appliedFilters.sharingType]);

    // Filter and sort results using APPLIED filters and searchResults
    const filteredAndSortedResults = useMemo(() => {
        let results = [...searchResults];

        // Filter by Area
        if (appliedFilters.selectedArea !== "All Areas") {
            results = results.filter((hostel) => hostel.area_name === appliedFilters.selectedArea);
        }

        // Filter by Hostel Type
        if (appliedFilters.hostelType !== "All Types") {
            results = results.filter((hostel) => hostel.hostel_type === appliedFilters.hostelType);
        }

        // Filter by PriceRange
        if (appliedFilters.priceRange !== "All Prices") {
            results = results.filter((hostel) => {
                const price = hostel.final_price ?? (Number(hostel.price) || 0);
                if (appliedFilters.priceRange === "Under ₹5000") return price < 5000;
                if (appliedFilters.priceRange === "₹5000 - ₹10000") return price >= 5000 && price <= 10000;
                if (appliedFilters.priceRange === "Above ₹10000") return price > 10000;
                return true;
            });
        }

        // Categorize results for sorting and statistics (Match Purity)
        const categorized = results.map(hostel => {
            const hasRoomFilter = appliedFilters.roomType !== "All Room Types";
            const hasSharingFilter = appliedFilters.sharingType !== "All Sharing Types";

            const matchesRoom = !hasRoomFilter ||
                hostel.room_types?.some((r: any) =>
                    appliedFilters.roomType === "AC" ? r.room_category === "AC" : r.room_category === "NON_AC"
                );

            const matchesSharing = !hasSharingFilter ||
                hostel.room_types?.some((r: any) => Number(r.sharing_type) === Number(appliedFilters.sharingType));

            if (!matchesRoom || !matchesSharing) return { hostel, matchType: 'none' as const };

            // Determine Purity: Pure if ALL rooms match the filter
            let allRoomsMatch = true;
            if (hasRoomFilter) {
                const pureRoom = hostel.room_types?.every((r: any) =>
                    appliedFilters.roomType === "AC" ? r.room_category === "AC" : r.room_category === "NON_AC"
                );
                if (!pureRoom) allRoomsMatch = false;
            }
            if (hasSharingFilter) {
                const pureSharing = hostel.room_types?.every((r: any) =>
                    Number(r.sharing_type) === Number(appliedFilters.sharingType)
                );
                if (!pureSharing) allRoomsMatch = false;
            }

            return { hostel, matchType: allRoomsMatch ? ('pure' as const) : ('mixed' as const) };
        }).filter(item => item.matchType !== 'none');

        // Sorting
        categorized.sort((a, b) => {
            // First priority: Pure Match vs Mixed Match (only if filters are active)
            const isFiltering = appliedFilters.roomType !== "All Room Types" || appliedFilters.sharingType !== "All Sharing Types";
            if (isFiltering && a.matchType !== b.matchType) {
                return a.matchType === 'pure' ? -1 : 1;
            }

            // Second priority: Verified/Discounted status
            const getPriority = (h: any) => {
                if (h.is_verified && h.is_discounted) return 1;
                if (h.is_verified) return 2;
                if (h.is_discounted) return 3;
                return 4;
            };

            const priorityA = getPriority(a.hostel);
            const priorityB = getPriority(b.hostel);

            if (priorityA !== priorityB) {
                return priorityA - priorityB;
            }

            if (appliedFilters.sortBy === "Price: Low to High") {
                return (a.hostel.final_price ?? (Number(a.hostel.price) || 0)) - (b.hostel.final_price ?? (Number(b.hostel.price) || 0));
            } else if (appliedFilters.sortBy === "Price: High to Low") {
                return (b.hostel.final_price ?? (Number(b.hostel.price) || 0)) - (a.hostel.final_price ?? (Number(a.hostel.price) || 0));
            } else if (appliedFilters.sortBy === "Highest Rated") {
                return b.hostel.rating - a.hostel.rating;
            }
            return 0;
        });

        const finalResults = categorized.map(i => i.hostel);
        const pureCount = categorized.filter(i => i.matchType === 'pure').length;
        const mixedCount = categorized.filter(i => i.matchType === 'mixed').length;

        return { results: finalResults, pureCount, mixedCount };
    }, [searchResults, appliedFilters]);

    const totalPages = Math.ceil(filteredAndSortedResults.results.length / itemsPerPage);

    const paginatedResults = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedResults.results.slice(start, start + itemsPerPage);
    }, [filteredAndSortedResults.results, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 150, behavior: "smooth" });
    };

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [appliedFilters, searchQuery]);

    return (
        <>
            <div className="mb-6 lg:mb-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm font-semibold text-[#10B981] mb-2 uppercase tracking-wider">
                            <MapPin className="w-4 h-4" />
                            {data.city}
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1E1B4B] tracking-tight">
                            Hostels in {data.city}
                        </h1>
                        <p className="text-slate-500 font-medium mt-1">
                            Showing {filteredAndSortedResults.results.length} {filteredAndSortedResults.results.length === 1 ? 'hostel' : 'hostels'}
                            {appliedFilters.roomType !== "All Room Types" || appliedFilters.sharingType !== "All Sharing Types" ? (
                                <span className="text-[#10B981] ml-1 font-semibold">
                                    ({filteredAndSortedResults.pureCount} only {
                                        appliedFilters.roomType !== "All Room Types" && appliedFilters.sharingType !== "All Sharing Types"
                                            ? `${appliedFilters.roomType} ${appliedFilters.sharingType}-Sharing`
                                            : appliedFilters.roomType !== "All Room Types"
                                                ? appliedFilters.roomType
                                                : `${appliedFilters.sharingType}-Sharing`
                                    }, {filteredAndSortedResults.mixedCount} Mixed)
                                </span>
                            ) : null}
                            {appliedFilters.selectedArea !== "All Areas" && ` in ${appliedFilters.selectedArea}`}
                        </p>
                    </div>

                    <div className="flex-1 max-w-2xl w-full flex items-center gap-3">
                        <div className="relative group flex-1">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#10B981] transition-colors pointer-events-none">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search by name, area or address..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-11 py-3.5 rounded-[1.25rem] border border-slate-200 bg-white shadow-sm focus:ring-4 focus:ring-[#10B981]/10 focus:border-[#10B981] focus:outline-none text-slate-900 font-medium placeholder:text-slate-400 transition-all text-sm md:text-base"
                            />
                            {isSearching && (
                                <div className="absolute right-11 top-1/2 -translate-y-1/2">
                                    <div className="w-4 h-4 border-2 border-slate-200 border-t-[#10B981] rounded-full animate-spin"></div>
                                </div>
                            )}
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                                >
                                    <X size={18} />
                                </button>
                            )}
                        </div>

                        {/* Top Filters Button (Beside Search - Airbnb style Popup Modal) */}
                        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={`h-[52px] px-4 sm:px-5 rounded-[1.25rem] border font-bold text-sm shadow-sm transition-all flex items-center gap-2 shrink-0 active:scale-95 ${activeFilterCount > 0
                                            ? "border-[#10B981] bg-emerald-50 text-emerald-950 hover:bg-emerald-100/80 hover:text-emerald-950"
                                            : "border-slate-200 bg-white hover:bg-slate-100 hover:border-slate-300 text-slate-800 hover:text-slate-900"
                                        }`}
                                >
                                    <SlidersHorizontal className={`w-4 h-4 transition-colors ${activeFilterCount > 0 ? "text-[#10B981]" : "text-slate-700"}`} />
                                    <span className="text-inherit">Filters</span>
                                    {activeFilterCount > 0 && (
                                        <span className="flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-[#10B981] text-white text-xs font-bold">
                                            {activeFilterCount}
                                        </span>
                                    )}
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="w-[95vw] sm:max-w-[440px] max-h-[85vh] !p-0 overflow-hidden flex flex-col rounded-2xl border border-slate-200 shadow-2xl bg-white">
                                <DialogHeader className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-100 px-5 py-3">
                                    <div className="flex justify-between items-center pr-8">
                                        <DialogTitle className="flex items-center gap-2 text-base font-bold text-[#1E1B4B]">
                                            <div className="p-1.5 rounded-lg bg-emerald-50 text-[#10B981]">
                                                <SlidersHorizontal className="w-4 h-4" strokeWidth={2.5} />
                                            </div>
                                            <span>Filters</span>
                                        </DialogTitle>
                                        {activeFilterCount > 0 && (
                                            <button
                                                type="button"
                                                onClick={handleResetFilters}
                                                className="text-[11px] font-bold text-[#10B981] hover:text-[#059669] transition-colors bg-emerald-50 hover:bg-emerald-100/70 px-2.5 py-1 rounded-md active:scale-95"
                                            >
                                                Reset all
                                            </button>
                                        )}
                                    </div>
                                </DialogHeader>

                                <div className="overflow-y-auto flex-1 px-5 py-3.5 space-y-3">
                                    {/* City & Area in 2 cols */}
                                    <div className={areas.length > 1 ? "grid grid-cols-2 gap-2.5" : "space-y-1"}>
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">City</Label>
                                            <Select value={pendingCitySlug} onValueChange={setPendingCitySlug}>
                                                <SelectTrigger className="w-full h-9 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-[10001]">
                                                    {CITIES.map((city) => (
                                                        <SelectItem key={city.value} value={city.value} className="text-xs">{city.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {areas.length > 1 && (
                                            <div className="space-y-1">
                                                <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Area</Label>
                                                <Select value={pendingFilters.selectedArea} onValueChange={(v) => updatePending("selectedArea", v)}>
                                                    <SelectTrigger className="w-full h-9 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent className="z-[10001]">
                                                        {areas.map((area) => <SelectItem key={area} value={area} className="text-xs">{area}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}
                                    </div>

                                    {/* Hostel Type & Budget in 2 cols */}
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Hostel Type</Label>
                                            <Select value={pendingFilters.hostelType} onValueChange={(v) => updatePending("hostelType", v)}>
                                                <SelectTrigger className="w-full h-9 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-[10001]">
                                                    {hostelTypes.map((type) => (
                                                        <SelectItem key={type} value={type} className="text-xs">
                                                            {type === "All Types" ? type : type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Budget</Label>
                                            <Select value={pendingFilters.priceRange} onValueChange={(v) => updatePending("priceRange", v)}>
                                                <SelectTrigger className="w-full h-9 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-[10001]">
                                                    <SelectItem value="All Prices" className="text-xs">All Prices</SelectItem>
                                                    <SelectItem value="Under ₹5000" className="text-xs">Under ₹5000</SelectItem>
                                                    <SelectItem value="₹5000 - ₹10000" className="text-xs">₹5000 - ₹10000</SelectItem>
                                                    <SelectItem value="Above ₹10000" className="text-xs">Above ₹10000</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Room Type & Sharing in 2 cols */}
                                    <div className="grid grid-cols-2 gap-2.5">
                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Room Type</Label>
                                            <Select value={pendingFilters.roomType} onValueChange={(v) => updatePending("roomType", v)}>
                                                <SelectTrigger className="w-full h-9 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-[10001]">
                                                    <SelectItem value="All Room Types" className="text-xs">All Types</SelectItem>
                                                    <SelectItem value="AC" className="text-xs">AC</SelectItem>
                                                    <SelectItem value="Non-AC" className="text-xs">Non-AC</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-1">
                                            <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Sharing</Label>
                                            <Select value={pendingFilters.sharingType} onValueChange={(v) => updatePending("sharingType", v)}>
                                                <SelectTrigger className="w-full h-9 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent className="z-[10001]">
                                                    <SelectItem value="All Sharing Types" className="text-xs">All</SelectItem>
                                                    <SelectItem value="0" className="text-xs">Private</SelectItem>
                                                    <SelectItem value="1" className="text-xs">1 Sharing</SelectItem>
                                                    <SelectItem value="2" className="text-xs">2 Sharing</SelectItem>
                                                    <SelectItem value="3" className="text-xs">3 Sharing</SelectItem>
                                                    <SelectItem value="4" className="text-xs">4 Sharing</SelectItem>
                                                    <SelectItem value="5" className="text-xs">5 Sharing</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Sort Results By */}
                                    <div className="space-y-1">
                                        <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-0.5">Sort Results By</Label>
                                        <Select value={pendingFilters.sortBy} onValueChange={(v) => updatePending("sortBy", v)}>
                                            <SelectTrigger className="w-full h-9 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-800 transition-colors">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="z-[10001]">
                                                <SelectItem value="Recommended" className="text-xs">Recommended</SelectItem>
                                                <SelectItem value="Price: Low to High" className="text-xs">Price: Low to High</SelectItem>
                                                <SelectItem value="Price: High to Low" className="text-xs">Price: High to Low</SelectItem>
                                                <SelectItem value="Highest Rated" className="text-xs">Highest Rated</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Sticky bottom action buttons */}
                                <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-100 px-5 py-3 flex items-center justify-between gap-3 z-20">
                                    <button
                                        type="button"
                                        onClick={handleResetFilters}
                                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                    >
                                        Clear all
                                    </button>
                                    <Button
                                        type="button"
                                        onClick={handleApplyFilters}
                                        className="bg-[#312E81] hover:bg-[#1E1B4B] text-white px-5 h-9 rounded-lg text-xs font-bold shadow-md shadow-indigo-950/20 active:scale-[0.98] transition-all flex items-center gap-1.5"
                                    >
                                        <span>Show Hostels</span>
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            </div>

            {/* Main Split Layout: Listings (Left) + Interactive Map (Right) - Thinner map with generous spacing */}
            <div className="grid grid-cols-12 gap-6 lg:gap-10 xl:gap-12 w-full items-start">
                {/* Listings Section (Left - 7 Cols on desktop) */}
                <div className={`col-span-12 lg:col-span-7 flex flex-col ${mobileView === "map" ? "hidden lg:flex" : "flex"}`}>
                    {filteredAndSortedResults.results.length === 0 ? (
                        <div className="bg-white p-20 rounded-[22px] text-center border border-slate-100 shadow-sm w-full">
                            <h3 className="text-2xl font-bold text-slate-900">No hostels found</h3>
                            <p className="text-slate-500 mt-3">
                                We couldn&apos;t find any active hostels matching your filters.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-6 w-full min-h-[600px]">
                            {paginatedResults.map((hostel) => (
                                <div
                                    key={hostel.id}
                                    id={`hostel-card-${hostel.id}`}
                                    onMouseEnter={() => setHoveredHostelId(hostel.id)}
                                    onMouseLeave={() => setHoveredHostelId(null)}
                                    className="transition-transform duration-150"
                                >
                                    <HostelCard
                                        id={String(hostel.id)}
                                        slug={hostel.slug}
                                        name={hostel.name}
                                        location={hostel.area_name ? `${hostel.area_name}, ${hostel.city_name}` : hostel.city_name}
                                        price={hostel.final_price ?? (Number(hostel.price) || 0)}
                                        originalPrice={hostel.is_discounted ? Number(hostel.price) || 0 : undefined}
                                        isDiscounted={!!hostel.is_discounted}
                                        discountPercentage={hostel.discount_percentage ? Number(hostel.discount_percentage) : undefined}
                                        rating={hostel.rating}
                                        reviewsCount={0}
                                        image={toLocalMediaPath(hostel.thumbnail)}
                                        gender={hostel.hostel_type || "coed"}
                                        features={[]}
                                        distance=""
                                        isFeatured={false}
                                        isVerified={!!hostel.is_verified}
                                        isApproved={!!hostel.is_approved}
                                        availableRooms={hostel.available_rooms}
                                    />
                                </div>
                            ))}

                            {totalPages > 1 && (
                                <nav className="flex items-center justify-center gap-2 mt-10 mb-6 w-full" aria-label="Pagination">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-xl border-slate-200 text-slate-600 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-50 h-10 px-4 font-semibold transition-all"
                                    >
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-1.5 mx-2">
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                            if (
                                                page === 1 ||
                                                page === totalPages ||
                                                (page >= currentPage - 1 && page <= currentPage + 1)
                                            ) {
                                                return (
                                                    <Button
                                                        key={page}
                                                        variant={currentPage === page ? "default" : "outline"}
                                                        size="icon"
                                                        onClick={() => handlePageChange(page)}
                                                        className={`w-10 h-10 rounded-xl font-bold transition-all ${currentPage === page
                                                            ? "bg-[#10B981] hover:bg-[#059669] text-white shadow-md shadow-[#10B981]/20"
                                                            : "border-slate-200 text-slate-600 hover:border-[#10B981] hover:bg-emerald-50 hover:text-[#10B981]"
                                                            }`}
                                                    >
                                                        {page}
                                                    </Button>
                                                );
                                            } else if (
                                                (page === currentPage - 2 && page > 1) ||
                                                (page === currentPage + 2 && page < totalPages)
                                            ) {
                                                return <span key={page} className="text-slate-400 font-bold px-1 select-none">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                        disabled={currentPage === totalPages}
                                        className="rounded-xl border-slate-200 text-slate-600 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-50 h-10 px-4 font-semibold transition-all"
                                    >
                                        Next
                                    </Button>
                                </nav>
                            )}
                        </div>
                    )}
                </div>

                {/* Map Section (Right - 5 Cols on desktop, thinner with space from cards) */}
                <div className={`col-span-12 lg:col-span-5 lg:self-start lg:sticky lg:top-[96px] ${mobileView === "map" ? "block" : "hidden lg:block"}`}>
                    <div className="h-[calc(100vh-120px)] min-h-[580px] w-full rounded-[24px] overflow-hidden border border-slate-200 shadow-sm bg-slate-50">
                        <HostelListingMap
                            key={`${data.city}-${appliedFilters.selectedArea}`}
                            hostels={filteredAndSortedResults.results}
                            allHostels={allNetworkHostels}
                            cityName={data.city}
                            hoveredHostelId={hoveredHostelId}
                            onMarkerClick={(hostel) => {
                                setHoveredHostelId(hostel.id);
                                const el = document.getElementById(`hostel-card-${hostel.id}`);
                                if (el) {
                                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                                }
                            }}
                            onSearchThisArea={handleFilterByMapBounds}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Floating Toggle for Map / List (like Airbnb) */}
            <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
                <button
                    onClick={() => setMobileView(mobileView === "list" ? "map" : "list")}
                    className="flex items-center gap-2 bg-[#0F172A] hover:bg-black text-white px-5 py-3 rounded-full shadow-2xl font-bold text-sm tracking-wide active:scale-95 transition-all border border-slate-700/50"
                >
                    {mobileView === "list" ? (
                        <>
                            <MapPin className="w-4 h-4 text-emerald-400" />
                            <span>Show Map</span>
                        </>
                    ) : (
                        <>
                            <ListIcon className="w-4 h-4 text-emerald-400" />
                            <span>Show List</span>
                        </>
                    )}
                </button>
            </div>
        </>
    );
}
