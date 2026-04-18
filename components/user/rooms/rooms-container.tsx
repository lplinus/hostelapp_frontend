"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, X, Pencil, Trash2, ChevronDownIcon, ChevronUpIcon, CheckIcon, AlertCircle, Users, Building2, Hotel, BedDouble } from "lucide-react";

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
    });

    const createMutation = useMutation({
        mutationFn: (data: RoomType) => createRoom(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["groupedRooms"] });
            setIsCreating(false);
            setFormData({ room_category: "NON_AC", sharing_type: "1" });
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
            setFormData({ room_category: "NON_AC", sharing_type: "1" });
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
        setFormData({ room_category: "NON_AC", sharing_type: "1", show_this_price: false });
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
        <div className="space-y-8 pb-12 font-sans">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-muted">
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Room Management</h1>
                    <p className="text-muted-foreground text-sm">Organize and manage your hostel room variants.</p>
                </div>
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    <Select value={priceView} onValueChange={(v) => setPriceView(v as "monthly" | "daily")}>
                        <SelectTrigger className="w-[180px] h-10 border-muted bg-white text-gray-900 font-medium">
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
                            ? "bg-muted text-foreground hover:bg-muted/80 shadow-none"
                            : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
                            }`}
                    >
                        {isCreating ? <X size={18} /> : <Plus size={18} />}
                        {isCreating ? "Cancel" : "Add Room"}
                    </Button>
                </div>
            </div>

            {isCreating && (
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-blue-50 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                            {isEditing ? <Pencil size={20} /> : <Plus size={20} />}
                        </div>
                        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600">
                            {isEditing ? "Modify Room Configuration" : "Define New Room Variant"}
                        </h3>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label htmlFor="hostel-select" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Building2 size={16} className="text-gray-400" />
                                    Assign to Hostel
                                </label>
                                <select
                                    id="hostel-select"
                                    name="hostel"
                                    onChange={handleChange}
                                    required
                                    value={formData.hostel || ""}
                                    className="w-full h-11 rounded-xl border-gray-200 bg-gray-50/50 px-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                >
                                    <option value="" disabled>Select a hostel...</option>
                                    {hostels?.map((h) => (
                                        <option key={h.id} value={h.id}>{h.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category-select" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <Hotel size={16} className="text-gray-400" />
                                    Room Environment
                                </label>
                                <select
                                    id="category-select"
                                    name="room_category"
                                    value={formData.room_category}
                                    onChange={handleChange}
                                    className="w-full h-11 rounded-xl border-gray-200 bg-gray-50/50 px-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    required
                                >
                                    <option value="NON_AC">Non-AC</option>
                                    <option value="AC">AC</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="sharing-select" className="text-sm font-bold text-gray-700 flex items-center gap-2">
                                    <BedDouble size={16} className="text-gray-400" />
                                    Sharing Configuration
                                </label>
                                <select
                                    id="sharing-select"
                                    name="sharing_type"
                                    value={formData.sharing_type}
                                    onChange={handleChange}
                                    className="w-full h-11 rounded-xl border-gray-200 bg-gray-50/50 px-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
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
                                <label htmlFor="price-input" className="text-sm font-bold text-gray-700">Monthly Revenue (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                    <input
                                        id="price-input"
                                        type="number"
                                        name="price"
                                        value={formData.price || ""}
                                        onChange={handleChange}
                                        placeholder="0.00"
                                        className="w-full h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-8 pr-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="price-day-input" className="text-sm font-bold text-gray-700">Daily Tariff (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                    <input
                                        id="price-day-input"
                                        type="number"
                                        name="price_per_day"
                                        value={formData.price_per_day || ""}
                                        onChange={handleChange}
                                        placeholder="Optional daily rate"
                                        className="w-full h-11 rounded-xl border-gray-200 bg-gray-50/50 pl-8 pr-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="beds-input" className="text-sm font-bold text-gray-700">Inventory Volume (Beds) <span className="text-gray-400 font-normal ml-1">(Optional)</span></label>
                                <div className="relative">
                                    <input
                                        id="beds-input"
                                        type="number"
                                        name="total_beds"
                                        value={formData.total_beds || ""}
                                        onChange={handleChange}
                                        placeholder="Number of beds"
                                        className="w-full h-11 rounded-xl border-gray-200 bg-gray-50/50 px-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
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
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                                />
                                <label htmlFor="show_this_price" className="text-sm font-bold text-gray-700 cursor-pointer">
                                    Show this room's price on Hostel card
                                </label>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2.5 rounded-xl font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all"
                            >
                                Discard
                            </button>
                            <button
                                type="submit"
                                disabled={createMutation.isPending || updateMutation.isPending}
                                className="px-8 py-2.5 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/20"
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
                    groupedRooms.map((hostel) => (
                        <Card key={hostel.hostel_id} className="rounded-xl shadow-sm border border-muted overflow-hidden transition-all hover:shadow-md bg-white mb-8">
                            <CardHeader className="bg-white px-8 py-6 text-gray-900 flex flex-row justify-between items-center space-y-0 border-b border-muted">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-xl shadow-sm border border-muted">
                                        🏨
                                    </div>
                                    <div>
                                        <CardTitle className="text-xl font-bold tracking-tight text-gray-900">
                                            {hostel.hostel_name}
                                        </CardTitle>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                                                <Users size={12} className="mr-1.5" />
                                                {hostel.categories.length} CATEGORIES ACTIVE
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>

                            <CardContent className="p-0">
                                <Accordion type="multiple" defaultValue={[hostel.categories[0]?.category_name]} className="w-full">
                                    {hostel.categories.map((category) => (
                                        <AccordionItem key={category.category_name} value={category.category_name} className="border-muted px-8">
                                            <AccordionTrigger className="hover:no-underline py-6">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="secondary" className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-muted text-gray-900 border-none">
                                                        {category.category_name} Rooms
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground font-medium">({category.rooms.length} variants)</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="pb-8">
                                                <div className="overflow-x-auto rounded-xl border border-muted bg-white">
                                                    <Table>
                                                        <TableHeader className="bg-muted/30">
                                                            <TableRow className="hover:bg-transparent">
                                                                <TableHead className="px-6 py-4 text-left text-[11px] font-black text-gray-900 uppercase tracking-[0.1em]">Sharing Configuration</TableHead>
                                                                <TableHead className="px-6 py-4 text-left text-[11px] font-black text-gray-900 uppercase tracking-[0.1em]">Tariff ({priceView})</TableHead>
                                                                <TableHead className="px-6 py-4 text-left text-[11px] font-black text-gray-900 uppercase tracking-[0.1em]">Capacity Details</TableHead>
                                                                <TableHead className="px-6 py-4 text-left text-[11px] font-black text-gray-900 uppercase tracking-[0.1em]">Status</TableHead>
                                                                <TableHead className="px-6 py-4 text-left text-[11px] font-black text-gray-900 uppercase tracking-[0.1em]">Featured Price</TableHead>
                                                                <TableHead className="px-6 py-4 text-right text-[11px] font-black text-gray-900 uppercase tracking-[0.1em]">Actions</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                            {category.rooms.map((room) => (
                                                                <TableRow key={room.id} className="group hover:bg-muted/30 transition-colors duration-200 border-muted">
                                                                    <TableCell className="px-6 py-5 whitespace-nowrap">
                                                                        <span className="text-sm font-semibold text-gray-900 uppercase tracking-tight">{room.sharing}</span>
                                                                    </TableCell>
                                                                    <TableCell className="px-6 py-5 whitespace-nowrap">
                                                                        <span className="text-sm font-bold text-blue-600">₹{Number(priceView === "monthly" ? room.price : (room.price_per_day || 0)).toLocaleString()}</span>
                                                                    </TableCell>
                                                                    <TableCell className="px-6 py-5 whitespace-nowrap">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                                                <div
                                                                                    className={`h-full transition-all duration-700 ${room.available_beds === 0 && room.total_beds ? 'bg-red-500' : 'bg-blue-500'}`}
                                                                                    style={{ width: `${room.total_beds ? ((room.available_beds || 0) / room.total_beds) * 100 : 0}%` }}
                                                                                />
                                                                            </div>
                                                                            <span className="text-xs font-bold text-gray-600">
                                                                                <span className={(room.available_beds || 0) > 0 ? "text-blue-600" : "text-gray-500"}>{room.available_beds || 0}</span>
                                                                                <span className="px-1 text-gray-300">/</span>
                                                                                {room.total_beds || "N/A"}
                                                                            </span>
                                                                        </div>
                                                                    </TableCell>
                                                                    <TableCell className="px-6 py-5 whitespace-nowrap">
                                                                        <Badge
                                                                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-none ${room.is_available
                                                                                ? "bg-green-100 text-green-700 hover:bg-green-100"
                                                                                : "bg-red-100 text-red-700 hover:bg-red-100"
                                                                                }`}
                                                                        >
                                                                            {room.is_available ? "Live" : "Inactive"}
                                                                        </Badge>
                                                                    </TableCell>
                                                                    <TableCell className="px-6 py-5 whitespace-nowrap">
                                                                        {room.show_this_price ? (
                                                                            <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[10px]">Hostel Card Price</Badge>
                                                                        ) : (
                                                                            <span className="text-xs text-gray-400 font-medium italic">Standard</span>
                                                                        )}
                                                                    </TableCell>
                                                                    <TableCell className="px-6 py-5 whitespace-nowrap text-right">
                                                                        <TooltipProvider>
                                                                            <div className="flex justify-end gap-1">
                                                                                <Tooltip>
                                                                                    <TooltipTrigger asChild>
                                                                                        <Button
                                                                                            variant="ghost"
                                                                                            size="icon"
                                                                                            onClick={() => handleEdit(room, hostel.hostel_id)}
                                                                                            className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-all rounded-lg"
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
                                                                                            className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all rounded-lg"
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
                        </Card>
                    ))
                ) : null}
            </div>
        </div>
    );
}
