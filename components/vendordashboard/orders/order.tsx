'use client';

import { useEffect, useState } from 'react';
import { vendorService } from '@/services/marketplaceservices/vendor.service';
import { Order } from '@/types/marketplace.types';
import {
    Clock,
    CheckCircle2,
    XCircle,
    Package,
    FileText,
    Image as ImageIcon,
    Calendar,
    Search,
    ArrowRight,
    Truck,
    Shield,
    TrendingUp,
    Store,
    ShoppingCart,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState<string>('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const data = await vendorService.getVendorOrders();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error('Failed to load your orders.');
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusVariant = (status: string): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (status.toLowerCase()) {
            case 'delivered': return 'default';
            case 'cancelled': return 'destructive';
            case 'pending': return 'outline';
            default: return 'secondary';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return <Clock size={12} />;
            case 'processing': return <Package size={12} />;
            case 'shipped': return <Truck size={12} />;
            case 'delivered': return <CheckCircle2 size={12} />;
            case 'cancelled': return <XCircle size={12} />;
            default: return <Clock size={12} />;
        }
    };

    const safeOrders = Array.isArray(orders) ? orders : [];
    const filteredOrders = safeOrders.filter(order =>
        filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase()
    );

    const filterTabs = [
        { value: 'all', label: 'All' },
        { value: 'pending', label: 'Pending' },
        { value: 'processing', label: 'Processing' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
    ];

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Orders</h1>
                    <p className="text-sm text-muted-foreground mt-1">Track and manage your supply orders.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                    <Input
                        placeholder="Search orders..."
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit">
                {filterTabs.map(tab => (
                    <Button
                        key={tab.value}
                        variant={filterStatus === tab.value ? 'default' : 'ghost'}
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => setFilterStatus(tab.value)}
                    >
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Orders List */}
            {isLoading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <Card key={i} className="py-0">
                            <CardContent className="p-5 flex items-center gap-6">
                                <Skeleton className="w-14 h-14 rounded-lg" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-60" />
                                </div>
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : filteredOrders.length > 0 ? (
                <div className="space-y-3">
                    {filteredOrders.map((order) => (
                        <Card key={order.id} className="py-0 hover:shadow-md transition-shadow duration-300 group">
                            <CardContent className="p-5">
                                <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                                    {/* Order Icon */}
                                    <div className="flex items-center gap-4 lg:min-w-[180px]">
                                        <div className={`p-3 rounded-lg ${order.order_type === 'image_scan' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                            {order.order_type === 'image_scan' ? (
                                                <ImageIcon size={20} />
                                            ) : (
                                                <Package size={20} />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">#{order.id.toString().padStart(5, '0')}</p>
                                            <p className="text-xs text-muted-foreground capitalize">{order.order_type.replace('_', ' ')}</p>
                                        </div>
                                    </div>

                                    {/* Vendor & Details */}
                                    <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-2">
                                        <div className="flex items-center gap-2">
                                            <Store size={14} className="text-muted-foreground" />
                                            <span className="text-sm font-medium text-foreground">{order.vendor_name}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar size={14} />
                                            <span className="text-xs">{new Date(order.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">₹{order.total_amount}</span>
                                    </div>

                                    {/* Status & Action */}
                                    <div className="flex items-center gap-3">
                                        <Badge variant={getStatusVariant(order.status)} className="gap-1.5 capitalize text-xs">
                                            {getStatusIcon(order.status)}
                                            {order.status}
                                        </Badge>
                                        <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
                                            Details
                                            <ArrowRight size={14} />
                                        </Button>
                                    </div>
                                </div>

                                {/* Note */}
                                {order.note && (
                                    <>
                                        <Separator className="my-4" />
                                        <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                                            <FileText size={14} className="mt-0.5 shrink-0" />
                                            <p className="italic leading-relaxed">&ldquo;{order.note}&rdquo;</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="border-dashed">
                    <CardContent className="py-20 flex flex-col items-center text-center">
                        <div className="p-4 rounded-2xl bg-muted mb-4">
                            <Package size={40} strokeWidth={1.5} className="text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">No orders found</h3>
                        <p className="text-sm text-muted-foreground max-w-sm mb-6">
                            {filterStatus !== 'all'
                                ? `No ${filterStatus} orders. Try a different filter.`
                                : 'You haven\'t placed any orders yet. Explore the marketplace to get started.'
                            }
                        </p>
                        {filterStatus !== 'all' && (
                            <Button variant="outline" onClick={() => setFilterStatus('all')}>
                                View All Orders
                            </Button>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Active Orders', value: safeOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length, icon: Package, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
                    { label: 'Total Spent', value: `₹${safeOrders.reduce((acc, o) => acc + parseFloat(o.total_amount || '0'), 0).toLocaleString()}`, icon: TrendingUp, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
                    { label: 'Vendors Used', value: new Set(safeOrders.map(o => o.vendor)).size, icon: Shield, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                    { label: 'In Transit', value: safeOrders.filter(o => o.status === 'shipped').length, icon: Truck, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
                ].map((stat, i) => (
                    <Card key={i} className="py-5 hover:shadow-md transition-shadow duration-300">
                        <CardContent className="px-5 py-0 flex items-center gap-4">
                            <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                                <stat.icon size={18} className={stat.iconColor} />
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                                <p className="text-lg font-semibold tracking-tight text-foreground">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
