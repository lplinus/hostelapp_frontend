"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { tokenManager } from "@/lib/token";

export default function UserOrders() {
    const { user } = useAuth();
    const [searchQuery, setSearchQuery] = useState("");
    const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "all">("all");
    
    // Contact Us state
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [contactForm, setContactForm] = useState({ name: '', mobile: '', issue: '' });

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
                <div className="border border-border/40 rounded-xl bg-card overflow-hidden shadow-sm">
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
                                <TableRow key={order.id} className="group hover:bg-muted/20 cursor-pointer transition-colors duration-200">
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
                                        <span className="text-sm font-bold text-foreground tabular-nums">
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
                                        <Button size="sm" variant="outline" className="gap-1 text-xs group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors">
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
