"use client";

import { useState, useEffect } from 'react';
import { marketplaceService } from '@/services/marketplaceservices/marketplace.service';
import { Vendor } from '@/types/marketplace.types';
import Image from 'next/image';
import {
    Store,
    Filter,
    ChevronRight,
    Search as SearchIcon,
    MapPin,
    Phone,
    BadgeCheck,
    RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { toLocalMediaPath } from '@/lib/utils';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import { marketplaceSearchService } from '@/services/marketplaceservices/marketplace-search.service';

export default function UserVendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVendors();
    }, []);

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        try {
            console.log('Searching vendors with query:', query);
            const response = await marketplaceSearchService.search(query, 'vendors');

            if (response?.success && response.data?.vendors) {
                setVendors(response.data.vendors);
            } else if (Array.isArray(response)) {
                setVendors(response);
            }
        } catch (error) {
            console.error('Error searching vendors:', error);
            toast.error('Search failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const response = await marketplaceService.getPublicVendors();
            if (response && typeof response === 'object') {
                const res = response as any;
                if (res.success && Array.isArray(res.data)) {
                    setVendors(res.data);
                } else if (Array.isArray(res.results)) {
                    setVendors(res.results);
                } else if (Array.isArray(res)) {
                    setVendors(res);
                }
            } else if (Array.isArray(response)) {
                setVendors(response);
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
            toast.error('Failed to load marketplace vendors.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredVendors = vendors;

    const renderVendors = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-border/40">
                            <CardContent className="p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="w-12 h-12 rounded-xl" />
                                    <div className="space-y-2 flex-1">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-3 w-1/2" />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Skeleton className="h-6 w-16 rounded-full" />
                                    <Skeleton className="h-6 w-20 rounded-full" />
                                </div>
                                <Separator />
                                <Skeleton className="h-10 w-full rounded-md" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (filteredVendors.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filteredVendors.map((vendor) => (
                        <Card
                            key={vendor.id}
                            className="group border-border/40 hover:border-border hover:shadow-md transition-all duration-300 flex flex-col h-full"
                        >
                            <CardContent className="p-5 flex flex-col flex-grow gap-4">
                                {/* Vendor Identity */}
                                <div className="flex items-center gap-3">
                                    <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-muted/50 border border-border/50 group-hover:scale-105 transition-transform shrink-0">
                                        <Image
                                            src={toLocalMediaPath(vendor.logo) || '/images/icon.webp'}
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
                                >
                                    Visit Catalog
                                    <ChevronRight size={14} />
                                </Button>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        return (
            <Card className="border-dashed border-border/60">
                <CardContent className="py-20 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-5">
                        <Store className="text-muted-foreground/50" size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1.5">No vendors found</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mb-6">
                        We couldn't find any vendors matching your search criteria.
                    </p>
                    <Button variant="outline" onClick={() => setSearchQuery('')}>
                        Clear Search
                    </Button>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <Card className="border-border/40 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-5">
                        <div className="space-y-1.5">
                            <Badge variant="outline" className="text-xs text-muted-foreground mb-1">
                                Premium Partners
                            </Badge>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                Partner Suppliers
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Connect with verified vendors for bulk supplies and hostel essentials.
                            </p>
                        </div>
                    </div>

                    {/* Search */}
                    <div className="flex flex-col sm:flex-row items-stretch gap-2 p-1.5 bg-muted/30 rounded-lg border border-border/40 focus-within:border-primary/30 transition-colors">
                        <div className="flex-1 flex items-center gap-2 px-3">
                            <SearchIcon size={16} className="text-muted-foreground shrink-0" />
                            <input
                                type="text"
                                placeholder="Search by vendor name or location..."
                                className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground w-full text-sm py-2.5"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-1.5 text-xs"
                                onClick={() => fetchVendors()}
                            >
                                <Filter size={14} />
                                Filters
                            </Button>
                            <Button
                                size="sm"
                                className="text-xs"
                                onClick={() => handleSearch(searchQuery)}
                            >
                                Search
                            </Button>
                            <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => {
                                    setSearchQuery('');
                                    fetchVendors();
                                }}
                            >
                                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Vendors Grid */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                            <Store size={16} />
                        </div>
                        <h2 className="text-base font-semibold text-foreground">Marketplace Catalog</h2>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        Sorted by <span className="text-primary font-medium">Relevance</span>
                    </span>
                </div>

                {renderVendors()}
            </div>
        </div>
    );
}
