"use client";

import type { VacationRental } from "@/types/vacationrental.types";
import type { UseMutationResult } from "@tanstack/react-query";
import { Palmtree, ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VacationRentalFormHeaderProps {
    editingRental: VacationRental | null;
    setIsCreating: React.Dispatch<React.SetStateAction<boolean>>;
    setEditingRental: React.Dispatch<React.SetStateAction<VacationRental | null>>;
    resetForm: () => void;
    handleSubmit: (e: React.FormEvent) => void;
    rentalMutation: UseMutationResult<VacationRental, unknown, unknown>;
}

export default function VacationRentalFormHeader({
    editingRental, setIsCreating, setEditingRental, resetForm, handleSubmit, rentalMutation,
}: VacationRentalFormHeaderProps) {
    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card border rounded-lg sm:rounded-xl p-5 sm:p-6 shadow-xs">
            <div className="space-y-1">
                <Button type="button" variant="ghost" size="sm" onClick={() => { setIsCreating(false); setEditingRental(null); resetForm(); }} className="gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground pl-0 mb-1 cursor-pointer">
                    <ArrowLeft size={14} />
                    <span>Back to Vacation Rentals Portfolio</span>
                </Button>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
                    <Palmtree className="text-[#312E81]" size={26} />
                    <span>{editingRental ? `Edit "${editingRental.title}"` : "Add New Vacation Rental Property"}</span>
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                    {editingRental
                        ? "Update your property details, pricing, caretaker contact, present photos, and Wi-Fi credentials."
                        : "Publish a private villa, beach haven, or holiday cottage to start receiving guest bookings."}
                </p>
            </div>
            <div className="flex items-center gap-2 self-stretch sm:self-auto">
                <Button type="button" variant="outline" size="sm" onClick={() => { setIsCreating(false); setEditingRental(null); resetForm(); }} disabled={rentalMutation.isPending} className="text-xs font-semibold rounded-lg">Cancel</Button>
                <Button type="button" onClick={handleSubmit} disabled={rentalMutation.isPending} className="bg-[#1E1B4B] hover:bg-[#312E81] text-white gap-2 text-xs font-semibold rounded-lg px-5 shadow-xs cursor-pointer">
                    <Save size={14} />
                    <span>{rentalMutation.isPending ? "Saving Property..." : editingRental ? "Save Changes" : "Publish Vacation Rental"}</span>
                </Button>
            </div>
        </div>
    );
}

