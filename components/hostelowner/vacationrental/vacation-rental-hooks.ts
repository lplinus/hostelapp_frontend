"use client";

import { useState, useRef, useEffect } from "react";
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
import { toast } from "sonner";
import { CATEGORIES } from "./vacation-rental-types";

export interface VacationRentalFormData {
    title: string; tagline: string; category: string; rental_type: string;
    city: string; area: string; address: string; postal_code: string;
    max_guests: string; bedrooms: string; beds: string; bathrooms: string;
    price_per_night: string; weekend_price_per_night: string;
    cleaning_fee: string; security_deposit: string;
    weekly_discount_percentage: string; monthly_discount_percentage: string;
    min_nights: string; max_nights: string;
    check_in_time: string; check_out_time: string;
    cancellation_policy: string; instant_book: boolean;
    allows_pets: boolean; allows_smoking: boolean; allows_parties: boolean;
    custom_rules: string; caretaker_name: string; caretaker_number: string;
    wifi_name: string; wifi_password: string;
    short_description: string; description: string; amenities: number[];
}

const INITIAL_FORM: VacationRentalFormData = {
    title: "", tagline: "", category: "villa", rental_type: "entire_place",
    city: "", area: "", address: "", postal_code: "",
    max_guests: "4", bedrooms: "2", beds: "2", bathrooms: "2.0",
    price_per_night: "", weekend_price_per_night: "",
    cleaning_fee: "0", security_deposit: "0",
    weekly_discount_percentage: "0", monthly_discount_percentage: "0",
    min_nights: "1", max_nights: "30",
    check_in_time: "15:00", check_out_time: "11:00",
    cancellation_policy: "moderate", instant_book: true,
    allows_pets: false, allows_smoking: false, allows_parties: false,
    custom_rules: "", caretaker_name: "", caretaker_number: "",
    wifi_name: "", wifi_password: "",
    short_description: "", description: "", amenities: [],
};

