"use client";

import Image from 'next/image';
import { MapPin, Phone, BadgeCheck, ChevronRight, ShoppingBag } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toLocalMediaPath } from '@/lib/utils';
import { Vendor } from '@/types/marketplace.types';

interface VendorCardProps {
    vendor: Vendor;
    onOrder: (vendor: Vendor) => void;
}

export function VendorCard({ vendor, onOrder }: VendorCardProps) {
    const formattedAddress = vendor.address
        ? vendor.address.replace(/,([^\s])/g, ', $1')
        : 'Location available on inquiry';

    return (
        <Card 
            className="group rounded-lg hover:shadow-md transition-all duration-200 flex flex-col justify-between aspect-square min-h-[290px] bg-white dark:bg-card p-4 sm:p-5 border border-border/60 hover:border-blue-500/60 dark:hover:border-blue-700/80 shadow-xs overflow-hidden"
        >
            <div className="flex flex-col flex-grow justify-between gap-2.5 h-full min-w-0">
                {/* Vendor Identity */}
                <div className="flex items-center gap-3 min-w-0">
                    <div className="relative w-11 h-11 rounded-md overflow-hidden bg-muted/40 border border-border/50 group-hover:scale-105 transition-transform shrink-0">
                        <Image
                            src={toLocalMediaPath(vendor.logo) ?? '/images/icon.webp'}
                            alt={vendor.business_name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Badge variant="outline" className="rounded text-[10px] py-0 font-normal text-emerald-700 border-emerald-300 bg-emerald-50/50 gap-1">
                                <BadgeCheck size={10} />
                                Verified
                            </Badge>
                        </div>
                        <h3 className="text-sm font-medium text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors truncate">
                            {vendor.business_name}
                        </h3>
                    </div>
                </div>

                {/* Items Sold - Highlighted in dark blue */}
                <div className="flex flex-wrap gap-1.5 min-w-0">
                    {vendor.vendor_types && Array.isArray(vendor.vendor_types) && vendor.vendor_types.length > 0 ? (
                        vendor.vendor_types.map((type, idx) => (
                            <Badge
                                key={`${type}-${idx}`}
                                className="rounded text-[11px] font-normal px-2.5 py-0.5 transition-colors bg-[#1e3a8a] hover:bg-[#172554] text-white border border-[#1d4ed8]/60 shadow-xs capitalize shrink-0"
                            >
                                {type.replace(/_/g, ' ')}
                            </Badge>
                        ))
                    ) : (
                        <Badge
                            className="rounded text-[11px] font-normal px-2.5 py-0.5 transition-colors bg-[#1e3a8a] hover:bg-[#172554] text-white border border-[#1d4ed8]/60 shadow-xs shrink-0"
                        >
                            General
                        </Badge>
                    )}
                </div>

                {/* Contact Info - Full Address Displayed Without Overflow */}
                <div className="rounded-md bg-muted/30 border border-border/30 p-2.5 space-y-1.5 flex-grow my-0.5 min-w-0 overflow-hidden">
                    <div className="flex items-start gap-2 min-w-0">
                        <div className="w-5 h-5 rounded bg-background border border-border/50 flex items-center justify-center text-muted-foreground shrink-0 mt-0.5">
                            <MapPin size={11} />
                        </div>
                        <p className="text-xs text-muted-foreground font-normal leading-relaxed break-words [overflow-wrap:anywhere] min-w-0 flex-1">
                            {formattedAddress}
                        </p>
                    </div>
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-5 h-5 rounded bg-background border border-border/50 flex items-center justify-center text-muted-foreground shrink-0">
                            <Phone size={11} />
                        </div>
                        <p className="text-xs font-normal text-foreground truncate min-w-0 flex-1">
                            {vendor.contact_phone || 'Contact Private'}
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <Button
                    className="w-full gap-1.5 text-xs font-medium rounded-md h-8.5 shrink-0"
                    size="sm"
                    onClick={() => onOrder(vendor)}
                >
                    Order
                    <ChevronRight size={14} />
                </Button>
            </div>
        </Card>
    );
}
