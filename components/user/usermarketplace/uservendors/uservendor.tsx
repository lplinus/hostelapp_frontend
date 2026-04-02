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
    ArrowUpRight,
    Star,
    BadgeCheck,
    Navigation,
    ShoppingBag
} from 'lucide-react';
import { toast } from 'sonner';
import { toLocalMediaPath } from '@/lib/utils';

import { marketplaceSearchService } from '@/services/marketplaceservices/marketplace-search.service';

export default function UserVendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            } else {
                fetchVendors();
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        try {
            console.log('Searching vendors with query:', query);
            const response = await marketplaceSearchService.search(query, 'vendors');

            if (response?.success && response.data?.vendors) {
                setVendors(response.data.vendors);
            } else if (Array.isArray(response)) {
                // Support case where response might be direct array
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
            // Handle both wrapped, paginated, and direct array responses
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm animate-pulse space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-4 bg-slate-100 rounded w-3/4" />
                                    <div className="h-3 bg-slate-50 rounded w-1/2" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="h-3 bg-slate-50 rounded w-full" />
                                <div className="h-3 bg-slate-50 rounded w-5/6" />
                            </div>
                            <div className="h-10 bg-slate-100 rounded-xl w-full" />
                        </div>
                    ))}
                </div>
            );
        }

        if (filteredVendors.length > 0) {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredVendors.map((vendor) => (
                        <div key={vendor.id} className="group relative bg-white rounded-[2rem] p-5 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_20px_40px_-15px_rgba(59,130,246,0.1)] transition-all duration-300 flex flex-col h-full hover:border-blue-500/30">

                            <div className="flex items-center gap-4 mb-5">
                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group-hover:scale-105 transition-transform shrink-0">
                                    <Image
                                        src={toLocalMediaPath(vendor.logo) || '/images/icon.webp'}
                                        alt={vendor.business_name}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 mb-0.5">
                                        <div className="flex items-center gap-1 text-[8px] font-black text-emerald-500 uppercase tracking-[0.15em] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                                            <BadgeCheck size={10} />
                                            Verified Merchant
                                        </div>
                                    </div>
                                    <h3 className="text-base font-black text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors tracking-tight">
                                        {vendor.business_name}
                                    </h3>
                                </div>
                            </div>

                            <div className="space-y-5 flex-grow">
                                {/* All Categories Displayed Once - High Visibility */}
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {vendor.vendor_types && Array.isArray(vendor.vendor_types) && vendor.vendor_types.length > 0 ? (
                                        vendor.vendor_types.map((type, idx) => (
                                            <span key={`${type}-${idx}`} className="px-3 py-1.5 bg-transparent text-slate-900 text-[11px] font-semibold uppercase tracking-wider rounded-lg border border-slate-200 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-all cursor-default">
                                                {type}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="px-3 py-1 bg-transparent text-slate-400 text-[10px] font-bold uppercase tracking-widest rounded-lg border border-slate-100">
                                            General
                                        </span>
                                    )}
                                </div>

                                {/* Highlighted Contact & Address Module */}
                                <div className="p-4 bg-slate-50/70 rounded-2xl space-y-3.5 border border-slate-100/80 group-hover:bg-blue-50/20 transition-colors">
                                    <div className="flex items-start gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-blue-500 shadow-sm shrink-0 border border-slate-100">
                                            <MapPin size={14} strokeWidth={2.5} />
                                        </div>
                                        <div className="space-y-0.5 min-w-0">
                                            <p className="text-[10px] text-slate-800 font-bold leading-relaxed line-clamp-2">
                                                {vendor.address || 'Location available on inquiry'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center text-indigo-500 shadow-sm shrink-0 border border-slate-100">
                                            <Phone size={14} strokeWidth={2.5} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-[11px] text-indigo-600 font-black tracking-tight">
                                                {vendor.contact_phone || 'Contact Private'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <button className="mt-6 w-full flex items-center justify-center gap-2 py-3.5 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-blue-600 shadow-lg shadow-slate-900/5 active:scale-[0.98] transition-all">
                                Visit Catalog
                                <ChevronRight size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Store size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No vendors found</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8">
                    We couldn't find any vendors matching your search criteria.
                </p>
                <button
                    onClick={() => setSearchQuery('')}
                    className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl text-xs uppercase tracking-widest hover:bg-blue-600 transition-all"
                >
                    Clear Search
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 font-sans leading-relaxed">
            {/* Cleanup Header - Focus on Search & Utility */}
            <div className="relative p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-[0_15px_40px_-20px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32" />

                <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
                    <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] text-blue-600 border border-blue-100">
                            Premium Partners
                        </div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                            Partner <span className="text-blue-600">Suppliers</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-md text-sm">
                            Connect with verified vendors for bulk supplies and hostel essentials.
                        </p>
                    </div>
                </div>

                {/* Integrated Search Bar - Primary Focus */}
                <div className="flex flex-col sm:flex-row items-center gap-3 p-1.5 bg-slate-50 rounded-2xl border border-slate-100 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                    <div className="flex-1 flex items-center gap-4 px-5 w-full">
                        <SearchIcon size={20} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by vendor name or location..."
                            className="bg-transparent border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-400 w-full text-sm py-3.5"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                        <button
                            className="flex-1 sm:flex-none px-6 py-3 bg-white hover:bg-slate-100 text-slate-600 font-black rounded-xl border border-slate-200 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                            onClick={() => fetchVendors()}
                        >
                            <Filter size={14} />
                            Filters
                        </button>
                        <button
                            className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-[0_8px_16px_-6px_rgba(37,99,235,0.4)] transition-all active:scale-95 text-[10px] uppercase tracking-widest"
                            onClick={() => handleSearch(searchQuery)}
                        >
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <div className="space-y-8">
                <div className="flex items-center justify-between px-4">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                            <Store size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Marketplace Catalog</h2>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest">
                        Sorted by <span className="text-blue-600">Relevance</span>
                    </div>
                </div>

                {renderVendors()}
            </div>

        </div>
    );
}
