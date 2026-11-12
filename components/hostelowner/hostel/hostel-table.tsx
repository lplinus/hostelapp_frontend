"use client";

import React from "react";
import { Pencil, Image as ImageIcon } from "lucide-react";
import type { HostelListItem } from "@/types/hostel.types";

interface HostelTableProps {
    hostels?: HostelListItem[];
    currentHostels: HostelListItem[];
    isLoading: boolean;
    mounted?: boolean;
    currentPage: number;
    pageSize: number;
    priceView: "monthly" | "daily";
    setPriceView: (view: "monthly" | "daily") => void;
    onEdit: (hostel: HostelListItem) => void;
    onUploadImages: (hostelId: number) => void;
}

export default function HostelTable({
    hostels,
    currentHostels,
    isLoading,
    mounted = true,
    currentPage,
    pageSize,
    priceView,
    setPriceView,
    onEdit,
    onUploadImages,
}: HostelTableProps) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-border overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted/40">
                    <tr>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">#</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                            <div className="flex items-center gap-2">
                                Price (₹)
                                <select
                                    className="ml-1 bg-white border border-border text-[10px] font-bold text-primary focus:ring-0 cursor-pointer outline-none uppercase px-1.5 py-0.5 rounded shadow-sm"
                                    value={priceView}
                                    onChange={(e) => setPriceView(e.target.value as "monthly" | "daily")}
                                >
                                    <option value="monthly">/ Month</option>
                                    <option value="daily">/ Day</option>
                                </select>
                            </div>
                        </th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Rating</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Images</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3.5 text-left text-xs font-bold text-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-border">
                    {(!mounted || isLoading) ? (
                        [1, 2, 3].map((id) => (
                            <tr key={`skel-${id}`} className="animate-pulse">
                                <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-3/4"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/2"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
                                <td className="px-6 py-4"><div className="h-4 bg-muted rounded w-1/4"></div></td>
                            </tr>
                        ))
                    ) : (
                        <>
                            {hostels?.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-muted-foreground">
                                        No hostels found. Click &quot;Add Hostel&quot; to get started.
                                    </td>
                                </tr>
                            ) : (
                                currentHostels.map((h, idx) => {
                                    const discountText = h.is_discounted ? (
                                        <span className="text-[10px] text-primary font-bold whitespace-nowrap">
                                            {priceView === "monthly" ? `(₹${h.final_price})` : (h.final_price_per_day ? `(₹${h.final_price_per_day})` : "")}
                                        </span>
                                    ) : null;

                                    return (
                                        <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 text-sm text-muted-foreground font-medium">
                                                {(currentPage - 1) * pageSize + idx + 1}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-foreground font-semibold">{h.name}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{h.city?.name ?? "N/A"}, {h.area?.name ?? "N/A"}</td>
                                            <td className="px-6 py-4 text-sm font-semibold text-foreground">
                                                <div className="flex flex-col">
                                                    <span className="text-primary font-bold">₹{priceView === "monthly" ? h.price : (h.price_per_day || "N/A")}</span>
                                                    {discountText}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">{h.rating_avg > 0 ? h.rating_avg.toFixed(1) : "Unrated"}</td>
                                            <td className="px-6 py-4 text-sm text-muted-foreground">
                                                <span className="text-foreground font-medium">{h.images?.length ?? 0}</span>
                                            </td>
                                            <td className="px-6 py-4 text-sm">
                                                <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${h.is_approved ? 'bg-primary/10 text-primary border-primary/20' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                                    {h.is_approved ? 'Verified' : 'Pending Verification'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium">
                                                <div className="flex flex-wrap gap-2">
                                                    <button
                                                        onClick={() => onEdit(h)}
                                                        className="text-primary hover:text-primary/80 bg-primary/10 p-2 rounded-md transition border border-primary/20 cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => onUploadImages(h.id)}
                                                        className="text-primary hover:text-primary/80 bg-primary/10 p-2 rounded-md transition border border-primary/20 cursor-pointer"
                                                        title="Images"
                                                    >
                                                        <ImageIcon size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </>
                    )}
                </tbody>
            </table>
        </div>
    );
}

