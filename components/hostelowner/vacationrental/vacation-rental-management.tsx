"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    getMyVacationRentals,
    createVacationRental,
    updateVacationRental,
    deleteVacationRental,
    uploadVacationRentalImages,
    deleteVacationRentalImage,
} from "@/services/vacanatinalrentalservices/vacationrental.service";
import { getCities, getAreas, type CityItem, type AreaItem } from "@/services/location.service";
import { getAmenities, type AmenityItem } from "@/services/hostelservices/amenity.service";
import type { VacationRental } from "@/types/vacationrental.types";
import { useAuth } from "@/hooks/useAuth";
import { tokenManager } from "@/lib/token";
import { toLocalMediaPath } from "@/lib/utils";
import { toast } from "sonner";
import {
    Palmtree,
    Building2,
    Plus,
    Search,
    RefreshCw,
    X,
    Star,
    MapPin,
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
    ExternalLink,
    Home,
    Calendar,
    Cigarette,
    PartyPopper,
    Zap,
    Check,
    ArrowLeft,
    Phone,
    User,
    KeyRound,
    Lock,
    Save,
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

const CATEGORIES = [
    { value: "villa", label: "Villa" },
    { value: "apartment", label: "Apartment" },
    { value: "house", label: "Independent House" },
    { value: "cottage", label: "Cottage" },
    { value: "farmhouse", label: "Farmhouse" },
    { value: "beach_house", label: "Beach House" },
    { value: "cabin", label: "Cabin" },
    { value: "penthouse", label: "Penthouse" },
    { value: "studio", label: "Studio" },
];

const RENTAL_TYPES = [
    { value: "entire_place", label: "Entire Place" },
    { value: "private_room", label: "Private Room" },
    { value: "shared_room", label: "Shared Room" },
];

const CANCELLATION_POLICIES = [
    { value: "flexible", label: "Flexible (Full refund up to 1 day prior)" },
    { value: "moderate", label: "Moderate (Full refund up to 5 days prior)" },
    { value: "strict", label: "Strict (50% refund up to 7 days prior)" },
    { value: "non_refundable", label: "Non-Refundable" },
];

export default function VacationRentalManagement() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);
    const isAuthenticated = !!user && tokenManager.getAuthFlag() === "authenticated";

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // View state: list vs full-page form
    const [isCreating, setIsCreating] = useState(false);
    const [editingRental, setEditingRental] = useState<VacationRental | null>(null);

    // List filtering state
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCityId, setSelectedCityId] = useState<string>("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    // Photo Management Modal State (for gallery on existing rentals)
    const [photoModalRental, setPhotoModalRental] = useState<VacationRental | null>(null);
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // Form Image Selection State (For adding photos directly while creating rental)
    const [formImageFiles, setFormImageFiles] = useState<File[]>([]);
    const [formImagePreviews, setFormImagePreviews] = useState<string[]>([]);

    // Form State (Including Caretaker and Wi-Fi Details)
    const [formData, setFormData] = useState({
        title: "",
        tagline: "",
        category: "villa",
        rental_type: "entire_place",
        city: "",
        area: "",
        address: "",
        postal_code: "",
        max_guests: "4",
        bedrooms: "2",
        beds: "2",
        bathrooms: "2.0",
        price_per_night: "",
        weekend_price_per_night: "",
        cleaning_fee: "0",
        security_deposit: "0",
        weekly_discount_percentage: "0",
        monthly_discount_percentage: "0",
        min_nights: "1",
        max_nights: "30",
        check_in_time: "15:00",
        check_out_time: "11:00",
        cancellation_policy: "moderate",
        instant_book: true,
        allows_pets: false,
        allows_smoking: false,
        allows_parties: false,
        custom_rules: "",
        // Caretaker and Wi-Fi Details
        caretaker_name: "",
        caretaker_number: "",
        wifi_name: "",
        wifi_password: "",
        short_description: "",
        description: "",
        amenities: [] as number[],
    });

    // Queries
    const {
        data: rentals = [],
        isLoading,
        isRefetching,
        refetch,
    } = useQuery({
        queryKey: ["myVacationRentalsList", user?.id],
        queryFn: () => getMyVacationRentals(),
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

    // Keep photoModalRental and editingRental synced with updated query data
    useEffect(() => {
        if (photoModalRental && rentals.length > 0) {
            const updated = rentals.find((r) => r.id === photoModalRental.id);
            if (updated && updated !== photoModalRental) {
                setPhotoModalRental(updated);
            }
        }
        if (editingRental && rentals.length > 0) {
            const current = rentals.find((r) => r.id === editingRental.id);
            if (current && current.images !== editingRental.images) {
                setEditingRental((prev) => (prev ? { ...prev, images: current.images } : null));
            }
        }
    }, [rentals, photoModalRental, editingRental]);

    // Filtered areas for selected city
    const filteredAreas = areas.filter(
        (a) => !formData.city || a.city === parseInt(formData.city)
    );

    // Create / Update Vacation Rental Mutation
    const rentalMutation = useMutation({
        mutationFn: async (payload: any) => {
            let savedRental: VacationRental;
            if (editingRental) {
                savedRental = await updateVacationRental(editingRental.slug, payload);
            } else {
                savedRental = await createVacationRental(payload);
            }

            // If user attached images during creation or editing, upload them now
            const targetRentalId = savedRental?.id || editingRental?.id;
            if (formImageFiles.length > 0 && targetRentalId) {
                const imgFormData = new FormData();
                imgFormData.append("rental", targetRentalId);
                formImageFiles.forEach((file) => {
                    imgFormData.append("images", file);
                });
                try {
                    await uploadVacationRentalImages(imgFormData);
                } catch (e) {
                    console.error("Failed to upload attached images:", e);
                }
            }

            return savedRental;
        },
        onSuccess: (saved) => {
            queryClient.invalidateQueries({ queryKey: ["myVacationRentalsList"] });
            toast.success(
                editingRental
                    ? "Vacation Rental updated successfully!"
                    : "Vacation Rental listed successfully!",
                { description: `${saved.title} is now in your property portfolio.` }
            );
            setIsCreating(false);
            setEditingRental(null);
            resetForm();
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onError: (err: any) => {
            const errorMsg =
                err?.response?.data?.title?.[0] ||
                err?.response?.data?.detail ||
                err?.message ||
                "Failed to save vacation rental. Please check the required fields.";
            toast.error(errorMsg);
        },
    });

    // Delete Mutation
    const deleteMutation = useMutation({
        mutationFn: (slug: string) => deleteVacationRental(slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myVacationRentalsList"] });
            toast.success("Vacation rental removed from portfolio.");
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail || "Failed to remove vacation rental.");
        },
    });

    // Reset Form
    const resetForm = () => {
        setFormData({
            title: "",
            tagline: "",
            category: "villa",
            rental_type: "entire_place",
            city: "",
            area: "",
            address: "",
            postal_code: "",
            max_guests: "4",
            bedrooms: "2",
            beds: "2",
            bathrooms: "2.0",
            price_per_night: "",
            weekend_price_per_night: "",
            cleaning_fee: "0",
            security_deposit: "0",
            weekly_discount_percentage: "0",
            monthly_discount_percentage: "0",
            min_nights: "1",
            max_nights: "30",
            check_in_time: "15:00",
            check_out_time: "11:00",
            cancellation_policy: "moderate",
            instant_book: true,
            allows_pets: false,
            allows_smoking: false,
            allows_parties: false,
            custom_rules: "",
            caretaker_name: "",
            caretaker_number: "",
            wifi_name: "",
            wifi_password: "",
            short_description: "",
            description: "",
            amenities: [],
        });
        setFormImageFiles([]);
        setFormImagePreviews([]);
    };

    // Open Edit Mode in Full Page View
    const handleEditRental = (rental: VacationRental) => {
        setEditingRental(rental);
        setFormData({
            title: rental.title || "",
            tagline: rental.tagline || "",
            category: rental.category || "villa",
            rental_type: rental.rental_type || "entire_place",
            city: rental.city ? rental.city.toString() : "",
            area: rental.area ? rental.area.toString() : "",
            address: rental.address || "",
            postal_code: rental.postal_code || "",
            max_guests: (rental.max_guests || 4).toString(),
            bedrooms: (rental.bedrooms || 2).toString(),
            beds: (rental.beds || 2).toString(),
            bathrooms: (rental.bathrooms || 2.0).toString(),
            price_per_night: rental.price_per_night || "",
            weekend_price_per_night: rental.weekend_price_per_night || "",
            cleaning_fee: rental.cleaning_fee || "0",
            security_deposit: rental.security_deposit || "0",
            weekly_discount_percentage: (rental.weekly_discount_percentage || 0).toString(),
            monthly_discount_percentage: (rental.monthly_discount_percentage || 0).toString(),
            min_nights: (rental.min_nights || 1).toString(),
            max_nights: (rental.max_nights || 30).toString(),
            check_in_time: rental.check_in_time ? rental.check_in_time.slice(0, 5) : "15:00",
            check_out_time: rental.check_out_time ? rental.check_out_time.slice(0, 5) : "11:00",
            cancellation_policy: rental.cancellation_policy || "moderate",
            instant_book: rental.instant_book ?? true,
            allows_pets: rental.allows_pets ?? false,
            allows_smoking: rental.allows_smoking ?? false,
            allows_parties: rental.allows_parties ?? false,
            custom_rules: rental.custom_rules || "",
            caretaker_name: rental.caretaker_name || "",
            caretaker_number: rental.caretaker_number || "",
            wifi_name: rental.wifi_name || "",
            wifi_password: rental.wifi_password || "",
            short_description: rental.short_description || "",
            description: rental.description || "",
            amenities: (rental.amenities_list || []).map((a) => a.id),
        });
        setFormImageFiles([]);
        setFormImagePreviews([]);
        setIsCreating(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Form Image Selection Handler
    const handleFormImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const filesArray = Array.from(e.target.files);
        setFormImageFiles((prev) => [...prev, ...filesArray]);

        filesArray.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setFormImagePreviews((prev) => [...prev, event.target!.result as string]);
                }
            };
            reader.readAsDataURL(file);
        });
    };

    const removeFormImage = (index: number) => {
        setFormImageFiles((prev) => prev.filter((_, i) => i !== index));
        setFormImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    // Submit Handler
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) {
            toast.error("Please enter a property title.");
            return;
        }
        if (!formData.city) {
            toast.error("Please select a city.");
            return;
        }
        if (!formData.price_per_night || parseFloat(formData.price_per_night) <= 0) {
            toast.error("Please enter a valid base price per night.");
            return;
        }

        const payload: any = {
            title: formData.title.trim(),
            tagline: formData.tagline.trim(),
            category: formData.category,
            rental_type: formData.rental_type,
            city: parseInt(formData.city),
            area: formData.area ? parseInt(formData.area) : null,
            address: formData.address.trim(),
            postal_code: formData.postal_code.trim(),
            max_guests: parseInt(formData.max_guests) || 4,
            bedrooms: parseInt(formData.bedrooms) || 1,
            beds: parseInt(formData.beds) || 1,
            bathrooms: parseFloat(formData.bathrooms) || 1.0,
            price_per_night: parseFloat(formData.price_per_night),
            weekend_price_per_night: formData.weekend_price_per_night
                ? parseFloat(formData.weekend_price_per_night)
                : null,
            cleaning_fee: parseFloat(formData.cleaning_fee) || 0,
            security_deposit: parseFloat(formData.security_deposit) || 0,
            weekly_discount_percentage: parseFloat(formData.weekly_discount_percentage) || 0,
            monthly_discount_percentage: parseFloat(formData.monthly_discount_percentage) || 0,
            min_nights: parseInt(formData.min_nights) || 1,
            max_nights: parseInt(formData.max_nights) || 30,
            check_in_time: formData.check_in_time,
            check_out_time: formData.check_out_time,
            cancellation_policy: formData.cancellation_policy,
            instant_book: formData.instant_book,
            allows_pets: formData.allows_pets,
            allows_smoking: formData.allows_smoking,
            allows_parties: formData.allows_parties,
            custom_rules: formData.custom_rules.trim(),
            caretaker_name: formData.caretaker_name.trim(),
            caretaker_number: formData.caretaker_number.trim(),
            wifi_name: formData.wifi_name.trim(),
            wifi_password: formData.wifi_password.trim(),
            short_description: formData.short_description.trim(),
            description: formData.description.trim() || formData.title.trim(),
            amenities: formData.amenities,
        };

        rentalMutation.mutate(payload);
    };

    // Upload New Photos to Existing Rental
    const handleUploadPhotosToExisting = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!photoModalRental || !e.target.files?.length) return;
        const files = Array.from(e.target.files);
        setIsUploadingPhotos(true);

        const imgFormData = new FormData();
        imgFormData.append("rental", photoModalRental.id);
        files.forEach((file) => {
            imgFormData.append("images", file);
        });

        try {
            await uploadVacationRentalImages(imgFormData);
            toast.success("Photos uploaded successfully!");
            queryClient.invalidateQueries({ queryKey: ["myVacationRentalsList"] });
        } catch (err: any) {
            toast.error(err?.response?.data?.detail || "Failed to upload photos.");
        } finally {
            setIsUploadingPhotos(false);
            if (photoInputRef.current) photoInputRef.current.value = "";
        }
    };

    // Delete Photo
    const handleDeletePhoto = async (photoId: number) => {
        try {
            await deleteVacationRentalImage(photoId);
            toast.success("Photo removed.");
            queryClient.invalidateQueries({ queryKey: ["myVacationRentalsList"] });
            if (editingRental) {
                setEditingRental((prev) =>
                    prev
                        ? {
                              ...prev,
                              images: prev.images?.filter((img) => img.id !== photoId),
                          }
                        : null
                );
            }
        } catch (err: any) {
            toast.error("Failed to delete photo.");
        }
    };

    // Filter rentals
    const filteredRentals = rentals.filter((r) => {
        const matchesSearch =
            !searchQuery ||
            r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            r.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (r.city_name && r.city_name.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (r.area_name && r.area_name.toLowerCase().includes(searchQuery.toLowerCase()));

        const matchesCity = selectedCityId === "all" || (r.city && r.city.toString() === selectedCityId);
        const matchesCategory = selectedCategory === "all" || r.category === selectedCategory;

        return matchesSearch && matchesCity && matchesCategory;
    });

    // KPI Metrics
    const totalProperties = rentals.length;
    const activeListings = rentals.filter((r) => r.is_active).length;
    const instantBookCount = rentals.filter((r) => r.instant_book).length;
    const avgRate =
        rentals.length > 0
            ? Math.round(
                  rentals.reduce((sum, r) => sum + (parseFloat(r.price_per_night) || 0), 0) /
                      rentals.length
              )
            : 0;

    // ─────────────────────────────────────────────────────────────────────────────
    // FULL-PAGE VIEW FOR ADDING & EDITING VACATION RENTALS
    // ─────────────────────────────────────────────────────────────────────────────
    if (isCreating) {
        return (
            <div className="space-y-6 animate-in fade-in duration-200 pb-16">
                {/* Full-Page Header with Back Button (Tailored less soft corners) */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-xs">
                    <div className="space-y-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                setIsCreating(false);
                                setEditingRental(null);
                                resetForm();
                            }}
                            className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground pl-0 mb-1 cursor-pointer"
                        >
                            <ArrowLeft size={14} />
                            <span>Back to Vacation Rentals Portfolio</span>
                        </Button>
                        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                            <Palmtree className="text-[#312E81]" size={26} />
                            <span>
                                {editingRental ? `Edit "${editingRental.title}"` : "Add New Vacation Rental Property"}
                            </span>
                        </h1>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                            {editingRental
                                ? "Update your property details, pricing, caretaker contact, present photos, and Wi-Fi credentials."
                                : "Publish a private villa, beach haven, or holiday cottage to start receiving guest bookings."}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 self-stretch sm:self-auto">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setIsCreating(false);
                                setEditingRental(null);
                                resetForm();
                            }}
                            disabled={rentalMutation.isPending}
                            className="text-xs font-semibold rounded-lg"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            onClick={handleSubmit}
                            disabled={rentalMutation.isPending}
                            className="bg-[#1E1B4B] hover:bg-[#312E81] text-white gap-2 text-xs font-semibold rounded-lg px-5 shadow-xs cursor-pointer"
                        >
                            <Save size={14} />
                            <span>
                                {rentalMutation.isPending
                                    ? "Saving Property..."
                                    : editingRental
                                    ? "Save Changes"
                                    : "Publish Vacation Rental"}
                            </span>
                        </Button>
                    </div>
                </div>

                {/* Form Sections */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 1: Basic Information */}
                    <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                        <CardContent className="p-5 sm:p-6 space-y-4">
                            <div className="border-b pb-2 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Home size={16} className="text-[#312E81]" />
                                    <span>1. Basic Property Information</span>
                                </h3>
                                <span className="text-[11px] text-muted-foreground font-medium">* Required</span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-xs font-semibold">
                                        Property Title <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        placeholder="e.g. Udaivilas Heritage Lakeside Haveli"
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        required
                                        className="h-10 text-xs sm:text-sm font-medium"
                                    />
                                </div>

                                <div className="space-y-1.5 md:col-span-2">
                                    <Label className="text-xs font-semibold">Catchy Tagline</Label>
                                    <Input
                                        placeholder="e.g. Restored 18th-century royal villa overlooking Lake Pichola"
                                        value={formData.tagline}
                                        onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Category</Label>
                                    <Select
                                        value={formData.category}
                                        onValueChange={(val) => setFormData({ ...formData, category: val })}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CATEGORIES.map((cat) => (
                                                <SelectItem key={cat.value} value={cat.value}>
                                                    {cat.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Rental Type</Label>
                                    <Select
                                        value={formData.rental_type}
                                        onValueChange={(val) => setFormData({ ...formData, rental_type: val })}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {RENTAL_TYPES.map((rt) => (
                                                <SelectItem key={rt.value} value={rt.value}>
                                                    {rt.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 2: Caretaker Contact & Wi-Fi Credentials (USER REQUESTED) */}
                    <Card className="border border-indigo-100 bg-indigo-50/20 shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                        <CardContent className="p-5 sm:p-6 space-y-4">
                            <div className="border-b border-indigo-100 pb-2 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <User size={16} className="text-[#312E81]" />
                                    <span>2. Caretaker Contact &amp; Wi-Fi Credentials</span>
                                </h3>
                                <Badge className="bg-[#312E81] text-white text-[10px]">Guest Amenities</Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {/* Caretaker Contact Subcard */}
                                <div className="p-4 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                        <Phone size={14} className="text-[#312E81]" />
                                        <span>On-Site Caretaker / Property Manager</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700">Caretaker Full Name</Label>
                                        <Input
                                            placeholder="e.g. Rameshwar Singh (Property Caretaker)"
                                            value={formData.caretaker_name}
                                            onChange={(e) => setFormData({ ...formData, caretaker_name: e.target.value })}
                                            className="h-9 text-xs"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700">
                                            Caretaker Contact / Mobile Number
                                        </Label>
                                        <Input
                                            type="tel"
                                            placeholder="e.g. +91 98765 43210"
                                            value={formData.caretaker_number}
                                            onChange={(e) => setFormData({ ...formData, caretaker_number: e.target.value })}
                                            className="h-9 text-xs font-mono"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Shared with guests on confirmed reservations for check-in coordination.
                                        </p>
                                    </div>
                                </div>

                                {/* Wi-Fi Credentials Subcard */}
                                <div className="p-4 rounded-lg bg-white border border-slate-200/90 shadow-2xs space-y-3">
                                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                                        <Wifi size={14} className="text-[#312E81]" />
                                        <span>Guest Wi-Fi Connection Details</span>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700">Wi-Fi Network Name (SSID)</Label>
                                        <Input
                                            placeholder="e.g. Udaivilas_Guest_5G"
                                            value={formData.wifi_name}
                                            onChange={(e) => setFormData({ ...formData, wifi_name: e.target.value })}
                                            className="h-9 text-xs font-medium"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-semibold text-slate-700">Wi-Fi Password</Label>
                                        <Input
                                            type="text"
                                            placeholder="e.g. HaveliGuest@2026"
                                            value={formData.wifi_password}
                                            onChange={(e) => setFormData({ ...formData, wifi_password: e.target.value })}
                                            className="h-9 text-xs font-mono"
                                        />
                                        <p className="text-[10px] text-muted-foreground">
                                            Made available inside the guest trip folio upon confirmed reservation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 3: Location & Address */}
                    <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                        <CardContent className="p-5 sm:p-6 space-y-4">
                            <div className="border-b pb-2 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <MapPin size={16} className="text-[#312E81]" />
                                    <span>3. Location &amp; Address</span>
                                </h3>
                                <span className="text-[11px] text-muted-foreground font-medium">* Required</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        City <span className="text-rose-500">*</span>
                                    </Label>
                                    <Select
                                        value={formData.city}
                                        onValueChange={(val) => setFormData({ ...formData, city: val, area: "" })}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Select City" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {cities.map((c) => (
                                                <SelectItem key={c.id} value={c.id.toString()}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Area / Neighborhood</Label>
                                    <Select
                                        value={formData.area}
                                        onValueChange={(val) => setFormData({ ...formData, area: val })}
                                        disabled={!formData.city}
                                    >
                                        <SelectTrigger className="h-9 text-xs">
                                            <SelectValue placeholder="Select Area" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filteredAreas.map((a) => (
                                                <SelectItem key={a.id} value={a.id.toString()}>
                                                    {a.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="text-xs font-semibold">Full Street Address</Label>
                                    <Input
                                        placeholder="Street, landmark, sector..."
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Postal Code</Label>
                                    <Input
                                        placeholder="313001"
                                        value={formData.postal_code}
                                        onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 4: Space & Capacity */}
                    <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                        <CardContent className="p-5 sm:p-6 space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <BedDouble size={16} className="text-[#312E81]" />
                                    <span>4. Space &amp; Capacity (Airbnb Specifications)</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Max Guests</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={formData.max_guests}
                                        onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                                        className="h-9 text-xs font-semibold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Bedrooms</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="20"
                                        value={formData.bedrooms}
                                        onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                                        className="h-9 text-xs font-semibold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Beds</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        max="30"
                                        value={formData.beds}
                                        onChange={(e) => setFormData({ ...formData, beds: e.target.value })}
                                        className="h-9 text-xs font-semibold"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Bathrooms</Label>
                                    <Input
                                        type="number"
                                        step="0.5"
                                        min="0.5"
                                        max="20"
                                        value={formData.bathrooms}
                                        onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                                        className="h-9 text-xs font-semibold"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 5: Pricing & Tariffs */}
                    <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                        <CardContent className="p-5 sm:p-6 space-y-4">
                            <div className="border-b pb-2 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <DollarSign size={16} className="text-[#312E81]" />
                                    <span>5. Pricing, Tariffs &amp; Discounts</span>
                                </h3>
                                <span className="text-[11px] text-muted-foreground font-medium">* Base price required</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">
                                        Nightly Base Price (₹) <span className="text-rose-500">*</span>
                                    </Label>
                                    <Input
                                        type="number"
                                        placeholder="e.g. 14000"
                                        value={formData.price_per_night}
                                        onChange={(e) => setFormData({ ...formData, price_per_night: e.target.value })}
                                        required
                                        className="h-10 text-sm font-bold text-slate-900"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Weekend Nightly Price (₹)</Label>
                                    <Input
                                        type="number"
                                        placeholder="Optional (Fri/Sat)"
                                        value={formData.weekend_price_per_night}
                                        onChange={(e) =>
                                            setFormData({ ...formData, weekend_price_per_night: e.target.value })
                                        }
                                        className="h-10 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Cleaning Fee (₹)</Label>
                                    <Input
                                        type="number"
                                        value={formData.cleaning_fee}
                                        onChange={(e) => setFormData({ ...formData, cleaning_fee: e.target.value })}
                                        className="h-10 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Security Deposit (₹)</Label>
                                    <Input
                                        type="number"
                                        value={formData.security_deposit}
                                        onChange={(e) => setFormData({ ...formData, security_deposit: e.target.value })}
                                        className="h-10 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="text-xs font-semibold">Weekly Stay Discount (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="Applied for 7+ nights stays"
                                        value={formData.weekly_discount_percentage}
                                        onChange={(e) =>
                                            setFormData({ ...formData, weekly_discount_percentage: e.target.value })
                                        }
                                        className="h-9 text-xs"
                                    />
                                </div>

                                <div className="space-y-1.5 sm:col-span-2">
                                    <Label className="text-xs font-semibold">Monthly Stay Discount (%)</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="Applied for 28+ nights stays"
                                        value={formData.monthly_discount_percentage}
                                        onChange={(e) =>
                                            setFormData({ ...formData, monthly_discount_percentage: e.target.value })
                                        }
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 6: House Rules & Check-in Policies */}
                    <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                        <CardContent className="p-5 sm:p-6 space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Clock size={16} className="text-[#312E81]" />
                                    <span>6. Rules &amp; Check-In Policies</span>
                                </h3>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Check-in Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.check_in_time}
                                        onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Check-out Time</Label>
                                    <Input
                                        type="time"
                                        value={formData.check_out_time}
                                        onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Min Nights</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.min_nights}
                                        onChange={(e) => setFormData({ ...formData, min_nights: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Max Nights</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.max_nights}
                                        onChange={(e) => setFormData({ ...formData, max_nights: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Cancellation Policy</Label>
                                <Select
                                    value={formData.cancellation_policy}
                                    onValueChange={(val) => setFormData({ ...formData, cancellation_policy: val })}
                                >
                                    <SelectTrigger className="h-9 text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CANCELLATION_POLICIES.map((p) => (
                                            <SelectItem key={p.value} value={p.value}>
                                                {p.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Toggles */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                <label className="flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.instant_book}
                                        onChange={(e) =>
                                            setFormData({ ...formData, instant_book: e.target.checked })
                                        }
                                        className="rounded text-[#312E81] focus:ring-0"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Instant Book</span>
                                        <span className="text-[10px] text-muted-foreground">No host pre-approval</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.allows_pets}
                                        onChange={(e) => setFormData({ ...formData, allows_pets: e.target.checked })}
                                        className="rounded text-[#312E81] focus:ring-0"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Pets Allowed</span>
                                        <span className="text-[10px] text-muted-foreground">Pet-friendly stay</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.allows_smoking}
                                        onChange={(e) =>
                                            setFormData({ ...formData, allows_smoking: e.target.checked })
                                        }
                                        className="rounded text-[#312E81] focus:ring-0"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Smoking Permitted</span>
                                        <span className="text-[10px] text-muted-foreground">Designated areas</span>
                                    </div>
                                </label>

                                <label className="flex items-center gap-2 p-3 rounded-lg border bg-card cursor-pointer hover:bg-slate-50 transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={formData.allows_parties}
                                        onChange={(e) =>
                                            setFormData({ ...formData, allows_parties: e.target.checked })
                                        }
                                        className="rounded text-[#312E81] focus:ring-0"
                                    />
                                    <div className="flex flex-col">
                                        <span className="text-xs font-semibold">Parties / Events OK</span>
                                        <span className="text-[10px] text-muted-foreground">Gatherings allowed</span>
                                    </div>
                                </label>
                            </div>

                            <div className="space-y-1.5 pt-2">
                                <Label className="text-xs font-semibold">Custom House Rules</Label>
                                <Input
                                    placeholder="e.g. Quiet hours after 10 PM, swimming pool usage rules, footwear policy..."
                                    value={formData.custom_rules}
                                    onChange={(e) => setFormData({ ...formData, custom_rules: e.target.value })}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 7: Amenities */}
                    <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                        <CardContent className="p-5 sm:p-6 space-y-4">
                            <div className="border-b pb-2 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Sparkles size={16} className="text-[#312E81]" />
                                    <span>7. Verified Property Amenities</span>
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    {formData.amenities.length} Selected
                                </span>
                            </div>

                            <div className="flex flex-wrap gap-2 p-2 border rounded-lg bg-slate-50/50 max-h-48 overflow-y-auto">
                                {amenitiesList.map((amenity) => {
                                    const isSelected = formData.amenities.includes(amenity.id);
                                    return (
                                        <button
                                            type="button"
                                            key={amenity.id}
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    amenities: isSelected
                                                        ? formData.amenities.filter((id) => id !== amenity.id)
                                                        : [...formData.amenities, amenity.id],
                                                });
                                            }}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                                                isSelected
                                                    ? "bg-[#312E81] text-white shadow-xs"
                                                    : "bg-white text-slate-700 hover:bg-slate-200 border border-slate-200/80"
                                            }`}
                                        >
                                            {isSelected && <Check size={13} />}
                                            <span>{amenity.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 8: Descriptions */}
                    <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                        <CardContent className="p-5 sm:p-6 space-y-4">
                            <div className="border-b pb-2">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Layers size={16} className="text-[#312E81]" />
                                    <span>8. Description &amp; Narrative</span>
                                </h3>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Short Summary</Label>
                                <Input
                                    placeholder="Brief overview in 1-2 lines..."
                                    value={formData.short_description}
                                    onChange={(e) =>
                                        setFormData({ ...formData, short_description: e.target.value })
                                    }
                                    className="h-9 text-xs"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Full Detailed Description</Label>
                                <textarea
                                    rows={4}
                                    placeholder="Describe the villa, rooms, architecture, surroundings, host story, and unique experience..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full text-xs sm:text-sm p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#312E81] font-sans"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Section 9: Property Photos (Present & Upload) */}
                    <Card className="border shadow-xs rounded-lg sm:rounded-xl p-0 py-0 gap-0">
                        <CardContent className="p-5 sm:p-6 space-y-5">
                            <div className="border-b pb-2 flex items-center justify-between">
                                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <ImageIcon size={16} className="text-[#312E81]" />
                                    <span>9. Property Photos</span>
                                </h3>
                                <span className="text-xs text-muted-foreground">
                                    {editingRental
                                        ? `${editingRental.images?.length || 0} Present • ${formImageFiles.length} New`
                                        : `${formImageFiles.length} photos selected`}
                                </span>
                            </div>

                            {/* PRESENT / EXISTING PHOTOS (Shown during Edit) */}
                            {editingRental && (
                                <div className="space-y-3 pb-4 border-b border-slate-200/80">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-0.5">
                                            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                                <span>Present Property Photos</span>
                                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-bold border-indigo-200 text-[#312E81]">
                                                    {editingRental.images?.length || 0} active
                                                </Badge>
                                            </h4>
                                            <p className="text-[11px] text-muted-foreground">
                                                Photos currently published and displayed to guests for this vacation rental.
                                            </p>
                                        </div>
                                    </div>

                                    {editingRental.images && editingRental.images.length > 0 ? (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                            {editingRental.images.map((img, index) => {
                                                const imgUrl = toLocalMediaPath(img.image);
                                                return (
                                                    <div
                                                        key={img.id || index}
                                                        className="relative h-24 rounded-lg overflow-hidden border border-slate-200 shadow-2xs group bg-slate-100"
                                                    >
                                                        {imgUrl ? (
                                                            <Image
                                                                src={imgUrl}
                                                                alt={img.caption || `Property photo ${index + 1}`}
                                                                fill
                                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                                            />
                                                        ) : null}
                                                        {img.is_primary && (
                                                            <span className="absolute bottom-1.5 left-1.5 bg-[#312E81] text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                                                                Cover
                                                            </span>
                                                        )}
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                if (confirm("Remove this photo from the property?")) {
                                                                    await handleDeletePhoto(img.id);
                                                                }
                                                            }}
                                                            title="Delete photo"
                                                            className="absolute top-1.5 right-1.5 bg-black/75 hover:bg-rose-600 text-white rounded-md p-1 transition-colors shadow-xs cursor-pointer opacity-90 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-lg bg-slate-50 border border-dashed border-slate-200 text-center">
                                            <p className="text-xs text-muted-foreground">
                                                No photos currently uploaded yet. Select files below to add property photos.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* UPLOAD NEW / ADDITIONAL PHOTOS */}
                            <div className="space-y-3">
                                <div className="space-y-0.5">
                                    <h4 className="text-xs font-bold text-slate-800">
                                        {editingRental ? "Upload Additional Photos" : "Add Property Photos"}
                                    </h4>
                                    <p className="text-[11px] text-muted-foreground">
                                        Upload exterior, living room, bedrooms, bathrooms, and terrace views. Supports JPG, PNG, WEBP.
                                    </p>
                                </div>

                                <label className="border-2 border-dashed border-slate-200 rounded-lg p-5 flex flex-col items-center justify-center cursor-pointer hover:border-[#312E81] hover:bg-indigo-50/20 transition-all">
                                    <Upload size={22} className="text-[#312E81] mb-1.5" />
                                    <span className="text-xs sm:text-sm font-semibold text-slate-800">
                                        Click to select {editingRental ? "more photos" : "property photos"}
                                    </span>
                                    <span className="text-[11px] text-muted-foreground mt-0.5">
                                        High-resolution landscape photos look best
                                    </span>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleFormImageSelect}
                                    />
                                </label>

                                {formImagePreviews.length > 0 && (
                                    <div className="space-y-2 pt-1">
                                        <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                            New Photos to Upload ({formImagePreviews.length})
                                        </span>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                                            {formImagePreviews.map((preview, index) => (
                                                <div
                                                    key={index}
                                                    className="relative h-24 rounded-lg overflow-hidden border shadow-xs group bg-slate-100"
                                                >
                                                    <Image
                                                        src={preview}
                                                        alt={`Upload preview ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeFormImage(index)}
                                                        className="absolute top-1.5 right-1.5 bg-black/70 hover:bg-rose-600 text-white rounded-md p-1 transition-colors"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Action Row (Tailored less soft corners) */}
                    <div className="sticky bottom-4 z-20 flex items-center justify-between gap-3 p-4 bg-white/95 backdrop-blur-md border border-slate-200 rounded-lg sm:rounded-xl shadow-lg">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setIsCreating(false);
                                setEditingRental(null);
                                resetForm();
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            disabled={rentalMutation.isPending}
                            className="text-xs font-semibold rounded-lg"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={rentalMutation.isPending}
                            className="bg-[#1E1B4B] hover:bg-[#312E81] text-white gap-2 text-xs font-semibold rounded-lg px-6 h-10 shadow-sm cursor-pointer"
                        >
                            <Save size={15} />
                            <span>
                                {rentalMutation.isPending
                                    ? "Saving Property..."
                                    : editingRental
                                    ? "Save Changes"
                                    : "Publish Vacation Rental"}
                            </span>
                        </Button>
                    </div>
                </form>
            </div>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // INVENTORY LIST VIEW
    // ─────────────────────────────────────────────────────────────────────────────
    return (
        <div className="space-y-6">
            {/* 1. HEADER SECTION */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border rounded-2xl p-5 sm:p-6 shadow-xs">
                <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Palmtree size={13} />
                        <span>Vacation Rental Portfolio</span>
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                        Vacation Rentals Inventory
                    </h1>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                        Register and manage your private villas, holiday cottages, beach havens, and homestays.
                    </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="gap-2 text-xs font-semibold rounded-xl cursor-pointer"
                    >
                        <RefreshCw size={14} className={isRefetching ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </Button>

                    <Button
                        size="sm"
                        onClick={() => {
                            resetForm();
                            setEditingRental(null);
                            setIsCreating(true);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="bg-[#1E1B4B] hover:bg-[#312E81] text-white gap-2 text-xs font-semibold rounded-xl shadow-xs px-4 cursor-pointer"
                    >
                        <Plus size={16} />
                        <span>Add Vacation Rental</span>
                    </Button>
                </div>
            </div>

            {/* 2. KPI STATS CARDS */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <Card className="border shadow-2xs">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Total Properties
                            </p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
                                {isMounted ? totalProperties : 0}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#312E81] flex items-center justify-center">
                            <Palmtree size={20} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-2xs">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Active Listings
                            </p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                                {isMounted ? activeListings : 0}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <CheckCircle2 size={20} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-2xs">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Instant Bookable
                            </p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
                                {isMounted ? instantBookCount : 0}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <Zap size={20} />
                        </div>
                    </CardContent>
                </Card>

                <Card className="border shadow-2xs">
                    <CardContent className="p-4 sm:p-5 flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                                Avg. Nightly Rate
                            </p>
                            <p className="text-2xl sm:text-3xl font-extrabold text-foreground">
                                {isMounted ? `₹${avgRate.toLocaleString("en-IN")}` : "₹0"}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* 3. SEARCH & FILTERS BAR */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border rounded-xl p-3 shadow-2xs">
                <div className="relative flex-1">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                        placeholder="Search rentals by title, address, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-9 text-xs"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                        <SelectTrigger className="h-9 text-xs w-[140px] sm:w-[160px]">
                            <SelectValue placeholder="All Cities" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Cities</SelectItem>
                            {cities.map((c) => (
                                <SelectItem key={c.id} value={c.id.toString()}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                        <SelectTrigger className="h-9 text-xs w-[140px] sm:w-[160px]">
                            <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {CATEGORIES.map((cat) => (
                                <SelectItem key={cat.value} value={cat.value}>
                                    {cat.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* 4. PROPERTIES GRID LIST */}
            {!isMounted || isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="overflow-hidden border shadow-xs">
                            <Skeleton className="h-48 w-full" />
                            <div className="p-4 space-y-2">
                                <Skeleton className="h-4 w-3/4" />
                                <Skeleton className="h-3 w-1/2" />
                                <Skeleton className="h-8 w-full mt-4" />
                            </div>
                        </Card>
                    ))}
                </div>
            ) : filteredRentals.length === 0 ? (
                <Card className="border border-dashed p-12 text-center shadow-none">
                    <div className="max-w-md mx-auto space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-[#312E81] flex items-center justify-center mx-auto shadow-2xs">
                            <Palmtree size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-lg font-bold text-foreground">
                                No vacation rentals found
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {searchQuery || selectedCityId !== "all" || selectedCategory !== "all"
                                    ? "No properties match your current search and filter criteria."
                                    : "You haven't listed any vacation rentals yet. Register your first villa or stay to start receiving guest bookings."}
                            </p>
                        </div>
                        <Button
                            onClick={() => {
                                resetForm();
                                setEditingRental(null);
                                setIsCreating(true);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className="bg-[#1E1B4B] hover:bg-[#312E81] text-white gap-2 text-xs font-semibold rounded-xl px-5 cursor-pointer"
                        >
                            <Plus size={15} />
                            <span>Add Vacation Rental</span>
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filteredRentals.map((rental) => {
                        const coverImg =
                            rental.images && rental.images.length > 0
                                ? rental.images[0].image
                                : rental.og_image;
                        const coverUrl = toLocalMediaPath(coverImg);

                        return (
                            <Card
                                key={rental.id}
                                className="p-0 py-0 gap-0 border border-slate-200/90 dark:border-slate-800 bg-card hover:shadow-md transition-all flex flex-col group rounded-lg sm:rounded-xl overflow-hidden"
                            >
                                {/* Property Cover Image - Flush to top with zero upper gap */}
                                <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                                    {coverUrl ? (
                                        <Image
                                            src={coverUrl}
                                            alt={rental.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-1 bg-slate-50">
                                            <Palmtree size={32} className="opacity-40" />
                                            <span className="text-[11px] font-medium">No cover image</span>
                                        </div>
                                    )}

                                    {/* Category Pill */}
                                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                                        <Badge className="bg-white/95 text-slate-900 border border-slate-200/80 shadow-xs font-bold text-[10px] uppercase tracking-wider backdrop-blur-xs">
                                            {rental.category_display || rental.category}
                                        </Badge>
                                        {rental.instant_book && (
                                            <Badge className="bg-[#312E81]/90 text-white font-semibold text-[10px] shadow-xs">
                                                <Zap size={10} className="mr-0.5" />
                                                Instant
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Photo Count Pill */}
                                    <button
                                        type="button"
                                        onClick={() => setPhotoModalRental(rental)}
                                        className="absolute bottom-3 right-3 bg-black/60 hover:bg-black/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                                    >
                                        <ImageIcon size={13} />
                                        <span>{rental.images?.length || 0} Photos</span>
                                    </button>
                                </div>

                                {/* Content */}
                                <CardContent className="p-4 flex-1 flex flex-col justify-between space-y-3">
                                    <div className="space-y-1.5">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="font-bold text-base text-foreground line-clamp-1 group-hover:text-[#312E81] transition-colors">
                                                {rental.title}
                                            </h3>
                                            <span className="text-sm font-extrabold text-[#312E81] shrink-0">
                                                ₹{parseFloat(rental.price_per_night || "0").toLocaleString("en-IN")}
                                                <span className="text-[10px] font-normal text-muted-foreground">/nt</span>
                                            </span>
                                        </div>

                                        {rental.tagline && (
                                            <p className="text-xs text-muted-foreground line-clamp-1 font-medium">
                                                {rental.tagline}
                                            </p>
                                        )}

                                        <p className="text-xs text-slate-500 flex items-center gap-1">
                                            <MapPin size={12} className="shrink-0 text-slate-400" />
                                            <span className="truncate">
                                                {rental.area_name ? `${rental.area_name}, ` : ""}
                                                {rental.city_name || rental.address}
                                            </span>
                                        </p>
                                    </div>

                                    {/* Caretaker & Wi-Fi Mini Badges (USER REQUESTED) */}
                                    {(rental.caretaker_name || rental.wifi_name) && (
                                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                                            {rental.caretaker_name && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium border border-slate-200/80">
                                                    <User size={11} className="text-slate-500" />
                                                    <span className="truncate max-w-[140px]">{rental.caretaker_name}</span>
                                                </span>
                                            )}
                                            {rental.wifi_name && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-[#312E81] font-medium border border-indigo-100">
                                                    <Wifi size={11} className="text-[#312E81]" />
                                                    <span className="truncate max-w-[140px]">Wi-Fi: {rental.wifi_name}</span>
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Specs Pills */}
                                    <div className="flex items-center gap-3 py-2 border-y text-xs text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Users size={13} className="text-slate-400" />
                                            {rental.max_guests} Guests
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <BedDouble size={13} className="text-slate-400" />
                                            {rental.bedrooms} BR
                                        </span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            {rental.bathrooms} Bath
                                        </span>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between gap-2 pt-1">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            asChild
                                            className="h-8 text-xs font-semibold gap-1 text-slate-700"
                                        >
                                            <Link
                                                href={`/vacanationalrental/${rental.slug}`}
                                                target="_blank"
                                            >
                                                <ExternalLink size={13} />
                                                <span>Live</span>
                                            </Link>
                                        </Button>

                                        <div className="flex items-center gap-1.5 ml-auto">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPhotoModalRental(rental)}
                                                className="h-8 text-xs font-semibold gap-1 text-slate-700 cursor-pointer"
                                            >
                                                <ImageIcon size={13} />
                                                <span>Photos</span>
                                            </Button>

                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleEditRental(rental)}
                                                className="h-8 text-xs font-semibold gap-1 text-slate-700 hover:text-black cursor-pointer"
                                            >
                                                <Pencil size={13} />
                                                <span>Edit</span>
                                            </Button>

                                            <Button
                                                variant="ghost"
                                                size="icon-sm"
                                                onClick={() => {
                                                    if (
                                                        confirm(
                                                            `Are you sure you want to remove "${rental.title}" from your portfolio?`
                                                        )
                                                    ) {
                                                        deleteMutation.mutate(rental.slug);
                                                    }
                                                }}
                                                className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            {/* PHOTO MANAGEMENT MODAL (Gallery for existing rentals) */}
            <Dialog open={!!photoModalRental} onOpenChange={(open) => !open && setPhotoModalRental(null)}>
                <DialogContent className="max-w-2xl w-[95vw] sm:w-full p-5 sm:p-6 rounded-2xl bg-white shadow-2xl border border-slate-100 max-h-[88vh] overflow-y-auto no-scrollbar">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
                            <ImageIcon className="text-[#312E81]" size={20} />
                            <span>Photo Gallery — {photoModalRental?.title}</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Upload and manage high-resolution photos for this vacation stay.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        {/* Upload trigger */}
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                                <p className="text-xs font-semibold text-slate-800">Add Photos to Gallery</p>
                                <p className="text-[11px] text-muted-foreground">
                                    Showcase bedrooms, pool, patio, living hall, kitchen, and scenic views.
                                </p>
                            </div>
                            <label className="cursor-pointer">
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={isUploadingPhotos}
                                    asChild
                                    className="bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-semibold gap-1.5"
                                >
                                    <span>
                                        <Upload size={14} />
                                        <span>{isUploadingPhotos ? "Uploading..." : "Upload Photos"}</span>
                                    </span>
                                </Button>
                                <input
                                    ref={photoInputRef}
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    disabled={isUploadingPhotos}
                                    onChange={handleUploadPhotosToExisting}
                                />
                            </label>
                        </div>

                        {/* Gallery Grid */}
                        {photoModalRental?.images && photoModalRental.images.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {photoModalRental.images.map((img) => {
                                    const imgUrl = toLocalMediaPath(img.image);
                                    return (
                                        <div
                                            key={img.id}
                                            className="relative h-32 rounded-xl overflow-hidden border shadow-xs group bg-slate-100"
                                        >
                                            {imgUrl && (
                                                <Image
                                                    src={imgUrl}
                                                    alt={img.caption || "Vacation Rental Photo"}
                                                    fill
                                                    className="object-cover"
                                                />
                                            )}
                                            {img.is_primary && (
                                                <Badge className="absolute top-2 left-2 bg-[#312E81] text-white text-[9px] font-bold">
                                                    Cover
                                                </Badge>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => handleDeletePhoto(img.id)}
                                                className="absolute top-2 right-2 bg-black/70 hover:bg-rose-600 text-white rounded-full p-1 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                                                title="Delete photo"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                            {img.caption && (
                                                <div className="absolute bottom-0 inset-x-0 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 truncate">
                                                    {img.caption}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-8 border border-dashed rounded-xl space-y-2">
                                <ImageIcon size={32} className="mx-auto text-slate-300" />
                                <p className="text-xs text-slate-500 font-medium">
                                    No photos in gallery yet. Upload photos above.
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPhotoModalRental(null)}
                            className="text-xs font-semibold cursor-pointer"
                        >
                            Done
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
