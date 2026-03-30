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
    TrendingUp,
    ChevronRight,
    Clock,
    Flame,
    Package
} from 'lucide-react';
import { toast } from 'sonner';

export default function OnlineKirana() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            // Fetch all products for now, filtering can be added later
            const response = await marketplaceService.getProducts();
            
            // Handle both wrapped and unwrapped response
            if (response && response.success && Array.isArray(response.data)) {
                setProducts(response.data);
            } else if (Array.isArray(response)) {
                setProducts(response);
            } else if (response && Array.isArray(response.results)) {
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm animate-pulse space-y-6">
                            <div className="h-48 bg-slate-50 rounded-2xl block border-2 border-dashed border-slate-100" />
                            <div className="space-y-3">
                                <div className="h-6 w-3/4 bg-slate-100 rounded-lg" />
                                <div className="h-4 w-1/2 bg-slate-50 rounded-lg" />
                            </div>
                            <div className="h-12 w-full bg-slate-100 rounded-xl" />
                        </div>
                    ))}
                </div>
            );
        }

        if (products.length > 0) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="group bg-white rounded-[2rem] p-4 border border-slate-100 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_50px_-15px_rgba(37,99,235,0.12)] hover:-translate-y-2 transition-all duration-500 overflow-hidden relative">
                            <div className="relative h-48 w-full bg-slate-50 rounded-2xl overflow-hidden mb-5">
                                <Image
                                    src={product.image || '/images/icon.webp'}
                                    alt={product.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-xl text-[10px] font-black uppercase text-blue-600 shadow-sm border border-blue-100">
                                    ₹{product.price}
                                </div>
                                <button className="absolute bottom-3 right-3 w-10 h-10 bg-blue-600 text-white rounded-xl shadow-xl flex items-center justify-center translate-y-12 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 hover:bg-blue-700 active:scale-90">
                                    <ShoppingCart size={18} />
                                </button>
                            </div>

                            <div className="px-2 space-y-3">
                                <div>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">
                                        {product.category_name || 'Essential'}
                                    </span>
                                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-tight truncate">
                                        {product.name}
                                    </h3>
                                </div>

                                <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                                    <span className={`text-[10px] font-black uppercase ${product.stock > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                        {product.stock > 0 ? `In Stock (${product.stock})` : 'Out of Stock'}
                                    </span>
                                    <button className="text-blue-600 hover:text-blue-700 p-1.5 transition-colors">
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </div>
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
            {/* Header section with Premium Gradient */}
            <div className="relative rounded-[2.5rem] bg-slate-900 p-8 md:p-14 overflow-hidden group border border-slate-800 shadow-2xl">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full -mr-32 -mt-32 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full -ml-32 -mb-32 blur-3xl" />

                <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.2em]">
                            <Flame size={14} className="text-orange-400 animate-pulse" />
                            Premium Supplies
                        </div>
                        <div className="space-y-4">
                            <h1 className="text-4xl md:text-6xl font-black text-white leading-[1.05] tracking-tight">
                                Online <span className="text-blue-500 underline decoration-blue-500/30 decoration-8 underline-offset-[12px]">Kirana</span> Store
                            </h1>
                            <p className="text-lg text-slate-400 font-medium leading-relaxed max-w-md">
                                Order groceries, cleaning supplies and daily essentials directly from verified local vendors at wholesale prices.
                            </p>
                        </div>

                        <div className="flex max-w-md items-center gap-3 p-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 group-focus-within:border-blue-500/50 transition-all shadow-2xl">
                            <div className="flex-1 flex items-center px-4 gap-3 text-white">
                                <Search size={22} className="text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="Search essentials..."
                                    className="bg-transparent border-none focus:ring-0 text-white font-medium placeholder:text-slate-400 w-full text-sm py-2"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_10px_20px_-5px_rgba(37,99,235,0.4)] transition-all active:scale-95 text-xs uppercase tracking-widest flex items-center gap-2">
                                Find
                            </button>
                        </div>
                    </div>

                    <div className="hidden md:flex justify-end">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full animate-pulse" />
                            <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl relative z-10 space-y-6 max-w-xs rotate-3 hover:rotate-0 transition-transform duration-500">
                                <div className="flex items-center justify-between">
                                    <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-xl">
                                        <Clock size={24} />
                                    </div>
                                    <span className="text-[10px] bg-green-500/20 text-green-400 px-3 py-1 rounded-full font-black uppercase tracking-widest">On Time</span>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 w-3/4 bg-white/10 rounded-full" />
                                    <div className="h-4 w-1/2 bg-white/5 rounded-full" />
                                </div>
                                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                                    <span className="text-white font-bold">Quick Delivery</span>
                                    <TrendingUp size={20} className="text-blue-400" />
                                </div>
                            </div>
                        </div>
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

            {/* CTA Section */}
            <div className="relative group overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-12 text-center text-white shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                <div className="relative z-10 space-y-6">
                    <h2 className="text-3xl font-black tracking-tight leading-tight">Need Bulk Supplies for your Hostel?</h2>
                    <p className="text-blue-100 max-w-lg mx-auto font-medium">Get exclusive discounts and customized delivery schedules for bulk orders.</p>
                    <button className="px-10 py-4 bg-white text-blue-600 font-black rounded-2xl hover:shadow-[0_15px_30px_-5px_rgba(255,255,255,0.3)] transition-all active:scale-95 uppercase text-xs tracking-widest flex items-center gap-3 mx-auto">
                        Contact Bulk Sales
                        <ArrowRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
}
