"use client";

import { Plus, X, Search, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import type { GroupedHostelRooms } from "@/services/hostelservices/room.service";
import HostelRoomKpis from "./hostel-room-kpis";
import HostelRoomForm from "./hostel-room-form";
import HostelRoomGroupCard from "./hostel-room-group-card";
import { useHostelRooms } from "./hostel-room-hooks";

interface RoomsContainerProps {
    readonly initialGroupedRooms: readonly GroupedHostelRooms[];
}

export default function RoomsContainer({ initialGroupedRooms }: RoomsContainerProps) {
    const r = useHostelRooms(initialGroupedRooms);

    return (
        <div className="space-y-6 pb-12 font-sans">
            {/* Top Bar / Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 bg-card p-4 sm:p-4.5 rounded-lg border border-border/80 shadow-2xs">
                <div className="space-y-0.5">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[11px] font-semibold bg-indigo-50 text-[#312E81] dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                        <span>Hostel Room Inventory</span>
                    </div>
                    <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Hostel Rooms & Sharing Variants</h1>
                    <p className="text-muted-foreground text-xs">
                        Structure tariffs, AC/Non-AC variants, bed capacity, and real-time room availability.
                    </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => r.refetch()}
                        disabled={r.isRefetching}
                        className="gap-1.5 text-xs font-semibold rounded-md bg-card hover:bg-muted cursor-pointer h-8 px-3"
                    >
                        <RefreshCw size={12} className={r.isRefetching ? "animate-spin" : ""} />
                        <span>Refresh</span>
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => {
                            if (r.isCreating) r.handleCancel();
                            else r.setIsCreating(true);
                        }}
                        className={`gap-1.5 text-xs text-white font-semibold rounded-md shadow-2xs px-3.5 h-8 cursor-pointer transition-all ${
                            r.isCreating
                                ? "bg-muted-foreground hover:bg-muted-foreground/90"
                                : "bg-[#312E81] hover:bg-[#252269] active:bg-[#1E1B4B]"
                        }`}
                    >
                        {r.isCreating ? <X size={13} /> : <Plus size={13} />}
                        <span>{r.isCreating ? "Cancel" : "Add Room"}</span>
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <HostelRoomKpis
                groupedRooms={r.groupedRooms}
                totalHostels={r.hostels?.length || 0}
            />

            {/* Commission / Edit Form */}
            {r.isCreating && (
                <HostelRoomForm
                    isEditing={r.isEditing}
                    formData={r.formData}
                    hostels={r.hostels}
                    isPending={r.createMutation.isPending || r.updateMutation.isPending}
                    handleChange={r.handleChange}
                    setFormData={r.setFormData}
                    handleSubmit={r.handleSubmit}
                    handleCancel={r.handleCancel}
                />
            )}

            {/* Filters Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-2.5 flex-wrap">
                    <Select value={r.selectedHostelFilter} onValueChange={r.setSelectedHostelFilter}>
                        <SelectTrigger className="h-9 w-[190px] text-xs bg-card border-border font-medium rounded-lg">
                            <SelectValue placeholder="All Hostels" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60 overflow-y-auto">
                            <SelectItem value="all">All Hostels ({r.hostels?.length || 0})</SelectItem>
                            {r.hostels?.map((h) => (
                                <SelectItem key={h.id} value={String(h.id)}>{h.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={r.priceView} onValueChange={(v) => r.setPriceView(v as "monthly" | "daily")}>
                        <SelectTrigger className="h-9 w-[140px] text-xs bg-card border-border font-medium rounded-lg">
                            <SelectValue placeholder="View Price" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="monthly">Monthly Tariff</SelectItem>
                            <SelectItem value="daily">Daily Tariff</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="relative w-full sm:w-72">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Search rooms, category, or features..."
                        value={r.searchQuery}
                        onChange={(e) => r.setSearchQuery(e.target.value)}
                        className="pl-9 text-xs h-9 bg-card border-border/70 rounded-lg"
                    />
                    {r.searchQuery && (
                        <button
                            onClick={() => r.setSearchQuery("")}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>
            </div>

            {/* Room List Content */}
            <div className="space-y-4">
                {r.roomsLoading && !r.groupedRooms ? (
                    <div className="space-y-3 animate-pulse">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-44 bg-card rounded-xl border border-border" />
                        ))}
                    </div>
                ) : null}

                {!r.roomsLoading && (!r.groupedRooms || r.groupedRooms.length === 0) ? (
                    <div className="bg-card p-12 text-center rounded-2xl border border-dashed border-border/80 shadow-2xs">
                        <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mx-auto mb-3.5">
                            <AlertCircle size={26} />
                        </div>
                        <h3 className="text-base font-bold text-foreground">No hostel rooms configured</h3>
                        <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                            Commission your first room variant by selecting a hostel, occupancy, and tariff above.
                        </p>
                        <Button
                            size="sm"
                            onClick={() => { r.handleCancel(); r.setIsCreating(true); }}
                            className="mt-4 text-xs font-semibold bg-[#312E81] hover:bg-[#252269] text-white rounded-xl cursor-pointer"
                        >
                            <Plus size={14} className="mr-1" /> Add First Room
                        </Button>
                    </div>
                ) : null}

                {r.groupedRooms && r.groupedRooms.length > 0 ? (
                    <>
                        <div className="flex justify-between items-center px-1">
                            <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                                Properties ({r.filteredGroupedRooms.length} of {r.groupedRooms.length})
                            </span>
                            {r.filteredGroupedRooms.length > 1 && (
                                <button
                                    type="button"
                                    onClick={r.toggleAllHostels}
                                    className="text-xs font-semibold text-primary hover:underline cursor-pointer"
                                >
                                    {r.allCollapsed ? "Expand all properties" : "Collapse all properties"}
                                </button>
                            )}
                        </div>

                        {r.filteredGroupedRooms.length === 0 ? (
                            <div className="bg-card p-8 text-center rounded-xl border border-border text-xs text-muted-foreground">
                                No properties or rooms matched your search &quot;{r.searchQuery}&quot;. Clear your search query or change filter.
                            </div>
                        ) : (
                            r.filteredGroupedRooms.map((hostel) => (
                                <HostelRoomGroupCard
                                    key={hostel.hostel_id}
                                    hostel={hostel}
                                    isCollapsed={!!r.collapsedHostels[hostel.hostel_id]}
                                    priceView={r.priceView}
                                    onToggleCollapse={r.toggleHostelCollapse}
                                    onEdit={r.handleEdit}
                                    onDelete={(room) => {
                                        toast("Delete Variant?", {
                                            description: `Delete this ${room.sharing} (${room.room_category}) variant? All associated beds will be cleared.`,
                                            action: {
                                                label: "Delete",
                                                onClick: () => r.deleteMutation.mutate(room.id),
                                            },
                                        });
                                    }}
                                />
                            ))
                        )}
                    </>
                ) : null}
            </div>
        </div>
    );
}
