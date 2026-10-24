"use client";

import { useState } from "react";
import Image from "next/image";
import { orderService } from "@/services/marketplaceservices/order.service";
import { OrderStatus } from "@/types/marketplace.types";
import {
    Package,
    Calendar,
    Truck,
    XCircle,
    Receipt,
    ShoppingBag,
    ChevronRight,
    Search as SearchIcon,
    RefreshCw,
    MessageSquare,
    CheckCircle2,
    Store,
    Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { tokenManager } from "@/lib/token";
import { toLocalMediaPath } from "@/lib/utils";

export default function UserOrders() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");

    // Contact Us state
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', mobile: '', issue: '' });
    const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<number | null>(null);

    const isAuthenticated = !!user && tokenManager.getAuthFlag() === 'authenticated';

    const { data: ordersData, isLoading } = useQuery({
        queryKey: ["userOrders"],
        queryFn: () => orderService.getOrders(),
        refetchInterval: isAuthenticated ? 5000 : false,
        enabled: isAuthenticated,
        retry: false,
    });

    const orders = ordersData || [];

    const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case "delivered": return "default";
            case "cancelled": return "destructive";
            case "shipped": return "secondary";
            default: return "outline";
        }
    };

    const getStatusDotColor = (status: OrderStatus) => {
        switch (status) {
            case "pending": return "bg-amber-500";
            case "shipped": return "bg-indigo-500";
            case "delivered": return "bg-emerald-500";
            case "cancelled": return "bg-rose-500";
            default: return "bg-slate-400";
        }
    };



    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
        });
    };

    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.vendor_name.toLowerCase().includes(appliedSearchQuery.toLowerCase()) ||
            order.id.toString().includes(appliedSearchQuery);
        const matchesStatus = selectedStatus === "all" || order.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const totalSpent = orders.reduce((acc, curr) => acc + Number.parseFloat(curr.total_amount), 0);
    const activeOrders = orders.filter(o => o.status !== "delivered" && o.status !== "cancelled").length;

    const statusFilters: (OrderStatus | "all")[] = ["all", "pending", "shipped", "delivered", "cancelled"];

    const renderOrdersList = () => {
        if (isLoading) {
            return (
                <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                        <Card key={i} className="border-border/40">
                            <CardContent className="p-5 flex flex-col md:flex-row gap-5 md:items-center">
                                <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
                                <div className="flex-1 space-y-2">
                                    <Skeleton className="h-4 w-1/3" />
                                    <Skeleton className="h-3 w-1/2" />
                                </div>
                                <Skeleton className="h-6 w-24 rounded-full" />
                                <Skeleton className="h-5 w-20" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            );
        }

        if (filteredOrders.length > 0) {
            return (
                <div className="border border-border/40 rounded-lg bg-card overflow-hidden shadow-sm">
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="font-semibold text-foreground">Order ID</TableHead>
                                <TableHead className="font-semibold text-foreground">Vendor</TableHead>
                                <TableHead className="font-semibold text-foreground">Date</TableHead>
                                <TableHead className="font-semibold text-foreground">Total Amount</TableHead>
                                <TableHead className="font-semibold text-foreground">Status</TableHead>
                                <TableHead className="text-right font-semibold text-foreground">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.map((order) => (
                                <TableRow
                                    key={order.id}
                                    className="group hover:bg-muted/20 cursor-pointer transition-colors duration-200"
                                    onClick={() => setSelectedOrderForDetail(order.id)}
                                >
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-mono text-xs font-semibold text-foreground">
                                                #ORD-{order.id.toString().padStart(5, "0")}
                                            </span>
                                            <Badge variant="secondary" className="text-[9px] py-0 w-fit">
                                                {order.order_type === "image_scan" ? "Image Scan" : "Marketplace"}
                                            </Badge>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-muted/60 flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors shrink-0">
                                                <ShoppingBag size={14} />
                                            </div>
                                            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                                                {order.vendor_name}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-0.5">
                                            <span className="text-xs font-medium text-foreground whitespace-nowrap flex items-center gap-1.5">
                                                <Calendar size={12} className="text-muted-foreground" />
                                                {formatDate(order.created_at)}
                                            </span>
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1.5">
                                                <Receipt size={10} />
                                                {order.items?.length || 0} items
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className="text-sm font-semibold text-foreground tabular-nums">
                                            ₹{parseFloat(order.total_amount).toLocaleString()}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <Badge variant={getStatusVariant(order.status)} className="capitalize text-[10px] gap-1.5 w-fit">
                                                <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(order.status)}`} />
                                                {order.status}
                                            </Badge>
                                            <span className="text-[9px] text-muted-foreground whitespace-nowrap">
                                                Updated: {formatDate(order.updated_at)}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="gap-1 text-xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedOrderForDetail(order.id);
                                            }}
                                        >
                                            Details
                                            <ChevronRight size={14} />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            );
        }

        return (
            <Card className="border-dashed border-border/60">
                <CardContent className="py-20 flex flex-col items-center text-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted/50 flex items-center justify-center mb-5">
                        <Package className="text-muted-foreground/50" size={28} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1.5">No orders found</h3>
                    <p className="text-sm text-muted-foreground max-w-xs mb-6 leading-relaxed">
                        You haven't placed any orders in the marketplace yet. Discover vendors and start shopping!
                    </p>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setSearchQuery("");
                            setSelectedStatus("all");
                        }}
                    >
                        Reset All Filters
                    </Button>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header Card */}
            <Card className="border-border/40 overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-5">
                        <div className="space-y-1.5">
                            <Badge variant="outline" className="text-xs text-muted-foreground mb-1">
                                Procurement History
                            </Badge>
                            <h1 className="text-2xl font-bold text-foreground tracking-tight">
                                Purchase Timeline
                            </h1>
                            <p className="text-sm text-muted-foreground max-w-md">
                                Track your bulk purchases and review your complete procurement history.
                            </p>
                        </div>

                        {/* Stats */}
                        <div className="flex gap-3">
                            <div className="bg-muted/40 border border-border/50 rounded-xl px-4 py-3 text-center min-w-[100px]">
                                <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-0.5">Total Spent</p>
                                <p className="text-xl font-bold text-foreground tabular-nums">₹{totalSpent.toLocaleString()}</p>
                            </div>
                            <div className="bg-primary text-primary-foreground rounded-xl px-4 py-3 text-center min-w-[70px]">
                                <p className="text-[10px] font-medium opacity-70 uppercase tracking-wider mb-0.5">Active</p>
                                <p className="text-xl font-bold tabular-nums">{activeOrders}</p>
                            </div>
                        </div>
                    </div>

                    {/* Search & Filters */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-1.5 bg-muted/30 rounded-lg border border-border/40">
                        {/* Search & Reset Container */}
                        <div className="flex-1 flex items-center justify-start gap-1 w-full md:w-auto px-2">
                            <div className="flex items-center gap-2 bg-transparent">
                                <SearchIcon size={14} className="text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search order ID..."
                                    className="bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground text-xs py-2 w-[120px] sm:w-[150px]"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setAppliedSearchQuery(e.target.value);
                                    }}
                                />
                            </div>
                            <Button
                                size="icon"
                                variant="ghost"
                                className="text-muted-foreground hover:text-foreground h-7 w-7"
                                onClick={() => {
                                    setSearchQuery('');
                                    setAppliedSearchQuery('');
                                    setSelectedStatus('all');
                                }}
                            >
                                <RefreshCw size={12} className={isLoading ? "animate-spin" : ""} />
                            </Button>
                        </div>

                        {/* Status Filters Center */}
                        <div className="flex-1 flex justify-center items-center gap-1 overflow-x-auto w-full md:w-auto order-first md:order-none py-1 md:py-0 border-b md:border-b-0 border-border/50">
                            {statusFilters.map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setSelectedStatus(status)}
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize whitespace-nowrap transition-all ${selectedStatus === status
                                        ? "bg-background text-foreground shadow-[0_1px_3px_0_rgba(0,0,0,0.1)] border border-border/50"
                                        : "text-muted-foreground hover:text-foreground hover:bg-background/40"
                                        }`}
                                >
                                    {status}
                                </button>
                            ))}
                        </div>

                        {/* Contact Us Right */}
                        <div className="flex-1 flex justify-end items-center px-1 w-full md:w-auto">
                            <Button
                                size="sm"
                                variant="outline"
                                className="gap-1.5 shadow-sm text-xs h-8"
                                onClick={() => setIsContactOpen(true)}
                            >
                                <MessageSquare size={13} />
                                Contact Us
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Orders List */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                            <Truck size={16} />
                        </div>
                        <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
                    </div>
                    <span className="text-xs text-muted-foreground">
                        {filteredOrders.length} {filteredOrders.length === 1 ? 'record' : 'records'}
                    </span>
                </div>

                {renderOrdersList()}
            </div>

            {/* Order Detail Modal */}
            {selectedOrderForDetail && (
                <OrderDetailModal
                    isOpen={!!selectedOrderForDetail}
                    onClose={() => setSelectedOrderForDetail(null)}
                    orderId={selectedOrderForDetail}
                />
            )}

            {/* Contact Us Modal */}
            {isContactOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-md shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-5">
                            <h2 className="text-xl font-bold text-foreground">Contact Support</h2>
                            <button
                                onClick={() => setIsContactOpen(false)}
                                className="p-1 rounded-md text-muted-foreground hover:bg-muted transition-colors"
                            >
                                <XCircle size={22} />
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
                                    onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
                                    placeholder="Enter your name"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold text-foreground">Mobile Number</label>
                                <Input
                                    required
                                    type="tel"
                                    value={contactForm.mobile}
                                    onChange={e => setContactForm({ ...contactForm, mobile: e.target.value })}
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
                                    onChange={e => setContactForm({ ...contactForm, issue: e.target.value })}
                                    placeholder="Please describe your issue in detail..."
                                />
                            </div>
                            <div className="pt-2">
                                <Button type="submit" className="w-full font-bold rounded-md">Submit Request</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

function OrderDetailModal({ isOpen, onClose, orderId }: { isOpen: boolean, onClose: () => void, orderId: number }) {
    const { data: order, isLoading } = useQuery({
        queryKey: ["orderDetail", orderId],
        queryFn: () => orderService.getOrderDetail(orderId),
        enabled: isOpen,
    });

    const getStatusVariant = (status: OrderStatus): "default" | "secondary" | "destructive" | "outline" => {
        switch (status) {
            case "delivered": return "default";
            case "cancelled": return "destructive";
            case "shipped": return "secondary";
            default: return "outline";
        }
    };

    const getStatusDotColor = (status: OrderStatus) => {
        switch (status) {
            case "pending": return "bg-amber-500";
            case "shipped": return "bg-indigo-500";
            case "delivered": return "bg-emerald-500";
            case "cancelled": return "bg-rose-500";
            default: return "bg-slate-400";
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-background/95 border border-border/50 rounded-md shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 backdrop-blur-xl">
                {/* Modal Header */}
                <div className="p-5 sm:p-6 border-b border-border/40 flex items-center justify-between bg-muted/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
                            <Package size={20} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h2 className="text-lg sm:text-xl font-bold text-foreground">Order Details</h2>
                                <Badge variant="secondary" className="text-[10px] py-0 px-1.5 font-mono rounded-sm">
                                    #ORD-{orderId.toString().padStart(5, "0")}
                                </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Quick commerce fulfillment & item breakdown
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors"
                    >
                        <XCircle size={20} />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                    {isLoading ? (
                        <div className="space-y-4">
                            <Skeleton className="h-24 w-full rounded-md" />
                            <Skeleton className="h-44 w-full rounded-md" />
                        </div>
                    ) : order ? (
                        <div className="space-y-6">
                            {/* Vendor & Status Header Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                <div className="p-4 rounded-md border border-border/50 bg-background/50 dark:bg-card/40 backdrop-blur-sm space-y-2.5 shadow-xs">
                                    <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Store size={12} className="text-primary" />
                                        Fulfilled By
                                    </h4>
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                                            <ShoppingBag size={16} />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-foreground truncate">{order.vendor_name}</p>
                                            <p className="text-[11px] text-muted-foreground">Verified Merchant</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-md border border-border/50 bg-background/50 dark:bg-card/40 backdrop-blur-sm space-y-2.5 shadow-xs">
                                    <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Truck size={12} className="text-primary" />
                                        Delivery Status
                                    </h4>
                                    <div className="flex items-center justify-between">
                                        <Badge variant={getStatusVariant(order.status)} className="capitalize gap-1.5 py-1 px-2.5 text-xs rounded-sm">
                                            <span className={`w-2 h-2 rounded-full ${getStatusDotColor(order.status)}`} />
                                            {order.status}
                                        </Badge>
                                        <div className="text-right">
                                            <p className="text-xs font-medium text-foreground">
                                                {new Date(order.created_at).toLocaleDateString("en-US", {
                                                    month: "short",
                                                    day: "numeric",
                                                    year: "numeric"
                                                })}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground">Placed on</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items Section - Quick Commerce Style with Transparent Outer Container */}
                            <div className="space-y-3.5">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <h4 className="text-sm font-semibold text-foreground">Ordered Items</h4>
                                        <Badge variant="secondary" className="text-[10px] py-0 px-2 font-medium bg-primary/10 text-primary border-primary/20 rounded-sm">
                                            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                                        </Badge>
                                    </div>
                                    <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                                        <CheckCircle2 size={12} />
                                        Quick Commerce Packaging
                                    </span>
                                </div>

                                {/* Items Container: Transparent outer cards with inside like quick commerce */}
                                <div className="space-y-2.5">
                                    {order.items && order.items.length > 0 ? (
                                        order.items.map((item, idx) => (
                                            <div
                                                key={idx}
                                                className="relative overflow-hidden rounded-md border border-border/50 bg-background/50 dark:bg-card/30 backdrop-blur-md p-3 sm:p-3.5 hover:border-primary/40 hover:bg-background/80 hover:shadow-md transition-all duration-300 shadow-xs flex items-center justify-between gap-3 group"
                                            >
                                                <div className="flex items-center gap-3.5 min-w-0">
                                                    {/* Quick Commerce Product Thumbnail Container */}
                                                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-md bg-white dark:bg-slate-900 border border-border/40 p-1.5 shrink-0 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                                                        {item.product_image ? (
                                                            <Image
                                                                src={toLocalMediaPath(item.product_image) || '/images/icon.webp'}
                                                                alt={item.product_name}
                                                                fill
                                                                className="object-contain p-1"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full rounded-md bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-indigo-950/40 dark:to-emerald-950/40 flex items-center justify-center text-primary">
                                                                <Package size={20} className="stroke-[1.8]" />
                                                            </div>
                                                        )}
                                                        {/* Quick Commerce Floating Quantity Badge */}
                                                        <span className="absolute bottom-1 right-1 bg-emerald-600 text-white font-semibold text-[9px] px-1.5 py-0.5 rounded-xs shadow-xs leading-none">
                                                            {item.quantity}x
                                                        </span>
                                                    </div>

                                                    {/* Inside Details */}
                                                    <div className="min-w-0 space-y-1">
                                                        <h5 className="text-sm font-semibold text-foreground tracking-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                            {item.product_name}
                                                        </h5>
                                                        <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                                                            <span className="font-normal text-foreground">
                                                                ₹{parseFloat(item.unit_price).toLocaleString()}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground/60">•</span>
                                                            <span>Qty: {item.quantity}</span>
                                                            {item.quantity_unit && (
                                                                <>
                                                                    <span className="text-[10px] text-muted-foreground/60">•</span>
                                                                    <Badge variant="outline" className="text-[9px] py-0 px-1 border-border/50 uppercase rounded-sm">
                                                                        {item.quantity_unit}
                                                                    </Badge>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Price Column */}
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-semibold text-foreground tabular-nums">
                                                        ₹{parseFloat(item.total_price).toLocaleString()}
                                                    </p>
                                                    <p className="text-[10px] text-muted-foreground font-normal">
                                                        ₹{parseFloat(item.unit_price).toLocaleString()} / unit
                                                    </p>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-sm text-muted-foreground border border-dashed border-border/50 rounded-md">
                                            No items listed for this order.
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Quick Commerce Bill Summary Box (Transparent Outer) */}
                            <div className="rounded-md border border-border/50 bg-muted/20 dark:bg-card/30 backdrop-blur-md p-4 sm:p-5 space-y-3">
                                <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                    <Receipt size={13} className="text-primary" />
                                    Bill Details
                                </h5>
                                <div className="space-y-2 text-xs">
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>Items Total ({order.items?.length || 0} items)</span>
                                        <span className="font-medium text-foreground tabular-nums">
                                            ₹{parseFloat(order.total_amount).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span className="flex items-center gap-1.5">
                                            Delivery Partner Fee
                                            <Badge variant="outline" className="text-[9px] py-0 px-1 text-emerald-600 border-emerald-200 bg-emerald-50/50 rounded-sm">
                                                Free
                                            </Badge>
                                        </span>
                                        <span className="text-emerald-600 font-medium">FREE</span>
                                    </div>
                                    <div className="flex items-center justify-between text-muted-foreground">
                                        <span>Packaging & Handling</span>
                                        <span className="text-muted-foreground font-medium">Included</span>
                                    </div>
                                    {order.note && (
                                        <div className="pt-1 text-[11px] text-muted-foreground bg-background/50 p-2.5 rounded-md border border-border/40">
                                            <span className="font-semibold text-foreground">Special Instructions: </span>
                                            {order.note}
                                        </div>
                                    )}
                                </div>
                                <Separator className="bg-border/50" />
                                <div className="flex items-center justify-between pt-0.5">
                                    <div>
                                        <p className="text-xs font-semibold text-foreground uppercase tracking-wider">Grand Total</p>
                                        <p className="text-[10px] text-muted-foreground">Inclusive of all taxes</p>
                                    </div>
                                    <p className="text-base sm:text-lg font-semibold text-primary tabular-nums">
                                        ₹{parseFloat(order.total_amount).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <p className="text-muted-foreground">Failed to load order details.</p>
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 sm:p-5 border-t border-border/40 flex justify-end bg-muted/10">
                    <Button onClick={onClose} className="rounded-md px-5 font-medium text-xs h-9">
                        Close Details
                    </Button>
                </div>
            </div>
        </div>
    );
}
