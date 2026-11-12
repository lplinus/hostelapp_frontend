"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { toLocalMediaPath, cn } from "@/lib/utils";
import {
    Hotel as HotelIcon,
    Building2,
    Plus,
    Search,
    RefreshCw,
    X,
    BedDouble,
    Calendar,
    CheckCircle2,
    Sparkles,
    ChevronRight,
    Layers,
    Image as ImageIcon,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import RoomsUnitsTab from "@/components/hostelowner/hostel/hostelrooms/rooms-units/rooms-units-tab";
import HotelBookingDashboard from "@/components/hostelowner/hotel/hotelbooking/hotel-booking-dashboard";
import { useHotelManagement } from "./hotel-management-hooks";
import HotelForm from "./hotel-form";
import HotelCard from "./hotel-card";
import HotelPhotoModal from "./hotel-photo-modal";
import HotelRoomTypeModal from "./hotelrooms/hotel-room-type-modal";

const HotelMapPicker = dynamic(() => import("./hotel-map-picker"), {
    ssr: false,
    loading: () => (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60">
            <div className="bg-card text-foreground px-5 py-3 rounded-xl shadow-xl font-medium animate-pulse flex items-center gap-2">
                <span>Loading Map...</span>
            </div>
        </div>
    ),
});

export default function HotelOwnerManagement() {
    const h = useHotelManagement();

    return (
        <div className="space-y-6">
            {/* Top Tabs */}
            <div className="flex items-center justify-between border-b border-border/80 pb-3 mb-6">
                <div className="flex items-center gap-1.5 p-1 bg-muted/60 rounded-lg border border-border/80 shadow-2xs">
                    <button type="button" onClick={() => h.handleTabChange("properties")} className={cn("flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer", h.activeTab === "properties" ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border" : "text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800")}>
                        <Building2 size={15} className={h.activeTab === "properties" ? "text-[#312E81] dark:text-indigo-400" : ""} />
                        <span>Hotel Properties</span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors", h.activeTab === "properties" ? "bg-indigo-50 text-[#312E81] dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300")}>{h.isMounted ? h.hotels.length : 0}</span>
                    </button>

                    <button type="button" onClick={() => h.handleTabChange("rooms")} className={cn("flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer", h.activeTab === "rooms" ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border" : "text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800")}>
                        <BedDouble size={15} className={h.activeTab === "rooms" ? "text-[#312E81] dark:text-indigo-400" : ""} />
                        <span>Rooms & Units</span>
                        <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors", h.activeTab === "rooms" ? "bg-[#312E81] text-white" : "bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300")}>{h.isMounted ? h.totalRoomsCount : 0}</span>
                    </button>

                    <button type="button" onClick={() => h.handleTabChange("bookings")} className={cn("flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer", h.activeTab === "bookings" ? "bg-white dark:bg-card text-foreground font-bold shadow-xs border border-border" : "text-muted-foreground hover:text-foreground hover:bg-slate-100/70 dark:hover:bg-slate-800")}>
                        <Calendar size={15} className={h.activeTab === "bookings" ? "text-[#312E81] dark:text-indigo-400" : ""} />
                        <span>Hotel Bookings</span>
                        {h.hotelBookings.length > 0 && (
                            <span className={cn("text-[10px] px-1.5 py-0.5 rounded-md font-bold transition-colors", h.activeTab === "bookings" ? "bg-indigo-50 text-[#312E81] dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800" : "bg-indigo-100 dark:bg-indigo-950 text-[#312E81] dark:text-indigo-300")}>{h.hotelBookings.length}</span>
                        )}
                    </button>
                </div>
            </div>

            {h.isSwitchingTab ? (
                <div className="py-20 flex flex-col items-center justify-center gap-3.5 bg-card/60 backdrop-blur-xs rounded-xl border border-border/60 shadow-2xs animate-in fade-in duration-200">
                    <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-3 border-indigo-100 dark:border-indigo-950 border-t-[#312E81] dark:border-t-indigo-400 animate-spin" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            {h.activeTab === "properties" && <Building2 size={16} className="text-[#312E81] dark:text-indigo-400 animate-pulse" />}
                            {h.activeTab === "rooms" && <BedDouble size={16} className="text-[#312E81] dark:text-indigo-400 animate-pulse" />}
                            {h.activeTab === "bookings" && <Calendar size={16} className="text-[#312E81] dark:text-indigo-400 animate-pulse" />}
                        </div>
                    </div>
                    <div className="text-center space-y-1">
                        <p className="text-xs font-bold text-foreground">
                            {h.activeTab === "properties" && "Loading Hotel Properties..."}
                            {h.activeTab === "rooms" && "Loading Rooms & Units Inventory..."}
                            {h.activeTab === "bookings" && "Loading Hotel Reservations..."}
                        </p>
                        <p className="text-[11px] text-muted-foreground">Updating live property inventory</p>
                    </div>
                </div>
            ) : h.activeTab === "bookings" ? (
                <HotelBookingDashboard hideTopTabs={true} />
            ) : h.activeTab === "rooms" ? (
                <RoomsUnitsTab propertyType="hotel" hotels={h.hotels} initialSelectedPropertyId={h.selectedHotelForRooms} onRefresh={() => h.refetch()} isRefetching={h.isRefetching} />
            ) : (
                <>
                    {/* Top Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-card p-4 sm:p-4.5 rounded-lg border border-border/80 shadow-2xs">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                    <Sparkles size={11} className="text-amber-500" />Hotel Management
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm text-[11px] font-medium bg-muted text-muted-foreground border">Property Portfolio</span>
                            </div>
                            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">Hotels & Luxury Suites</h1>
                            <p className="text-xs text-muted-foreground">Add and manage your boutique hotels, suites, per-night tariffs, photos, and inventory.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => h.refetch()} disabled={h.isRefetching} className="gap-1.5 text-xs font-semibold rounded-md h-8 px-3">
                                <RefreshCw size={12} className={h.isRefetching ? "animate-spin" : ""} />Refresh
                            </Button>
                            <Button size="sm" onClick={() => { if (h.isCreating) { h.setIsCreating(false); h.setEditingHotel(null); } else { h.resetForm(); h.setIsCreating(true); } }} className={`gap-1.5 text-xs text-white font-semibold rounded-md shadow-2xs h-8 px-3.5 transition-all ${h.isCreating ? "bg-muted-foreground hover:bg-muted-foreground/90" : "bg-[#312E81] hover:bg-[#252269] active:bg-[#1E1B4B]"}`}>
                                {h.isCreating ? (<><X size={13} /> Cancel</>) : (<><Plus size={13} /> Add Hotel</>)}
                            </Button>
                        </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
                        <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                            <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Hotels Managed</p>
                                    <p className="text-lg sm:text-xl font-bold tracking-tight text-foreground tabular-nums leading-none">{h.isMounted ? h.hotels.length : 0}</p>
                                    <p className="text-[10px] text-muted-foreground/80 truncate">Registered</p>
                                </div>
                                <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0"><HotelIcon size={15} /></div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                            <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Room Inventory</p>
                                    <p className="text-lg sm:text-xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums leading-none">{h.isMounted ? h.totalRoomsCount : 0}</p>
                                    <p className="text-[10px] text-muted-foreground/80 truncate">Suites & rooms</p>
                                </div>
                                <div className="w-8 h-8 rounded-md bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0"><BedDouble size={15} /></div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                            <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Active Listings</p>
                                    <p className="text-lg sm:text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums leading-none">{h.isMounted ? h.hotels.filter((htl) => htl.is_active).length : 0}</p>
                                    <p className="text-[10px] text-muted-foreground/80 truncate">Online reservations</p>
                                </div>
                                <div className="w-8 h-8 rounded-md bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0"><CheckCircle2 size={15} /></div>
                            </CardContent>
                        </Card>
                        <Card className="border border-border/70 rounded-md bg-card shadow-2xs">
                            <CardContent className="p-3 sm:p-3.5 flex items-center justify-between">
                                <div className="space-y-0.5 min-w-0">
                                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider truncate">Booking Dashboard</p>
                                    <Link href="/hotelbooking" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-0.5">View <ChevronRight size={12} /></Link>
                                    <p className="text-[10px] text-muted-foreground/80 truncate">Check-ins & folios</p>
                                </div>
                                <div className="w-8 h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0"><Layers size={15} /></div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* ADD / EDIT HOTEL FORM */}
                    {h.isCreating && (
                        <HotelForm
                            formData={h.formData} setFormData={h.setFormData}
                            editingHotel={h.editingHotel} setEditingHotel={h.setEditingHotel}
                            setIsCreating={h.setIsCreating} handleFormSubmit={h.handleFormSubmit}
                            hotelMutation={h.hotelMutation} cities={h.cities}
                            filteredAreas={h.filteredAreas} amenitiesList={h.amenitiesList}
                            formImagePreviews={h.formImagePreviews}
                            handleFormImageChange={h.handleFormImageChange}
                            removeFormImage={h.removeFormImage}
                            photoDeleteMutation={h.photoDeleteMutation}
                            handleLocationChange={h.handleLocationChange}
                            setIsMapOpen={h.setIsMapOpen}
                        />
                    )}

                    {/* Filter and Search Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                        <div className="flex items-center gap-2">
                            <Select value={h.selectedCityId} onValueChange={(val) => h.setSelectedCityId(val)}>
                                <SelectTrigger className="h-9 w-[190px] text-xs bg-card border-border font-medium"><SelectValue placeholder="All Cities" /></SelectTrigger>
                                <SelectContent className="max-h-60 overflow-y-auto">
                                    <SelectItem value="all">All Cities ({h.isMounted ? h.hotels.length : 0})</SelectItem>
                                    {h.cities.map((c) => (<SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="relative w-full sm:w-72">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                            <Input placeholder="Search hotel name, area, or address..." value={h.searchQuery} onChange={(e) => h.setSearchQuery(e.target.value)} className="pl-9 text-xs h-9 bg-card border-border/50" />
                            {h.searchQuery && (<button onClick={() => h.setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={13} /></button>)}
                        </div>
                    </div>

                    {/* Hotel Cards List */}
                    {!h.isMounted || h.isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (<Card key={i} className="border-border/40 p-5 space-y-3"><Skeleton className="h-6 w-2/3" /><Skeleton className="h-4 w-1/2" /><Skeleton className="h-16 w-full" /></Card>))}
                        </div>
                    ) : h.filteredHotels.length === 0 ? (
                        <Card className="border-border/40 bg-card p-12 text-center">
                            <div className="max-w-md mx-auto space-y-3.5">
                                <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto"><HotelIcon size={26} /></div>
                                <div className="space-y-1">
                                    <h3 className="text-base font-semibold text-foreground">{h.searchQuery ? "No matching hotels found" : "No hotels registered yet"}</h3>
                                    <p className="text-xs text-muted-foreground">{h.searchQuery ? `No properties matched "${h.searchQuery}". Clear your search query.` : "Click 'Add Hotel' to create your first hotel property, upload photos, and manage rooms."}</p>
                                </div>
                                <Button size="sm" onClick={() => { h.resetForm(); h.setIsCreating(true); }} className="text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white gap-1.5 shadow-sm font-medium"><Plus size={14} /> Add Hotel Now</Button>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {h.filteredHotels.map((hotel) => (
                                <HotelCard
                                    key={hotel.id}
                                    hotel={hotel}
                                    startEdit={h.startEdit}
                                    setPhotoModalHotel={h.setPhotoModalHotel}
                                    setSelectedHotelForRooms={h.setSelectedHotelForRooms}
                                    handleTabChange={h.handleTabChange}
                                    deleteMutation={h.deleteMutation}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}

            {/* Photo Gallery Modal */}
            <HotelPhotoModal
                photoModalHotel={h.photoModalHotel} setPhotoModalHotel={h.setPhotoModalHotel}
                photoFormRef={h.photoFormRef} photoPreviews={h.photoPreviews}
                handleGalleryImageChange={h.handleGalleryImageChange}
                handleGalleryUploadSubmit={h.handleGalleryUploadSubmit}
                photoUploadMutation={h.photoUploadMutation}
                photoDeleteMutation={h.photoDeleteMutation}
            />

            {/* Room Type Modal */}
            <HotelRoomTypeModal
                roomTypeModalHotel={h.roomTypeModalHotel} setRoomTypeModalHotel={h.setRoomTypeModalHotel}
                roomFormData={h.roomFormData} setRoomFormData={h.setRoomFormData}
                handleRoomTypeSubmit={h.handleRoomTypeSubmit} roomTypeMutation={h.roomTypeMutation}
            />

            {/* Map Picker */}
            {h.isMapOpen && (
                <HotelMapPicker
                    lat={Number.parseFloat(h.formData.latitude) || 0}
                    lng={Number.parseFloat(h.formData.longitude) || 0}
                    onChange={h.handleLocationChange}
                    onClose={() => h.setIsMapOpen(false)}
                />
            )}
        </div>
    );
}
