"use client";

import { useState, useEffect } from 'react';
import { orderService } from '@/services/marketplaceservices/order.service';
import { Order, OrderStatus } from '@/types/marketplace.types';
import {
    Package,
    Calendar,
    Truck,
    CheckCircle2,
    Clock,
    XCircle,
    Eye,
    Receipt,
    ShoppingBag,
    Building2,
    ChevronRight,
    ArrowUpRight,
    Search as SearchIcon,
    Filter,
    MoreVertical,
    Download
} from 'lucide-react';
import { toast } from 'sonner';

export default function UserOrders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await orderService.getOrders();
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load your orders.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusStyles = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'processing': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'shipped': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
            case 'delivered': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'cancelled': return 'bg-rose-50 text-rose-600 border-rose-100';
            default: return 'bg-slate-50 text-slate-600 border-slate-100';
        }
    };

    const getStatusIcon = (status: OrderStatus) => {
        switch (status) {
            case 'pending': return <Clock size={14} />;
            case 'processing': return <Package size={14} />;
            case 'shipped': return <Truck size={14} />;
            case 'delivered': return <CheckCircle2 size={14} />;
            case 'cancelled': return <XCircle size={14} />;
            default: return <Package size={14} />;
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.vendor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toString().includes(searchQuery);
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const renderOrdersList = () => {
        if (isLoading) {
            return (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm animate-pulse flex flex-col md:flex-row gap-6 md:items-center">
                            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex-shrink-0" />
                            <div className="flex-1 space-y-3">
                                <div className="h-4 bg-slate-100 rounded w-1/4" />
                                <div className="h-3 bg-slate-50 rounded w-1/2" />
                            </div>
                            <div className="w-24 h-8 bg-slate-50 rounded-full" />
                            <div className="w-20 h-4 bg-slate-100 rounded" />
                        </div>
                    ))}
                </div>
            );
        }

        if (filteredOrders.length > 0) {
            return (
                <div className="space-y-6">
                    {filteredOrders.map((order) => (
                        <div key={order.id} className="group relative bg-white rounded-[2.5rem] p-6 border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.03)] hover:shadow-[0_25px_60px_-15px_rgba(59,130,246,0.12)] transition-all duration-500 overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-bl-[4rem] -mr-16 -mt-16 group-hover:scale-125 transition-transform" />

                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                        <ShoppingBag size={32} strokeWidth={1.5} />
                                    </div>
                                    <div className="space-y-1.5">
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">#ORD-{order.id.toString().padStart(5, '0')}</span>
                                            <div className="text-[10px] px-2 py-0.5 bg-slate-900 text-white rounded font-black uppercase tracking-tighter">
                                                {order.order_type === 'image_scan' ? 'Image Scan' : 'Marketplace'}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors">
                                            {order.vendor_name}
                                        </h3>
                                        <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-slate-300" />
                                                {formatDate(order.created_at)}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Receipt size={14} className="text-slate-300" />
                                                {order.items?.length || 0} Items
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-4 lg:gap-12">
                                    <div className="space-y-1">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amount</div>
                                        <div className="text-2xl font-black text-slate-900 tracking-tight">
                                            ₹{parseFloat(order.total_amount).toLocaleString()}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2 min-w-[140px]">
                                        <div className={`px-4 py-2 rounded-2xl border font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 ${getStatusStyles(order.status)} shadow-sm`}>
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </div>
                                        <div className="text-center text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                                            Updated {formatDate(order.updated_at)}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button className="w-12 h-12 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center transition-all border border-slate-100 active:scale-95 group/btn">
                                            <Download size={18} className="group-hover/btn:-translate-y-0.5 transition-transform" />
                                        </button>
                                        <button className="px-6 py-3 bg-slate-900 group-hover:bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all flex items-center gap-2 active:scale-95 shadow-xl shadow-slate-900/10">
                                            Details
                                            <ChevronRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="py-24 text-center bg-white rounded-[3rem] border border-dashed border-slate-200">
                <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-slate-300">
                    <Package size={40} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-2">No orders found</h3>
                <p className="text-slate-500 font-medium max-w-xs mx-auto mb-8 leading-relaxed">
                    You haven't placed any orders in the marketplace yet. Discover vendors and start shopping!
                </p>
                <button
                    onClick={() => {
                        setSearchQuery('');
                        setSelectedStatus('all');
                    }}
                    className="px-8 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-900 font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all"
                >
                    Reset All Filters
                </button>
            </div>
        );
    };

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-700 font-sans leading-relaxed">
            {/* Premium Header Container */}
            <div className="p-10 md:p-14 bg-white rounded-[3rem] border border-slate-100 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.03)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[40rem] h-[40rem] bg-indigo-50 rounded-full blur-[100px] -mr-64 -mt-64 translate-x-1/2 -translate-y-1/2 opacity-60" />

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-600">
                            <Clock size={12} className="animate-pulse" />
                            Order History
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Purchase <span className="text-indigo-600">Timeline</span>
                        </h1>
                        <p className="text-slate-500 font-medium max-w-lg leading-relaxed">
                            Track your bulk purchases, manage vendor deliveries, and review your procurement history in one place.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-900/5 min-w-[160px] group hover:-translate-y-1 transition-transform">
                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 group-hover:text-indigo-600 transition-colors">Total Spent</div>
                            <div className="text-2xl font-black text-slate-900 tracking-tight">₹{orders.reduce((acc, curr) => acc + parseFloat(curr.total_amount), 0).toLocaleString()}</div>
                        </div>
                        <div className="bg-slate-900 p-6 rounded-[2rem] shadow-xl shadow-slate-900/20 min-w-[140px] text-white hover:bg-blue-600 transition-colors cursor-default">
                            <div className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-1">Active Orders</div>
                            <div className="text-2xl font-black tracking-tight">{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</div>
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="mt-12 flex flex-col lg:flex-row items-center gap-4 bg-slate-50 p-2 rounded-[2.25rem] border border-slate-100">
                    <div className="flex-1 flex items-center gap-4 px-6 w-full">
                        <SearchIcon size={20} className="text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by vendor, order ID..."
                            className="bg-transparent border-none focus:ring-0 text-slate-900 font-bold placeholder:text-slate-400 w-full text-sm py-4"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="h-10 w-px bg-slate-200 hidden lg:block" />

                    <div className="flex items-center gap-2 p-1 overflow-x-auto w-full lg:w-auto scrollbar-hide">
                        {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setSelectedStatus(status as any)}
                                className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap ${selectedStatus === status
                                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>

                    <button className="flex-none px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-[1.25rem] shadow-lg shadow-indigo-600/20 active:scale-95 transition-all text-[10px] uppercase tracking-widest w-full lg:w-auto">
                        Apply Filter
                    </button>
                </div>
            </div>

            {/* Orders Feed */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-6">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                            <Truck size={20} />
                        </div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Shipments</h2>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Total {filteredOrders.length} records found
                    </div>
                </div>

                {renderOrdersList()}
            </div>

            {/* Summary Footer Widget */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-emerald-500 rounded-[3rem] p-10 md:p-12 text-white relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl transform group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 flex items-start justify-between gap-6">
                        <div className="space-y-6">
                            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center border border-white/20 backdrop-blur-md">
                                <CheckCircle2 size={32} className="text-white" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight">Need Support?</h3>
                                <p className="text-emerald-50 font-medium max-w-xs leading-relaxed">
                                    Our logistics team is available 24/7 to help you with order placement and vendor disputes.
                                </p>
                            </div>
                            <button className="px-8 py-4 bg-white text-emerald-600 font-black rounded-2xl text-[10px] uppercase tracking-widest hover:shadow-xl active:scale-95 transition-all">
                                Contact Support
                            </button>
                        </div>
                        <div className="hidden lg:block">
                            <div className="w-32 h-32 opacity-10 rotate-12 bg-white rounded-full flex items-center justify-center">
                                <ShoppingBag size={80} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[3rem] p-10 md:p-12 text-white relative overflow-hidden group shadow-2xl">
                    <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-600/20 rounded-full -mr-32 -mt-32 blur-3xl transform group-hover:scale-110 transition-transform duration-1000" />
                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10">
                                <Building2 size={24} className="text-indigo-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black tracking-tight">Supplier Directory</h3>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Connect with more vendors</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            {['Kirana Pro', 'Clean Co.', 'Meat Hub', 'Milk Fresh'].map((brand, i) => (
                                <div key={i} className="px-4 py-3 bg-white/5 border border-white/10 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors cursor-pointer text-slate-300">
                                    {brand}
                                </div>
                            ))}
                        </div>
                        <button className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest transition-all active:scale-[0.98] flex items-center justify-center gap-3">
                            Browse All Vendors
                            <ArrowUpRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
