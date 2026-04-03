'use client';

import { useEffect, useState } from 'react';
import { marketplaceService } from '@/services/marketplaceservices/marketplace.service';
import { vendorService } from '@/services/marketplaceservices/vendor.service';
import { Vendor } from '@/types/marketplace.types';
import Image from 'next/image';
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
    CheckCircle2
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
            const profile = await vendorService.getMyVendorProfile();
            setMyVendor(profile);
        } catch (error) {
            console.error('Error fetching vendor profile:', error);
            toast.error('Failed to load your vendor profile.');
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
                    {/* Stats Row */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                            {
                                label: 'Total Sales',
                                value: '₹1,24,500',
                                change: '+12% this month',
                                changeColor: 'text-emerald-600',
                                icon: TrendingUp,
                                iconBg: 'bg-blue-50',
                                iconColor: 'text-blue-600',
                            },
                            {
                                label: 'Active Products',
                                value: '42',
                                change: 'View all products',
                                changeColor: 'text-primary',
                                icon: Package,
                                iconBg: 'bg-indigo-50',
                                iconColor: 'text-indigo-600',
                            },
                            {
                                label: 'Pending Orders',
                                value: '18',
                                change: 'Manage orders',
                                changeColor: 'text-amber-600',
                                icon: ShoppingCart,
                                iconBg: 'bg-amber-50',
                                iconColor: 'text-amber-600',
                            },
                        ].map((stat, i) => (
                            <Card key={i} className="py-5 hover:shadow-md transition-shadow duration-300">
                                <CardContent className="px-5 py-0">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                                            <stat.icon size={20} className={stat.iconColor} />
                                        </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
                                    <p className="text-2xl font-semibold tracking-tight text-foreground mb-2">{stat.value}</p>
                                    <p className={`text-xs font-medium ${stat.changeColor} flex items-center gap-1`}>
                                        <ArrowUpRight size={12} />
                                        {stat.change}
                                    </p>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Recent Activity */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-base">Recent Activity</CardTitle>
                                    <CardDescription>Latest customer interactions</CardDescription>
                                </div>
                                <Button variant="ghost" size="sm" className="text-xs">
                                    View All
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-1">
                            {[
                                { name: 'Zostel Delhi', items: '24 Furniture items', time: '2 hours ago' },
                                { name: 'Backpacker Hostel', items: '12 Bedding sets', time: '5 hours ago' },
                                { name: 'The Hosteller', items: '8 Electronics items', time: '1 day ago' },
                            ].map((activity, i) => (
                                <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="w-9 h-9 bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
                                        <UserCircle size={18} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-foreground">New order from {activity.name}</p>
                                        <p className="text-xs text-muted-foreground">{activity.items} · {activity.time}</p>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px]">New</Badge>
                                </div>
                            ))}
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
