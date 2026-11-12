"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    BedDouble,
    Users,
    Sparkles,
    Pencil,
    Trash2,
    Plus,
    Search,
    X,
    Building2,
    Palmtree,
    Coffee,
    Wind,
    ShieldCheck,
    Maximize2,
    ImageIcon,
    CheckCircle2,
    AlertCircle,
    SlidersHorizontal,
    RefreshCw,
    TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toLocalMediaPath } from "@/lib/utils";

export interface RoomListItem {
    id: string | number;
    propertyId: string;
    propertyName: string;
    propertyType: "hotel" | "vacation_rental";
    propertyLocation?: string;
    propertySlug?: string;
    name: string;
    category: string;
    categoryDisplay?: string;
    bedType: string;
    bedTypeDisplay?: string;
    maxAdults: number;
    maxChildren: number;
    maxOccupancy: number;
    basePricePerNight: number;
    weekendPricePerNight?: number | null;
    taxPercentage?: number;
    totalRooms: number;
    roomsAvailable: number;
    roomSizeSqft?: number | null;
    hasBalcony?: boolean;
    hasView?: boolean;
    includesBreakfast?: boolean;
    isRefundable?: boolean;
    isAvailable: boolean;
    description?: string;
    features?: string[];
    images?: Array<{
        id: number;
        image: string;
        altText?: string;
        isPrimary?: boolean;
    }>;
    coverImage?: string;
    raw?: any;
}

interface RoomListViewProps {
    rooms: RoomListItem[];
    properties: Array<{ id: string; name: string; type: "hotel" | "vacation_rental" }>;
    selectedPropertyId: string;
    onSelectProperty: (propertyId: string) => void;
    onAddRoom: () => void;
    onEditRoom: (room: RoomListItem) => void;
    onDeleteRoom: (room: RoomListItem) => void;
    isLoading?: boolean;
    onRefresh?: () => void;
    isRefetching?: boolean;
    propertyType: "hotel" | "vacation_rental";
}

