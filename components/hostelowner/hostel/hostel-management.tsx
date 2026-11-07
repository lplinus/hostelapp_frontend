"use client";

import { useState, useEffect, useRef } from "react";
import DashboardSidebar from "@/components/hostelowner/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/hostelowner/dashboard/dashboard-header";
import { getMyHostels, createHostel, updateHostel, deleteHostel } from "@/services/hostelservices/hostel.service";
import { uploadHostelImages, deleteHostelImage, updateHostelImages } from "@/services/hotelservices/hostel-image.service";
import { getCities, getAreas, getStates } from "@/services/location.service";
import { getAmenities } from "@/services/hostelservices/amenity.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { HostelListItem } from "@/types/hostel.types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Pencil, Image as ImageIcon, Trash2, UploadCloud, X, AlertCircle } from "lucide-react";
import HostelForm from "./hostel-form";
import { toLocalMediaPath } from "@/lib/utils";
import { getStorageSettings, StorageSettings } from "@/services/cms.service";

const IMAGE_SLOTS = [
    { name: "image", id: "img-outer", label: "Cover / Main Photo", slotNum: 1 },
    { name: "image2", id: "img-inner-1", label: "Room View", slotNum: 2 },
    { name: "image3", id: "img-inner-2", label: "Interior / Facility", slotNum: 3 },
    { name: "image4", id: "img-inner-3", label: "Room / Balcony View", slotNum: 4 },
    { name: "image5", id: "img-inner-4", label: "Common Area / Lounge", slotNum: 5 },
    { name: "image6", id: "img-inner-5", label: "Study / Dining Space", slotNum: 6 },
    { name: "image7", id: "img-inner-6", label: "Washroom / Facility", slotNum: 7 },
    { name: "image8", id: "img-inner-7", label: "Building Entrance / Facade", slotNum: 8 },
    { name: "image9", id: "img-inner-8", label: "Additional Amenity", slotNum: 9 },
    { name: "image10", id: "img-inner-9", label: "Additional Photo", slotNum: 10 },
] as const;

