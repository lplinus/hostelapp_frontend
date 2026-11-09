"use client";

import type { VacationRentalBooking } from "@/types/vacationrental.types";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { UseMutationResult } from "@tanstack/react-query";

interface DashboardDeclineModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedBooking: VacationRentalBooking | null;
    declineReason: string;
    setDeclineReason: (r: string) => void;
    declineMutation: UseMutationResult<VacationRentalBooking, any, { id: string; reason: string }, unknown>;
}

export function DashboardDeclineModal({
    isOpen,
    onOpenChange,
    selectedBooking,
    declineReason,
    setDeclineReason,
    declineMutation,
}: DashboardDeclineModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-lg sm:rounded-lg border border-border/80 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
                        <AlertCircle size={18} />
                        Decline Reservation Request
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Are you sure you want to decline this booking request from{" "}
                        {selectedBooking?.guest_details?.guest_name || "the guest"}?
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <label className="text-xs font-medium text-foreground block">
                        Reason for declining (Optional):
                    </label>
                    <Input
                        placeholder="Property under maintenance, minimum nights not met..."
                        value={declineReason}
                        onChange={(e) => setDeclineReason(e.target.value)}
                        className="text-xs h-9"
                    />
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={declineMutation.isPending}
                        className="text-xs"
                    >
                        Back
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={declineMutation.isPending}
                        onClick={() => {
                            if (selectedBooking) {
                                declineMutation.mutate({
                                    id: selectedBooking.id,
                                    reason: declineReason.trim() || "Declined by host",
                                });
                            }
                        }}
                        className="text-xs gap-1.5"
                    >
                        {declineMutation.isPending ? "Declining..." : "Confirm Decline"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

