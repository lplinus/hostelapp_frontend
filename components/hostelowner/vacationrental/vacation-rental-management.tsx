"use client";

import { cn } from "@/lib/utils";
import {
    Palmtree, Plus, Search, RefreshCw,
    BedDouble, CheckCircle2, Zap, DollarSign,
    Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import RoomsUnitsTab from "@/components/hostelowner/hostel/hostelrooms/rooms-units/rooms-units-tab";
import { CATEGORIES } from "./vacation-rental-types";
import { useVacationRentalManagement } from "./vacation-rental-hooks";
import VacationRentalFormHeader from "./vacation-rental-form-header";
import VacationRentalFormBasic from "./vacation-rental-form-basic";
import VacationRentalFormLocation from "./vacation-rental-form-location";
import VacationRentalFormPricing from "./vacation-rental-form-pricing";
import VacationRentalFormDetails from "./vacation-rental-form-details";
import VacationRentalPropertyCard from "./vacation-rental-property-card";
import VacationRentalPhotoModal from "./vacation-rental-photo-modal";

export interface VacationRentalManagementProps {
    activeTab?: "properties" | "rooms";
    onTabChange?: (tab: "properties" | "rooms") => void;
    hideSubTabs?: boolean;
}

export default function VacationRentalManagement({
    activeTab: externalActiveTab, onTabChange, hideSubTabs = false,
}: VacationRentalManagementProps = {}) {
    const v = useVacationRentalManagement();
    const activeTab = externalActiveTab !== undefined ? externalActiveTab : v.internalActiveTab;
    const setActiveTab = (tab: "properties" | "rooms") => {
        v.setInternalActiveTab(tab);
        if (onTabChange) onTabChange(tab);
    };

    // ─── FULL-PAGE FORM VIEW ─────────────────────────────────────────────────
    if (v.isCreating) {
        return (
            <div className="space-y-6 animate-in fade-in duration-200 pb-16">
                <VacationRentalFormHeader
                    editingRental={v.editingRental} setIsCreating={v.setIsCreating}
                    setEditingRental={v.setEditingRental} resetForm={v.resetForm}
                    handleSubmit={v.handleSubmit} rentalMutation={v.rentalMutation}
                />
                <form onSubmit={v.handleSubmit} className="space-y-6">
                    <VacationRentalFormBasic formData={v.formData} setFormData={v.setFormData} />
                    <VacationRentalFormLocation formData={v.formData} setFormData={v.setFormData} cities={v.cities} filteredAreas={v.filteredAreas} />
                    <VacationRentalFormPricing formData={v.formData} setFormData={v.setFormData} />
                    <VacationRentalFormDetails
                        formData={v.formData} setFormData={v.setFormData}
                        amenitiesList={v.amenitiesList} editingRental={v.editingRental}
                        formImagePreviews={v.formImagePreviews}
                        handleFormImageSelect={v.handleFormImageSelect}
                        removeFormImage={v.removeFormImage}
                        handleDeletePhoto={v.handleDeletePhoto}
                        setIsCreating={v.setIsCreating} setEditingRental={v.setEditingRental}
                        resetForm={v.resetForm} rentalMutation={v.rentalMutation}
                        formImageFiles={v.formImageFiles}
                    />
                </form>
            </div>
        );
    }

    // ─── INVENTORY LIST VIEW ────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* 1. HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 bg-card border border-border/80 rounded-lg p-4 sm:p-4.5 shadow-2xs">
                <div className="space-y-0.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Palmtree size={12} /><span>Vacation Rental Portfolio</span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Vacation Rentals Inventory</h1>
                    <p className="text-xs text-muted-foreground">Register and manage your private villas, holiday cottages, beach havens, and homestays.</p>
                </div>
                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <Button size="sm" onClick={() => v.refetch()} disabled={v.isRefetching} className="gap-1.5 text-xs font-semibold rounded-md bg-[#312E81] text-white hover:bg-[#1E1B4B] border border-[#312E81] shadow-2xs cursor-pointer transition-colors h-8 px-3">
                        <RefreshCw size={12} className={v.isRefetching ? "animate-spin text-white" : "text-white"} /><span>Refresh</span>
                    </Button>
                    <Button size="sm" onClick={() => { v.resetForm(); v.setEditingRental(null); v.setIsCreating(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-[#312E81] hover:bg-[#1E1B4B] text-white gap-1.5 text-xs font-semibold rounded-md shadow-2xs px-3.5 h-8 cursor-pointer border border-[#312E81] transition-colors">
                        <Plus size={14} /><span>Add Vacation Rental</span>
                    </Button>
                </div>
            </div>

            {/* Sub-tab Navigation */}
            {!hideSubTabs && (
                <div className="flex items-center justify-between border-b border-border/80 pb-3">
                    <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/80 shadow-2xs">
                        <button type="button" onClick={() => setActiveTab("properties")} className={cn("flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer", activeTab === "properties" ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border" : "text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800")}>
                            <Palmtree size={15} className={activeTab === "properties" ? "text-[#312E81] dark:text-indigo-400" : ""} />
                            <span>Vacation Properties</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5 rounded-md font-bold">{v.isMounted ? v.rentals.length : 0}</Badge>
                        </button>
                        <button type="button" onClick={() => setActiveTab("rooms")} className={cn("flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer", activeTab === "rooms" ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border" : "text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800")}>
                            <BedDouble size={15} className={activeTab === "rooms" ? "text-[#312E81] dark:text-indigo-400" : ""} />
                            <span>Rooms & Units</span>
                            <Badge className="text-[10px] px-1.5 py-0.5 rounded-md font-bold bg-[#312E81] text-white">{v.isMounted ? v.rentals.length : 0}</Badge>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "rooms" ? (
                <RoomsUnitsTab propertyType="vacation_rental" vacationRentals={v.rentals} initialSelectedPropertyId={v.selectedRentalForRooms} onRefresh={() => v.refetch()} isRefetching={v.isRefetching} />
            ) : (
                <>
                    {/* 2. KPI STATS CARDS */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                        <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                            <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Total Properties</p>
                                    <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums leading-none">{v.isMounted ? v.totalProperties : 0}</p>
                                    <p className="text-[10px] text-muted-foreground/80 truncate">Registered</p>
                                </div>
                                <div className="w-8 h-8 rounded-md bg-indigo-50 dark:bg-indigo-950/50 text-[#312E81] dark:text-indigo-300 flex items-center justify-center shrink-0"><Palmtree size={15} /></div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                            <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Active Listings</p>
                                    <p className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">{v.isMounted ? v.activeListings : 0}</p>
                                    <p className="text-[10px] text-muted-foreground/80 truncate">Online stays</p>
                                </div>
                                <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0"><CheckCircle2 size={15} /></div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                            <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Instant Bookable</p>
                                    <p className="text-lg sm:text-xl font-bold tracking-tight text-indigo-600 dark:text-indigo-400 tabular-nums leading-none">{v.isMounted ? v.instantBookCount : 0}</p>
                                    <p className="text-[10px] text-muted-foreground/80 truncate">Instant checkout</p>
                                </div>
                                <div className="w-8 h-8 rounded-md bg-indigo-500/10 text-indigo-600 flex items-center justify-center shrink-0"><Zap size={15} /></div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                            <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Avg. Nightly Rate</p>
                                    <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums leading-none">{v.isMounted ? `₹${v.avgRate.toLocaleString("en-IN")}` : "₹0"}</p>
                                    <p className="text-[10px] text-muted-foreground/80 truncate">Per night tariff</p>
                                </div>
                                <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0"><DollarSign size={15} /></div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* 3. SEARCH & FILTERS BAR */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-2xs">
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search rentals by title, address, or location..." value={v.searchQuery} onChange={(e) => v.setSearchQuery(e.target.value)} className="pl-9 h-9 text-xs" />
                        </div>
                        <div className="flex items-center gap-2">
                            <Select value={v.selectedCityId} onValueChange={v.setSelectedCityId}>
                                <SelectTrigger className="h-9 text-xs w-[140px] sm:w-[160px]"><SelectValue placeholder="All Cities" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Cities</SelectItem>
                                    {v.cities.map((c) => (<SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                            <Select value={v.selectedCategory} onValueChange={v.setSelectedCategory}>
                                <SelectTrigger className="h-9 text-xs w-[140px] sm:w-[160px]"><SelectValue placeholder="All Categories" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {CATEGORIES.map((cat) => (<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* 4. PROPERTIES GRID */}
                    {!v.isMounted || v.isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {[1, 2, 3].map((i) => (<Card key={i} className="overflow-hidden border shadow-xs"><Skeleton className="h-48 w-full" /><div className="p-4 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /><Skeleton className="h-8 w-full mt-4" /></div></Card>))}
                        </div>
                    ) : v.filteredRentals.length === 0 ? (
                        <Card className="border border-dashed p-12 text-center shadow-none">
                            <div className="max-w-md mx-auto space-y-4">
                                <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#312E81] flex items-center justify-center mx-auto shadow-2xs"><Palmtree size={32} /></div>
                                <div className="space-y-1">
                                    <h3 className="text-lg font-bold text-foreground">No vacation rentals found</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {v.searchQuery || v.selectedCityId !== "all" || v.selectedCategory !== "all"
                                            ? "No properties match your current search and filter criteria."
                                            : "You haven't listed any vacation rentals yet. Register your first villa or stay to start receiving guest bookings."}
                                    </p>
                                </div>
                                <Button onClick={() => { v.resetForm(); v.setEditingRental(null); v.setIsCreating(true); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="bg-[#1E1B4B] hover:bg-[#312E81] text-white gap-2 text-xs font-semibold rounded-xl px-5 cursor-pointer">
                                    <Plus size={15} /><span>Add Vacation Rental</span>
                                </Button>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {v.filteredRentals.map((rental) => (
                                <VacationRentalPropertyCard
                                    key={rental.id} rental={rental}
                                    handleEditRental={v.handleEditRental}
                                    setPhotoModalRental={v.setPhotoModalRental}
                                    setSelectedRentalForRooms={v.setSelectedRentalForRooms}
                                    setActiveTab={setActiveTab}
                                    deleteMutation={v.deleteMutation}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Photo Gallery Modal */}
            <VacationRentalPhotoModal
                photoModalRental={v.photoModalRental} setPhotoModalRental={v.setPhotoModalRental}
                isUploadingPhotos={v.isUploadingPhotos} photoInputRef={v.photoInputRef}
                handleUploadPhotosToExisting={v.handleUploadPhotosToExisting}
                handleDeletePhoto={v.handleDeletePhoto}
            />
        </div>
    );
}
