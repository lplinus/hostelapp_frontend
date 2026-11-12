"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import type { HostelListItem } from "@/types/hostel.types";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { createCity, createArea } from "@/services/location.service";
import { createAmenity } from "@/services/hostelservices/amenity.service";
import { Building2, X } from "lucide-react";
import type { ExtraChargeForm } from "./hostel-types";
import HostelFormBasic from "./hostel-form-basic";
import HostelFormLocation from "./hostel-form-location";
import HostelFormPricingSchedule from "./hostel-form-pricing-schedule";
import HostelFormAmenities from "./hostel-form-amenities";
import HostelFormCharges from "./hostel-form-charges";

interface HostelFormProps {
    initialData?: HostelListItem | null;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
    isPending: boolean;
    cities: any[] | undefined;
    areas: any[] | undefined;
    states: any[] | undefined;
    amenities: any[] | undefined;
}

const HostelForm: React.FC<HostelFormProps> = ({
    initialData,
    onSubmit,
    onCancel,
    isPending,
    cities,
    areas,
    states,
    amenities,
}) => {
    const queryClient = useQueryClient();
    const [selectedCity, setSelectedCity] = useState<string>(
        initialData?.city?.id?.toString() || ""
    );
    const [selectedArea, setSelectedArea] = useState<string>(
        initialData?.area?.id?.toString() || ""
    );

    const createCityMutation = useMutation({
        mutationFn: createCity,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["cities"] });
            setSelectedCity(data.id.toString());
            toast.success("New city added!");
        },
        onError: (err: any) => toast.error(err.message || "Failed to add city"),
    });

    const createAreaMutation = useMutation({
        mutationFn: createArea,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["areas"] });
            setSelectedArea(data.id.toString());
            toast.success("New area added!");
        },
        onError: (err: any) => toast.error(err.message || "Failed to add area"),
    });

    const createAmenityMutation = useMutation({
        mutationFn: createAmenity,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["amenities"] });
            toast.success("New amenity added!");
        },
        onError: (err: any) => toast.error(err.message || "Failed to add amenity"),
    });

    const [lat, setLat] = useState(initialData?.latitude?.toString() || "");
    const [lng, setLng] = useState(initialData?.longitude?.toString() || "");
    const [address, setAddress] = useState(initialData?.address || "");
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [extraCharges, setExtraCharges] = useState<ExtraChargeForm[]>(() => {
        if (!initialData?.extra_charges) return [];
        return initialData.extra_charges.map((ec) => ({
            id: ec.id,
            charge_type: ec.charge_type as any,
            amount: ec.amount.toString(),
            description: ec.description || "",
        }));
    });

    const handleAddExtraCharge = () => {
        setExtraCharges([
            ...extraCharges,
            { charge_type: "electricity", amount: "", description: "" },
        ]);
    };

    const handleRemoveExtraCharge = (index: number) => {
        setExtraCharges(extraCharges.filter((_, i) => i !== index));
    };

    const handleUpdateExtraCharge = (
        index: number,
        field: keyof ExtraChargeForm,
        value: any
    ) => {
        const updated = [...extraCharges];
        updated[index] = { ...updated[index], [field]: value };
        setExtraCharges(updated);
    };

    useEffect(() => {
        if (initialData) {
            setSelectedCity(initialData.city?.id?.toString() || "");
            setLat(initialData.latitude?.toString() || "");
            setLng(initialData.longitude?.toString() || "");
            setAddress(initialData.address || "");
        } else {
            setSelectedCity("");
            setSelectedArea("");
            setLat("");
            setLng("");
            setAddress("");
            setExtraCharges([]);
        }
    }, [initialData]);

    const idPrefix = initialData ? "edit" : "create";

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const newErrors: Record<string, string> = {};

        const name = formData.get("name") as string;
        const price = formData.get("price") as string;
        const short_desc = formData.get("short_description") as string;
        const city = formData.get("city") as string;
        const postalCode = formData.get("postal_code") as string;

        if (!name || name.trim().length < 3) {
            newErrors.name = "Hostel name must be at least 3 characters long.";
        }
        if (!city) {
            newErrors.city = "Please select a city.";
        }
        if (!price || Number(price) <= 0) {
            newErrors.price = "Price must be a positive number.";
        }
        if (!short_desc || short_desc.trim().length < 10) {
            newErrors.short_description = "Short description should be at least 10 characters.";
        }
        if (!postalCode || !/^\d{5,6}$/.test(postalCode)) {
            newErrors.postal_code = "Please enter a valid 5 or 6 digit postal code.";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fill in the required fields correctly.");
            return;
        }

        setErrors({});
        onSubmit(e);
    };

    return (
        <div className="w-full bg-card rounded-2xl border border-border/70 shadow-lg p-5 sm:p-7 mb-6 animate-in fade-in slide-in-from-top-3 duration-300">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-border/50 mb-5">
                <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/10 text-primary border border-primary/20">
                            <Building2 size={11} />
                            Hostel Management
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-foreground">
                            {initialData ? `Edit Hostel: ${initialData.name}` : "Add New Hostel Property"}
                        </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Configure property classification, monthly tariff, location, and amenities.
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onCancel}
                    className="text-muted-foreground hover:text-foreground p-1.5 hover:bg-muted rounded-lg transition-colors"
                >
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-6">
                <HostelFormBasic
                    idPrefix={idPrefix}
                    initialData={initialData}
                    errors={errors}
                    setErrors={setErrors}
                />

                <HostelFormLocation
                    idPrefix={idPrefix}
                    cities={cities}
                    areas={areas}
                    states={states}
                    selectedCity={selectedCity}
                    setSelectedCity={setSelectedCity}
                    selectedArea={selectedArea}
                    setSelectedArea={setSelectedArea}
                    lat={lat}
                    setLat={setLat}
                    lng={lng}
                    setLng={setLng}
                    address={address}
                    setAddress={setAddress}
                    errors={errors}
                    setErrors={setErrors}
                    initialPostalCode={initialData?.postal_code ?? undefined}
                    createCityMutation={createCityMutation}
                    createAreaMutation={createAreaMutation}
                />

                <HostelFormPricingSchedule
                    idPrefix={idPrefix}
                    initialData={initialData}
                    errors={errors}
                    setErrors={setErrors}
                />

                <HostelFormAmenities
                    amenities={amenities}
                    initialAmenities={initialData?.amenities ? [...initialData.amenities] : undefined}
                    createAmenityMutation={createAmenityMutation}
                />

                <HostelFormCharges
                    extraCharges={extraCharges}
                    handleAddExtraCharge={handleAddExtraCharge}
                    handleRemoveExtraCharge={handleRemoveExtraCharge}
                    handleUpdateExtraCharge={handleUpdateExtraCharge}
                />

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/50">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-xs font-semibold border border-input rounded-lg bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isPending}
                        className="px-5 py-2 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-all active:scale-[0.98] disabled:opacity-50"
                    >
                        {isPending
                            ? initialData
                                ? "Updating..."
                                : "Creating..."
                            : initialData
                                ? "Update Hostel"
                                : "Publish Hostel"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default HostelForm;
export type { HostelFormProps };