export function useVacationRentalManagement() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);
    const isAuthenticated = !!user && tokenManager.getAuthFlag() === "authenticated";
    useEffect(() => { setIsMounted(true); }, []);

    const [isCreating, setIsCreating] = useState(false);
    const [editingRental, setEditingRental] = useState<VacationRental | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCityId, setSelectedCityId] = useState<string>("all");
    const [selectedCategory, setSelectedCategory] = useState<string>("all");
    const [internalActiveTab, setInternalActiveTab] = useState<"properties" | "rooms">("properties");
    const [selectedRentalForRooms, setSelectedRentalForRooms] = useState<string>("all");

    const [photoModalRental, setPhotoModalRental] = useState<VacationRental | null>(null);
    const [isUploadingPhotos, setIsUploadingPhotos] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [formImageFiles, setFormImageFiles] = useState<File[]>([]);
    const [formImagePreviews, setFormImagePreviews] = useState<string[]>([]);
    const [formData, setFormData] = useState<VacationRentalFormData>({ ...INITIAL_FORM });

    const { data: rentals = [], isLoading, isRefetching, refetch } = useQuery({
        queryKey: ["myVacationRentalsList", user?.id], queryFn: () => getMyVacationRentals(),
        enabled: isAuthenticated && !!user?.id, refetchInterval: isAuthenticated ? 8000 : false,
    });
    const { data: cities = [] } = useQuery<CityItem[]>({ queryKey: ["cities"], queryFn: getCities });
    const { data: areas = [] } = useQuery<AreaItem[]>({ queryKey: ["areas"], queryFn: getAreas });
    const { data: amenitiesList = [] } = useQuery<AmenityItem[]>({ queryKey: ["amenities"], queryFn: getAmenities });

    useEffect(() => {
        if (photoModalRental && rentals.length > 0) {
            const updated = rentals.find((r) => r.id === photoModalRental.id);
            if (updated && updated !== photoModalRental) setPhotoModalRental(updated);
        }
        if (editingRental && rentals.length > 0) {
            const current = rentals.find((r) => r.id === editingRental.id);
            if (current && current.images !== editingRental.images)
                setEditingRental((prev) => (prev ? { ...prev, images: current.images } : null));
        }
    }, [rentals, photoModalRental, editingRental]);

    const filteredAreas = areas.filter((a) => !formData.city || a.city === parseInt(formData.city));

    const rentalMutation = useMutation({
        mutationFn: async (payload: any) => {
            let savedRental: VacationRental;
            if (editingRental) { savedRental = await updateVacationRental(editingRental.slug, payload); }
            else { savedRental = await createVacationRental(payload); }
            const targetRentalId = savedRental?.id || editingRental?.id;
            if (formImageFiles.length > 0 && targetRentalId) {
                const imgFormData = new FormData();
                imgFormData.append("rental", targetRentalId);
                formImageFiles.forEach((file) => { imgFormData.append("images", file); });
                try { await uploadVacationRentalImages(imgFormData); } catch (e) { console.error("Failed to upload attached images:", e); }
            }
            return savedRental;
        },
        onSuccess: (saved) => {
            queryClient.invalidateQueries({ queryKey: ["myVacationRentalsList"] });
            toast.success(editingRental ? "Vacation Rental updated successfully!" : "Vacation Rental listed successfully!", { description: `${saved.title} is now in your property portfolio.` });
            setIsCreating(false); setEditingRental(null); resetForm();
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.title?.[0] || err?.response?.data?.detail || err?.message || "Failed to save vacation rental. Please check the required fields.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (slug: string) => deleteVacationRental(slug),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["myVacationRentalsList"] }); toast.success("Vacation rental removed from portfolio."); },
        onError: (err: any) => { toast.error(err?.response?.data?.detail || "Failed to remove vacation rental."); },
    });

    const resetForm = () => { setFormData({ ...INITIAL_FORM }); setFormImageFiles([]); setFormImagePreviews([]); };

    const handleEditRental = (rental: VacationRental) => {
        setEditingRental(rental);
        setFormData({
            title: rental.title || "", tagline: rental.tagline || "",
            category: rental.category || "villa", rental_type: rental.rental_type || "entire_place",
            city: rental.city ? rental.city.toString() : "", area: rental.area ? rental.area.toString() : "",
            address: rental.address || "", postal_code: rental.postal_code || "",
            max_guests: (rental.max_guests || 4).toString(), bedrooms: (rental.bedrooms || 2).toString(),
            beds: (rental.beds || 2).toString(), bathrooms: (rental.bathrooms || 2.0).toString(),
            price_per_night: rental.price_per_night || "", weekend_price_per_night: rental.weekend_price_per_night || "",
            cleaning_fee: rental.cleaning_fee || "0", security_deposit: rental.security_deposit || "0",
            weekly_discount_percentage: (rental.weekly_discount_percentage || 0).toString(),
            monthly_discount_percentage: (rental.monthly_discount_percentage || 0).toString(),
            min_nights: (rental.min_nights || 1).toString(), max_nights: (rental.max_nights || 30).toString(),
            check_in_time: rental.check_in_time ? rental.check_in_time.slice(0, 5) : "15:00",
            check_out_time: rental.check_out_time ? rental.check_out_time.slice(0, 5) : "11:00",
            cancellation_policy: rental.cancellation_policy || "moderate",
            instant_book: rental.instant_book ?? true, allows_pets: rental.allows_pets ?? false,
            allows_smoking: rental.allows_smoking ?? false, allows_parties: rental.allows_parties ?? false,
            custom_rules: rental.custom_rules || "",
            caretaker_name: rental.caretaker_name || "", caretaker_number: rental.caretaker_number || "",
            wifi_name: rental.wifi_name || "", wifi_password: rental.wifi_password || "",
            short_description: rental.short_description || "", description: rental.description || "",
            amenities: (rental.amenities_list || []).map((a) => a.id),
        });
        setFormImageFiles([]); setFormImagePreviews([]); setIsCreating(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleFormImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const filesArray = Array.from(e.target.files);
        setFormImageFiles((prev) => [...prev, ...filesArray]);
        filesArray.forEach((file) => {
            const reader = new FileReader();
            reader.onload = (event) => { if (event.target?.result) { setFormImagePreviews((prev) => [...prev, event.target!.result as string]); } };
            reader.readAsDataURL(file);
        });
    };

    const removeFormImage = (index: number) => {
        setFormImageFiles((prev) => prev.filter((_, i) => i !== index));
        setFormImagePreviews((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) { toast.error("Please enter a property title."); return; }
        if (!formData.city) { toast.error("Please select a city."); return; }
        if (!formData.price_per_night || parseFloat(formData.price_per_night) <= 0) { toast.error("Please enter a valid base price per night."); return; }
        const payload: any = {
            title: formData.title.trim(), tagline: formData.tagline.trim(),
            category: formData.category, rental_type: formData.rental_type,
            city: parseInt(formData.city), area: formData.area ? parseInt(formData.area) : null,
            address: formData.address.trim(), postal_code: formData.postal_code.trim(),
            max_guests: parseInt(formData.max_guests) || 4, bedrooms: parseInt(formData.bedrooms) || 1,
            beds: parseInt(formData.beds) || 1, bathrooms: parseFloat(formData.bathrooms) || 1.0,
            price_per_night: parseFloat(formData.price_per_night),
            weekend_price_per_night: formData.weekend_price_per_night ? parseFloat(formData.weekend_price_per_night) : null,
            cleaning_fee: parseFloat(formData.cleaning_fee) || 0, security_deposit: parseFloat(formData.security_deposit) || 0,
            weekly_discount_percentage: parseFloat(formData.weekly_discount_percentage) || 0,
            monthly_discount_percentage: parseFloat(formData.monthly_discount_percentage) || 0,
            min_nights: parseInt(formData.min_nights) || 1, max_nights: parseInt(formData.max_nights) || 30,
            check_in_time: formData.check_in_time, check_out_time: formData.check_out_time,
            cancellation_policy: formData.cancellation_policy, instant_book: formData.instant_book,
            allows_pets: formData.allows_pets, allows_smoking: formData.allows_smoking,
            allows_parties: formData.allows_parties, custom_rules: formData.custom_rules.trim(),
            caretaker_name: formData.caretaker_name.trim(), caretaker_number: formData.caretaker_number.trim(),
            wifi_name: formData.wifi_name.trim(), wifi_password: formData.wifi_password.trim(),
            short_description: formData.short_description.trim(),
            description: formData.description.trim() || formData.title.trim(), amenities: formData.amenities,
        };
        rentalMutation.mutate(payload);
    };

    const handleUploadPhotosToExisting = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!photoModalRental || !e.target.files?.length) return;
        const files = Array.from(e.target.files);
        setIsUploadingPhotos(true);
        const imgFormData = new FormData();
        imgFormData.append("rental", photoModalRental.id);
        files.forEach((file) => { imgFormData.append("images", file); });
        try { await uploadVacationRentalImages(imgFormData); toast.success("Photos uploaded successfully!"); queryClient.invalidateQueries({ queryKey: ["myVacationRentalsList"] }); }
        catch (err: any) { toast.error(err?.response?.data?.detail || "Failed to upload photos."); }
        finally { setIsUploadingPhotos(false); if (photoInputRef.current) photoInputRef.current.value = ""; }
    };

    const handleDeletePhoto = async (photoId: number) => {
        try {
            await deleteVacationRentalImage(photoId); toast.success("Photo removed.");
            queryClient.invalidateQueries({ queryKey: ["myVacationRentalsList"] });
            if (editingRental) { setEditingRental((prev) => prev ? { ...prev, images: prev.images?.filter((img) => img.id !== photoId) } : null); }
        } catch { toast.error("Failed to delete photo."); }
    };

    const filteredRentals = rentals.filter((r) => {
        const matchesSearch = !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.address.toLowerCase().includes(searchQuery.toLowerCase()) || (r.city_name && r.city_name.toLowerCase().includes(searchQuery.toLowerCase())) || (r.area_name && r.area_name.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesCity = selectedCityId === "all" || (r.city && r.city.toString() === selectedCityId);
        const matchesCategory = selectedCategory === "all" || r.category === selectedCategory;
        return matchesSearch && matchesCity && matchesCategory;
    });

    const totalProperties = rentals.length;
    const activeListings = rentals.filter((r) => r.is_active).length;
    const instantBookCount = rentals.filter((r) => r.instant_book).length;
    const avgRate = rentals.length > 0 ? Math.round(rentals.reduce((sum, r) => sum + (parseFloat(r.price_per_night) || 0), 0) / rentals.length) : 0;

    return {
        isMounted, rentals, isLoading, isRefetching, refetch,
        cities, areas, filteredAreas, amenitiesList,
        isCreating, setIsCreating, editingRental, setEditingRental,
        searchQuery, setSearchQuery, selectedCityId, setSelectedCityId,
        selectedCategory, setSelectedCategory,
        internalActiveTab, setInternalActiveTab,
        selectedRentalForRooms, setSelectedRentalForRooms,
        photoModalRental, setPhotoModalRental, isUploadingPhotos, photoInputRef,
        formData, setFormData, formImageFiles, formImagePreviews,
        rentalMutation, deleteMutation,
        resetForm, handleEditRental, handleFormImageSelect, removeFormImage,
        handleSubmit, handleUploadPhotosToExisting, handleDeletePhoto,
        filteredRentals, totalProperties, activeListings, instantBookCount, avgRate,
    };
}

