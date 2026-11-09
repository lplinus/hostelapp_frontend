"use client";

import type { VacationRentalBooking } from "@/types/vacationrental.types";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import type { UseMutationResult } from "@tanstack/react-query";

interface DashboardCancelModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    selectedBooking: VacationRentalBooking | null;
    cancelReason: string;
    setCancelReason: (r: string) => void;
    cancelMutation: UseMutationResult<VacationRentalBooking, any, { id: string; reason: string }, unknown>;
}

export function DashboardCancelModal({
    isOpen,
    onOpenChange,
    selectedBooking,
    cancelReason,
    setCancelReason,
    cancelMutation,
}: DashboardCancelModalProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md rounded-lg sm:rounded-lg border border-border/80 shadow-2xl">
                <DialogHeader>
                    <DialogTitle className="text-base font-bold text-destructive flex items-center gap-2">
                        <AlertCircle size={18} />
                        Cancel Vacation Rental Stay
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                        Are you sure you want to cancel reservation #{selectedBooking?.booking_reference}?
                        The calendar dates will be restored for other guests.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                    <label className="text-xs font-medium text-foreground block">
                        Reason for cancellation (Optional):
                    </label>
                    <Input
                        placeholder="Travel plan changes, emergency, etc..."
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        className="text-xs h-9"
                    />
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onOpenChange(false)}
                        disabled={cancelMutation.isPending}
                        className="text-xs"
                    >
                        Keep Reservation
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        disabled={cancelMutation.isPending}
                        onClick={() => {
                            if (selectedBooking) {
                                cancelMutation.mutate({
                                    id: selectedBooking.id,
                                    reason: cancelReason.trim() || "Cancelled by user",
                                });
                            }
                        }}
                        className="text-xs gap-1.5"
                    >
                        {cancelMutation.isPending ? "Cancelling..." : "Confirm Cancellation"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

