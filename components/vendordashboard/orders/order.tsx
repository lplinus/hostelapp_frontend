'use client';

import { useState, Fragment } from 'react';
import { vendorService } from '@/services/marketplaceservices/vendor.service';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Order, OrderStatus } from '@/types/marketplace.types';
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
    ChevronDown,
    ChevronUp,
    Building2,
    Loader2,
    AlertCircle,
    Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { tokenManager } from '@/lib/token';

const STATUS_FLOW: Record<string, OrderStatus[]> = {
    pending: ['shipped', 'cancelled'],
    processing: ['shipped', 'cancelled'], // Hidden from flow but kept for legacy data
    shipped: ['delivered'],
    delivered: [],
    cancelled: [],
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending: { label: 'Pending', color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    processing: { label: 'Processing', color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
    shipped: { label: 'In Transit', color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
    delivered: { label: 'Delivered', color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
    cancelled: { label: 'Cancelled', color: 'text-rose-700', bg: 'bg-rose-50', border: 'border-rose-200' },
};

export default function OrdersPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    
    // Contact Us State
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', mobile: '', issue: '' });

    const handleCopy = (e: React.MouseEvent, text: string) => {
        e.stopPropagation();
        navigator.clipboard.writeText(text);
        toast.success("Address copied securely!");
    };

    const isAuthenticated = !!user && tokenManager.getAuthFlag() === 'authenticated';

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ['vendorOrders'],
        queryFn: () => vendorService.getVendorOrders(),
        refetchInterval: isAuthenticated ? 5000 : false,
        enabled: isAuthenticated,
        retry: false,
    });
    const orders = ordersData || [];

    const handleStatusUpdate = async (orderId: number, newStatus: OrderStatus) => {
        setUpdatingOrderId(orderId);
        try {
            await vendorService.updateOrderStatus(orderId, newStatus);
            toast.success(`Order #${orderId.toString().padStart(5, '0')} updated to "${STATUS_CONFIG[newStatus]?.label || newStatus}"`);
            
            // Invalidate to trigger lively refresh
            queryClient.invalidateQueries({ queryKey: ['vendorOrders'] });
        } catch (error: any) {
            console.error('Error updating order status:', error);
            const msg = error?.response?.data?.message || error?.message || 'Failed to update order status.';
            toast.error(msg);
        } finally {
            setUpdatingOrderId(null);
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

    const getStatusDotColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending': return 'bg-amber-500';
            case 'processing': return 'bg-blue-500';
            case 'shipped': return 'bg-indigo-500';
            case 'delivered': return 'bg-emerald-500';
            case 'cancelled': return 'bg-rose-500';
            default: return 'bg-slate-400';
        }
    };

    const safeOrders = Array.isArray(orders) ? orders : [];

    const filteredOrders = safeOrders.filter(order => {
        const matchesStatus = filterStatus === 'all' || order.status.toLowerCase() === filterStatus.toLowerCase();
        const matchesSearch = !searchQuery ||
            order.hostel_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.vendor_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toString().includes(searchQuery);
        return matchesStatus && matchesSearch;
    });

    const filterTabs = [
        { value: 'all', label: 'All', count: safeOrders.length },
        { value: 'pending', label: 'Pending', count: safeOrders.filter(o => o.status === 'pending').length },
        // { value: 'processing', label: 'Processing', count: safeOrders.filter(o => o.status === 'processing').length }, // Process commented out
        { value: 'shipped', label: 'Shipped', count: safeOrders.filter(o => o.status === 'shipped').length },
        { value: 'delivered', label: 'Delivered', count: safeOrders.filter(o => o.status === 'delivered').length },
    ];

    const toggleExpand = (orderId: number) => {
        setExpandedOrderId(prev => prev === orderId ? null : orderId);
    };

    const pendingCount = safeOrders.filter(o => o.status === 'pending').length;

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Received Orders</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage orders placed by hostel owners. Update status to keep them informed.
                    </p>
                </div>
                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <Button variant="outline" className="w-full md:w-auto" onClick={() => setIsContactOpen(true)}>
                        Contact Us
                    </Button>
                    <div className="relative w-full md:w-64 lg:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                        <Input
                            placeholder="Search by hostel, order ID..."
                            className="pl-9"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Pending Alert */}
            {pendingCount > 0 && (
                <div className="flex items-center gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                    <div className="p-2 rounded-lg bg-amber-100">
                        <AlertCircle size={18} className="text-amber-600" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-800">
                            {pendingCount} new {pendingCount === 1 ? 'order' : 'orders'} awaiting your action
                        </p>
                        <p className="text-xs text-amber-600 mt-0.5">
                            Review and accept pending orders to start processing them.
                        </p>
                    </div>
                    <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 text-amber-700 hover:bg-amber-100 text-xs"
                        onClick={() => setFilterStatus('pending')}
                    >
                        View Pending
                    </Button>
                </div>
            )}

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg w-fit overflow-x-auto">
                {filterTabs.map(tab => (
                    <Button
                        key={tab.value}
                        variant={filterStatus === tab.value ? 'default' : 'ghost'}
                        size="sm"
                        className="text-xs h-8 gap-1.5"
                        onClick={() => setFilterStatus(tab.value)}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                                filterStatus === tab.value
                                    ? 'bg-primary-foreground/20 text-primary-foreground'
                                    : 'bg-muted-foreground/10 text-muted-foreground'
                            }`}>
                                {tab.count}
                            </span>
                        )}
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
                <div className="border border-border/40 rounded-xl bg-card overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="font-semibold text-foreground">Order</TableHead>
                                <TableHead className="font-semibold text-foreground">Hostel & Details</TableHead>
                                <TableHead className="font-semibold text-foreground">Date</TableHead>
                                <TableHead className="font-semibold text-foreground">Total</TableHead>
                                <TableHead className="font-semibold text-foreground">Status</TableHead>
                                <TableHead className="font-semibold text-foreground text-right w-12"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => {
                                const isExpanded = expandedOrderId === order.id;
                                const nextStatuses = STATUS_FLOW[order.status] || [];
                                const isUpdating = updatingOrderId === order.id;
                                const statusConf = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;

                                return (
                                    <Fragment key={order.id}>
                                        <TableRow 
                                            className="group cursor-pointer hover:bg-muted/20 transition-colors duration-200"
                                            onClick={() => toggleExpand(order.id)}
                                        >
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${order.order_type === 'image_scan' ? 'bg-blue-50 text-blue-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                                        {order.order_type === 'image_scan' ? <ImageIcon size={14} /> : <Package size={14} />}
                                                    </div>
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="font-mono text-xs font-semibold text-foreground">
                                                            #{order.id.toString().padStart(5, '0')}
                                                        </span>
                                                        <span className="text-[10px] text-muted-foreground capitalize">
                                                            {order.order_type.replace('_', ' ')}
                                                        </span>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 size={13} className="text-muted-foreground" />
                                                        <span className="text-sm font-semibold text-foreground">{order.hostel_name || 'Unknown Hostel'}</span>
                                                    </div>
                                                    {order.hostel_address && (
                                                        <div className="flex items-center gap-1.5 ml-[21px]">
                                                            <p className="text-[11px] text-muted-foreground max-w-[200px] truncate" title={order.hostel_address}>
                                                                {order.hostel_address}
                                                            </p>
                                                            <button 
                                                                onClick={(e) => handleCopy(e, order.hostel_address!)}
                                                                className="text-muted-foreground hover:text-primary transition-colors focus:outline-none"
                                                                title="Copy Address"
                                                            >
                                                                <Copy size={12} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            
                                            <TableCell>
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-xs font-medium text-foreground whitespace-nowrap flex items-center gap-1.5">
                                                        <Calendar size={12} className="text-muted-foreground" />
                                                        {new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                                        <ShoppingCart size={11} />
                                                        {order.items?.length || 0} items
                                                    </span>
                                                </div>
                                            </TableCell>

                                            <TableCell>
                                                <span className="text-sm font-bold text-foreground tabular-nums">
                                                    ₹{parseFloat(order.total_amount).toLocaleString()}
                                                </span>
                                            </TableCell>

                                            <TableCell>
                                                <Badge variant={getStatusVariant(order.status)} className="capitalize text-[10px] gap-1.5 w-fit">
                                                    {getStatusIcon(order.status)}
                                                    {statusConf.label}
                                                </Badge>
                                            </TableCell>

                                            <TableCell className="text-right align-middle">
                                                <div className={`p-1.5 rounded-md inline-flex transition-colors ${isExpanded ? 'bg-muted' : 'group-hover:bg-muted/50'}`}>
                                                    {isExpanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
                                                </div>
                                            </TableCell>
                                        </TableRow>

                                        {isExpanded && (
                                            <TableRow className="bg-muted/10 hover:bg-muted/10">
                                                <TableCell colSpan={6} className="p-0 border-b">
                                                    <div className="px-6 py-5 animate-in slide-in-from-top-2 fade-in duration-200">
                                                        {/* Order Items */}
                                                        {order.items && order.items.length > 0 && (
                                                            <div className="mb-6">
                                                                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                                                    <Package size={12} />
                                                                    Ordered Items
                                                                </p>
                                                                <div className="space-y-2 max-w-2xl">
                                                                    {order.items.map((item) => (
                                                                        <div key={item.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border/40 shadow-sm">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center">
                                                                                    <Package size={14} className="text-indigo-500" />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-medium text-foreground">{item.product_name_at_order}</p>
                                                                                    <p className="text-xs text-muted-foreground">
                                                                                        {item.quantity} × ₹{parseFloat(item.unit_price).toFixed(2)}
                                                                                    </p>
                                                                                </div>
                                                                            </div>
                                                                            <span className="text-sm font-bold text-foreground tabular-nums">
                                                                                ₹{parseFloat(item.total_price).toFixed(2)}
                                                                            </span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                                <div className="flex items-center justify-between max-w-2xl mt-3 pt-3 border-t border-border/40">
                                                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Order Total</span>
                                                                    <span className="text-base font-bold text-foreground tabular-nums">₹{parseFloat(order.total_amount).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Note */}
                                                        {order.note && (
                                                            <div className="mb-6 max-w-2xl">
                                                                <div className="flex items-start gap-2 text-sm text-muted-foreground bg-background rounded-lg p-3 border border-border/40 shadow-sm">
                                                                    <FileText size={14} className="mt-0.5 shrink-0" />
                                                                    <p className="italic leading-relaxed">&ldquo;{order.note}&rdquo;</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Status Actions */}
                                                        {nextStatuses.length > 0 && (
                                                            <div className="mb-4">
                                                                <Separator className="mb-4 max-w-2xl" />
                                                                <div className="flex flex-wrap items-center gap-2">
                                                                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-2">
                                                                        Required Action:
                                                                    </span>
                                                                    {nextStatuses.map((nextStatus) => {
                                                                        const conf = STATUS_CONFIG[nextStatus];
                                                                        const isCancelAction = nextStatus === 'cancelled';
                                                                        return (
                                                                            <Button
                                                                                key={nextStatus}
                                                                                size="sm"
                                                                                variant={isCancelAction ? 'destructive' : 'outline'}
                                                                                className={`text-xs gap-1.5 ${!isCancelAction ? `${conf.color} ${conf.border} hover:${conf.bg} bg-background` : ''} shadow-sm`}
                                                                                disabled={isUpdating}
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    handleStatusUpdate(order.id, nextStatus);
                                                                                }}
                                                                            >
                                                                                {isUpdating ? (
                                                                                    <Loader2 size={12} className="animate-spin" />
                                                                                ) : (
                                                                                    getStatusIcon(nextStatus)
                                                                                )}
                                                                                {isCancelAction ? 'Cancel Order' : `Mark as ${conf.label}`}
                                                                            </Button>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Meta */}
                                                        <div className="flex flex-wrap items-center gap-4 text-[10px] text-muted-foreground/80 mt-6 font-medium">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={10} />
                                                                Placed: {new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Clock size={10} />
                                                                Updated: {new Date(order.updated_at).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </Fragment>
                                );
                            })}
                        </TableBody>
                    </Table>
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
                                : 'No orders received yet. Orders placed by hostel owners will appear here.'
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
                    { label: 'Pending Orders', value: safeOrders.filter(o => o.status === 'pending').length, icon: Clock, iconBg: 'bg-amber-50', iconColor: 'text-amber-600' },
                    { label: 'Total Revenue', value: `₹${safeOrders.filter(o => o.status !== 'cancelled').reduce((acc, o) => acc + parseFloat(o.total_amount || '0'), 0).toLocaleString()}`, icon: TrendingUp, iconBg: 'bg-indigo-50', iconColor: 'text-indigo-600' },
                    { label: 'Hostels Served', value: new Set(safeOrders.map(o => o.hostel)).size, icon: Building2, iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600' },
                    { label: 'In Transit', value: safeOrders.filter(o => o.status === 'shipped').length, icon: Truck, iconBg: 'bg-blue-50', iconColor: 'text-blue-600' },
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

            {/* Contact Us Modal */}
            {isContactOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-foreground">Contact Support</h2>
                            <button 
                                onClick={() => setIsContactOpen(false)} 
                                className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                            >
                                <XCircle size={22}/>
                            </button>
                        </div>
                        <form 
                            onSubmit={(e) => {
                                e.preventDefault();
                                toast.success("Message sent successfully! Our team will contact you soon.");
                                setIsContactOpen(false);
                                setContactForm({ name: '', mobile: '', issue: '' });
                            }} 
                            className="space-y-4"
                        >
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Full Name</label>
                                <Input 
                                    required 
                                    value={contactForm.name} 
                                    onChange={e => setContactForm({...contactForm, name: e.target.value})} 
                                    placeholder="Enter your name" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Mobile Number</label>
                                <Input 
                                    required 
                                    type="tel" 
                                    value={contactForm.mobile} 
                                    onChange={e => setContactForm({...contactForm, mobile: e.target.value})} 
                                    placeholder="Enter your registered mobile number" 
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Issue Description</label>
                                <textarea 
                                    required 
                                    rows={4} 
                                    className="w-full p-3 border border-input bg-transparent rounded-md text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 resize-none" 
                                    value={contactForm.issue} 
                                    onChange={e => setContactForm({...contactForm, issue: e.target.value})} 
                                    placeholder="Please describe your issue in detail..." 
                                />
                            </div>
                            <div className="pt-2">
                                <Button type="submit" className="w-full font-bold">Submit Request</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
