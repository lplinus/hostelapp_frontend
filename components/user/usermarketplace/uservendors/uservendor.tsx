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

export default function UserVendors() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        setIsLoading(true);
        try {
            const response = await marketplaceService.getPublicVendors();
            // Handle both wrapped and unwrapped response
            if (response && (response as any).success && Array.isArray((response as any).data)) {
                setVendors((response as any).data);
            } else if (Array.isArray(response)) {
                setVendors(response as any);
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
            toast.error('Failed to load marketplace vendors.');
        } finally {
            setIsLoading(false);
        }
    };

    const filteredVendors = vendors.filter(vendor =>
        vendor.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.address.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredVendors.map((vendor) => (
                        <div key={vendor.id} className="group relative bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-20px_rgba(59,130,246,0.15)] transition-all duration-500 hover:-translate-y-2 overflow-hidden">
                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/50 rounded-bl-[5rem] -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

                            <div className="relative z-10 space-y-6">
                                <div className="flex items-start justify-between">
                                    <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner group-hover:rotate-3 transition-transform duration-500">
                                        <Image
                                            src={vendor.logo || '/images/icon.webp'}
                                            alt={vendor.business_name}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-100 flex items-center gap-1.5">
                                            <BadgeCheck size={12} />
                                            Verified
                                        </div>
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
                                            {vendor.product_count} Products
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors leading-tight">
                                        {vendor.business_name}
                                    </h3>
                                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed">
                                        {vendor.description || 'Verified marketplace vendor supplying high-quality hostel essentials and bulk kirana items.'}
                                    </p>
                                </div>

                                <div className="space-y-3 pt-4 border-t border-slate-50">
                                    <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                            <MapPin size={14} />
                                        </div>
                                        <span className="truncate">{vendor.address}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold">
                                        <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                            <Phone size={14} />
                                        </div>
                                        <span>{vendor.contact_phone}</span>
                                    </div>
                                </div>

                                <button className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 shadow-xl shadow-slate-900/10 transition-all active:scale-95 group/btn">
                                    Visit Catalog
                                    <ArrowUpRight size={16} className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                                </button>
                            </div>
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
            {/* Premium Header */}
            <div className="relative p-10 md:p-14 bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.03)] overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full border border-blue-100 text-[10px] font-black uppercase tracking-[0.15em] text-blue-600">
                            <Navigation size={12} className="animate-pulse" />
                            Discover Partners
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Verified <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Suppliers</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                            Connect with trusted vendors for bulk supplies, maintenance services, and essential hostel operational needs.
                        </p>
                    </div>

                    <div className="relative flex-shrink-0">
                        <div className="absolute -inset-4 bg-orange-500/10 blur-2xl rounded-full" />
                        <div className="bg-slate-900 text-white rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10 flex flex-col items-center gap-4 min-w-[200px] hover:scale-105 transition-transform duration-500 group">
                            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <ShoppingBag className="text-orange-400" size={32} />
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-black tracking-tight">{vendors.length}+</div>
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Partners</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Integrated Search Bar */}
                <div className="mt-12 flex flex-col sm:flex-row items-center gap-4 p-2 bg-slate-50 rounded-[2rem] border border-slate-100 focus-within:ring-4 focus-within:ring-blue-500/5 transition-all">
                    <div className="flex-1 flex items-center gap-4 px-6 w-full">
                        <SearchIcon size={22} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by vendor name or location..."
                            className="bg-transparent border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-400 w-full text-sm py-4"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto p-1">
                        <button className="flex-1 sm:flex-none px-8 py-3 bg-white hover:bg-slate-100 text-slate-600 font-black rounded-[1.25rem] border border-slate-200 transition-all text-[11px] uppercase tracking-widest flex items-center justify-center gap-2">
                            <Filter size={14} />
                            Filters
                        </button>
                        <button className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[1.25rem] shadow-[0_10px_20px_-10px_rgba(37,99,235,0.5)] transition-all active:scale-95 text-[11px] uppercase tracking-widest">
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

            {/* Info Card */}
            <div className="bg-indigo-600 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full -mr-64 -mt-64 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                            <Star className="text-yellow-400 fill-yellow-400" size={32} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-3xl font-black tracking-tight leading-tight">Apply to Become a Vendor</h2>
                            <p className="max-w-md text-indigo-100 font-medium text-lg leading-relaxed">
                                Reach thousands of hostel owners across the country and grow your business with our partner program.
                            </p>
                        </div>
                        <button className="px-10 py-4 bg-white text-indigo-600 font-black rounded-2xl hover:shadow-xl transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center gap-3">
                            Join Marketplace
                            <ChevronRight size={18} />
                        </button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: 'Bulk Orders', sub: 'Wholesale rates', id: 1 },
                            { label: 'Quick Payouts', sub: 'T+2 settlement', id: 2 },
                            { label: 'Verified', sub: 'Trust system', id: 3 },
                            { label: 'Growth', sub: 'Analytics dashboard', id: 4 }
                        ].map((item) => (
                            <div key={item.id} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[2rem] space-y-2 hover:bg-white/10 transition-colors">
                                <div className="text-white font-black tracking-tight">{item.label}</div>
                                <div className="text-[10px] text-indigo-200 font-black uppercase tracking-widest">{item.sub}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
