"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Pencil, Trash2, BedDouble, CheckCircle2 } from "lucide-react";
import type { GroupedRoom } from "@/services/hostelservices/room.service";

interface HostelRoomCategoryTableProps {
    rooms: GroupedRoom[];
    priceView: "monthly" | "daily";
    hostelId: number;
    onEdit: (room: GroupedRoom, hostelId: number) => void;
    onDelete: (room: GroupedRoom) => void;
}

export default function HostelRoomCategoryTable({
    rooms,
    priceView,
    hostelId,
    onEdit,
    onDelete,
}: HostelRoomCategoryTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-border/80 bg-card shadow-2xs">
            <Table>
                <TableHeader className="bg-muted/40">
                    <TableRow className="hover:bg-transparent border-border/70">
                        <TableHead className="px-5 py-3 text-left text-[11px] font-bold text-foreground uppercase tracking-wider">
                            Sharing Configuration
                        </TableHead>
                        <TableHead className="px-5 py-3 text-left text-[11px] font-bold text-foreground uppercase tracking-wider">
                            Tariff ({priceView === "monthly" ? "₹ / Month" : "₹ / Day"})
                        </TableHead>
                        <TableHead className="px-5 py-3 text-left text-[11px] font-bold text-foreground uppercase tracking-wider">
                            Capacity & Beds
                        </TableHead>
                        <TableHead className="px-5 py-3 text-left text-[11px] font-bold text-foreground uppercase tracking-wider">
                            Features & Highlights
                        </TableHead>
                        <TableHead className="px-5 py-3 text-left text-[11px] font-bold text-foreground uppercase tracking-wider">
                            Status
                        </TableHead>
                        <TableHead className="px-5 py-3 text-right text-[11px] font-bold text-foreground uppercase tracking-wider">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody className="divide-y divide-border/60">
                    {rooms.map((room) => {
                        const price = Number(priceView === "monthly" ? room.price : (room.price_per_day || 0));
                        const pctAvailable = room.total_beds ? Math.round(((room.available_beds || 0) / room.total_beds) * 100) : 0;

                        return (
                            <TableRow key={room.id} className="group hover:bg-muted/30 transition-colors">
                                <TableCell className="px-5 py-3.5 whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                            <BedDouble size={14} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-foreground uppercase tracking-tight">{room.sharing}</p>
                                            <p className="text-[10px] text-muted-foreground">{room.room_category} Room</p>
                                        </div>
                                    </div>
                                </TableCell>

                                <TableCell className="px-5 py-3.5 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="text-xs font-bold text-primary">₹{price.toLocaleString()}</span>
                                        {room.show_this_price && (
                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                                                <CheckCircle2 size={10} /> Card featured
                                            </span>
                                        )}
                                    </div>
                                </TableCell>

                                <TableCell className="px-5 py-3.5 whitespace-nowrap">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden shrink-0">
                                            <div
                                                className={`h-full transition-all duration-500 ${room.available_beds === 0 && room.total_beds ? 'bg-red-500' : 'bg-primary'}`}
                                                style={{ width: `${pctAvailable}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold text-foreground">
                                            <span className={(room.available_beds || 0) > 0 ? "text-primary font-bold" : "text-muted-foreground"}>
                                                {room.available_beds || 0}
                                            </span>
                                            <span className="px-1 text-muted-foreground/60">/</span>
                                            <span className="text-muted-foreground">{room.total_beds || "—"}</span>
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell className="px-5 py-3.5">
                                    {room.features_list && room.features_list.length > 0 ? (
                                        <div className="flex flex-wrap gap-1 max-w-[240px]">
                                            {room.features_list.slice(0, 2).map((f: string, i: number) => (
                                                <span key={i} className="inline-block px-2 py-0.5 text-[10px] font-semibold rounded-md bg-muted text-foreground border border-border/60 truncate max-w-[110px]" title={f}>
                                                    {f}
                                                </span>
                                            ))}
                                            {room.features_list.length > 2 && (
                                                <span className="text-[10px] text-muted-foreground font-semibold px-1 py-0.5">
                                                    +{room.features_list.length - 2}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground font-normal italic">—</span>
                                    )}
                                </TableCell>

                                <TableCell className="px-5 py-3.5 whitespace-nowrap">
                                    <Badge
                                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${room.is_available
                                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200"
                                            : "bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-300 border-red-200"
                                            }`}
                                    >
                                        {room.is_available ? "Live" : "Inactive"}
                                    </Badge>
                                </TableCell>

                                <TableCell className="px-5 py-3.5 whitespace-nowrap text-right">
                                    <TooltipProvider>
                                        <div className="flex justify-end gap-1">
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onEdit(room, hostelId)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all rounded-lg cursor-pointer"
                                                    >
                                                        <Pencil className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Edit Variant</TooltipContent>
                                            </Tooltip>
                                            <Tooltip>
                                                <TooltipTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => onDelete(room)}
                                                        className="h-8 w-8 text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all rounded-lg cursor-pointer"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </TooltipTrigger>
                                                <TooltipContent>Delete Variant</TooltipContent>
                                            </Tooltip>
                                        </div>
                                    </TooltipProvider>
                                </TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}

