"use client";

import { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getMyHotels,
    getHotelBySlug,
    createHotel,
    updateHotel,
    deleteHotel,
    createHotelRoomType,
    uploadHotelImages,
    deleteHotelImage,
} from "@/services/hotelservices/hotel.service";
import { getCities, getAreas, type CityItem, type AreaItem } from "@/services/location.service";
import { getAmenities, type AmenityItem } from "@/services/hostelservices/amenity.service";
import type { Hotel, HotelRoomType } from "@/types/hotel.types";
import { useAuth } from "@/hooks/useAuth";
import { tokenManager } from "@/lib/token";
import { toLocalMediaPath } from "@/lib/utils";
import { toast } from "sonner";
import {
    Hotel as HotelIcon,
    Building2,
    Plus,
    Search,
    RefreshCw,
    X,
    Star,
    MapPin,
    Map as MapIcon,
    Clock,
    BedDouble,
    Pencil,
    Trash2,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    PawPrint,
    Wifi,
    ChevronRight,
    Users,
    Layers,
    DollarSign,
    Filter,
    Image as ImageIcon,
    Upload,
    Eye,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import UseCurrentLocation from "@/components/hostelowner/location/use-current-location";

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
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);
    const isAuthenticated = !!user && tokenManager.getAuthFlag() === "authenticated";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [isCreating, setIsCreating] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCityId, setSelectedCityId] = useState<string>("all");

    // Photo Management Modal State
    const [photoModalHotel, setPhotoModalHotel] = useState<Hotel | null>(null);
    const [photoPreviews, setPhotoPreviews] = useState<{ [key: string]: string | null }>({
        image: null,
        image2: null,
        image3: null,
        image4: null,
        image5: null,
    });
    const photoFormRef = useRef<HTMLFormElement>(null);

    // Form Image Selection State (For adding photos directly while creating hotel)
    const [formImageFiles, setFormImageFiles] = useState<File[]>([]);
    const [formImagePreviews, setFormImagePreviews] = useState<string[]>([]);

    // Room Type Modal State
    const [roomTypeModalHotel, setRoomTypeModalHotel] = useState<Hotel | null>(null);
    const [roomFormData, setRoomFormData] = useState({
        name: "",
        category: "deluxe",
        bed_type: "king",
        base_price_per_night: "",
        total_rooms: "5",
        rooms_available: "5",
        max_adults: "2",
        max_children: "1",
        has_balcony: false,
        has_view: true,
    });

    // Map Picker State
    const [isMapOpen, setIsMapOpen] = useState(false);

    // Hotel Form State
    const [formData, setFormData] = useState({
        name: "",
        tagline: "",
        hotel_type: "boutique",
        star_rating: 4,
        city: "",
        area: "",
        address: "",
        postal_code: "",
        latitude: "",
        longitude: "",
        check_in_time: "14:00",
        check_out_time: "11:00",
        cancellation_policy: "free_cancellation",
        allows_pets: false,
        description: "",
        short_description: "",
        amenities: [] as number[],
    });

    // Queries
    const {
        data: hotels = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ["myHotelsList", user?.id],
        queryFn: () => getMyHotels(),
        enabled: isAuthenticated && !!user?.id,
        refetchInterval: isAuthenticated ? 8000 : false,
    });

    const { data: cities = [] } = useQuery<CityItem[]>({
        queryKey: ["cities"],
        queryFn: getCities,
    });

    const { data: areas = [] } = useQuery<AreaItem[]>({
        queryKey: ["areas"],
        queryFn: getAreas,
    });

    const { data: amenitiesList = [] } = useQuery<AmenityItem[]>({
        queryKey: ["amenities"],
        queryFn: getAmenities,
    });

    // Sync photoModalHotel with latest hotels list data (keeps modal in sync with refetchInterval)
    useEffect(() => {
        if (photoModalHotel && hotels.length > 0) {
            const updated = hotels.find((h) => h.id === photoModalHotel.id);
            if (updated && updated !== photoModalHotel) {
                setPhotoModalHotel(updated);
            }
        }
    }, [hotels, photoModalHotel]);

    // Filtered areas for selected city
    const filteredAreas = areas.filter(
        (a) => !formData.city || a.city === parseInt(formData.city)
    );

    // Create / Update Hotel Mutation
    const hotelMutation = useMutation({
        mutationFn: async (payload: any) => {
            let savedHotel: Hotel;
            if (editingHotel) {
                savedHotel = await updateHotel(editingHotel.id, payload);
            } else {
                savedHotel = await createHotel(payload);
            }

            // If user attached images during creation or editing, upload them now
            const targetHotelId = savedHotel?.id || editingHotel?.id;
            if (formImageFiles.length > 0 && targetHotelId) {
                const imgFormData = new FormData();
                imgFormData.append("hotel", targetHotelId);
                formImageFiles.forEach((file, index) => {
                    imgFormData.append(`image${index > 0 ? index + 1 : ""}`, file);
                });
                try {
                    await uploadHotelImages(imgFormData);
                } catch (e) {
                    console.error("Failed to upload attached images:", e);
                }
            }

            return savedHotel;
        },
        onSuccess: (saved) => {
            queryClient.invalidateQueries({ queryKey: ["myHotelsList"] });
            toast.success(
                editingHotel ? "Hotel updated successfully!" : "Hotel created successfully!",
                { description: `${saved.name} is now available in your property inventory.` }
            );
            setIsCreating(false);
            setEditingHotel(null);
            resetForm();
        },
        onError: (err: any) => {
            const errorMsg =
                err?.response?.data?.name?.[0] ||
                err?.response?.data?.detail ||
                err?.message ||
                "Failed to save hotel. Please verify the required fields.";
            toast.error(errorMsg);
        },
    });

    // Delete Hotel Mutation
    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteHotel(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHotelsList"] });
            toast.success("Hotel removed from inventory.");
        },
        onError: () => {
            toast.error("Failed to delete hotel.");
        },
    });

    // Add Room Type Mutation
    const roomTypeMutation = useMutation({
        mutationFn: (payload: any) => createHotelRoomType(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHotelsList"] });
            toast.success("Room type added successfully!");
            setRoomTypeModalHotel(null);
            setRoomFormData({
                name: "",
                category: "deluxe",
                bed_type: "king",
                base_price_per_night: "",
                total_rooms: "5",
                rooms_available: "5",
                max_adults: "2",
                max_children: "1",
                has_balcony: false,
                has_view: true,
            });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail || "Failed to add room type.");
        },
    });

    // Photo Gallery Upload Mutation
    const photoUploadMutation = useMutation({
        mutationFn: (data: FormData) => uploadHotelImages(data),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["myHotelsList"] });
            toast.success("Hotel photos uploaded successfully!");
            // Reset form inputs but keep previews until fresh data loads
            if (photoFormRef.current) photoFormRef.current.reset();
            // Refresh modal hotel data with fresh server data so all uploaded photos show up immediately
            if (photoModalHotel) {
                try {
                    const lookupKey = photoModalHotel.slug || photoModalHotel.id;
                    const fresh = await getHotelBySlug(lookupKey);
                    if (fresh) setPhotoModalHotel(fresh);
                } catch {
                    // Fallback: wait a moment for query cache, then pull from the list
                    await new Promise((r) => setTimeout(r, 800));
                    await queryClient.refetchQueries({ queryKey: ["myHotelsList"] });
                }
            }
            // Clear previews after fresh data is set
            setPhotoPreviews({ image: null, image2: null, image3: null, image4: null, image5: null });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail || "Failed to upload hotel photos.");
        },
    });

    // Photo Delete Mutation
    const photoDeleteMutation = useMutation({
        mutationFn: (imageId: number) => deleteHotelImage(imageId),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["myHotelsList"] });
            toast.success("Photo removed successfully.");
            if (photoModalHotel) {
                try {
                    const lookupKey = photoModalHotel.slug || photoModalHotel.id;
                    const fresh = await getHotelBySlug(lookupKey);
                    if (fresh) setPhotoModalHotel(fresh);
                } catch {
                    // Fallback: refetch from list query
                    await new Promise((r) => setTimeout(r, 800));
                    await queryClient.refetchQueries({ queryKey: ["myHotelsList"] });
                }
            }
        },
        onError: () => {
            toast.error("Failed to delete photo.");
        },
    });

    const resetForm = () => {
        setFormData({
            name: "",
            tagline: "",
            hotel_type: "boutique",
            star_rating: 4,
            city: cities[0]?.id ? String(cities[0].id) : "",
            area: "",
            address: "",
            postal_code: "",
            latitude: "",
            longitude: "",
            check_in_time: "14:00",
            check_out_time: "11:00",
            cancellation_policy: "free_cancellation",
            allows_pets: false,
            description: "",
            short_description: "",
            amenities: [],
        });
        setFormImageFiles([]);
        setFormImagePreviews([]);
    };

    const startEdit = (hotel: Hotel) => {
        setEditingHotel(hotel);
        setFormData({
            name: hotel.name || "",
            tagline: hotel.tagline || "",
            hotel_type: hotel.hotel_type || "boutique",
            star_rating: hotel.star_rating || 4,
            city: String(hotel.city || ""),
            area: hotel.area ? String(hotel.area) : "",
            address: hotel.address || "",
            postal_code: hotel.postal_code || "",
            latitude: hotel.latitude ? String(hotel.latitude) : "",
            longitude: hotel.longitude ? String(hotel.longitude) : "",
            check_in_time: hotel.check_in_time || "14:00",
            check_out_time: hotel.check_out_time || "11:00",
            cancellation_policy: hotel.cancellation_policy || "free_cancellation",
            allows_pets: hotel.allows_pets || false,
            description: hotel.description || "",
            short_description: hotel.short_description || "",
            amenities: hotel.amenities_list?.map((a) => a.id) || [],
        });
        setFormImageFiles([]);
        setFormImagePreviews([]);
        setIsCreating(true);
    };

    // Location Change Callback from Geolocation or Map Picker
    const handleLocationChange = (newLat: number, newLng: number, newAddress: string) => {
        setFormData((prev) => ({
            ...prev,
            latitude: newLat ? newLat.toFixed(6) : prev.latitude,
            longitude: newLng ? newLng.toFixed(6) : prev.longitude,
            address: newAddress ? newAddress : prev.address,
        }));
    };

    // Handle Form Photo Selection
    const handleFormImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setFormImageFiles((prev) => [...prev, ...files].slice(0, 5));
            const newPreviews = files.map((file) => URL.createObjectURL(file));
            setFormImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 5));
        }
    };

    const removeFormImage = (index: number) => {
        setFormImageFiles((prev) => prev.filter((_, i) => i !== index));
        setFormImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // Handle Gallery Modal Image Selection
    const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files?.[0]) {
            const file = files[0];
            setPhotoPreviews((prev) => ({
                ...prev,
                [name]: URL.createObjectURL(file),
            }));
        } else {
            setPhotoPreviews((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const handleGalleryUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!photoModalHotel) return;
        const formData = new FormData(e.currentTarget);
        formData.append("hotel", photoModalHotel.id);
        photoUploadMutation.mutate(formData);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast.error("Hotel name is required.");
            return;
        }
        if (!formData.city) {
            toast.error("Please select a city.");
            return;
        }
        if (!formData.address.trim()) {
            toast.error("Address is required.");
            return;
        }

        const payload: any = {
            name: formData.name.trim(),
            tagline: formData.tagline.trim(),
            hotel_type: formData.hotel_type,
            star_rating: Number(formData.star_rating),
            city: parseInt(formData.city),
            area: formData.area ? parseInt(formData.area) : null,
            address: formData.address.trim(),
            postal_code: formData.postal_code.trim(),
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            check_in_time: formData.check_in_time,
            check_out_time: formData.check_out_time,
            cancellation_policy: formData.cancellation_policy,
            allows_pets: formData.allows_pets,
            description: formData.description.trim() || formData.name,
            short_description: formData.short_description.trim(),
            amenities: formData.amenities,
            is_active: true,
        };

        hotelMutation.mutate(payload);
    };

    const handleRoomTypeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomTypeModalHotel) return;
        if (!roomFormData.name.trim()) {
            toast.error("Room category name is required.");
            return;
        }
        if (!roomFormData.base_price_per_night || parseFloat(roomFormData.base_price_per_night) <= 0) {
            toast.error("Please enter a valid price per night.");
            return;
        }

        const payload = {
            hotel: roomTypeModalHotel.id,
            name: roomFormData.name.trim(),
            room_category: roomFormData.category,
            bed_type: roomFormData.bed_type,
            base_price_per_night: roomFormData.base_price_per_night,
            total_rooms: parseInt(roomFormData.total_rooms) || 1,
            rooms_available: parseInt(roomFormData.rooms_available) || 1,
            max_adults: parseInt(roomFormData.max_adults) || 2,
            max_children: parseInt(roomFormData.max_children) || 0,
            has_balcony: roomFormData.has_balcony,
            has_view: roomFormData.has_view,
            is_available: true,
        };

        roomTypeMutation.mutate(payload);
    };

    // Filter hotels
    const filteredHotels = hotels.filter((h) => {
        const matchesSearch =
            h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.city_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.address?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCity = selectedCityId === "all" || String(h.city) === selectedCityId;
        return matchesSearch && matchesCity;
    });

    const totalRoomsCount = hotels.reduce(
        (acc, h) => acc + (h.room_types?.reduce((sum, r) => sum + (r.total_rooms || 0), 0) || 0),
        0
    );

    return (
        <div className="space-y-6">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                            <Sparkles size={12} className="text-amber-500" />
                            Hotel Management
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border">
                            Property Portfolio
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                        Hotels & Luxury Suites
                    </h1>
                    <p className="text-sm text-muted-foreground mt-0.5">
                        Add and manage your boutique hotels, suites, per-night tariffs, photos, and inventory.
                    </p>
                </div>

                <div className="flex items-center gap-2.5">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="gap-2 text-xs"
                    >
                        <RefreshCw size={13} className={isRefetching ? "animate-spin" : ""} />
                        Refresh
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => {
                            if (isCreating) {
                                setIsCreating(false);
                                setEditingHotel(null);
                            } else {
                                resetForm();
                                setIsCreating(true);
                            }
                        }}
                        className={`gap-1.5 text-xs text-white shadow-sm transition-all ${isCreating
                            ? "bg-muted-foreground hover:bg-muted-foreground/90"
                            : "bg-[#312E81] hover:bg-[#252269] active:bg-[#1E1B4B]"
                            }`}
                    >
                        {isCreating ? (
                            <>
                                <X size={14} /> Cancel
                            </>
                        ) : (
                            <>
                                <Plus size={14} /> Add Hotel
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-border/50 bg-card shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Hotels Managed</p>
                            <p className="text-2xl font-bold tracking-tight text-foreground tabular-nums">
                                {isMounted ? hotels.length : 0}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Properties registered</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                            <HotelIcon size={18} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Room Inventory</p>
                            <p className="text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400 tabular-nums">
                                {isMounted ? totalRoomsCount : 0}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Suites & rooms across all hotels</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0">
                            <BedDouble size={18} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Active Listings</p>
                            <p className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400 tabular-nums">
                                {isMounted ? hotels.filter((h) => h.is_active).length : 0}
                            </p>
                            <p className="text-[11px] text-muted-foreground">Ready for online reservations</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={18} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card shadow-xs">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-xs font-medium text-muted-foreground">Booking Dashboard</p>
                            <Link
                                href="/hotelbooking"
                                className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 pt-1"
                            >
                                View Reservations <ChevronRight size={13} />
                            </Link>
                            <p className="text-[11px] text-muted-foreground">Check-ins & daily folios</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <Layers size={18} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ADD / EDIT HOTEL FORM */}
            {isCreating && (
                <Card className="border-blue-500/30 bg-card shadow-sm">
                    <CardContent className="p-6">
                        <div className="border-b pb-3 mb-5 flex items-center justify-between">
                            <div>
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <HotelIcon size={18} className="text-blue-600" />
                                    {editingHotel ? `Edit Hotel: ${editingHotel.name}` : "Add New Hotel Property"}
                                </h3>
                                <p className="text-xs text-muted-foreground mt-0.5">
                                    Fill in the hotel specifications, location, photos, amenities, and policies.
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                    setIsCreating(false);
                                    setEditingHotel(null);
                                }}
                            >
                                <X size={14} />
                            </Button>
                        </div>

                        <form onSubmit={handleFormSubmit} className="space-y-5">
                            {/* General Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-xs font-semibold">
                                        Hotel Name <span className="text-destructive">*</span>
                                    </Label>
                                    <Input
                                        placeholder="e.g. Royal Orchid Grand Palace"
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="h-9 text-xs"
                                        required
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Tagline</Label>
                                    <Input
                                        placeholder="e.g. 5-Star Waterfront Luxury"
                                        value={formData.tagline || ""}
                                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            {/* Hotel Type & Rating */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Hotel Classification</Label>
                                    <Select
                                        value={formData.hotel_type}
                                        onValueChange={(val) => setFormData({ ...formData, hotel_type: val })}
                                    >
                                        <SelectTrigger className="w-full h-9 text-xs bg-background">
                                            <SelectValue placeholder="Select Classification" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="luxury">Luxury Hotel</SelectItem>
                                            <SelectItem value="boutique">Boutique Hotel</SelectItem>
                                            <SelectItem value="business">Business Hotel</SelectItem>
                                            <SelectItem value="resort">Resort & Spa</SelectItem>
                                            <SelectItem value="heritage">Heritage Hotel</SelectItem>
                                            <SelectItem value="budget">Budget Hotel</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Star Rating</Label>
                                    <Select
                                        value={String(formData.star_rating)}
                                        onValueChange={(val) => setFormData({ ...formData, star_rating: parseInt(val) })}
                                    >
                                        <SelectTrigger className="w-full h-9 text-xs bg-background">
                                            <SelectValue placeholder="Select Star Rating" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">5 Star ★★★★★</SelectItem>
                                            <SelectItem value="4">4 Star ★★★★</SelectItem>
                                            <SelectItem value="3">3 Star ★★★</SelectItem>
                                            <SelectItem value="2">2 Star ★★</SelectItem>
                                            <SelectItem value="1">1 Star ★</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Cancellation Policy</Label>
                                    <Select
                                        value={formData.cancellation_policy}
                                        onValueChange={(val) => setFormData({ ...formData, cancellation_policy: val })}
                                    >
                                        <SelectTrigger className="w-full h-9 text-xs bg-background">
                                            <SelectValue placeholder="Select Cancellation Policy" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="free_cancellation">Free Cancellation (24h before)</SelectItem>
                                            <SelectItem value="moderate">Moderate (Up to 3 days before)</SelectItem>
                                            <SelectItem value="non_refundable">Non-Refundable</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Location & Address */}
                            <div className="space-y-3.5">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">
                                            City <span className="text-destructive">*</span>
                                        </Label>
                                        <Select
                                            value={formData.city ? String(formData.city) : undefined}
                                            onValueChange={(val) => setFormData({ ...formData, city: val, area: "" })}
                                        >
                                            <SelectTrigger className="w-full h-9 text-xs bg-background">
                                                <SelectValue placeholder="Select City..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                {cities.map((c) => (
                                                    <SelectItem key={c.id} value={String(c.id)}>
                                                        {c.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Area / Neighborhood</Label>
                                        <Select
                                            value={formData.area ? String(formData.area) : "none"}
                                            onValueChange={(val) => setFormData({ ...formData, area: val === "none" ? "" : val })}
                                        >
                                            <SelectTrigger className="w-full h-9 text-xs bg-background">
                                                <SelectValue placeholder="Select Area (Optional)..." />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-60 overflow-y-auto">
                                                <SelectItem value="none">Select Area (Optional)...</SelectItem>
                                                {filteredAreas.map((a) => (
                                                    <SelectItem key={a.id} value={String(a.id)}>
                                                        {a.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Postal / PIN Code</Label>
                                        <Input
                                            placeholder="e.g. 500081"
                                            value={formData.postal_code || ""}
                                            onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>

                                {/* Detailed Street Address with Location Detection & Map Picker */}
                                <div className="space-y-2">
                                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <Label className="text-xs font-semibold">
                                            Detailed Address <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <UseCurrentLocation onLocationDetected={handleLocationChange} />
                                            <button
                                                type="button"
                                                onClick={() => setIsMapOpen(true)}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#312E81] text-white hover:bg-[#252269] rounded-md transition-all text-xs font-semibold shadow-xs cursor-pointer border border-[#312E81]"
                                            >
                                                <MapIcon className="w-3.5 h-3.5 text-white" />
                                                <span>Select on Map</span>
                                            </button>
                                        </div>
                                    </div>
                                    <textarea
                                        rows={2}
                                        placeholder="Enter detailed street address, landmark, building name, or use location buttons above..."
                                        value={formData.address || ""}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-xs focus:ring-1 focus:ring-primary outline-none"
                                        required
                                    />
                                </div>

                                {/* Coordinates (Latitude & Longitude) */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-lg border border-border/60 bg-muted/20">
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                                            <span>Latitude</span>
                                            <span className="text-[10px] text-muted-foreground/75 font-normal">Auto-filled from GPS / Map</span>
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.000001"
                                            placeholder="e.g. 17.385044"
                                            value={formData.latitude ?? ""}
                                            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                                            className="h-8 text-xs font-mono bg-background"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[11px] font-semibold text-muted-foreground flex items-center justify-between">
                                            <span>Longitude</span>
                                            <span className="text-[10px] text-muted-foreground/75 font-normal">Auto-filled from GPS / Map</span>
                                        </label>
                                        <Input
                                            type="number"
                                            step="0.000001"
                                            placeholder="e.g. 78.486671"
                                            value={formData.longitude ?? ""}
                                            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                                            className="h-8 text-xs font-mono bg-background"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Check-in Times & Pet policy */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Check-In Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.check_in_time || "14:00"}
                                        onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Check-Out Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.check_out_time || "11:00"}
                                        onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="flex items-center gap-2 pt-6">
                                    <input
                                        type="checkbox"
                                        id="allows_pets"
                                        checked={formData.allows_pets}
                                        onChange={(e) => setFormData({ ...formData, allows_pets: e.target.checked })}
                                        className="rounded border-input text-blue-600 focus:ring-blue-500"
                                    />
                                    <Label htmlFor="allows_pets" className="text-xs font-medium cursor-pointer">
                                        Pet Friendly Property 🐾
                                    </Label>
                                </div>
                            </div>

                            {/* 📸 Photos & Media Upload Section */}
                            <div className="space-y-2.5 p-4 rounded-xl border border-dashed border-[#312E81]/30 bg-[#312E81]/5 dark:bg-indigo-950/10">
                                <div className="flex items-center justify-between">
                                    <div className="space-y-0.5">
                                        <Label className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                                            <ImageIcon size={14} className="text-[#312E81]" />
                                            Hotel Photos & Gallery
                                        </Label>
                                        <p className="text-[11px] text-muted-foreground">
                                            Upload and manage photos (Exterior, Lobby, Deluxe Rooms, Dining) for this hotel.
                                        </p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px] border-[#312E81]/30 text-[#312E81] bg-[#312E81]/10 font-semibold">
                                        {((editingHotel?.images?.length || 0) + formImagePreviews.length)} Photos
                                    </Badge>
                                </div>

                                <div className="flex flex-wrap items-center gap-3 pt-1">
                                    {/* Existing Saved Hotel Photos */}
                                    {editingHotel?.images?.map((img) => (
                                        <div
                                            key={`existing-${img.id}`}
                                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-border shadow-xs group bg-muted"
                                        >
                                            <img
                                                src={toLocalMediaPath(img.image) || img.image}
                                                alt={img.caption || "Hotel Photo"}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                disabled={photoDeleteMutation.isPending}
                                                onClick={() => {
                                                    photoDeleteMutation.mutate(img.id);
                                                    setEditingHotel((prev) =>
                                                        prev
                                                            ? {
                                                                ...prev,
                                                                images: (prev.images || []).filter((i) => i.id !== img.id),
                                                            }
                                                            : null
                                                    );
                                                }}
                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                                title="Delete this photo"
                                            >
                                                <X size={11} />
                                            </button>
                                            <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[9px] text-center py-0.5 truncate px-1">
                                                {img.is_primary ? "Primary" : "Saved"}
                                            </span>
                                        </div>
                                    ))}

                                    {/* Newly Picked Photos (Pending Upload) */}
                                    {formImagePreviews.map((preview, idx) => (
                                        <div
                                            key={`new-${idx}`}
                                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-[#312E81]/50 shadow-xs group"
                                        >
                                            <img
                                                src={preview}
                                                alt={`New ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeFormImage(idx)}
                                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/75 text-white flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                            >
                                                <X size={11} />
                                            </button>
                                            <span className="absolute bottom-0 inset-x-0 bg-[#312E81] text-white text-[9px] text-center py-0.5 font-medium">
                                                New {idx + 1}
                                            </span>
                                        </div>
                                    ))}

                                    {/* Add Photo Button */}
                                    {((editingHotel?.images?.length || 0) + formImagePreviews.length) < 10 && (
                                        <label className="w-20 h-20 rounded-lg border-2 border-dashed border-[#312E81]/40 hover:border-[#312E81] bg-muted/40 hover:bg-[#312E81]/5 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors text-muted-foreground hover:text-[#312E81]">
                                            <Upload size={16} />
                                            <span className="text-[10px] font-medium">Add Photo</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                multiple
                                                onChange={handleFormImageChange}
                                                className="sr-only"
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Amenities Checklist */}
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Hotel Amenities</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 p-3 rounded-lg border bg-muted/20">
                                    {amenitiesList.map((a) => {
                                        const isChecked = formData.amenities.includes(a.id);
                                        return (
                                            <label
                                                key={a.id}
                                                className={`flex items-center gap-2 p-2 rounded-md text-xs cursor-pointer border transition-colors ${isChecked
                                                    ? "bg-[#312E81] border-[#312E81] text-white font-semibold shadow-2xs hover:bg-[#252269]"
                                                    : "border-border/60 bg-background hover:bg-slate-100 text-foreground"
                                                    }`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isChecked}
                                                    onChange={() => {
                                                        const updated = isChecked
                                                            ? formData.amenities.filter((id) => id !== a.id)
                                                            : [...formData.amenities, a.id];
                                                        setFormData({ ...formData, amenities: updated });
                                                    }}
                                                    className="sr-only"
                                                />
                                                <CheckCircle2
                                                    size={13}
                                                    className={isChecked ? "text-white" : "text-muted-foreground/40"}
                                                />
                                                <span className="truncate">{a.name}</span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Hotel Description</Label>
                                <textarea
                                    rows={3}
                                    placeholder="Highlight luxury suites, culinary dining, spa amenities, and prime location..."
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full rounded-md border border-input bg-background p-2.5 text-xs shadow-xs focus:ring-1 focus:ring-primary"
                                />
                            </div>

                            {/* Submit Buttons */}
                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setEditingHotel(null);
                                    }}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={hotelMutation.isPending}
                                    className="text-xs bg-[#312E81] text-white font-medium shadow-sm cursor-pointer rounded-[3px] border border-[#312E81]"
                                >
                                    {hotelMutation.isPending
                                        ? "Saving Hotel & Media..."
                                        : editingHotel
                                            ? "Update Hotel"
                                            : "Publish Hotel"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Filter and Search Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                    <Select value={selectedCityId} onValueChange={(val) => setSelectedCityId(val)}>
                        <SelectTrigger className="h-9 w-[190px] text-xs bg-card border-border font-medium">
                            <SelectValue placeholder="All Cities" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                            <SelectItem value="all">All Cities ({isMounted ? hotels.length : 0})</SelectItem>
                            {cities.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search hotel name, area, or address..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 text-xs h-9 bg-card border-border/50"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Hotel Cards List */}
            {!isMounted || isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-border/40 p-5 space-y-3">
                            <Skeleton className="h-6 w-2/3" />
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-16 w-full" />
                        </Card>
                    ))}
                </div>
            ) : filteredHotels.length === 0 ? (
                <Card className="border-border/40 bg-card p-12 text-center">
                    <div className="max-w-md mx-auto space-y-3.5">
                        <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mx-auto">
                            <HotelIcon size={26} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-base font-semibold text-foreground">
                                {searchQuery ? "No matching hotels found" : "No hotels registered yet"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {searchQuery
                                    ? `No properties matched "${searchQuery}". Clear your search query.`
                                    : "Click 'Add Hotel' to create your first hotel property, upload photos, and manage rooms."}
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={() => {
                                resetForm();
                                setIsCreating(true);
                            }}
                            className="text-xs bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white gap-1.5 shadow-sm font-medium"
                        >
                            <Plus size={14} /> Add Hotel Now
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredHotels.map((hotel) => {
                        const roomCount = hotel.room_types?.length || 0;
                        const imagesCount = hotel.images?.length || 0;
                        const coverImg = hotel.images?.[0]?.image || hotel.og_image;
                        const startingPrice = hotel.starting_price_per_night
                            ? `₹${parseFloat(hotel.starting_price_per_night).toLocaleString()}`
                            : "Rates on request";

                        return (
                            <Card
                                key={hotel.id}
                                className="p-0 py-0 gap-0 border border-border/80 bg-card rounded-lg sm:rounded-xl shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                            >
                                {/* Spacious Card Image (h-48) matching Vacation Rental scale */}
                                {coverImg ? (
                                    <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                                        <img
                                            src={toLocalMediaPath(coverImg) || coverImg}
                                            alt={hotel.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            onError={(e) => {
                                                const target = e.currentTarget;
                                                if (target.src.includes("ik.imagekit.io") && !target.src.includes("tr=")) {
                                                    target.src = `${target.src}${target.src.includes("?") ? "&" : "?"}tr=w-800,f-auto`;
                                                }
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
                                        <div className="absolute top-3 left-3">
                                            <span
                                                className={`text-[10px] px-2.5 py-1 font-bold tracking-wider uppercase rounded-md shadow-xs ${hotel.is_active ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"
                                                    }`}
                                            >
                                                {hotel.is_active ? "Active" : "Draft"}
                                            </span>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <span className="bg-black/75 backdrop-blur-xs text-white text-[10px] font-semibold gap-1 px-2.5 py-1 rounded-md flex items-center shadow-xs">
                                                <ImageIcon size={11} />
                                                {imagesCount} Photo{imagesCount === 1 ? "" : "s"}
                                            </span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-48 w-full bg-slate-900 dark:bg-slate-950 flex flex-col items-center justify-center p-4 border-b border-border/60 text-slate-400 gap-2 relative">
                                        <HotelIcon size={28} className="text-[#312E81] dark:text-indigo-400" />
                                        <span className="text-xs font-semibold text-slate-300">No Cover Photo</span>
                                        <button
                                            type="button"
                                            onClick={() => setPhotoModalHotel(hotel)}
                                            className="text-xs font-semibold text-white bg-[#312E81] flex items-center gap-1.5 px-3 py-1 rounded-md shadow-2xs cursor-pointer border border-[#312E81] hover:bg-[#1E1B4B] transition-colors"
                                        >
                                            <Upload size={12} className="text-white" /> Upload Photos
                                        </button>
                                        <div className="absolute top-3 left-3">
                                            <span
                                                className={`text-[10px] px-2.5 py-1 font-bold tracking-wider uppercase rounded-md shadow-xs ${hotel.is_active ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"
                                                    }`}
                                            >
                                                {hotel.is_active ? "Active" : "Draft"}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                                    <div className="space-y-2">
                                        {/* Top Row: Classification Label & Full 5-Star Rating */}
                                        <div className="flex items-center justify-between gap-1.5">
                                            <span className="inline-flex items-center text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-[#312E81]/10 text-[#312E81] dark:bg-indigo-950/70 dark:text-indigo-300 border border-[#312E81]/25">
                                                {hotel.hotel_type_display || hotel.hotel_type || "Hotel"}
                                            </span>
                                            <div className="flex items-center gap-1" title={`${hotel.star_rating || 5} Star Hotel`}>
                                                <div className="flex items-center gap-0.5">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            className={
                                                                i < (hotel.star_rating || 5)
                                                                    ? "fill-amber-400 text-amber-400"
                                                                    : "fill-slate-200 text-slate-300 dark:fill-slate-800 dark:text-slate-700"
                                                            }
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 ml-0.5">
                                                    {hotel.star_rating || 5} Star
                                                </span>
                                            </div>
                                        </div>

                                        {/* Hotel Name */}
                                        <div>
                                            <h3
                                                className="text-base font-bold text-foreground tracking-tight line-clamp-1 group-hover:text-[#312E81] transition-colors"
                                                title={hotel.name}
                                            >
                                                {hotel.name}
                                            </h3>
                                        </div>

                                        {/* Location & Address */}
                                        <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                                            <MapPin size={13} className="shrink-0 text-[#312E81] dark:text-indigo-400" />
                                            <span className="truncate font-medium">
                                                {hotel.area_name ? `${hotel.area_name}, ` : ""}
                                                {hotel.city_name || "City"}
                                                {hotel.address ? ` • ${hotel.address}` : ""}
                                            </span>
                                        </div>

                                        {/* Room inventory & Check-in specs bar */}
                                        <div className="grid grid-cols-2 gap-2 py-1.5 px-2.5 rounded-md bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px]">
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                <BedDouble size={13} className="text-[#312E81] dark:text-indigo-400 shrink-0" />
                                                <span className="font-semibold truncate">
                                                    {roomCount} {roomCount === 1 ? "Category" : "Categories"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                                                <Clock size={13} className="text-[#312E81] dark:text-indigo-400 shrink-0" />
                                                <span className="text-muted-foreground truncate font-medium">
                                                    In: {hotel.check_in_time ? hotel.check_in_time.slice(0, 5) : "14:00"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom: Pricing & Actions */}
                                    <div className="space-y-2.5 pt-1">
                                        {/* Enterprise Pricing Block */}
                                        <div className="pt-2 border-t border-border/60 flex items-end justify-between">
                                            <div className="space-y-0.5">
                                                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80 block">
                                                    Starting Rate
                                                </span>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-base font-bold text-foreground tabular-nums tracking-tight">
                                                        {startingPrice}
                                                    </span>
                                                    {hotel.starting_price_per_night && (
                                                        <span className="text-xs text-muted-foreground font-normal">
                                                            / night
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground/80 font-medium">
                                                + taxes & fees
                                            </span>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    size="sm"
                                                    className="text-xs h-8 px-3 gap-1.5 bg-[#312E81] text-white font-semibold rounded-md border border-[#312E81] shadow-2xs cursor-pointer hover:bg-[#1E1B4B] transition-colors"
                                                    onClick={() => setPhotoModalHotel(hotel)}
                                                >
                                                    <ImageIcon size={12} className="text-white" />
                                                    Photos ({imagesCount})
                                                </Button>

                                                <Button
                                                    size="sm"
                                                    className="text-xs h-8 px-2.5 gap-1.5 bg-[#312E81] text-white font-semibold rounded-md border border-[#312E81] shadow-2xs cursor-pointer hover:bg-[#1E1B4B] transition-colors"
                                                    onClick={() => setRoomTypeModalHotel(hotel)}
                                                >
                                                    <Plus size={12} className="text-white" /> Room
                                                </Button>
                                            </div>

                                            <div className="flex items-center gap-1.5">
                                                <Button
                                                    size="icon"
                                                    className="w-8 h-8 bg-[#312E81] text-white rounded-md border border-[#312E81] shadow-2xs cursor-pointer hover:bg-[#1E1B4B] flex items-center justify-center transition-colors"
                                                    onClick={() => startEdit(hotel)}
                                                    title="Edit Hotel"
                                                >
                                                    <Pencil size={13} className="text-white" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="w-8 h-8 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 rounded-md border border-rose-200 dark:border-rose-900 cursor-pointer flex items-center justify-center hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                                                    disabled={deleteMutation.isPending}
                                                    onClick={() => {
                                                        if (confirm(`Are you sure you want to delete ${hotel.name}?`)) {
                                                            deleteMutation.mutate(hotel.id);
                                                        }
                                                    }}
                                                    title="Delete Hotel"
                                                >
                                                    <Trash2 size={13} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* 📸 HOTEL PHOTO GALLERY & UPLOAD MODAL (Like Hostel Management) */}
            <Dialog open={!!photoModalHotel} onOpenChange={(open) => !open && setPhotoModalHotel(null)}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {photoModalHotel && (
                        <div>
                            <DialogHeader className="border-b pb-3 mb-4">
                                <DialogTitle className="text-base font-bold flex items-center gap-2">
                                    <ImageIcon size={18} className="text-[#312E81]" />
                                    Manage Photos: {photoModalHotel.name}
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Upload and organize high-resolution photos for this hotel listing.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-5">
                                {/* Existing Photos Grid */}
                                <div className="space-y-2">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                        Current Photos ({photoModalHotel.images?.length || 0})
                                    </h4>

                                    {photoModalHotel.images && photoModalHotel.images.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                            {photoModalHotel.images.map((img) => (
                                                <div
                                                    key={img.id}
                                                    className="relative rounded-lg overflow-hidden border border-border group bg-muted aspect-4/3"
                                                >
                                                    <img
                                                        src={toLocalMediaPath(img.image) || img.image}
                                                        alt={img.caption || photoModalHotel.name}
                                                        className="w-full h-full object-cover"
                                                        onError={(e) => {
                                                            const target = e.currentTarget;
                                                            if (target.src.includes("ik.imagekit.io") && !target.src.includes("tr=")) {
                                                                target.src = `${target.src}${target.src.includes("?") ? "&" : "?"}tr=w-800,f-auto`;
                                                            }
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                        <Button
                                                            size="icon"
                                                            variant="destructive"
                                                            className="w-7 h-7 rounded-full"
                                                            disabled={photoDeleteMutation.isPending}
                                                            onClick={() => photoDeleteMutation.mutate(img.id)}
                                                        >
                                                            <Trash2 size={12} />
                                                        </Button>
                                                    </div>
                                                    {img.is_primary && (
                                                        <Badge className="absolute top-1.5 left-1.5 text-[9px] bg-[#312E81] text-white shadow-xs font-semibold">
                                                            Primary
                                                        </Badge>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-lg bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 text-xs text-blue-800 dark:text-blue-200">
                                            ℹ️ No uploaded photos found for this hotel. Please upload gallery images below.
                                        </div>
                                    )}
                                </div>

                                {/* Upload New Images Form (Hostel Style) */}
                                <div className="space-y-3 pt-3 border-t">
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                        <Upload size={13} /> Upload New Photos
                                    </h4>

                                    <form
                                        ref={photoFormRef}
                                        onSubmit={handleGalleryUploadSubmit}
                                        className="space-y-3"
                                    >
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                            {["image", "image2", "image3", "image4", "image5"].map((fieldName, i) => (
                                                <div key={fieldName} className="space-y-1">
                                                    <label className="text-[11px] font-medium text-foreground block">
                                                        Photo {i + 1} {i === 0 ? "(Facade / Cover)" : ""}
                                                    </label>
                                                    <div className="flex items-center gap-2.5 p-2 rounded-lg border border-dashed hover:border-blue-500 bg-muted/20 transition-colors">
                                                        <input
                                                            type="file"
                                                            name={fieldName}
                                                            accept="image/*"
                                                            onChange={handleGalleryImageChange}
                                                            className="text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[11px] file:font-semibold file:bg-[#312E81]/10 file:text-[#312E81] hover:file:bg-[#312E81]/20 cursor-pointer flex-1"
                                                        />
                                                        {/* Always visible preview thumbnail box beside input */}
                                                        <div className="w-10 h-10 rounded-md border border-slate-200 dark:border-slate-800 bg-background/80 overflow-hidden flex items-center justify-center shrink-0 shadow-2xs">
                                                            {photoPreviews[fieldName] ? (
                                                                <img
                                                                    src={photoPreviews[fieldName]!}
                                                                    alt="preview"
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="flex flex-col items-center justify-center text-muted-foreground/35">
                                                                    <ImageIcon size={15} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <DialogFooter className="pt-2">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPhotoModalHotel(null)}
                                                className="text-xs"
                                            >
                                                Done
                                            </Button>
                                            <Button
                                                type="submit"
                                                size="sm"
                                                disabled={photoUploadMutation.isPending}
                                                className="text-xs bg-[#312E81] hover:bg-[#252269] active:bg-[#1E1B4B] text-white gap-1.5 font-medium shadow-xs transition-all"
                                            >
                                                <Upload size={13} />
                                                {photoUploadMutation.isPending ? "Uploading..." : "Upload Photos"}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* ADD ROOM TYPE MODAL */}
            <Dialog open={!!roomTypeModalHotel} onOpenChange={(open) => !open && setRoomTypeModalHotel(null)}>
                <DialogContent className="max-w-lg scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {roomTypeModalHotel && (
                        <form onSubmit={handleRoomTypeSubmit}>
                            <DialogHeader>
                                <DialogTitle className="text-base font-bold flex items-center gap-2">
                                    <BedDouble size={18} className="text-[#312E81]" />
                                    Add Room Type to {roomTypeModalHotel.name}
                                </DialogTitle>
                                <DialogDescription className="text-xs">
                                    Configure a private suite or room inventory with base per-night rate.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4 text-xs">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Room Category Name *</Label>
                                    <Input
                                        placeholder="e.g. Deluxe King Suite"
                                        value={roomFormData.name || ""}
                                        onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })}
                                        className="h-9 text-xs"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Category</Label>
                                        <Select
                                            value={roomFormData.category}
                                            onValueChange={(val) => setRoomFormData({ ...roomFormData, category: val })}
                                        >
                                            <SelectTrigger className="h-9 text-xs bg-background">
                                                <SelectValue placeholder="Select Category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="standard">Standard Room</SelectItem>
                                                <SelectItem value="deluxe">Deluxe Room</SelectItem>
                                                <SelectItem value="executive_suite">Executive Suite</SelectItem>
                                                <SelectItem value="family_suite">Family Suite</SelectItem>
                                                <SelectItem value="presidential_suite">Presidential Suite</SelectItem>
                                                <SelectItem value="studio">Studio</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Bed Configuration</Label>
                                        <Select
                                            value={roomFormData.bed_type}
                                            onValueChange={(val) => setRoomFormData({ ...roomFormData, bed_type: val })}
                                        >
                                            <SelectTrigger className="h-9 text-xs bg-background">
                                                <SelectValue placeholder="Select Bed Type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="king">1 King Bed</SelectItem>
                                                <SelectItem value="queen">1 Queen Bed</SelectItem>
                                                <SelectItem value="twin">2 Twin Beds</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Nightly Price (₹) *</Label>
                                        <Input
                                            type="number"
                                            placeholder="2999"
                                            value={roomFormData.base_price_per_night || ""}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, base_price_per_night: e.target.value })}
                                            className="h-9 text-xs"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Total Inventory</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={roomFormData.total_rooms || ""}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, total_rooms: e.target.value, rooms_available: e.target.value })}
                                            className="h-9 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold">Max Guests</Label>
                                        <Input
                                            type="number"
                                            min="1"
                                            value={roomFormData.max_adults || ""}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, max_adults: e.target.value })}
                                            className="h-9 text-xs"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-1">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={roomFormData.has_balcony}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, has_balcony: e.target.checked })}
                                            className="rounded border-input text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Private Balcony</span>
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={roomFormData.has_view}
                                            onChange={(e) => setRoomFormData({ ...roomFormData, has_view: e.target.checked })}
                                            className="rounded border-input text-blue-600 focus:ring-blue-500"
                                        />
                                        <span>Scenic City/Pool View</span>
                                    </label>
                                </div>
                            </div>

                            <DialogFooter className="gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRoomTypeModalHotel(null)}
                                    className="text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    size="sm"
                                    disabled={roomTypeMutation.isPending}
                                    className="text-xs bg-[#312E81] hover:bg-[#252269] active:bg-[#1E1B4B] text-white font-medium shadow-xs transition-all"
                                >
                                    {roomTypeMutation.isPending ? "Adding..." : "Add Room Type"}
                                </Button>
                            </DialogFooter>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Interactive Map Location Picker Modal */}
            {isMapOpen && (
                <HotelMapPicker
                    lat={Number.parseFloat(formData.latitude) || 0}
                    lng={Number.parseFloat(formData.longitude) || 0}
                    onChange={handleLocationChange}
                    onClose={() => setIsMapOpen(false)}
                />
            )}
        </div>
    );
}
