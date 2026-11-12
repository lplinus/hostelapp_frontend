"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMyHostels } from "@/services/hostelservices/hostel.service";
import { getCities, getAreas, getStates } from "@/services/location.service";
import { getAmenities } from "@/services/hostelservices/amenity.service";
import { getStorageSettings, StorageSettings } from "@/services/cms.service";
import type { HostelListItem } from "@/types/hostel.types";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useHostelMutations } from "./hostel-mutations";

export function useHostelManagement() {
    const { user } = useAuth();
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

    // Image Upload State
    const [uploadingFor, setUploadingFor] = useState<number | null>(null);

    // Image Previews and Upload Form Ref
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
                e.target.value = "";
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

    useEffect(() => {
        if (uploadingFor && hostels) {
            clearPreviewsAndForm();
            const hostel = hostels.find((h) => h.id === uploadingFor);
            if (hostel && (!hostel.images || hostel.images.length === 0)) {
                toast.info("No uploaded images found. Default images are shown. Please upload your hostel images.");
            }
        }
    }, [uploadingFor, hostels]);

    const {
        createMutation,
        updateMutation,
        deleteMutation,
        imageUploadMutation,
        imageUpdateMutation,
        imageDeleteMutation,
        handleCreateSubmit,
        handleEditSubmit,
        handleImageUpload,
    } = useHostelMutations({
        setIsCreating,
        setEditingHostel,
        clearPreviewsAndForm,
        hostels,
        uploadingFor,
        editingHostel,
    });

    const totalPages = Math.ceil((hostels?.length || 0) / pageSize);
    const currentHostels = hostels?.slice((currentPage - 1) * pageSize, currentPage * pageSize) || [];

    return {
        hostels,
        isLoading,
        cities,
        areas,
        states,
        amenities,
        isCreating,
        setIsCreating,
        editingHostel,
        setEditingHostel,
        storageSettings,
        uploadingFor,
        setUploadingFor,
        imagePreviews,
        uploadFormRef,
        handleImageChange,
        clearPreviewsAndForm,
        createMutation,
        updateMutation,
        deleteMutation,
        imageUploadMutation,
        imageUpdateMutation,
        imageDeleteMutation,
        handleCreateSubmit,
        handleEditSubmit,
        handleImageUpload,
        currentPage,
        setCurrentPage,
        priceView,
        setPriceView,
        pageSize,
        totalPages,
        currentHostels,
    };
}
