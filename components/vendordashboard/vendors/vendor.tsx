'use client';

import { useEffect, useState } from 'react';
import { marketplaceService } from '@/services/marketplaceservices/marketplace.service';
import { vendorService } from '@/services/marketplaceservices/vendor.service';
import { Vendor, Product, Order } from '@/types/marketplace.types';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    Search,
    Store,
    MapPin,
    Phone,
    ExternalLink,
    ArrowRight,
    ArrowUpRight,
    Star,
    Shield,
    TrendingUp,
    UserCircle,
    Package,
    ShoppingCart,
    CheckCircle2,
    Truck,
    XCircle,
    Clock,
    Settings2,
    FileText,
    ClipboardList,
    Image as ImageIcon
} from 'lucide-react';
import { authApiClient } from '@/lib/api/auth-client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

export default function VendorsPage() {
    const { user } = useAuth();
    const role = user?.role;
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [myVendor, setMyVendor] = useState<Vendor | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (role === 'vendor') {
            fetchVendorData();
            fetchVendorSubscription();
        } else {
            fetchPublicVendors();
        }
    }, [role]);

    const fetchVendorSubscription = async () => {
        try {
            const data: any = await authApiClient.get('/api/payments/vendor-subscriptions/current/');
            if (data && data.plan) {
                setCurrentSubscription(data);
            }
        } catch (error) {
            // Ignore if no active subscription
        }
    };

    const fetchVendorData = async () => {
        setIsLoading(true);
        try {
            const [profile, fetchedOrders, fetchedProducts] = await Promise.all([
                vendorService.getMyVendorProfile(),
                vendorService.getVendorOrders(),
                vendorService.getMyProducts()
            ]);
            setMyVendor(profile);
            setOrders(fetchedOrders);
            setProducts(fetchedProducts);
        } catch (error) {
            console.error('Error fetching vendor profile:', error);
            toast.error('Failed to load your vendor dashboard data.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchPublicVendors = async (search?: string) => {
        setIsLoading(true);
        try {
            const response = await marketplaceService.getPublicVendors(search);
            if (response.success) {
                setVendors(response.data);
            }
        } catch (error) {
            console.error('Error fetching vendors:', error);
            toast.error('Failed to load marketplace vendors.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (role !== 'vendor') {
            fetchPublicVendors(searchQuery);
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                        {role === 'vendor' ? 'Dashboard' : 'Marketplace'}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1 mb-2">
                        {role === 'vendor'
                            ? 'Overview of your vendor activity and performance.'
                            : 'Discover verified vendors for your hostel needs.'
                        }
                    </p>
                    {role === 'vendor' && currentSubscription && currentSubscription.end_date && (
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md text-xs font-medium animate-in fade-in slide-in-from-top-1">
                            <CheckCircle2 size={13} className="shrink-0 text-white" strokeWidth={3} />
                            <span>
                                <strong className="font-extrabold tracking-wide uppercase mr-1">{currentSubscription.plan_name}</strong>
                                <span className="opacity-90">Active until {new Date(currentSubscription.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </span>
                        </div>
                    )}
                </div>
                {role !== 'vendor' && (
                    <form onSubmit={handleSearch} className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                            <Input
                                placeholder="Search vendors..."
                                className="pl-9"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button type="submit" size="sm">Search</Button>
                    </form>
                )}
            </div>

            {role === 'vendor' ? (
                /* ─── Vendor Dashboard ─── */
                <div className="space-y-6">
                    {/* Main Stats Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card className="hover:shadow-md transition-shadow duration-300">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-primary/10 text-primary">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Sales</p>
                                    <p className="text-xl font-bold tracking-tight">
                                        ₹{orders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + parseFloat(o.total_amount || '0'), 0).toLocaleString()}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow duration-300">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
                                    <Package size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Active Products</p>
                                    <p className="text-xl font-bold tracking-tight">{products.filter(p => p.is_active).length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow duration-300">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
                                    <ShoppingCart size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total Orders</p>
                                    <p className="text-xl font-bold tracking-tight">{orders.length}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="hover:shadow-md transition-shadow duration-300">
                            <CardContent className="p-4 flex items-center gap-4">
                                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Success Rate</p>
                                    <p className="text-xl font-bold tracking-tight">
                                        {orders.length > 0 ? Math.round((orders.filter(o => o.status === 'delivered').length / orders.length) * 100) : 0}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Order Status Breakdown */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        {[
                            { label: 'Pending', status: 'pending', icon: Clock, color: 'amber' },
                            { label: 'Processing', status: 'processing', icon: Settings2, color: 'blue' },
                            { label: 'Shipped', status: 'shipped', icon: Truck, color: 'indigo' },
                            { label: 'Delivered', status: 'delivered', icon: CheckCircle2, color: 'emerald' },
                            { label: 'Cancelled', status: 'cancelled', icon: XCircle, color: 'red' },
                        ].map((stat) => {
                            const filteredOrders = orders.filter(o => o.status === stat.status);
                            const count = filteredOrders.length;
                            const revenue = filteredOrders.reduce((acc, o) => acc + parseFloat(o.total_amount || '0'), 0);

                            const statusColors: Record<string, string> = {
                                amber: 'bg-amber-50 text-amber-600 border-amber-100',
                                blue: 'bg-blue-50 text-blue-600 border-blue-100',
                                indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                                emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                                red: 'bg-red-50 text-red-600 border-red-100',
                            };
                            const colorClasses = statusColors[stat.color] || 'bg-muted text-muted-foreground border-muted';
                            const colors = colorClasses.split(' ');
                            
                            return (
                                <Card
                                    key={stat.status}
                                    className={cn(
                                        "relative overflow-hidden border shadow-sm hover:shadow-md transition-all duration-300 group",
                                        "bg-background/50 backdrop-blur-sm"
                                    )}
                                >
                                    <CardContent className="p-4">
                                        <div className="flex flex-col gap-3">
                                            <div className="flex items-center justify-between">
                                                <div className={cn(
                                                    "p-2 rounded-lg transition-transform group-hover:scale-110 duration-300",
                                                    colors[0],
                                                    colors[1]
                                                )}>
                                                    <stat.icon size={18} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xl font-bold tracking-tight">{count}</span>
                                                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">Orders</p>
                                                </div>
                                            </div>
                                            <div className="space-y-0.5">
                                                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{stat.label}</p>
                                                <p className={cn("text-sm font-bold", colors[1])}>
                                                    ₹{revenue.toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Recent Activity</CardTitle>
                                    <CardDescription>Latest customer interactions</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs" asChild>
                                    <Link href="/vendordashboard/orders">
                                        View All
                                    </Link>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {orders.length > 0 ? (
                                orders.slice(0, 5).map((order) => (
                                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                        <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                                            <UserCircle size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-foreground">Order #{order.id} from {order.hostel_name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {order.items.length} items · ₹{parseFloat(order.total_amount).toLocaleString()} · {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <Badge
                                            variant="secondary"
                                            className={cn(
                                                "text-[10px] capitalize",
                                                order.status === 'pending' && "bg-amber-100 text-amber-700",
                                                order.status === 'delivered' && "bg-emerald-100 text-emerald-700",
                                                order.status === 'cancelled' && "bg-red-100 text-red-700"
                                            )}
                                        >
                                            {order.status}
                                        </Badge>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-muted-foreground">No recent activity found.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            ) : (
                /* ─── Public Marketplace ─── */
                <div className="space-y-6">
                    {/* Vendor Grid */}
                    <div className="flex items-center gap-2 mb-1">
                        <Store size={16} className="text-muted-foreground" />
                        <h2 className="text-base font-semibold text-foreground">Featured Vendors</h2>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="py-0 overflow-hidden">
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-start gap-3">
                                            <Skeleton className="w-14 h-14 rounded-lg" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-32" />
                                                <Skeleton className="h-3 w-full" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-10 w-full rounded-lg" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : vendors.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {vendors.map((vendor) => (
                                <Card key={vendor.id} className="py-0 overflow-hidden hover:shadow-lg transition-all duration-300 group">
                                    <CardContent className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="w-14 h-14 rounded-lg border bg-muted overflow-hidden relative">
                                                <Image
                                                    src={vendor.logo || '/images/icon.webp'}
                                                    alt={vendor.business_name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-200 bg-emerald-50">
                                                Active
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                                {[1, 2, 3, 4, 5].map(i => (
                                                    <Star key={i} size={10} className="fill-amber-400 text-amber-400" />
                                                ))}
                                                <span className="text-[10px] text-muted-foreground ml-1">4.9</span>
                                            </div>
                                            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                                                {vendor.business_name}
                                            </h3>
                                            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
                                                {vendor.description}
                                            </p>
                                        </div>

                                        <Separator className="mb-4" />

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <MapPin size={12} />
                                                <span className="truncate">{vendor.address}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <Phone size={12} />
                                                <span>{vendor.contact_phone}</span>
                                            </div>
                                        </div>

                                        <Button className="w-full gap-2" variant="default" size="sm">
                                            View Catalog
                                            <ArrowRight size={14} />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card className="border-dashed">
                            <CardContent className="py-20 flex flex-col items-center text-center">
                                <div className="p-4 rounded-2xl bg-muted mb-4">
                                    <Search size={40} strokeWidth={1.5} className="text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-2">No vendors found</h3>
                                <p className="text-sm text-muted-foreground">Try adjusting your search terms or check back later.</p>
                            </CardContent>
                        </Card>
                    )}

                    {/* CTA Section */}
                    <Card className="bg-foreground text-background border-transparent overflow-hidden">
                        <CardContent className="py-12 md:py-16 text-center relative">
                            <div className="max-w-lg mx-auto space-y-5">
                                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center mx-auto">
                                    <ArrowUpRight size={28} className="text-primary-foreground" />
                                </div>
                                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
                                    Want to list your products?
                                </h2>
                                <p className="text-sm text-muted-foreground/80 max-w-md mx-auto">
                                    Join our vendor network and reach thousands of hostel owners across the country.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                                    <Button size="lg" variant="secondary" className="gap-2">
                                        Apply as Vendor
                                        <ExternalLink size={14} />
                                    </Button>
                                    <Button size="lg" variant="outline" className="border-muted-foreground/20 text-background hover:text-background hover:bg-muted-foreground/10">
                                        Contact Sales
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