export default function HostelManagement() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [currentPage, setCurrentPage] = useState(1);
    const [priceView, setPriceView] = useState<"monthly" | "daily">("monthly");
    const pageSize = 8;

    const { data: hostels, isLoading } = useQuery({
        queryKey: ["myHostels", user?.id],
        queryFn: getMyHostels,
        enabled: !!user?.id,
        refetchInterval: 5000,
    });

    const { data: cities } = useQuery({
        queryKey: ["cities"],
        queryFn: getCities,
    });

    const { data: areas } = useQuery({
        queryKey: ["areas"],
        queryFn: getAreas,
    });

    const { data: amenities } = useQuery({
        queryKey: ["amenities"],
        queryFn: getAmenities,
    });

    const { data: states } = useQuery({
        queryKey: ["states"],
        queryFn: getStates,
    });

    const [isCreating, setIsCreating] = useState(false);
    const [editingHostel, setEditingHostel] = useState<HostelListItem | null>(null);
    const [storageSettings, setStorageSettings] = useState<StorageSettings>({ max_image_size_mb: 30 });

    useEffect(() => {
        getStorageSettings().then(setStorageSettings);
    }, []);

    // ── Image Upload State ──────────────────────────────────────
    const [uploadingFor, setUploadingFor] = useState<number | null>(null);

    // ── Image Previews and Upload Form Ref ──────────────────────
    const [imagePreviews, setImagePreviews] = useState({
        image: null as string | null,
        image2: null as string | null,
        image3: null as string | null,
        image4: null as string | null,
        image5: null as string | null,
        image6: null as string | null,
        image7: null as string | null,
        image8: null as string | null,
        image9: null as string | null,
        image10: null as string | null,
    });
    const uploadFormRef = useRef<HTMLFormElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files?.[0]) {
            const file = files[0];
            const maxSize = storageSettings.max_image_size_mb * 1024 * 1024;

            if (file.size > maxSize) {
                toast.error(`Image "${file.name}" is too large. Max size is ${storageSettings.max_image_size_mb}MB.`);
                e.target.value = ""; // Clear input
                setImagePreviews((prev) => ({ ...prev, [name]: null }));
                return;
            }

            setImagePreviews((prev) => ({
                ...prev,
                [name]: URL.createObjectURL(file),
            }));
        } else {
            setImagePreviews((prev) => ({
                ...prev,
                [name]: null,
            }));
        }
    };

    const clearPreviewsAndForm = () => {
        setImagePreviews({
            image: null, image2: null, image3: null, image4: null,
            image5: null, image6: null, image7: null, image8: null,
            image9: null, image10: null
        });
        if (uploadFormRef.current) uploadFormRef.current.reset();
    };

    // ── Create ────────────────────────────────────────────────────
    const createMutation = useMutation({
        mutationFn: (data: Record<string, any>) => createHostel(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            setIsCreating(false);
            toast.success("Hostel created successfully! Please wait for admin verification.");
        },
        onError: (error: any) => {
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to create hostel.");
        }
    });

    // ── Update ────────────────────────────────────────────────────
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) =>
            updateHostel(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            setEditingHostel(null);
            toast.success("Hostel updated successfully!");
        },
        onError: (error: any) => {
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to update hostel.");
        }
    });

    // ── Delete ────────────────────────────────────────────────────
    const deleteMutation = useMutation({
        mutationFn: deleteHostel,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            toast.success("Hostel deleted successfully!");
        },
        onError: () => {
            toast.error("Failed to delete hostel. Please try again.");
        }
    });

    // ── Image Upload ──────────────────────────────────────────────
    const imageUploadMutation = useMutation({
        mutationFn: (data: FormData) => uploadHostelImages(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            clearPreviewsAndForm();
            toast.success("Images uploaded successfully!");
        },
        onError: (error: any) => {
            if (error?.status === 413 || error?.response?.status === 413) {
                toast.error("Total upload size too large. Please upload fewer images at once or reduce image resolution.");
                return;
            }
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to upload images.");
        }
    });

    const imageUpdateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: FormData }) => updateHostelImages(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            clearPreviewsAndForm();
            toast.success("Images updated successfully!");
        },
        onError: (error: any) => {
            if (error?.status === 413 || error?.response?.status === 413) {
                toast.error("Total upload size too large. Please upload fewer images at once or reduce image resolution.");
                return;
            }
            const message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            toast.error(message || "Failed to update images.");
        }
    });

    // Show toast when opening images panel for a hostel with no uploaded images
    useEffect(() => {
        if (uploadingFor && hostels) {
            clearPreviewsAndForm(); // Clear the form inputs and previews when switching hostels
            const hostel = hostels.find((h) => h.id === uploadingFor);
            if (hostel && (!hostel.images || hostel.images.length === 0)) {
                toast.info("No uploaded images found. Default images are shown. Please upload your hostel images.");
            }
        }
    }, [uploadingFor, hostels]);

    const imageDeleteMutation = useMutation({
        mutationFn: (id: number) => deleteHostelImage(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["myHostels"] });
            toast.success("Image deleted!");
        },
        onError: () => {
            toast.error("Failed to delete image.");
        }
    });

    const handleCreateSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const payload: Record<string, any> = {};

        if (!fd.get("is_active")) payload.is_active = false;
        if (!fd.get("is_discounted")) payload.is_discounted = false;

        const amenityIds = fd.getAll("amenities").map(Number);
        payload.amenities = amenityIds;

        const suitableFor = fd.getAll("suitable_for").filter(Boolean);
        payload.suitable_for = suitableFor;

        fd.forEach((value, key) => {
            if (key === "amenities" || key === "extra_charges_json" || key === "suitable_for") return; // already handled
            if (value !== "") payload[key] = value;
        });

        const extraChargesJson = fd.get("extra_charges_json") as string;
        if (extraChargesJson) {
            try {
                payload.extra_charges = JSON.parse(extraChargesJson);
            } catch (e) {
                payload.extra_charges = [];
            }
        } else {
            payload.extra_charges = [];
        }

        createMutation.mutate(payload);
    };

    const handleEditSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingHostel) return;
        const fd = new FormData(e.currentTarget);
        const payload: Record<string, any> = {};
        if (!fd.get("is_active")) payload.is_active = false;
        if (!fd.get("is_discounted")) payload.is_discounted = false;

        // Collect amenities
        const amenityIds = fd.getAll("amenities").map(Number);
        payload.amenities = amenityIds;

        const suitableFor = fd.getAll("suitable_for").filter(Boolean);
        payload.suitable_for = suitableFor;

        fd.forEach((value, key) => {
            if (key === "amenities" || key === "extra_charges_json" || key === "suitable_for") return; // already handled
            if (value !== "") payload[key] = value;
        });

        const extraChargesJson = fd.get("extra_charges_json") as string;
        if (extraChargesJson) {
            try {
                payload.extra_charges = JSON.parse(extraChargesJson);
            } catch (e) {
                payload.extra_charges = [];
            }
        } else {
            payload.extra_charges = [];
        }

        updateMutation.mutate({ id: editingHostel.id, data: payload });
    };

    const handleDelete = (id: number) => {
        toast("Delete Hostel", {
            description: "Are you sure you want to delete this hostel? This action cannot be undone.",
            action: {
                label: "Delete",
                onClick: () => deleteMutation.mutate(id),
            },
            cancel: { label: "Cancel", onClick: () => { } },
        });
    };

    const handleImageUpload = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);

        // Remove empty file objects so we don't overwrite existing images with nothing
        const keysToDelete: string[] = [];
        fd.forEach((value, key) => {
            if (value instanceof File && value.size === 0) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach(k => fd.delete(k));

        const hostel = hostels?.find((h) => h.id === uploadingFor);
        const existingSet = hostel?.images && hostel.images.length > 0 ? hostel.images[0] : null;

        if (existingSet) {
            imageUpdateMutation.mutate({ id: existingSet.id, data: fd });
        } else {
            imageUploadMutation.mutate(fd);
        }
    };

    const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

    const totalPages = Math.ceil((hostels?.length || 0) / pageSize);
    const currentHostels = hostels?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];

    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />
                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">My Hostels</h2>
                            <p className="text-sm text-muted-foreground">Manage your hostel listings, details, and media</p>
                        </div>
                        <button
                            onClick={() => {
                                setIsCreating(!isCreating);
                                setEditingHostel(null);
                                setUploadingFor(null);
                            }}
                            className="bg-primary text-primary-foreground py-2 px-4 rounded-lg hover:bg-primary/90 shadow-md shadow-primary/20 transition-all font-semibold"
                        >
                            {isCreating ? "Cancel" : "Add Hostel"}
                        </button>
                    </div>

                    {/* ── Forms ──────────────────────────────────── */}
                    {isCreating && (
                        <HostelForm
                            onSubmit={handleCreateSubmit}
                            onCancel={() => setIsCreating(false)}
                            isPending={createMutation.isPending}
                            cities={cities}
                            areas={areas}
                            states={states}
                            amenities={amenities}
                        />
                    )}

                    {editingHostel && (
                        <HostelForm
                            initialData={editingHostel}
                            onSubmit={handleEditSubmit}
                            onCancel={() => setEditingHostel(null)}
                            isPending={updateMutation.isPending}
                            cities={cities}
                            areas={areas}
                            states={states}
                            amenities={amenities}
                        />
                    )}

                    {/* ── Image Upload Form (for a specific hostel) ───── */}
                    {uploadingFor && (
                        <div className="max-w-4xl mx-auto rounded-2xl border border-border/70 bg-card shadow-lg p-5 sm:p-7 mb-6 animate-in fade-in slide-in-from-top-3 duration-300 space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between pb-4 border-b border-border/60">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                                            <ImageIcon className="w-3.5 h-3.5" /> Media Gallery
                                        </span>
                                        <span className="text-xs text-muted-foreground font-medium">Hostel #{uploadingFor}</span>
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
                                        Manage Photos: {hostels?.find((h) => h.id === uploadingFor)?.name}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        Upload up to 10 photos of rooms, amenities, and facade. High-quality photos increase student bookings.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        clearPreviewsAndForm();
                                        setUploadingFor(null);
                                    }}
                                    className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                                    title="Close gallery"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            {/* Existing Images — Current Sets */}
                            {(() => {
                                const hostel = hostels?.find((h) => h.id === uploadingFor);
                                const imgs = hostel?.images ?? [];
                                if (imgs.length > 0) {
                                    return (
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between pb-1 border-b border-border/50">
                                                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                                                    <ImageIcon className="w-3.5 h-3.5" /> Current Gallery Photo Sets ({imgs.length})
                                                </h4>
                                            </div>
                                            {imgs.map((img) => {
                                                const photos = [
                                                    { label: "Cover", url: img.image },
                                                    { label: "Slot 2", url: img.image2 },
                                                    { label: "Slot 3", url: img.image3 },
                                                    { label: "Slot 4", url: img.image4 },
                                                    { label: "Slot 5", url: img.image5 },
                                                    { label: "Slot 6", url: img.image6 },
                                                    { label: "Slot 7", url: img.image7 },
                                                    { label: "Slot 8", url: img.image8 },
                                                    { label: "Slot 9", url: img.image9 },
                                                    { label: "Slot 10", url: img.image10 },
                                                ].filter((p) => Boolean(p.url));

                                                return (
                                                    <div key={img.id} className="p-3.5 rounded-xl border border-border/70 bg-muted/20 space-y-2.5">
                                                        <div className="flex items-center justify-between gap-2">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="text-xs font-semibold text-foreground">
                                                                    Set #{img.id}
                                                                </span>
                                                                {img.is_primary && (
                                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full">
                                                                        Primary Gallery
                                                                    </span>
                                                                )}
                                                                {img.alt_text && (
                                                                    <span className="text-xs text-muted-foreground italic truncate max-w-xs">
                                                                        &ldquo;{img.alt_text}&rdquo;
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => imageDeleteMutation.mutate(img.id)}
                                                                disabled={imageDeleteMutation.isPending}
                                                                className="inline-flex items-center gap-1 text-xs text-destructive hover:text-destructive/90 bg-destructive/10 hover:bg-destructive/15 px-2.5 py-1 rounded-md font-medium transition-colors"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                                Delete Set
                                                            </button>
                                                        </div>

                                                        {photos.length > 0 ? (
                                                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                                                {photos.map((p, idx) => (
                                                                    <div key={idx} className="relative aspect-[4/3] rounded-lg overflow-hidden border border-border/70 bg-muted/40 group">
                                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                        <img
                                                                            src={toLocalMediaPath(p.url) || ""}
                                                                            alt={img.alt_text || p.label}
                                                                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                                                                        />
                                                                        <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] font-semibold backdrop-blur-xs">
                                                                            {p.label}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground italic">No image files attached to this set.</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    );
                                }
                                return (
                                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs">
                                        <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
                                        <div>
                                            <p className="font-semibold">No custom photos uploaded yet</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                Your hostel listing is currently showing default placeholder images on the public portal. Upload your photos below to showcase your property.
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Upload Form */}
                            <form ref={uploadFormRef} onSubmit={handleImageUpload} className="space-y-4">
                                <input type="hidden" name="hostel" value={uploadingFor} />
                                {(() => {
                                    const hostel = hostels?.find((h) => h.id === uploadingFor);
                                    const existingSet = hostel?.images?.[0];

                                    return (
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between pb-1 border-b border-border/50">
                                                <div>
                                                    <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                                                        Upload / Update Photo Slots
                                                    </h4>
                                                </div>
                                                <span className="text-[11px] font-medium text-muted-foreground">
                                                    Max {storageSettings.max_image_size_mb}MB per file
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {IMAGE_SLOTS.map((slot) => {
                                                    const currentPreview = imagePreviews[slot.name as keyof typeof imagePreviews];
                                                    const existingImgUrl = existingSet ? (existingSet as any)[slot.name] : null;
                                                    const displayUrl = currentPreview || (existingImgUrl ? toLocalMediaPath(existingImgUrl) : null);
                                                    const isNew = Boolean(currentPreview);
                                                    const isSlotRequired = slot.slotNum === 1 && !existingSet?.image;

                                                    return (
                                                        <div
                                                            key={slot.name}
                                                            className="group relative flex flex-col justify-between p-3 rounded-xl border border-border/70 bg-card hover:border-primary/40 hover:shadow-2xs transition-all"
                                                        >
                                                            <div className="flex items-center justify-between gap-2 mb-2">
                                                                <div className="flex items-center gap-1.5 min-w-0">
                                                                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-md text-[10px] font-bold bg-primary/10 text-primary shrink-0">
                                                                        {slot.slotNum}
                                                                    </span>
                                                                    <span className="text-xs font-semibold text-foreground truncate">
                                                                        {slot.label}
                                                                    </span>
                                                                    {isSlotRequired && (
                                                                        <span className="text-[10px] font-bold text-destructive shrink-0">*Req</span>
                                                                    )}
                                                                </div>
                                                                {displayUrl && (
                                                                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${isNew ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold" : "bg-muted text-muted-foreground"}`}>
                                                                        {isNew ? "New file" : "Saved"}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2.5">
                                                                <div className="relative w-12 h-12 rounded-lg bg-muted/50 border border-border/70 overflow-hidden shrink-0 flex items-center justify-center shadow-2xs">
                                                                    {displayUrl ? (
                                                                        // eslint-disable-next-line @next/next/no-img-element
                                                                        <img
                                                                            src={displayUrl}
                                                                            alt={`Preview slot ${slot.slotNum}`}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <ImageIcon className="w-5 h-5 text-muted-foreground/35" />
                                                                    )}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <input
                                                                        id={slot.id}
                                                                        type="file"
                                                                        name={slot.name}
                                                                        accept="image/*"
                                                                        required={isSlotRequired}
                                                                        onChange={handleImageChange}
                                                                        className="w-full text-xs text-muted-foreground file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer focus:outline-hidden"
                                                                    />
                                                                    <p className="text-[10px] text-muted-foreground/75 mt-0.5 truncate">
                                                                        {displayUrl
                                                                            ? isNew
                                                                                ? "Ready to upload"
                                                                                : existingImgUrl?.split("/").pop()
                                                                            : "Choose file..."}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Alt Text and Primary Switch */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                                                <div className="space-y-1.5">
                                                    <label htmlFor="img-alt" className="text-xs font-semibold text-foreground flex items-center justify-between">
                                                        <span>Alt Text / Gallery Caption <span className="text-destructive">*</span></span>
                                                    </label>
                                                    <input
                                                        id="img-alt"
                                                        type="text"
                                                        name="alt_text"
                                                        defaultValue={existingSet?.alt_text || ""}
                                                        required
                                                        placeholder="e.g. Modern room interior, study desk, and amenities"
                                                        className="w-full h-9 rounded-lg border border-input bg-background px-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                                                    />
                                                </div>

                                                <div className="flex items-end">
                                                    <label htmlFor="img-primary" className="w-full h-9 flex items-center gap-2.5 px-3 rounded-lg border border-border/70 bg-muted/20 hover:bg-muted/40 cursor-pointer transition-colors">
                                                        <input
                                                            id="img-primary"
                                                            type="checkbox"
                                                            name="is_primary"
                                                            defaultChecked={existingSet?.is_primary || false}
                                                            value="true"
                                                            className="w-4 h-4 rounded text-primary accent-primary focus:ring-primary/20"
                                                        />
                                                        <div className="min-w-0">
                                                            <span className="text-xs font-semibold text-foreground block leading-tight">Primary Gallery</span>
                                                            <span className="text-[10px] text-muted-foreground block leading-tight truncate">Display as the main cover photos</span>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border/60">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        clearPreviewsAndForm();
                                                        setUploadingFor(null);
                                                    }}
                                                    className="px-4 py-2 rounded-xl border border-border/80 text-foreground text-xs font-semibold hover:bg-muted transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={imageUploadMutation.isPending || imageUpdateMutation.isPending}
                                                    className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 shadow-md shadow-primary/20 transition-all disabled:opacity-50"
                                                >
                                                    <UploadCloud className="w-4 h-4" />
                                                    {imageUploadMutation.isPending || imageUpdateMutation.isPending
                                                        ? "Saving Gallery..."
                                                        : existingSet
                                                            ? "Update Gallery Photos"
                                                            : "Save Gallery Photos"}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </form>
                        </div>
                    )}

                    {/* ── Hostels Table ──────────────────────────────── */}
                    <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
                        <table className="min-w-full divide-y divide-border">
                            <thead className="bg-muted/40">
                                <tr>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">#</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            Price (₹)
                                            <select
                                                className="ml-1 bg-white border border-border text-[10px] font-bold text-primary focus:ring-0 cursor-pointer outline-none uppercase px-1.5 py-0.5 rounded shadow-sm"
                                                value={priceView}
                                                onChange={(e) => setPriceView(e.target.value as "monthly" | "daily")}
                                            >
                                                <option value="monthly">/ Month</option>
                                                <option value="daily">/ Day</option>
                                            </select>
                                        </div>
                                    </th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Rating</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Images</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-border">
                                {isLoading ? (
                                    [1, 2, 3].map((id) => (
                                        <tr key={`skel-${id}`} className="animate-pulse">
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/2"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
                                            <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
                                        </tr>
                                    ))
                                ) : (
                                    <>
                                        {hostels?.length === 0 ? (
                                            <tr><td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">No hostels found. Click &quot;Add Hostel&quot; to get started.</td></tr>
                                        ) : (
                                            currentHostels?.map((h, idx) => {
                                                const discountText = h.is_discounted ? (
                                                    <span className="text-[10px] text-primary font-bold whitespace-nowrap">
                                                        {priceView === "monthly" ? `(₹${h.final_price})` : (h.final_price_per_day ? `(₹${h.final_price_per_day})` : "")}
                                                    </span>
                                                ) : null;

                                                return (
                                                    <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                                                        <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                                                            {(currentPage - 1) * pageSize + idx + 1}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-foreground font-semibold">{h.name}</td>
                                                        <td className="px-6 py-4 text-sm text-muted-foreground">{h.city?.name ?? "N/A"}, {h.area?.name ?? "N/A"}</td>
                                                        <td className="px-6 py-4 text-sm font-semibold text-foreground">
                                                            <div className="flex flex-col">
                                                                <span className="text-primary font-bold">₹{priceView === "monthly" ? h.price : (h.price_per_day || "N/A")}</span>
                                                                {discountText}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-muted-foreground">{h.rating_avg > 0 ? h.rating_avg.toFixed(1) : "Unrated"}</td>
                                                        <td className="px-6 py-4 text-sm text-muted-foreground">
                                                            <span className="text-foreground font-medium">{h.images?.length ?? 0}</span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm">
                                                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${h.is_approved ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                                {h.is_approved ? 'Verified' : 'Pending Verification'}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm font-medium">
                                                            <div className="flex flex-wrap gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        setEditingHostel(h);
                                                                        setIsCreating(false);
                                                                        setUploadingFor(null);
                                                                        globalThis.scrollTo({ top: 0, behavior: "smooth" });
                                                                    }}
                                                                    className="text-primary hover:text-primary/80 bg-primary/10 p-2 rounded-md transition border border-primary/20"
                                                                    title="Edit"
                                                                >
                                                                    <Pencil size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => {
                                                                        setUploadingFor(h.id);
                                                                        setEditingHostel(null);
                                                                        setIsCreating(false);
                                                                        globalThis.scrollTo({ top: 0, behavior: "smooth" });
                                                                    }}
                                                                    className="text-primary hover:text-primary/80 bg-primary/10 p-2 rounded-md transition border border-primary/20"
                                                                    title="Images"
                                                                >
                                                                    <ImageIcon size={18} />
                                                                </button>
                                                                {/* <button
                                                                onClick={() => handleDelete(h.id)}
                                                                disabled={deleteMutation.isPending}
                                                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-md transition disabled:opacity-50"
                                                                title="Delete"
                                                            >
                                                                {deleteMutation.isPending ? "..." : <Trash2 size={18} />}
                                                            </button> */}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2 mt-4">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(prev => prev - 1)}
                                className="px-4 py-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: totalPages }).map((_, i) => {
                                const pageNum = i + 1;
                                return (
                                    <button
                                        key={`page-${pageNum}`}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-4 py-2 border rounded-lg text-sm transition-colors ${currentPage === pageNum ? "bg-primary text-primary-foreground font-semibold border-primary" : "bg-white text-foreground hover:bg-muted/50 border-border"}`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className="px-4 py-2 border rounded bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
