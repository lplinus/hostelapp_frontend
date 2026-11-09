"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import RoomListView, { RoomListItem } from "./room-list-view";
import RoomEditModal, { RoomFormData, PropertyOption } from "./room-edit-modal";
import {
    createHotelRoomType,
    updateHotelRoomType,
    deleteHotelRoomType,
    uploadHotelImages,
} from "@/services/hotelservices/hotel.service";
import {
    updateVacationRental,
    createVacationRental,
    deleteVacationRental,
    uploadVacationRentalImages,
} from "@/services/vacanatinalrentalservices/vacationrental.service";
import type { Hotel, HotelRoomType } from "@/types/hotel.types";
import type { VacationRental } from "@/types/vacationrental.types";

interface RoomsUnitsTabProps {
    propertyType: "hotel" | "vacation_rental";
    hotels?: Hotel[];
    vacationRentals?: VacationRental[];
    initialSelectedPropertyId?: string;
    onRefresh?: () => void;
    isRefetching?: boolean;
}

export default function RoomsUnitsTab({
    propertyType,
    hotels = [],
    vacationRentals = [],
    initialSelectedPropertyId,
    onRefresh,
    isRefetching = false,
}: RoomsUnitsTabProps) {
    const queryClient = useQueryClient();

    // Selected Property Filter
    const [selectedPropertyId, setSelectedPropertyId] = useState<string>(
        initialSelectedPropertyId || "all"
    );

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingRoomData, setEditingRoomData] = useState<RoomFormData | null>(null);

    // Normalize property options for selector dropdown
    const propertyOptions: PropertyOption[] = useMemo(() => {
        if (propertyType === "hotel") {
            return hotels.map((h) => ({
                id: h.id,
                name: h.name,
                type: "hotel" as const,
                slug: h.slug,
            }));
        } else {
            return vacationRentals.map((r) => ({
                id: r.id,
                name: r.title,
                type: "vacation_rental" as const,
                slug: r.slug,
            }));
        }
    }, [propertyType, hotels, vacationRentals]);

    // Normalize rooms / units into unified RoomListItem[]
    const roomsList: RoomListItem[] = useMemo(() => {
        if (propertyType === "hotel") {
            const list: RoomListItem[] = [];
            hotels.forEach((hotel) => {
                const roomTypes = hotel.room_types || [];
                roomTypes.forEach((rt) => {
                    const roomImages = (rt.images && rt.images.length > 0)
                        ? rt.images
                        : (hotel.images || []);

                    const cover = roomImages[0]?.image || hotel.og_image;

                    const featuresArr = rt.features
                        ? rt.features.split(",").map((f) => f.trim()).filter(Boolean)
                        : [];

                    list.push({
                        id: rt.id,
                        propertyId: hotel.id,
                        propertyName: hotel.name,
                        propertyType: "hotel",
                        propertyLocation: hotel.city_name || hotel.address,
                        propertySlug: hotel.slug,
                        name: rt.name,
                        category: rt.room_category || rt.category || "deluxe",
                        categoryDisplay: rt.category_display || rt.room_category || "Deluxe Suite",
                        bedType: rt.bed_type,
                        bedTypeDisplay: rt.bed_display || rt.bed_type || "1 King Bed",
                        maxAdults: rt.max_adults || 2,
                        maxChildren: rt.max_children || 0,
                        maxOccupancy: rt.max_occupancy || (rt.max_adults + (rt.max_children || 0)),
                        basePricePerNight: parseFloat(rt.base_price_per_night || rt.price_per_night || "0"),
                        weekendPricePerNight: rt.weekend_price_per_night ? parseFloat(rt.weekend_price_per_night) : null,
                        taxPercentage: typeof rt.tax_percentage === "number" ? rt.tax_percentage : parseFloat(String(rt.tax_percentage || "12")),
                        totalRooms: rt.total_rooms || 1,
                        roomsAvailable: rt.rooms_available ?? rt.total_rooms ?? 1,
                        roomSizeSqft: rt.room_size_sqft,
                        hasBalcony: rt.has_balcony,
                        hasView: rt.has_view,
                        includesBreakfast: rt.includes_breakfast,
                        isRefundable: rt.is_refundable,
                        isAvailable: rt.is_available ?? true,
                        description: rt.description,
                        features: featuresArr,
                        images: roomImages.map((img: any) => ({
                            id: img.id,
                            image: img.image,
                            altText: img.alt_text || img.caption,
                            isPrimary: img.is_primary,
                        })),
                        coverImage: cover,
                        raw: rt,
                    });
                });
            });
            return list;
        } else {
            // For Vacation Rentals:
            const list: RoomListItem[] = [];
            vacationRentals.forEach((rental) => {
                const cover = rental.images?.[0]?.image || rental.og_image;
                const featuresArr = rental.amenities_list
                    ? rental.amenities_list.map((a) => a.name)
                    : [];

                list.push({
                    id: rental.id,
                    propertyId: rental.id,
                    propertyName: rental.title,
                    propertyType: "vacation_rental",
                    propertyLocation: rental.city_name || rental.address,
                    propertySlug: rental.slug,
                    name: rental.title,
                    category: rental.category || "villa",
                    categoryDisplay: rental.category_display || rental.category,
                    bedType: rental.beds ? `${rental.beds} Beds` : "Multiple Beds",
                    bedTypeDisplay: `${rental.bedrooms} Bedroom(s) • ${rental.beds} Bed(s)`,
                    maxAdults: rental.max_guests || 4,
                    maxChildren: 0,
                    maxOccupancy: rental.max_guests || 4,
                    basePricePerNight: parseFloat(rental.price_per_night || "0"),
                    weekendPricePerNight: rental.weekend_price_per_night ? parseFloat(rental.weekend_price_per_night) : null,
                    taxPercentage: 12,
                    totalRooms: 1,
                    roomsAvailable: rental.is_active ? 1 : 0,
                    roomSizeSqft: null,
                    hasBalcony: true,
                    hasView: true,
                    includesBreakfast: false,
                    isRefundable: rental.cancellation_policy !== "non_refundable",
                    isAvailable: rental.is_active ?? true,
                    description: rental.description || rental.short_description,
                    features: featuresArr,
                    images: (rental.images || []).map((img) => ({
                        id: img.id,
                        image: img.image,
                        altText: img.caption,
                        isPrimary: img.is_primary,
                    })),
                    coverImage: cover,
                    raw: rental,
                });
            });
            return list;
        }
    }, [propertyType, hotels, vacationRentals]);

    // Hotel Room Type Mutations
    const hotelRoomMutation = useMutation({
        mutationFn: async ({ form, photoFiles }: { form: RoomFormData; photoFiles: File[] }) => {
            const payload: any = {
                hotel: form.propertyId,
                name: form.name.trim(),
                room_category: form.category,
                bed_type: form.bed_type,
                base_price_per_night: form.base_price_per_night,
                total_rooms: parseInt(form.total_rooms) || 1,
                rooms_available: parseInt(form.rooms_available) || 1,
                max_adults: parseInt(form.max_adults) || 2,
                max_children: parseInt(form.max_children) || 0,
                max_occupancy: (parseInt(form.max_adults) || 2) + (parseInt(form.max_children) || 0),
                room_size_sqft: form.room_size_sqft ? parseInt(form.room_size_sqft) : null,
                has_balcony: form.has_balcony,
                has_view: form.has_view,
                includes_breakfast: form.includes_breakfast,
                is_refundable: form.is_refundable,
                is_available: form.is_available,
                description: form.description.trim(),
                features: form.features.join(", "),
            };

            let savedRoom: HotelRoomType;
            if (form.id) {
                savedRoom = await updateHotelRoomType(form.id, payload);
            } else {
                savedRoom = await createHotelRoomType(payload);
            }

            // Upload room photos if any were selected
            if (photoFiles.length > 0 && (savedRoom?.id || form.id)) {
                const targetRoomId = savedRoom?.id || form.id;
                const imgFormData = new FormData();
                imgFormData.append("hotel", form.propertyId);
                imgFormData.append("room_type", String(targetRoomId));
                photoFiles.forEach((file) => {
                    imgFormData.append("images", file);
                });
                try {
                    await uploadHotelImages(imgFormData);
                } catch (e) {
                    console.error("Failed to upload room photos:", e);
                }
            }

            return savedRoom;
        },
        onSuccess: (saved) => {
            queryClient.invalidateQueries({ queryKey: ["myHotelsList"] });
            queryClient.invalidateQueries({ queryKey: ["hotelRoomTypes"] });
            toast.success(
                editingRoomData?.id
                    ? "Room specifications updated successfully!"
                    : "New room type created and inventory published!",
                { description: `${saved?.name || "Room"} is ready for guest reservations.` }
            );
            setIsEditModalOpen(false);
            setEditingRoomData(null);
        },
        onError: (err: any) => {
            const errorMsg =
                err?.response?.data?.name?.[0] ||
                err?.response?.data?.detail ||
                err?.message ||
                "Failed to save room details. Please check the inputs.";
            toast.error(errorMsg);
        },
    });

    // Vacation Rental Mutation
    const vacationRentalUnitMutation = useMutation({
        mutationFn: async ({ form, photoFiles }: { form: RoomFormData; photoFiles: File[] }) => {
            const rental = vacationRentals.find((r) => r.id === form.propertyId);
            if (!rental) throw new Error("Property not found");

            const VALID_VACATION_CATEGORIES = [
                "villa",
                "apartment",
                "house",
                "cottage",
                "farmhouse",
                "beach_house",
                "cabin",
                "penthouse",
                "studio",
            ];
            const resolvedCategory = VALID_VACATION_CATEGORIES.includes(form.category)
                ? form.category
                : (rental.category || "villa");

            const payload: Partial<VacationRental> = {
                title: form.name.trim(),
                category: resolvedCategory,
                price_per_night: form.base_price_per_night,
                weekend_price_per_night: form.weekend_price_per_night || undefined,
                max_guests: (parseInt(form.max_adults) || 2) + (parseInt(form.max_children) || 0),
                description: form.description || rental.description,
            };

            const updated = await updateVacationRental(rental.slug, payload);

            if (photoFiles.length > 0) {
                const imgFormData = new FormData();
                imgFormData.append("rental", rental.id);
                photoFiles.forEach((file) => {
                    imgFormData.append("images", file);
                });
                try {
                    await uploadVacationRentalImages(imgFormData);
                } catch (e) {
                    console.error("Failed to upload photos:", e);
                }
            }

            return updated;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myVacationRentalsList"] });
            toast.success("Vacation rental unit specifications updated!");
            setIsEditModalOpen(false);
            setEditingRoomData(null);
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail || "Failed to update vacation rental unit.");
        },
    });

    // Delete Mutation
    const deleteRoomMutation = useMutation({
        mutationFn: async (room: RoomListItem) => {
            if (room.propertyType === "hotel") {
                await deleteHotelRoomType(room.id);
            } else {
                if (room.propertySlug) {
                    await deleteVacationRental(room.propertySlug);
                }
            }
        },
        onSuccess: () => {
            if (propertyType === "hotel") {
                queryClient.invalidateQueries({ queryKey: ["myHotelsList"] });
                queryClient.invalidateQueries({ queryKey: ["hotelRoomTypes"] });
                toast.success("Room type removed from hotel inventory.");
            } else {
                queryClient.invalidateQueries({ queryKey: ["myVacationRentalsList"] });
                toast.success("Vacation rental unit removed.");
            }
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.detail || "Failed to delete room.");
        },
    });

    // Handlers
    const handleAddRoom = () => {
        setEditingRoomData(null);
        setIsEditModalOpen(true);
    };

    const handleEditRoom = (room: RoomListItem) => {
        setEditingRoomData({
            id: room.id,
            propertyId: room.propertyId,
            propertyName: room.propertyName,
            propertyType: room.propertyType,
            name: room.name,
            category: room.category,
            bed_type: room.bedType,
            base_price_per_night: String(room.basePricePerNight),
            weekend_price_per_night: room.weekendPricePerNight ? String(room.weekendPricePerNight) : "",
            tax_percentage: String(room.taxPercentage || "12"),
            max_adults: String(room.maxAdults),
            max_children: String(room.maxChildren),
            max_occupancy: String(room.maxOccupancy),
            total_rooms: String(room.totalRooms),
            rooms_available: String(room.roomsAvailable),
            room_size_sqft: room.roomSizeSqft ? String(room.roomSizeSqft) : "",
            has_balcony: room.hasBalcony ?? false,
            has_view: room.hasView ?? true,
            includes_breakfast: room.includesBreakfast ?? false,
            is_refundable: room.isRefundable ?? true,
            is_available: room.isAvailable ?? true,
            description: room.description || "",
            features: room.features || [],
            existingImages: room.images,
        });
        setIsEditModalOpen(true);
    };

    const handleDeleteRoom = (room: RoomListItem) => {
        if (confirm(`Are you sure you want to remove "${room.name}" from your property inventory?`)) {
            deleteRoomMutation.mutate(room);
        }
    };

    const handleModalSubmit = async (formData: RoomFormData, photoFiles: File[]) => {
        if (formData.propertyType === "hotel") {
            await hotelRoomMutation.mutateAsync({ form: formData, photoFiles });
        } else {
            await vacationRentalUnitMutation.mutateAsync({ form: formData, photoFiles });
        }
    };

    return (
        <div className="space-y-6">
            <RoomListView
                rooms={roomsList}
                properties={propertyOptions}
                selectedPropertyId={selectedPropertyId}
                onSelectProperty={setSelectedPropertyId}
                onAddRoom={handleAddRoom}
                onEditRoom={handleEditRoom}
                onDeleteRoom={handleDeleteRoom}
                onRefresh={onRefresh}
                isRefetching={isRefetching}
                propertyType={propertyType}
            />

            {/* Room Add / Edit Modal */}
            <RoomEditModal
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                initialData={editingRoomData}
                properties={propertyOptions}
                selectedPropertyId={selectedPropertyId !== "all" ? selectedPropertyId : undefined}
                onSubmit={handleModalSubmit}
                isSubmitting={hotelRoomMutation.isPending || vacationRentalUnitMutation.isPending}
            />
        </div>
    );
}
