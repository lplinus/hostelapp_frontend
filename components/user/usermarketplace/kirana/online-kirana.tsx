'use client';

import { useState, useEffect } from 'react';
import { marketplaceService } from '@/services/marketplaceservices/marketplace.service';
import { Product } from '@/types/marketplace.types';
import Image from 'next/image';
import {
    Search,
    ShoppingCart,
    Filter,
    ArrowRight,
    Flame,
    Package
} from 'lucide-react';
import { toast } from 'sonner';
import { Card } from "@/components/ui/card";
import { Button } from '@/components/ui/button';

import { marketplaceSearchService } from '@/services/marketplaceservices/marketplace-search.service';

export default function OnlineKirana() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch(searchQuery);
            } else {
                fetchProducts();
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const handleSearch = async (query: string) => {
        setIsLoading(true);
        try {
            const response = await marketplaceSearchService.search(query, 'products');
            if (response?.success && response.data?.products) {
                setProducts(response.data.products);
            }
        } catch (error) {
            console.error('Error searching products:', error);
            toast.error('Search failed.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            // Fetch all products for now, filtering can be added later
            const response = await marketplaceService.getProducts();

            // Handle both wrapped and unwrapped response
            if (response?.success && Array.isArray(response.data)) {
                setProducts(response.data);
            } else if (Array.isArray(response)) {
                setProducts(response);
            } else if (Array.isArray(response?.results)) {
                setProducts(response.results);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load kirana items.');
        } finally {
            setIsLoading(false);
        }
    };

    const renderProductsGrid = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                        <Card key={i} className="rounded-[1.25rem] border-slate-100 shadow-sm animate-pulse overflow-hidden bg-white p-0">
                            <div className="aspect-[4/3] bg-slate-50 w-full" />
                            <div className="p-3 space-y-2">
                                <div className="h-3 bg-slate-100 rounded-full w-3/4" />
                                <div className="h-2 bg-slate-50 rounded-full w-1/2" />
                                <div className="h-8 bg-slate-50 rounded-lg w-full" />
                            </div>
                        </Card>
                    ))}
                </div>
            );
        }

        if (products.length > 0) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                    {products.map((product) => (
                        <Card key={product.id} className="rounded-2xl border-slate-100 bg-white overflow-hidden flex flex-col h-full border shadow-sm p-0">
                            <div className="relative aspect-[4/3] w-full bg-slate-50">
                                <Image
                                    src={product.image || '/images/icon.webp'}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                                    {product.is_featured && (
                                        <div className="bg-amber-500 text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                                            Featured
                                        </div>
                                    )}
                                    {!product.is_active && (
                                        <div className="bg-slate-500 text-white text-[7px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full shadow-sm">
                                            Draft
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-3.5 flex flex-col flex-grow justify-between gap-3">
                                <div className="space-y-0.5">
                                    <div className="flex items-center justify-between">
                                        <div className="text-[7px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                            {product.category_name || 'Essential'}
                                        </div>
                                        <div className="text-[11px] font-black text-blue-600">
                                            ₹{product.price}<span className="text-[8px] opacity-60">/{product.quantity_unit || 'unit'}</span>
                                        </div>
                                    </div>
                                    <h3 className="text-[13px] font-black text-slate-900 tracking-tight leading-tight line-clamp-1">
                                        {product.name}
                                    </h3>
                                </div>

                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between text-[7px] font-black uppercase tracking-widest pt-1.5 border-t border-slate-100">
                                        <span className={(product.stock ?? 0) > 0 ? "text-emerald-500" : "text-rose-500"}>
                                            {(product.stock ?? 0) > 0 ? "In Stock" : "Sold Out"}
                                        </span>
                                        <span className="text-slate-300">
                                            {(product.stock ?? 0) > 0 ? `${product.stock}${product.quantity_unit === 'kg' ? 'kg' : 'U'}` : '0U'}
                                        </span>
                                    </div>
                                    <Button
                                        className="w-full h-8 bg-slate-900 hover:bg-black text-white rounded-lg font-black text-[8px] uppercase tracking-widest flex items-center justify-center gap-2 transition-colors border-none"
                                    >
                                        Add
                                        <ShoppingCart size={11} />
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            );
        }

        return (
            <div className="py-32 text-center bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-inner group">
                <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-slate-100 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Package className="text-slate-300" size={48} />
                </div>
                <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">No products listed</h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto mb-10 leading-relaxed">
                    The online kirana store will be populated soon with essentials from local vendors.
                </p>
                <button className="px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-blue-600 transition-all active:scale-95 uppercase text-xs tracking-[0.15em] shadow-xl" onClick={fetchProducts}>
                    Check for updates
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 font-sans leading-relaxed">
            {/* Modernized Kirana Header */}
            <div className="relative rounded-[2.5rem] bg-slate-900 px-8 py-10 md:px-14 overflow-hidden group border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full -mr-32 -mt-32 blur-3xl" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                    <div className="space-y-6 flex-1">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em]">
                            <Flame size={12} className="text-orange-400" />
                            Essential Supplies
                        </div>
                        <div className="space-y-2">
                            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
                                Online <span className="text-blue-500">Kirana</span>
                            </h1>
                            <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-sm">
                                Wholesale groceries and daily hostel essentials at your doorstep.
                            </p>
                        </div>
                    </div>

                    <div className="w-full md:max-w-md p-1.5 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 focus-within:border-blue-500/50 transition-all shadow-2xl flex items-center">
                        <div className="flex-1 flex items-center px-4 gap-3 text-white">
                            <Search size={18} className="text-slate-500" />
                            <input
                                type="text"
                                placeholder="Search essentials..."
                                className="bg-transparent border-none focus:ring-0 text-white font-medium placeholder:text-slate-400 w-full text-sm py-2.5"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <button className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] transition-all active:scale-95 text-[10px] uppercase tracking-widest">
                            Search
                        </button>
                    </div>
                </div>
            </div>

            {/* Product Section */}
            <div>
                <div className="flex items-center justify-between mb-8 px-2">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Essential Supplies</h2>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-widest">Categories & Items</p>
                        </div>
                    </div>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 font-black rounded-xl border border-slate-200 transition-all active:scale-95 text-xs uppercase tracking-widest">
                        <Filter size={16} />
                        Filter
                    </button>
                </div>

                {renderProductsGrid()}
            </div>

        </div>
    );
}
