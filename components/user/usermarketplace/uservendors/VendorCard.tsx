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
    return (
        <Card className="group border-border/40 hover:border-border hover:shadow-md transition-all duration-300 flex flex-col h-full">
            <CardContent className="p-5 flex flex-col flex-grow gap-4">
                {/* Vendor Identity */}
                <div className="flex items-center gap-3">
                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-muted/50 border border-border/50 group-hover:scale-105 transition-transform shrink-0">
                        <Image
                            src={toLocalMediaPath(vendor.logo) ?? '/images/icon.webp'}
                            alt={vendor.business_name}
                            fill
                            className="object-cover"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <Badge variant="outline" className="text-[10px] py-0 text-emerald-600 border-emerald-200 bg-emerald-50/50 gap-1">
                                <BadgeCheck size={10} />
                                Verified
                            </Badge>
                        </div>
                        <h3 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                            {vendor.business_name}
                        </h3>
                    </div>
                </div>

                {/* Categories */}
                <div className="flex flex-wrap gap-1.5">
                    {vendor.vendor_types && Array.isArray(vendor.vendor_types) && vendor.vendor_types.length > 0 ? (
                        vendor.vendor_types.map((type, idx) => (
                            <Badge
                                key={`${type}-${idx}`}
                                variant="secondary"
                                className="text-[11px] font-normal"
                            >
                                {type}
                            </Badge>
                        ))
                    ) : (
                        <Badge variant="secondary" className="text-[11px] font-normal">
                            General
                        </Badge>
                    )}
                </div>

                {/* Contact Info */}
                <div className="rounded-lg bg-muted/30 border border-border/30 p-3.5 space-y-2.5 flex-grow">
                    <div className="flex items-start gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-background border border-border/50 flex items-center justify-center text-muted-foreground shrink-0">
                            <MapPin size={13} />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 pt-1">
                            {vendor.address || 'Location available on inquiry'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-background border border-border/50 flex items-center justify-center text-muted-foreground shrink-0">
                            <Phone size={13} />
                        </div>
                        <p className="text-xs font-medium text-foreground">
                            {vendor.contact_phone || 'Contact Private'}
                        </p>
                    </div>
                </div>

                {/* CTA */}
                <Button
                    className="w-full gap-1.5 text-xs mt-auto"
                    size="sm"
                    onClick={() => onOrder(vendor)}
                >
                    Order
                    <ChevronRight size={14} />
                </Button>
            </CardContent>
        </Card>
    );
}
