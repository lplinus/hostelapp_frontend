"use client";

import type { Hotel } from "@/types/hotel.types";
import type { RoomFormData } from "../hotel-management-types";
import type { UseMutationResult } from "@tanstack/react-query";
import { BedDouble } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface HotelRoomTypeModalProps {
    roomTypeModalHotel: Hotel | null;
    setRoomTypeModalHotel: React.Dispatch<React.SetStateAction<Hotel | null>>;
    roomFormData: RoomFormData;
    setRoomFormData: React.Dispatch<React.SetStateAction<RoomFormData>>;
    handleRoomTypeSubmit: (e: React.FormEvent) => void;
    roomTypeMutation: UseMutationResult<unknown, unknown, unknown>;
}

export default function HotelRoomTypeModal({
    roomTypeModalHotel, setRoomTypeModalHotel,
    roomFormData, setRoomFormData,
    handleRoomTypeSubmit, roomTypeMutation,
}: HotelRoomTypeModalProps) {
    return (
        <Dialog open={!!roomTypeModalHotel} onOpenChange={(open) => !open && setRoomTypeModalHotel(null)}>
            <DialogContent className="max-w-lg scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {roomTypeModalHotel && (
                    <form onSubmit={handleRoomTypeSubmit}>
                        <DialogHeader>
                            <DialogTitle className="text-base font-bold flex items-center gap-2">
                                <BedDouble size={18} className="text-[#312E81]" />
                                Add Room Type to {roomTypeModalHotel.name}
                            </DialogTitle>
                            <DialogDescription className="text-xs">
                                Configure a private suite or room inventory with base per-night rate.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4 text-xs">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-semibold">Room Category Name *</Label>
                                <Input placeholder="e.g. Deluxe King Suite" value={roomFormData.name || ""} onChange={(e) => setRoomFormData({ ...roomFormData, name: e.target.value })} className="h-9 text-xs" required />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Category</Label>
                                    <Select value={roomFormData.category} onValueChange={(val) => setRoomFormData({ ...roomFormData, category: val })}>
                                        <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="Select Category" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="standard">Standard Room</SelectItem>
                                            <SelectItem value="deluxe">Deluxe Room</SelectItem>
                                            <SelectItem value="executive_suite">Executive Suite</SelectItem>
                                            <SelectItem value="family_suite">Family Suite</SelectItem>
                                            <SelectItem value="presidential_suite">Presidential Suite</SelectItem>
                                            <SelectItem value="studio">Studio</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Bed Configuration</Label>
                                    <Select value={roomFormData.bed_type} onValueChange={(val) => setRoomFormData({ ...roomFormData, bed_type: val })}>
                                        <SelectTrigger className="h-9 text-xs bg-background"><SelectValue placeholder="Select Bed Type" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="king">1 King Bed</SelectItem>
                                            <SelectItem value="queen">1 Queen Bed</SelectItem>
                                            <SelectItem value="twin">2 Twin Beds</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Nightly Price (₹) *</Label>
                                    <Input type="number" placeholder="2999" value={roomFormData.base_price_per_night || ""} onChange={(e) => setRoomFormData({ ...roomFormData, base_price_per_night: e.target.value })} className="h-9 text-xs" required />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Total Inventory</Label>
                                    <Input type="number" min="1" value={roomFormData.total_rooms || ""} onChange={(e) => setRoomFormData({ ...roomFormData, total_rooms: e.target.value, rooms_available: e.target.value })} className="h-9 text-xs" />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-semibold">Max Guests</Label>
                                    <Input type="number" min="1" value={roomFormData.max_adults || ""} onChange={(e) => setRoomFormData({ ...roomFormData, max_adults: e.target.value })} className="h-9 text-xs" />
                                </div>
                            </div>

                            <div className="flex items-center gap-4 pt-1">
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={roomFormData.has_balcony} onChange={(e) => setRoomFormData({ ...roomFormData, has_balcony: e.target.checked })} className="rounded border-input text-blue-600 focus:ring-blue-500" />
                                    <span>Private Balcony</span>
                                </label>
                                <label className="flex items-center gap-1.5 cursor-pointer">
                                    <input type="checkbox" checked={roomFormData.has_view} onChange={(e) => setRoomFormData({ ...roomFormData, has_view: e.target.checked })} className="rounded border-input text-blue-600 focus:ring-blue-500" />
                                    <span>Scenic City/Pool View</span>
                                </label>
                            </div>
                        </div>

                        <DialogFooter className="gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => setRoomTypeModalHotel(null)} className="text-xs">Cancel</Button>
                            <Button type="submit" size="sm" disabled={roomTypeMutation.isPending} className="text-xs bg-[#312E81] hover:bg-[#252269] active:bg-[#1E1B4B] text-white font-medium shadow-xs transition-all">
                                {roomTypeMutation.isPending ? "Adding..." : "Add Room Type"}
                            </Button>
                        </DialogFooter>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}