export default function RoomListView({
    rooms,
    properties,
    selectedPropertyId,
    onSelectProperty,
    onAddRoom,
    onEditRoom,
    onDeleteRoom,
    isLoading = false,
    onRefresh,
    isRefetching = false,
    propertyType,
}: RoomListViewProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [selectedBedType, setSelectedBedType] = useState<string>("all");
    const [availabilityFilter, setAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");

    // Filter rooms based on controls
    const filteredRooms = rooms.filter((r) => {
        // Property filter
        if (selectedPropertyId !== "all" && r.propertyId !== selectedPropertyId) {
            return false;
        }

        // Search text
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const nameMatch = r.name.toLowerCase().includes(query);
            const propMatch = r.propertyName.toLowerCase().includes(query);
            const catMatch = (r.categoryDisplay || r.category || "").toLowerCase().includes(query);
            const bedMatch = (r.bedTypeDisplay || r.bedType || "").toLowerCase().includes(query);
            if (!nameMatch && !propMatch && !catMatch && !bedMatch) return false;
        }

        // Category filter
        if (selectedCategory !== "all" && r.category !== selectedCategory) {
            return false;
        }

        // Bed type filter
        if (selectedBedType !== "all" && r.bedType !== selectedBedType) {
            return false;
        }

        // Availability filter
        if (availabilityFilter === "available" && !r.isAvailable) return false;
        if (availabilityFilter === "unavailable" && r.isAvailable) return false;

        return true;
    });

    // KPI Metrics calculation
    const totalCategoriesCount = filteredRooms.length;
    const totalInventoryUnits = filteredRooms.reduce((acc, r) => acc + (r.totalRooms || 1), 0);
    const totalAvailableUnits = filteredRooms.reduce((acc, r) => acc + (r.isAvailable ? (r.roomsAvailable ?? r.totalRooms ?? 1) : 0), 0);
    const avgDailyRate = filteredRooms.length > 0
        ? Math.round(filteredRooms.reduce((sum, r) => sum + r.basePricePerNight, 0) / filteredRooms.length)
        : 0;
    const totalGuestCapacity = filteredRooms.reduce((sum, r) => sum + ((r.maxOccupancy || r.maxAdults) * (r.totalRooms || 1)), 0);

    return (
        <div className="space-y-6">
            {/* KPI Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border border-border/60 bg-card shadow-xs">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Room Variants
                            </p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
                                {totalCategoriesCount}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Configured categories</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#312E81] dark:bg-indigo-950/70 dark:text-indigo-300 flex items-center justify-center shrink-0">
                            <BedDouble size={20} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/60 bg-card shadow-xs">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Inventory Units
                            </p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
                                {totalInventoryUnits}
                            </p>
                            <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                                {totalAvailableUnits} units available
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-400 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={20} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/60 bg-card shadow-xs">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Average Nightly Rate
                            </p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
                                ₹{avgDailyRate.toLocaleString("en-IN")}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Portfolio ADR</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-400 flex items-center justify-center shrink-0">
                            <TrendingUp size={20} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border border-border/60 bg-card shadow-xs">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Capacity
                            </p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-foreground tabular-nums">
                                {totalGuestCapacity}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Max simultaneous guests</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-700 dark:bg-sky-950/70 dark:text-sky-400 flex items-center justify-center shrink-0">
                            <Users size={20} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter and Control Bar */}
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 p-4 rounded-xl bg-card border border-border/70 shadow-2xs">
                {/* Left: Property Selector & Search */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
                    {/* Property Selector */}
                    <div className="w-full sm:w-[240px]">
                        <Select value={selectedPropertyId} onValueChange={onSelectProperty}>
                            <SelectTrigger className="h-9 text-xs bg-background font-medium">
                                <SelectValue placeholder="All Properties" />
                            </SelectTrigger>
                            <SelectContent className="max-h-60">
                                <SelectItem value="all">
                                    All {propertyType === "hotel" ? "Hotels" : "Vacation Rentals"} ({properties.length})
                                </SelectItem>
                                {properties.map((p) => (
                                    <SelectItem key={p.id} value={p.id}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search Input */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Search room name, bed type, category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 text-xs h-9 bg-background"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Right: Filters & Add Room Button */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Category Filter */}
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-9 w-[130px] text-xs bg-background">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            <SelectItem value="standard">Standard</SelectItem>
                            <SelectItem value="deluxe">Deluxe</SelectItem>
                            <SelectItem value="executive_suite">Executive Suite</SelectItem>
                            <SelectItem value="family_suite">Family Suite</SelectItem>
                            <SelectItem value="presidential_suite">Presidential</SelectItem>
                            <SelectItem value="studio">Studio</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Bed Type Filter */}
                    <Select value={selectedBedType} onValueChange={setSelectedBedType}>
                        <SelectTrigger className="h-9 w-[120px] text-xs bg-background">
                            <SelectValue placeholder="Bed Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Beds</SelectItem>
                            <SelectItem value="king">King Bed</SelectItem>
                            <SelectItem value="queen">Queen Bed</SelectItem>
                            <SelectItem value="twin">Twin Beds</SelectItem>
                            <SelectItem value="double">Double Beds</SelectItem>
                        </SelectContent>
                    </Select>

                    {onRefresh && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={isRefetching}
                            className="h-9 px-2.5 text-xs"
                            title="Refresh rooms"
                        >
                            <RefreshCw size={13} className={isRefetching ? "animate-spin" : ""} />
                        </Button>
                    )}

                    <Button
                        size="sm"
                        onClick={onAddRoom}
                        className="h-9 bg-[#312E81] hover:bg-[#252269] text-white text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
                    >
                        <Plus size={14} />
                        <span>Add Room Type</span>
                    </Button>
                </div>
            </div>

            {/* Room Cards Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border p-5 space-y-3 animate-pulse">
                            <div className="h-44 bg-muted rounded-xl" />
                            <div className="h-5 bg-muted rounded w-2/3" />
                            <div className="h-4 bg-muted rounded w-1/2" />
                            <div className="h-10 bg-muted rounded" />
                        </Card>
                    ))}
                </div>
            ) : filteredRooms.length === 0 ? (
                <Card className="border border-dashed p-10 sm:p-14 text-center bg-card">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-[#312E81] dark:bg-indigo-950/70 dark:text-indigo-300 flex items-center justify-center mx-auto">
                            <BedDouble size={28} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base sm:text-lg font-bold text-foreground">
                                {searchQuery || selectedCategory !== "all" || selectedBedType !== "all"
                                    ? "No rooms match your filter criteria"
                                    : "No room types added yet"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {searchQuery || selectedCategory !== "all" || selectedBedType !== "all"
                                    ? "Try clearing your search query or selecting a different filter."
                                    : "Create your first room type to begin accepting guest reservations for this property."}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={onAddRoom}
                            className="bg-[#312E81] hover:bg-[#252269] text-white text-xs font-semibold gap-1.5 shadow-xs cursor-pointer"
                        >
                            <Plus size={14} />
                            <span>Add First Room Type</span>
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredRooms.map((room) => {
                        const coverImg = room.coverImage || (room.images && room.images[0]?.image);
                        const coverUrl = coverImg ? toLocalMediaPath(coverImg) || coverImg : null;
                        const photosCount = room.images?.length || 0;

                        return (
                            <Card
                                key={room.id}
                                className="p-0 py-0 gap-0 border border-border/80 bg-card rounded-xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                            >
                                {/* Top Room Photo Container */}
                                <div className="relative h-44 w-full overflow-hidden bg-slate-950">
                                    {coverUrl ? (
                                        <img
                                            src={coverUrl}
                                            alt={room.name}
                                            className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                target.src = "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80";
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-1.5 bg-slate-900">
                                            <BedDouble size={30} className="text-[#312E81] dark:text-indigo-400" />
                                            <span className="text-[11px] font-semibold text-slate-300">
                                                No Room Photo
                                            </span>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

                                    {/* Availability Status Badge */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                        <span
                                            className={cn(
                                                "text-[10px] px-2.5 py-0.5 font-bold tracking-wider uppercase rounded-md shadow-xs text-white",
                                                room.isAvailable
                                                    ? "bg-emerald-600"
                                                    : "bg-slate-700"
                                            )}
                                        >
                                            {room.isAvailable ? "Available" : "Inactive"}
                                        </span>
                                        {room.categoryDisplay && (
                                            <span className="text-[10px] px-2 py-0.5 font-semibold rounded-md bg-black/60 backdrop-blur-xs text-white border border-white/20">
                                                {room.categoryDisplay}
                                            </span>
                                        )}
                                    </div>

                                    {/* Photos Count Badge */}
                                    <div className="absolute top-3 right-3">
                                        <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold gap-1 px-2.5 py-1 rounded-md flex items-center shadow-xs">
                                            <ImageIcon size={11} />
                                            {photosCount} Photo{photosCount === 1 ? "" : "s"}
                                        </span>
                                    </div>
                                </div>

                                {/* Room Content Body */}
                                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        {/* Property Association Line */}
                                        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground truncate font-medium">
                                            {room.propertyType === "hotel" ? (
                                                <Building2 size={12} className="text-[#312E81] shrink-0" />
                                            ) : (
                                                <Palmtree size={12} className="text-[#312E81] shrink-0" />
                                            )}
                                            <span className="truncate">{room.propertyName}</span>
                                        </div>

                                        {/* Room Name */}
                                        <h3
                                            className="text-base font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-[#312E81] transition-colors"
                                            title={room.name}
                                        >
                                            {room.name}
                                        </h3>

                                        {/* Specifications Pills */}
                                        <div className="grid grid-cols-2 gap-2 py-2 px-2.5 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px]">
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                <BedDouble size={13} className="text-[#312E81] shrink-0" />
                                                <span className="font-semibold truncate">
                                                    {room.bedTypeDisplay || "1 King Bed"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                <Users size={13} className="text-[#312E81] shrink-0" />
                                                <span className="font-semibold truncate">
                                                    Max {room.maxOccupancy || room.maxAdults} Guests
                                                </span>
                                            </div>
                                        </div>

                                        {/* Perks / Inclusions Tags */}
                                        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
                                            {room.includesBreakfast && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold border border-amber-500/20">
                                                    <Coffee size={10} /> Breakfast
                                                </span>
                                            )}
                                            {room.hasBalcony && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-700 dark:text-sky-400 font-semibold border border-sky-500/20">
                                                    <Wind size={10} /> Balcony
                                                </span>
                                            )}
                                            {room.roomSizeSqft && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 font-medium border border-slate-200">
                                                    <Maximize2 size={10} /> {room.roomSizeSqft} sq ft
                                                </span>
                                            )}
                                            {room.isRefundable && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                                                    <ShieldCheck size={10} /> Refundable
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Bottom: Pricing & Actions */}
                                    <div className="space-y-2.5 pt-1 border-t border-border/60">
                                        <div className="flex items-end justify-between">
                                            <div>
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                                                    Nightly Tariff
                                                </span>
                                                <div className="flex items-baseline gap-1 mt-0.5">
                                                    <span className="text-lg font-extrabold text-[#312E81] dark:text-indigo-400 tabular-nums">
                                                        ₹{room.basePricePerNight.toLocaleString("en-IN")}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground font-normal">
                                                        / night
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                                                    {room.totalRooms} Units Total
                                                </span>
                                                <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                                                    {room.roomsAvailable} Available
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons Row */}
                                        <div className="flex items-center justify-between gap-2 pt-2 border-t border-border/60">
                                            <Button
                                                size="sm"
                                                onClick={() => onEditRoom(room)}
                                                className="h-8 text-xs font-semibold gap-1.5 flex-1 bg-[#312E81] text-white hover:bg-[#1E1B4B] border border-[#312E81] shadow-2xs rounded-md cursor-pointer transition-colors"
                                            >
                                                <Pencil size={12} className="text-white" />
                                                <span>Edit Room Details</span>
                                            </Button>

                                            <Button
                                                size="icon"
                                                onClick={() => onDeleteRoom(room)}
                                                className="w-8 h-8 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-600 hover:text-white rounded-md border border-rose-200 dark:border-rose-900 cursor-pointer flex items-center justify-center transition-colors shrink-0"
                                                title="Delete Room Type"
                                            >
                                                <Trash2 size={13} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

