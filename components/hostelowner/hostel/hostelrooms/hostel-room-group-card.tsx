"use client";

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Building2, BedDouble, ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import HostelRoomCategoryTable from "./hostel-room-category-table";
import type { GroupedHostelRooms, GroupedRoom } from "@/services/hostelservices/room.service";

interface HostelRoomGroupCardProps {
    hostel: GroupedHostelRooms;
    isCollapsed: boolean;
    priceView: "monthly" | "daily";
    onToggleCollapse: (hostelId: number) => void;
    onEdit: (room: GroupedRoom, hostelId: number) => void;
    onDelete: (room: GroupedRoom) => void;
}

export default function HostelRoomGroupCard({
    hostel,
    isCollapsed,
    priceView,
    onToggleCollapse,
    onEdit,
    onDelete,
}: HostelRoomGroupCardProps) {
    const totalVariants = hostel.categories.reduce((acc, cat) => acc + (cat.rooms?.length || 0), 0);

    return (
        <Card className="rounded-xl shadow-xs border border-border/80 overflow-hidden transition-all hover:shadow-md bg-card mb-5">
            <CardHeader
                onClick={() => onToggleCollapse(hostel.hostel_id)}
                className={cn(
                    "bg-card px-5 sm:px-6 py-4 text-foreground flex flex-row justify-between items-center space-y-0 cursor-pointer select-none transition-colors hover:bg-muted/30 group",
                    !isCollapsed && "border-b border-border/70"
                )}
            >
                <div className="flex items-center gap-3.5 min-w-0">
                    <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center text-lg shadow-2xs border border-primary/20 shrink-0">
                        <Building2 size={20} />
                    </div>
                    <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                            <CardTitle className="text-base sm:text-lg font-bold tracking-tight text-foreground group-hover:text-primary transition-colors truncate">
                                {hostel.hostel_name}
                            </CardTitle>
                            <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold rounded-md bg-primary/10 text-primary border border-primary/20 shrink-0">
                                {hostel.categories.length} {hostel.categories.length === 1 ? "CATEGORY" : "CATEGORIES"}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                            <span>{totalVariants} room variant{totalVariants === 1 ? "" : "s"} configured</span>
                            <span>•</span>
                            <span className="font-medium text-foreground/70">
                                {isCollapsed ? "Click to expand rooms" : "Click to collapse"}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 ml-4">
                    <span className="hidden sm:inline-flex items-center px-2.5 py-1 text-xs font-semibold text-muted-foreground bg-muted/40 rounded-lg border border-border/50">
                        <BedDouble size={13} className="mr-1.5 text-primary" />
                        {totalVariants} {totalVariants === 1 ? "Variant" : "Variants"}
                    </span>
                    <button
                        type="button"
                        aria-expanded={!isCollapsed}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-primary/10 hover:bg-primary/15 text-primary border border-primary/20 transition-all cursor-pointer"
                        onClick={(e) => {
                            e.stopPropagation();
                            onToggleCollapse(hostel.hostel_id);
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
                            <AccordionItem key={category.category_name} value={category.category_name} className="border-border/60 px-5 sm:px-6">
                                <AccordionTrigger className="hover:no-underline py-3.5">
                                    <div className="flex items-center gap-2.5">
                                        <Badge variant="outline" className="px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider bg-primary/5 text-primary border-primary/20">
                                            {category.category_name} Rooms
                                        </Badge>
                                        <span className="text-xs text-muted-foreground font-medium">({category.rooms.length} variants)</span>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-5">
                                    <HostelRoomCategoryTable
                                        rooms={category.rooms}
                                        priceView={priceView}
                                        hostelId={hostel.hostel_id}
                                        onEdit={onEdit}
                                        onDelete={onDelete}
                                    />
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            )}
        </Card>
    );
}

