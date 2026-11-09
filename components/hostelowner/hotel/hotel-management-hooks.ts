"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
    getMyHotelBookings,
} from "@/services/hotelservices/hotel.service";
import { getCities, getAreas, type CityItem, type AreaItem } from "@/services/location.service";
import { getAmenities, type AmenityItem } from "@/services/hostelservices/amenity.service";
import type { Hotel } from "@/types/hotel.types";
import { useAuth } from "@/hooks/useAuth";
import { tokenManager } from "@/lib/token";
import { toast } from "sonner";
import type { HotelFormData, RoomFormData, PhotoPreviews, TabType } from "./hotel-management-types";

export function useHotelManagement() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isMounted, setIsMounted] = useState(false);
    const isAuthenticated = !!user && tokenManager.getAuthFlag() === "authenticated";

    useEffect(() => { setIsMounted(true); }, []);

    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get("tab");

    const [isCreating, setIsCreating] = useState(false);
    const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCityId, setSelectedCityId] = useState<string>("all");
    const [activeTab, setActiveTab] = useState<TabType>(
        tabParam === "bookings" ? "bookings" : tabParam === "rooms" ? "rooms" : "properties"
    );
    const [isSwitchingTab, setIsSwitchingTab] = useState(false);
    const [selectedHotelForRooms, setSelectedHotelForRooms] = useState<string>("all");
    const [isMapOpen, setIsMapOpen] = useState(false);

    useEffect(() => {
        const target: TabType = tabParam === "bookings" ? "bookings" : tabParam === "rooms" ? "rooms" : "properties";
        if (target !== activeTab) {
            setIsSwitchingTab(true);
            setActiveTab(target);
            const timer = setTimeout(() => setIsSwitchingTab(false), 280);
            return () => clearTimeout(timer);
        }
    }, [tabParam]);

    const handleTabChange = (newTab: TabType) => {
        if (newTab === activeTab) return;
        setIsSwitchingTab(true);
        setActiveTab(newTab);
        const query = newTab === "bookings" ? "bookings" : newTab === "rooms" ? "rooms" : "property";
        router.replace(`/hotel?tab=${query}`, { scroll: false });
        setTimeout(() => { setIsSwitchingTab(false); }, 280);
    };

    const [photoModalHotel, setPhotoModalHotel] = useState<Hotel | null>(null);
    const [photoPreviews, setPhotoPreviews] = useState<PhotoPreviews>({
        image: null, image2: null, image3: null, image4: null, image5: null,
    });
    const photoFormRef = useRef<HTMLFormElement>(null);
    const [formImageFiles, setFormImageFiles] = useState<File[]>([]);
    const [formImagePreviews, setFormImagePreviews] = useState<string[]>([]);
    const [roomTypeModalHotel, setRoomTypeModalHotel] = useState<Hotel | null>(null);
    const [roomFormData, setRoomFormData] = useState<RoomFormData>({
        name: "", category: "deluxe", bed_type: "king", base_price_per_night: "",
        total_rooms: "5", rooms_available: "5", max_adults: "2", max_children: "1",
        has_balcony: false, has_view: true,
    });

    const [formData, setFormData] = useState<HotelFormData>({
        name: "", tagline: "", hotel_type: "boutique", star_rating: 4,
        city: "", area: "", address: "", postal_code: "",
        latitude: "", longitude: "", check_in_time: "14:00", check_out_time: "11:00",
        cancellation_policy: "free_cancellation", allows_pets: false,
        description: "", short_description: "", amenities: [],
    });

    const { data: hotels = [], isLoading, isRefetching, refetch } = useQuery({
        queryKey: ["myHotelsList", user?.id], queryFn: () => getMyHotels(),
        enabled: isAuthenticated && !!user?.id, refetchInterval: isAuthenticated ? 8000 : false,
    });
    const { data: hotelBookings = [] } = useQuery({
        queryKey: ["hotelBookings", user?.id], queryFn: () => getMyHotelBookings(),
        enabled: isAuthenticated && !!user?.id,
    });
    const { data: cities = [] } = useQuery<CityItem[]>({ queryKey: ["cities"], queryFn: getCities });
    const { data: areas = [] } = useQuery<AreaItem[]>({ queryKey: ["areas"], queryFn: getAreas });
    const { data: amenitiesList = [] } = useQuery<AmenityItem[]>({ queryKey: ["amenities"], queryFn: getAmenities });

    useEffect(() => {
        if (photoModalHotel && hotels.length > 0) {
            const updated = hotels.find((h) => h.id === photoModalHotel.id);
            if (updated && updated !== photoModalHotel) setPhotoModalHotel(updated);
        }
    }, [hotels, photoModalHotel]);

    const filteredAreas = areas.filter((a) => !formData.city || a.city === parseInt(formData.city));

    const hotelMutation = useMutation({
        mutationFn: async (payload: any) => {
            let savedHotel: Hotel;
            if (editingHotel) { savedHotel = await updateHotel(editingHotel.id, payload); }
            else { savedHotel = await createHotel(payload); }
            const targetHotelId = savedHotel?.id || editingHotel?.id;
            if (formImageFiles.length > 0 && targetHotelId) {
                const imgFormData = new FormData();
                imgFormData.append("hotel", targetHotelId);
                formImageFiles.forEach((file, index) => {
                    imgFormData.append(`image${index > 0 ? index + 1 : ""}`, file);
                });
                try { await uploadHotelImages(imgFormData); } catch (e) { console.error("Failed to upload attached images:", e); }
            }
            return savedHotel;
        },
        onSuccess: (saved) => {
            queryClient.invalidateQueries({ queryKey: ["myHotelsList"] });
            toast.success(editingHotel ? "Hotel updated successfully!" : "Hotel created successfully!",
                { description: `${saved.name} is now available in your property inventory.` });
            setIsCreating(false); setEditingHotel(null); resetForm();
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.name?.[0] || err?.response?.data?.detail || err?.message || "Failed to save hotel. Please verify the required fields.");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => deleteHotel(id),
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["myHotelsList"] }); toast.success("Hotel removed from inventory."); },
        onError: () => { toast.error("Failed to delete hotel."); },
    });

    const roomTypeMutation = useMutation({
        mutationFn: (payload: any) => createHotelRoomType(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHotelsList"] });
            toast.success("Room type added successfully!");
            setRoomTypeModalHotel(null);
            setRoomFormData({ name: "", category: "deluxe", bed_type: "king", base_price_per_night: "",
                total_rooms: "5", rooms_available: "5", max_adults: "2", max_children: "1", has_balcony: false, has_view: true });
        },
        onError: (err: any) => { toast.error(err?.response?.data?.detail || "Failed to add room type."); },
    });

    const photoUploadMutation = useMutation({
        mutationFn: (data: FormData) => uploadHotelImages(data),
        onSuccess: async () => {
            queryClient.invalidateQueries({ queryKey: ["myHotelsList"] });
            toast.success("Hotel photos uploaded successfully!");
            if (photoFormRef.current) photoFormRef.current.reset();
            if (photoModalHotel) {
                try {
                    const lookupKey = photoModalHotel.slug || photoModalHotel.id;
                    const fresh = await getHotelBySlug(lookupKey);
                    if (fresh) setPhotoModalHotel(fresh);
                } catch {
                    await new Promise((r) => setTimeout(r, 800));
                    await queryClient.refetchQueries({ queryKey: ["myHotelsList"] });
                }
            }
            setPhotoPreviews({ image: null, image2: null, image3: null, image4: null, image5: null });
        },
        onError: (err: any) => { toast.error(err?.response?.data?.detail || "Failed to upload hotel photos."); },
    });

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
                    await new Promise((r) => setTimeout(r, 800));
                    await queryClient.refetchQueries({ queryKey: ["myHotelsList"] });
                }
            }
        },
        onError: () => { toast.error("Failed to delete photo."); },
    });

    const resetForm = () => {
        setFormData({ name: "", tagline: "", hotel_type: "boutique", star_rating: 4,
            city: cities[0]?.id ? String(cities[0].id) : "", area: "", address: "", postal_code: "",
            latitude: "", longitude: "", check_in_time: "14:00", check_out_time: "11:00",
            cancellation_policy: "free_cancellation", allows_pets: false,
            description: "", short_description: "", amenities: [] });
        setFormImageFiles([]); setFormImagePreviews([]);
    };

    const startEdit = (hotel: Hotel) => {
        setEditingHotel(hotel);
        setFormData({
            name: hotel.name || "", tagline: hotel.tagline || "", hotel_type: hotel.hotel_type || "boutique",
            star_rating: hotel.star_rating || 4, city: String(hotel.city || ""),
            area: hotel.area ? String(hotel.area) : "", address: hotel.address || "",
            postal_code: hotel.postal_code || "",
            latitude: hotel.latitude ? String(hotel.latitude) : "", longitude: hotel.longitude ? String(hotel.longitude) : "",
            check_in_time: hotel.check_in_time || "14:00", check_out_time: hotel.check_out_time || "11:00",
            cancellation_policy: hotel.cancellation_policy || "free_cancellation",
            allows_pets: hotel.allows_pets || false, description: hotel.description || "",
            short_description: hotel.short_description || "",
            amenities: hotel.amenities_list?.map((a) => a.id) || [],
        });
        setFormImageFiles([]); setFormImagePreviews([]); setIsCreating(true);
    };

    const handleLocationChange = (newLat: number, newLng: number, newAddress: string) => {
        setFormData((prev) => ({
            ...prev,
            latitude: newLat ? newLat.toFixed(6) : prev.latitude,
            longitude: newLng ? newLng.toFixed(6) : prev.longitude,
            address: newAddress ? newAddress : prev.address,
        }));
    };

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

    const handleGalleryImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files?.[0]) { setPhotoPreviews((prev) => ({ ...prev, [name]: URL.createObjectURL(files[0]) })); }
        else { setPhotoPreviews((prev) => ({ ...prev, [name]: null })); }
    };

    const handleGalleryUploadSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!photoModalHotel) return;
        const fd = new FormData(e.currentTarget);
        fd.append("hotel", photoModalHotel.id);
        photoUploadMutation.mutate(fd);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) { toast.error("Hotel name is required."); return; }
        if (!formData.city) { toast.error("Please select a city."); return; }
        if (!formData.address.trim()) { toast.error("Address is required."); return; }
        const payload: any = {
            name: formData.name.trim(), tagline: formData.tagline.trim(), hotel_type: formData.hotel_type,
            star_rating: Number(formData.star_rating), city: parseInt(formData.city),
            area: formData.area ? parseInt(formData.area) : null, address: formData.address.trim(),
            postal_code: formData.postal_code.trim(),
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            check_in_time: formData.check_in_time, check_out_time: formData.check_out_time,
            cancellation_policy: formData.cancellation_policy, allows_pets: formData.allows_pets,
            description: formData.description.trim() || formData.name,
            short_description: formData.short_description.trim(), amenities: formData.amenities, is_active: true,
        };
        hotelMutation.mutate(payload);
    };

    const handleRoomTypeSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomTypeModalHotel) return;
        if (!roomFormData.name.trim()) { toast.error("Room category name is required."); return; }
        if (!roomFormData.base_price_per_night || parseFloat(roomFormData.base_price_per_night) <= 0) { toast.error("Please enter a valid price per night."); return; }
        const payload = {
            hotel: roomTypeModalHotel.id, name: roomFormData.name.trim(),
            room_category: roomFormData.category, bed_type: roomFormData.bed_type,
            base_price_per_night: roomFormData.base_price_per_night,
            total_rooms: parseInt(roomFormData.total_rooms) || 1,
            rooms_available: parseInt(roomFormData.rooms_available) || 1,
            max_adults: parseInt(roomFormData.max_adults) || 2,
            max_children: parseInt(roomFormData.max_children) || 0,
            has_balcony: roomFormData.has_balcony, has_view: roomFormData.has_view, is_available: true,
        };
        roomTypeMutation.mutate(payload);
    };

    const filteredHotels = hotels.filter((h) => {
        const matchesSearch = h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.city_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            h.address?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCity = selectedCityId === "all" || String(h.city) === selectedCityId;
        return matchesSearch && matchesCity;
    });

    const totalRoomsCount = hotels.reduce((acc, h) => acc + (h.room_types?.length || 0), 0);

    return {
        isMounted, hotels, hotelBookings, isLoading, isRefetching, refetch,
        cities, areas, filteredAreas, amenitiesList,
        activeTab, isSwitchingTab, handleTabChange,
        isCreating, setIsCreating, editingHotel, setEditingHotel,
        searchQuery, setSearchQuery, selectedCityId, setSelectedCityId,
        selectedHotelForRooms, setSelectedHotelForRooms,
        isMapOpen, setIsMapOpen,
        formData, setFormData, formImageFiles, formImagePreviews,
        photoModalHotel, setPhotoModalHotel, photoPreviews, photoFormRef,
        roomTypeModalHotel, setRoomTypeModalHotel, roomFormData, setRoomFormData,
        hotelMutation, deleteMutation, roomTypeMutation, photoUploadMutation, photoDeleteMutation,
        resetForm, startEdit, handleLocationChange,
        handleFormImageChange, removeFormImage,
        handleGalleryImageChange, handleGalleryUploadSubmit,
        handleFormSubmit, handleRoomTypeSubmit,
        filteredHotels, totalRoomsCount,
    };
}

