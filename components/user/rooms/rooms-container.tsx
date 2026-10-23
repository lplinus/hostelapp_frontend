"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, X, Pencil, Trash2, ChevronDownIcon, ChevronUpIcon, CheckIcon, AlertCircle, Users, Building2, Hotel, BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import {
    getGroupedMyRooms,
    createRoom,
    deleteRoom,
    updateRoom,
    RoomType,
    GroupedHostelRooms
} from "@/services/room.service";
import { getMyHostels } from "@/services/hostel.service";

interface RoomsContainerProps {
    readonly initialGroupedRooms: readonly GroupedHostelRooms[];
}

export default function RoomsContainer({ initialGroupedRooms }: RoomsContainerProps) {
    const queryClient = useQueryClient();
    const [priceView, setPriceView] = useState<"monthly" | "daily">("monthly");

    const { data: groupedRooms, isLoading: roomsLoading } = useQuery({
        queryKey: ["groupedRooms"],
        queryFn: getGroupedMyRooms,
        initialData: Array.from(initialGroupedRooms), // Convert readonly to mutable for useQuery if needed
        refetchInterval: 5000,
    });

    // Track collapsed state per hostel (keyed by hostel_id)
    const [collapsedHostels, setCollapsedHostels] = useState<Record<number, boolean>>({});

    const toggleHostelCollapse = (hostelId: number) => {
        setCollapsedHostels((prev) => ({
            ...prev,
            [hostelId]: !prev[hostelId],
        }));
    };

    const allCollapsed = Boolean(
        groupedRooms &&
        groupedRooms.length > 0 &&
        groupedRooms.every((h) => !!collapsedHostels[h.hostel_id])
    );

    const toggleAllHostels = () => {
        if (!groupedRooms) return;
        if (allCollapsed) {
            setCollapsedHostels({});
        } else {
            const newMap: Record<number, boolean> = {};
            groupedRooms.forEach((h) => {
                newMap[h.hostel_id] = true;
            });
            setCollapsedHostels(newMap);
        }
    };

    const { data: hostels } = useQuery({
        queryKey: ["myHostels"],
        queryFn: getMyHostels,
    });

    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [formData, setFormData] = useState<Partial<RoomType>>({
        room_category: "NON_AC",
        sharing_type: "1",
        show_this_price: false,
        features: "",
    });

    const createMutation = useMutation({
        mutationFn: (data: RoomType) => createRoom(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groupedRooms"] });
            setIsCreating(false);
            setFormData({ room_category: "NON_AC", sharing_type: "1", features: "" });
            toast.success("Room type created successfully!");
        },
        onError: (error: any) => {
            let message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            if (message && message.includes("must make a unique set")) {
                message = "This room configuration (Category + Sharing Type) already exists for this hostel. Please modify or delete the existing one.";
            }
            toast.error(message || "Failed to create room.");
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data: { id: number; data: Partial<RoomType> }) => updateRoom(data.id, data.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groupedRooms"] });
            setIsCreating(false);
            setIsEditing(false);
            setEditingId(null);
            setFormData({ room_category: "NON_AC", sharing_type: "1", features: "" });
            toast.success("Room type updated successfully!");
        },
        onError: (error: any) => {
            let message = error.errors ? Object.values(error.errors).flat().join(", ") : error.message;
            if (message && message.includes("must make a unique set")) {
                message = "This room configuration (Category + Sharing Type) already exists for this hostel. Please modify or delete the existing one.";
            }
            toast.error(message || "Failed to update room.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRoom,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groupedRooms"] });
            toast.success("Room variant deleted successfully!");
        },
        onError: () => {
            toast.error("Failed to delete room. It might have active bookings.");
        }
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isEditing && editingId) {
            updateMutation.mutate({ id: editingId, data: formData });
        } else {
            createMutation.mutate(formData as RoomType);
        }
    };

    const handleEdit = (room: any, hostelId: number) => {
        setFormData({
            hostel: hostelId,
            room_category: room.room_category ? room.room_category.toUpperCase() : "NON_AC",
            sharing_type: String(room.sharing_type),
            price: room.price,
            price_per_day: room.price_per_day,
            total_beds: room.total_beds,
            show_this_price: !!room.show_this_price,
            features: room.features || "",
        });
        setEditingId(room.id as number);
        setIsEditing(true);
        setIsCreating(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleCancel = () => {
        setIsCreating(false);
        setIsEditing(false);
        setEditingId(null);
        setFormData({ room_category: "NON_AC", sharing_type: "1", show_this_price: false, features: "" });
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === "checkbox") {
            const checkbox = e.target as HTMLInputElement;
            setFormData({ ...formData, [name]: checkbox.checked });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    return (
        <div className="space-y-6 pb-12 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-border">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">Room Management</h1>
                    <p className="text-muted-foreground text-sm">Organize and manage your hostel room variants, capacity, and tariffs.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select value={priceView} onValueChange={(v) => setPriceView(v as "monthly" | "daily")}>
                        <SelectTrigger className="w-[180px] h-10 border-border bg-white text-foreground font-medium rounded-lg">
                            <SelectValue placeholder="View Price" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly Price</SelectItem>
                            <SelectItem value="daily">Daily Price</SelectItem>
                        </SelectContent>
                    </Select>
                    <Button
                        onClick={() => {
                            if (isCreating) handleCancel();
                            else setIsCreating(true);
                        }}
                        className={`flex items-center justify-center gap-2 h-10 px-5 rounded-lg font-semibold transition-all shadow-sm ${isCreating
                            ? "bg-muted text-foreground hover:bg-muted/80 shadow-none border border-border"
                            : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 shadow-md shadow-primary/20"
                            }`}
                    >
                        {isCreating ? <X size={18} /> : <Plus size={18} />}
                        {isCreating ? "Cancel" : "Add Room"}
                    </Button>
                </div>
            </div>

            {isCreating && (
                <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-border animate-in fade-in slide-in-from-top-3 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                            {isEditing ? <Pencil size={18} /> : <Plus size={18} />}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-foreground">
                                {isEditing ? "Modify Room Configuration" : "Define New Room Variant"}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                {isEditing ? "Update rates and features for this room" : "Set up pricing, sharing type and occupancy"}
                            </p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="hostel-select" className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Building2 size={16} className="text-muted-foreground" />
                                    Assign to Hostel
                                </label>
                                <select
                                    id="hostel-select"
                                    name="hostel"
                                    onChange={handleChange}
                                    required
                                    value={formData.hostel || ""}
                                    className="w-full h-11 rounded-xl border border-border bg-muted/20 px-4 text-sm text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                >
                                    <option value="" disabled>Select a hostel...</option>
                                    {hostels?.map((h) => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category-select" className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <Hotel size={16} className="text-muted-foreground" />
                                    Room Environment
                                </label>
                                <select
                                    id="category-select"
                                    name="room_category"
                                    value={formData.room_category}
                                    onChange={handleChange}
                                    className="w-full h-11 rounded-xl border border-border bg-muted/20 px-4 text-sm text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    required
                                >
                                    <option value="NON_AC">Non-AC</option>
                                    <option value="AC">AC</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="sharing-select" className="text-sm font-bold text-foreground flex items-center gap-2">
                                    <BedDouble size={16} className="text-muted-foreground" />
                                    Sharing Configuration
                                </label>
                                <select
                                    id="sharing-select"
                                    name="sharing_type"
                                    value={formData.sharing_type}
                                    onChange={handleChange}
                                    className="w-full h-11 rounded-xl border border-border bg-muted/20 px-4 text-sm text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    required
                                >
                                    <option value="0">Private Room</option>
                                    <option value="1">Single Occupancy</option>
                                    <option value="2">Double Occupancy</option>
                                    <option value="3">Triple Occupancy</option>
                                    <option value="4">Four-Person Shared</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="price-input" className="text-sm font-bold text-foreground">Monthly Revenue (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                    <input
                                        id="price-input"
                                        type="number"
                                        name="price"
                                        value={formData.price || ""}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="w-full h-11 rounded-xl border border-border bg-muted/20 pl-8 pr-4 text-sm text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="price-day-input" className="text-sm font-bold text-foreground">Daily Tariff (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                                    <input
                                        id="price-day-input"
                                        type="number"
                                        name="price_per_day"
                                        value={formData.price_per_day || ""}
                                        onChange={handleChange}
                                        placeholder="Optional daily rate"
                                        className="w-full h-11 rounded-xl border border-border bg-muted/20 pl-8 pr-4 text-sm text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="beds-input" className="text-sm font-bold text-foreground">Inventory Volume (Beds) <span className="text-muted-foreground font-normal ml-1">(Optional)</span></label>
                                <div className="relative">
                                    <input
                                        id="beds-input"
                                        type="number"
                                        name="total_beds"
                                        value={formData.total_beds || ""}
                                        onChange={handleChange}
                                        placeholder="Number of beds"
                                        className="w-full h-11 rounded-xl border border-border bg-muted/20 px-4 text-sm text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
                                        title="Beds are permanently generated and available"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2 pt-6">
                                <input
                                    type="checkbox"
                                    id="show_this_price"
                                    name="show_this_price"
                                    checked={formData.show_this_price || false}
                                    onChange={handleChange}
                                    className="w-5 h-5 rounded border-border text-primary focus:ring-primary transition-all"
                                />
                                <label htmlFor="show_this_price" className="text-sm font-bold text-foreground cursor-pointer">
                                    Show this room's price on Hostel card
                                </label>
                            </div>
                        </div>

                        {/* Room Features */}
                        <div className="space-y-2">
                            <label htmlFor="features-input" className="text-sm font-bold text-foreground flex items-center gap-2">
                                Room Features / Highlights
                                <span className="text-muted-foreground font-normal text-xs">(comma separated)</span>
                            </label>
                            <textarea
                                id="features-input"
                                name="features"
                                value={formData.features || ""}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                placeholder="e.g. Air conditioning included, Privacy pods with curtains, Individual lockable lockers, Attached bathroom"
                                rows={3}
                                className="w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none resize-none"
                            />
                            {formData.features && (
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                    {formData.features.split(",").filter(f => f.trim()).map((feature, idx) => (
                                        <span key={idx} className="inline-flex items-center px-2.5 py-1 text-[11px] font-semibold rounded-md bg-primary/10 text-primary border border-primary/20">
                                            {feature.trim()}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-5 py-2.5 rounded-lg font-semibold bg-muted/50 text-foreground hover:bg-muted border border-border transition-all text-sm"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="px-7 py-2.5 rounded-lg font-semibold bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-all text-sm shadow-md shadow-primary/20"
                            >
                                {createMutation.isPending || updateMutation.isPending ? "Processing..." : isEditing ? "Update Configuration" : "Commission Variant"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="space-y-12">
                {roomsLoading && !groupedRooms ? (
                    <div className="space-y-4 animate-pulse">
                        {[1, 2].map(i => (
                            <div key={i} className="h-64 bg-gray-100 rounded-2xl" />
                        ))}
                    </div>
                ) : null}

                {!roomsLoading && (!groupedRooms || groupedRooms.length === 0) ? (
                    <div className="bg-white p-12 text-center rounded-3xl border-2 border-dashed border-gray-100">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="text-gray-300" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No rooms listed yet</h3>
                        <p className="text-gray-500 mt-1">Start by adding your first room configuration above.</p>
                    </div>
                ) : null}

                {groupedRooms && groupedRooms.length > 0 ? (
                    <>
                        {groupedRooms.length > 1 && (
                            <div className="flex justify-between items-center px-1 mb-2">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                    Properties ({groupedRooms.length})
                                </span>
                                <button
                                    type="button"
                                    onClick={toggleAllHostels}
                                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                                >
                                    {allCollapsed ? "Expand all properties" : "Collapse all properties"}
                                </button>
                            </div>
                        )}
                        {groupedRooms.map((hostel) => {
                            const isCollapsed = !!collapsedHostels[hostel.hostel_id];
                            const totalVariants = hostel.categories.reduce((acc, cat) => acc + (cat.rooms?.length || 0), 0);

                            return (
                                <Card key={hostel.hostel_id} className="rounded-xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md bg-white mb-6">
                                    <CardHeader
                                        onClick={() => toggleHostelCollapse(hostel.hostel_id)}
                                        className={cn(
                                            "bg-white px-6 py-5 text-foreground flex flex-row justify-between items-center space-y-0 cursor-pointer select-none transition-colors hover:bg-muted/30 group",
                                            !isCollapsed && "border-b border-border"
                                        )}
                                    >
                                        <div className="flex items-center gap-3.5 min-w-0">
                                            <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg shadow-sm border border-primary/20 shrink-0">
                                                🏨
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <CardTitle className="text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                                                        {hostel.hostel_name}
                                                    </CardTitle>
                                                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
                                                        <Users size={11} className="mr-1" />
                                                        {hostel.categories.length} CATEGORIES ACTIVE
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                    <span>{totalVariants} variant{totalVariants === 1 ? '' : 's'} configured</span>
                                                    <span>•</span>
                                                    <span className="font-medium text-foreground/70">
                                                        {isCollapsed ? "Click to expand rooms" : "Click to collapse rooms"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2.5 shrink-0 ml-4">
                                            <span className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-semibold text-muted-foreground bg-muted/40 rounded-lg border border-border/50">
                                                <BedDouble size={13} className="mr-1.5 text-primary" />
                                                {totalVariants} {totalVariants === 1 ? 'Variant' : 'Variants'}
                                            </span>
                                            <button
                                                type="button"
                                                aria-expanded={!isCollapsed}
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 transition-all cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleHostelCollapse(hostel.hostel_id);
                                                }}
                                            >
                                                <span className="hidden sm:inline">{isCollapsed ? "Expand" : "Collapse"}</span>
                                                <ChevronDownIcon
                                                    size={14}
                                                    className={cn(
                                                        "transition-transform duration-200",
                                                        !isCollapsed && "rotate-180"
                                                    )}
                                                />
                                            </button>
                                        </div>
                                    </CardHeader>

                                    {!isCollapsed && (
                                        <CardContent className="p-0 animate-in fade-in-50 duration-200">
                                            <Accordion type="multiple" defaultValue={[hostel.categories[0]?.category_name]} className="w-full">
                                                {hostel.categories.map((category) => (
                                                    <AccordionItem key={category.category_name} value={category.category_name} className="border-border px-6">
                                                        <AccordionTrigger className="hover:no-underline py-4">
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
                                                                    {category.category_name} Rooms
                                                                </Badge>
                                                                <span className="text-xs text-muted-foreground font-medium">({category.rooms.length} variants)</span>
                                                            </div>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pb-6">
                                                            <div className="overflow-x-auto rounded-xl border border-border bg-white">
                                                                <Table>
                                                                    <TableHeader className="bg-muted/40">
                                                                        <TableRow className="hover:bg-transparent border-border">
                                                                            <TableHead className="px-5 py-3.5 text-left text-[11px] font-bold text-foreground uppercase tracking-wider">Sharing Configuration</TableHead>
                                                                            <TableHead className="px-5 py-3.5 text-left text-[11px] font-bold text-foreground uppercase tracking-wider">Tariff ({priceView})</TableHead>
                                                                            <TableHead className="px-5 py-3.5 text-left text-[11px] font-bold text-foreground uppercase tracking-wider">Capacity Details</TableHead>
                                                                            <TableHead className="px-5 py-3.5 text-left text-[11px] font-bold text-foreground uppercase tracking-wider">Features</TableHead>
                                                                            <TableHead className="px-5 py-3.5 text-left text-[11px] font-bold text-foreground uppercase tracking-wider">Status</TableHead>
                                                                            <TableHead className="px-5 py-3.5 text-right text-[11px] font-bold text-foreground uppercase tracking-wider">Actions</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {category.rooms.map((room) => (
                                                                            <TableRow key={room.id} className="group hover:bg-muted/30 transition-colors duration-150 border-border">
                                                                                <TableCell className="px-5 py-4 whitespace-nowrap">
                                                                                    <span className="text-sm font-semibold text-foreground uppercase tracking-tight">{room.sharing}</span>
                                                                                </TableCell>
                                                                                <TableCell className="px-5 py-4 whitespace-nowrap">
                                                                                    <span className="text-sm font-bold text-primary">₹{Number(priceView === "monthly" ? room.price : (room.price_per_day || 0)).toLocaleString()}</span>
                                                                                </TableCell>
                                                                                <TableCell className="px-5 py-4 whitespace-nowrap">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                                                                                            <div
                                                                                                className={`h-full transition-all duration-700 ${room.available_beds === 0 && room.total_beds ? 'bg-red-500' : 'bg-primary'}`}
                                                                                                style={{ width: `${room.total_beds ? ((room.available_beds || 0) / room.total_beds) * 100 : 0}%` }}
                                                                                            />
                                                                                        </div>
                                                                                        <span className="text-xs font-bold text-foreground">
                                                                                            <span className={(room.available_beds || 0) > 0 ? "text-primary font-bold" : "text-muted-foreground"}>{room.available_beds || 0}</span>
                                                                                            <span className="px-1 text-muted-foreground/60">/</span>
                                                                                            {room.total_beds || "N/A"}
                                                                                        </span>
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell className="px-5 py-4">
                                                                                    {room.features_list && room.features_list.length > 0 ? (
                                                                                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                                                            {room.features_list.slice(0, 2).map((f: string, i: number) => (
                                                                                                <span key={i} className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                                                                                                    {f}
                                                                                                </span>
                                                                                            ))}
                                                                                            {room.features_list.length > 2 && (
                                                                                                <span className="text-[10px] text-muted-foreground font-medium">+{room.features_list.length - 2} more</span>
                                                                                            )}
                                                                                        </div>
                                                                                    ) : (
                                                                                        <span className="text-xs text-muted-foreground font-medium italic">Default</span>
                                                                                    )}
                                                                                </TableCell>
                                                                                <TableCell className="px-5 py-4 whitespace-nowrap">
                                                                                    <Badge
                                                                                        className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${room.is_available
                                                                                            ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/15"
                                                                                            : "bg-red-50 text-red-700 border-red-200 hover:bg-red-50"
                                                                                            }`}
                                                                                    >
                                                                                        {room.is_available ? "Live" : "Inactive"}
                                                                                    </Badge>
                                                                                </TableCell>
                                                                                <TableCell className="px-5 py-4 whitespace-nowrap text-right">
                                                                                    <TooltipProvider>
                                                                                        <div className="flex justify-end gap-1">
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger asChild>
                                                                                                    <Button
                                                                                                        variant="ghost"
                                                                                                        size="icon"
                                                                                                        onClick={() => handleEdit(room, hostel.hostel_id)}
                                                                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg"
                                                                                                    >
                                                                                                        <Pencil className="h-4 w-4" />
                                                                                                    </Button>
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent>Edit Configuration</TooltipContent>
                                                                                            </Tooltip>
                                                                                            <Tooltip>
                                                                                                <TooltipTrigger asChild>
                                                                                                    <Button
                                                                                                        variant="ghost"
                                                                                                        size="icon"
                                                                                                        onClick={() => {
                                                                                                            toast("Delete Variant?", {
                                                                                                                description: "Are you sure you want to delete this room variant? All associated bed data will be removed.",
                                                                                                                action: {
                                                                                                                    label: "Delete",
                                                                                                                    onClick: () => deleteMutation.mutate(room.id),
                                                                                                                },
                                                                                                            });
                                                                                                        }}
                                                                                                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
                                                                                                    >
                                                                                                        <Trash2 className="h-4 w-4" />
                                                                                                    </Button>
                                                                                                </TooltipTrigger>
                                                                                                <TooltipContent>Delete Variant</TooltipContent>
                                                                                            </Tooltip>
                                                                                        </div>
                                                                                    </TooltipProvider>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>
                                                ))}
                                            </Accordion>
                                        </CardContent>
                                    )}
                                </Card>
                            );
                        })}
                    </>
                ) : null}
            </div>
        </div>
    );
}
