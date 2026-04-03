'use client';

import { useState, useEffect, useMemo } from 'react';
import { marketplaceService } from '@/services/marketplaceservices/marketplace.service';
import { orderService } from '@/services/marketplaceservices/order.service';
import { getMyHostels } from '@/services/hostel.service';
import { Product } from '@/types/marketplace.types';
import { HostelListItem } from '@/types/hostel.types';
import Image from 'next/image';
import {
    Search,
    ShoppingCart,
    Filter,
    Flame,
    Package,
    Plus,
    Minus,
    RefreshCw,
    X,
    Trash2,
    Send,
    StickyNote,
    Building2,
    ChevronDown,
    Loader2,
    CheckCircle2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import { marketplaceSearchService } from '@/services/marketplaceservices/marketplace-search.service';

interface CartItem {
    product: Product;
    quantity: number;
}

export default function OnlineKirana() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [orderNote, setOrderNote] = useState('');
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Hostel selection state
    const [hostels, setHostels] = useState<HostelListItem[]>([]);
    const [selectedHostelId, setSelectedHostelId] = useState<number | null>(null);
    const [isHostelDropdownOpen, setIsHostelDropdownOpen] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchHostels();
    }, []);

    const fetchHostels = async () => {
        try {
            const data = await getMyHostels();
            setHostels(data || []);
            if (data && data.length === 1) {
                setSelectedHostelId(data[0].id);
            }
        } catch (error) {
            console.error('Error fetching hostels:', error);
        }
    };

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
            const response = await marketplaceService.getProducts();

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

    // Cart operations
    const getCartItem = (productId: number) => {
        return cart.find(item => item.product.id === productId);
    };

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.product.id === product.id);
            if (existing) {
                return prev.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...prev, { product, quantity: 1 }];
        });
        toast.success(`${product.name} added to cart`);
    };

    const updateQuantity = (productId: number, delta: number) => {
        setCart(prev => {
            return prev
                .map(item => {
                    if (item.product.id === productId) {
                        const newQty = item.quantity + delta;
                        if (newQty <= 0) return null;
                        return { ...item, quantity: newQty };
                    }
                    return item;
                })
                .filter(Boolean) as CartItem[];
        });
    };

    const removeFromCart = (productId: number) => {
        setCart(prev => prev.filter(item => item.product.id !== productId));
    };

    const clearCart = () => {
        setCart([]);
        setOrderNote('');
    };

    const cartTotal = useMemo(() => {
        return cart.reduce((sum, item) => sum + parseFloat(item.product.price) * item.quantity, 0);
    }, [cart]);

    const cartItemCount = useMemo(() => {
        return cart.reduce((sum, item) => sum + item.quantity, 0);
    }, [cart]);

    // Group cart items by vendor
    const cartByVendor = useMemo(() => {
        const grouped: Record<number, { vendorName: string; items: CartItem[] }> = {};
        cart.forEach(item => {
            const vendorId = item.product.vendor;
            const vendorName = item.product.vendor_name || `Vendor #${vendorId}`;
            if (!grouped[vendorId]) {
                grouped[vendorId] = { vendorName, items: [] };
            }
            grouped[vendorId].items.push(item);
        });
        return grouped;
    }, [cart]);

    const placeOrder = async () => {
        if (cart.length === 0) {
            toast.error('Your cart is empty.');
            return;
        }

        if (!selectedHostelId) {
            toast.error('Please select a hostel first.');
            return;
        }

        setIsPlacingOrder(true);

        try {
            // Group items by vendor and place separate orders
            const vendorGroups = cartByVendor;
            const orderPromises = Object.entries(vendorGroups).map(([vendorId, group]) => {
                return orderService.createStructuredOrder({
                    hostel_id: selectedHostelId,
                    vendor_id: parseInt(vendorId),
                    items: group.items.map(item => ({
                        product_id: item.product.id,
                        quantity: item.quantity,
                    })),
                    note: orderNote,
                });
            });

            await Promise.all(orderPromises);

            setOrderSuccess(true);
            toast.success('Order placed successfully! Vendors have been notified.');
            
            setTimeout(() => {
                clearCart();
                setOrderSuccess(false);
                setIsCartOpen(false);
            }, 2000);
        } catch (error: any) {
            console.error('Error placing order:', error);
            const msg = error?.response?.data?.message || error?.message || 'Failed to place order.';
            toast.error(msg);
        } finally {
            setIsPlacingOrder(false);
        }
    };

    const renderProductsGrid = () => {
        if (isLoading) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <Card key={i} className="overflow-hidden border-border/40 p-0">
                            <Skeleton className="aspect-[4/3] w-full rounded-none" />
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-3 w-2/3" />
                                <Skeleton className="h-4 w-4/5" />
                                <Separator />
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-8 w-20 rounded-md" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            );
        }

        if (products.length > 0) {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => {
                        const cartItem = getCartItem(product.id);
                        const inCart = !!cartItem;

                        return (
                            <Card
                                key={product.id}
                                className="group overflow-hidden border-border/40 hover:border-border hover:shadow-md transition-all duration-300 flex flex-col h-full p-0"
                            >
                                <div className="relative aspect-[4/3] w-full bg-muted/30 overflow-hidden">
                                    <Image
                                        src={product.image || '/images/icon.webp'}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
                                        {product.is_featured && (
                                            <Badge className="bg-amber-500/90 hover:bg-amber-500 text-white text-[10px] backdrop-blur-sm">
                                                <Flame size={10} />
                                                Featured
                                            </Badge>
                                        )}
                                        {!product.is_active && (
                                            <Badge variant="secondary" className="text-[10px] backdrop-blur-sm">
                                                Draft
                                            </Badge>
                                        )}
                                    </div>
                                    {inCart && (
                                        <div className="absolute top-2.5 right-2.5">
                                            <Badge className="bg-emerald-500/90 hover:bg-emerald-500 text-white text-[10px] backdrop-blur-sm gap-1">
                                                <ShoppingCart size={10} />
                                                {cartItem!.quantity} in cart
                                            </Badge>
                                        </div>
                                    )}
                                </div>

                                <CardContent className="p-4 flex flex-col flex-grow justify-between gap-3">
                                    <div className="space-y-1">
                                        <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                                            {product.category_name || 'Essential'}
                                        </p>
                                        <h3 className="text-sm font-semibold text-foreground leading-tight line-clamp-1">
                                            {product.name}
                                        </h3>
                                        {product.vendor_name && (
                                            <p className="text-[10px] text-muted-foreground">
                                                by {product.vendor_name}
                                            </p>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <Separator />
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <span className="text-base font-bold text-foreground">
                                                    ₹{product.price}
                                                </span>
                                                <span className="text-xs text-muted-foreground ml-0.5">
                                                    /{product.quantity_unit || 'unit'}
                                                </span>
                                            </div>
                                            <Badge
                                                variant={(product.stock ?? 0) > 0 ? "outline" : "destructive"}
                                                className={`text-[10px] font-medium ${(product.stock ?? 0) > 0
                                                    ? 'text-emerald-600 border-emerald-200 bg-emerald-50/50'
                                                    : ''
                                                    }`}
                                            >
                                                {(product.stock ?? 0) > 0 ? `${product.stock} left` : 'Sold Out'}
                                            </Badge>
                                        </div>

                                        {inCart ? (
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 w-9 p-0"
                                                    onClick={() => updateQuantity(product.id, -1)}
                                                >
                                                    <Minus size={14} />
                                                </Button>
                                                <span className="flex-1 text-center text-sm font-bold tabular-nums">
                                                    {cartItem!.quantity}
                                                </span>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="h-9 w-9 p-0"
                                                    onClick={() => updateQuantity(product.id, 1)}
                                                    disabled={(product.stock ?? Infinity) <= cartItem!.quantity}
                                                >
                                                    <Plus size={14} />
                                                </Button>
                                            </div>
                                        ) : (
                                            <Button
                                                size="sm"
                                                className="w-full gap-1.5 text-xs"
                                                disabled={(product.stock ?? 0) === 0}
                                                onClick={() => addToCart(product)}
                                            >
                                                <Plus size={14} />
                                                Add to Cart
                                            </Button>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            );
        }

        return (
            <Card className="border-dashed border-border/60">
                <CardContent className="py-20 flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-6">
                        <Package className="text-muted-foreground/50" size={32} />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No products listed</h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-8 leading-relaxed">
                        The online kirana store will be populated soon with essentials from local vendors.
                    </p>
                    <Button variant="outline" onClick={fetchProducts}>
                        Check for updates
                    </Button>
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 md:p-8">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-600/10 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-500/15 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 text-xs">
                                <Flame size={12} className="text-orange-400" />
                                Essential Supplies
                            </Badge>
                        </div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                            Online <span className="text-blue-400">Kirana</span>
                        </h1>
                        <p className="text-sm text-slate-400 max-w-sm">
                            Wholesale groceries and daily hostel essentials at your doorstep.
                        </p>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="flex-1 md:max-w-sm flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-1 backdrop-blur-sm focus-within:border-blue-500/40 transition-colors">
                            <div className="flex-1 flex items-center gap-2 px-3">
                                <Search size={16} className="text-slate-500 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Search essentials..."
                                    className="bg-transparent border-none outline-none text-white placeholder:text-slate-500 w-full text-sm py-2"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button
                                size="sm"
                                className="bg-blue-600 hover:bg-blue-700 text-xs shrink-0"
                                onClick={() => handleSearch(searchQuery)}
                            >
                                Search
                            </Button>
                            <Button
                                size="sm"
                                variant="secondary"
                                className="bg-slate-700/50 hover:bg-slate-700 text-slate-200 border border-slate-600/50 text-xs shrink-0"
                                onClick={() => {
                                    setSearchQuery('');
                                    fetchProducts();
                                }}
                            >
                                <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                            </Button>
                        </div>

                        {/* Cart Button */}
                        <button
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg backdrop-blur-sm transition-all duration-200 group"
                        >
                            <ShoppingCart size={20} className="text-white group-hover:scale-110 transition-transform" />
                            {cartItemCount > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-in zoom-in duration-200">
                                    {cartItemCount}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div>
                <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingCart size={18} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-foreground">All Products</h2>
                            <p className="text-xs text-muted-foreground">
                                {!isLoading && `${products.length} items available`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {cartItemCount > 0 && (
                            <Button
                                variant="default"
                                size="sm"
                                className="gap-1.5 text-xs"
                                onClick={() => setIsCartOpen(true)}
                            >
                                <ShoppingCart size={14} />
                                View Cart ({cartItemCount})
                            </Button>
                        )}
                        <Button variant="outline" size="sm" className="gap-1.5 text-xs">
                            <Filter size={14} />
                            Filter
                        </Button>
                    </div>
                </div>

                {renderProductsGrid()}
            </div>

            {/* Cart Drawer Overlay */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={() => setIsCartOpen(false)}
                />
            )}

            {/* Cart Drawer */}
            <div
                className={`fixed top-0 right-0 z-50 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
                    isCartOpen ? 'translate-x-0' : 'translate-x-full'
                }`}
            >
                <div className="flex flex-col h-full">
                    {/* Cart Header */}
                    <div className="flex items-center justify-between p-5 border-b border-border/40">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <ShoppingCart size={20} />
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-foreground">Your Cart</h2>
                                <p className="text-xs text-muted-foreground">
                                    {cartItemCount} {cartItemCount === 1 ? 'item' : 'items'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {cart.length > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 gap-1"
                                    onClick={clearCart}
                                >
                                    <Trash2 size={14} />
                                    Clear
                                </Button>
                            )}
                            <button
                                onClick={() => setIsCartOpen(false)}
                                className="p-2 hover:bg-muted/50 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-muted-foreground" />
                            </button>
                        </div>
                    </div>

                    {/* Cart Content */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-4">
                        {orderSuccess ? (
                            <div className="flex flex-col items-center justify-center h-full text-center animate-in fade-in zoom-in duration-300">
                                <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                                    <CheckCircle2 size={40} className="text-emerald-500" />
                                </div>
                                <h3 className="text-xl font-bold text-foreground mb-2">Order Placed!</h3>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    Your order has been sent to the vendor. Track it in "My Orders".
                                </p>
                            </div>
                        ) : cart.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-center">
                                <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                    <ShoppingCart size={28} className="text-muted-foreground/40" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground mb-1">Cart is empty</h3>
                                <p className="text-sm text-muted-foreground max-w-xs">
                                    Browse the kirana and add essentials to get started.
                                </p>
                            </div>
                        ) : (
                            <>
                                {/* Cart Items grouped by Vendor */}
                                {Object.entries(cartByVendor).map(([vendorId, group]) => (
                                    <div key={vendorId} className="space-y-2">
                                        <div className="flex items-center gap-2 px-1">
                                            <div className="w-5 h-5 rounded bg-indigo-50 flex items-center justify-center">
                                                <Package size={12} className="text-indigo-500" />
                                            </div>
                                            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                {group.vendorName}
                                            </span>
                                        </div>
                                        {group.items.map((item) => (
                                            <div
                                                key={item.product.id}
                                                className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/30 hover:border-border/60 transition-colors"
                                            >
                                                <div className="relative w-14 h-14 rounded-lg overflow-hidden bg-muted shrink-0">
                                                    <Image
                                                        src={item.product.image || '/images/icon.webp'}
                                                        alt={item.product.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-semibold text-foreground truncate">
                                                        {item.product.name}
                                                    </h4>
                                                    <p className="text-xs text-muted-foreground">
                                                        ₹{item.product.price}/{item.product.quantity_unit || 'unit'}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, -1)}
                                                        className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
                                                    >
                                                        <Minus size={12} />
                                                    </button>
                                                    <span className="w-7 text-center text-sm font-bold tabular-nums">
                                                        {item.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product.id, 1)}
                                                        className="w-7 h-7 rounded-md border border-border/50 flex items-center justify-center hover:bg-muted transition-colors"
                                                    >
                                                        <Plus size={12} />
                                                    </button>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <p className="text-sm font-bold text-foreground tabular-nums">
                                                        ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => removeFromCart(item.product.id)}
                                                    className="p-1 text-muted-foreground hover:text-red-500 transition-colors"
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ))}

                                {/* Hostel Selection */}
                                <div className="space-y-2 pt-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Building2 size={12} />
                                        Deliver to Hostel
                                    </label>
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => setIsHostelDropdownOpen(!isHostelDropdownOpen)}
                                            className="w-full flex items-center justify-between p-3 bg-muted/30 border border-border/40 rounded-xl text-sm hover:border-border/80 transition-colors"
                                        >
                                            <span className={selectedHostelId ? "text-foreground font-medium" : "text-muted-foreground"}>
                                                {selectedHostelId
                                                    ? hostels.find(h => h.id === selectedHostelId)?.name || 'Selected Hostel'
                                                    : 'Select your hostel'}
                                            </span>
                                            <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isHostelDropdownOpen ? 'rotate-180' : ''}`} />
                                        </button>
                                        {isHostelDropdownOpen && (
                                            <div className="absolute z-10 mt-1 w-full bg-white border border-border/60 rounded-xl shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                                                {hostels.length === 0 ? (
                                                    <div className="p-4 text-center text-sm text-muted-foreground">
                                                        No hostels found. Please add a hostel first.
                                                    </div>
                                                ) : (
                                                    hostels.map((hostel) => (
                                                        <button
                                                            key={hostel.id}
                                                            onClick={() => {
                                                                setSelectedHostelId(hostel.id);
                                                                setIsHostelDropdownOpen(false);
                                                            }}
                                                            className={`w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${
                                                                selectedHostelId === hostel.id ? 'bg-primary/5 text-primary font-medium' : 'text-foreground'
                                                            }`}
                                                        >
                                                            <div>
                                                                <p className="font-medium">{hostel.name}</p>
                                                                <p className="text-xs text-muted-foreground">{hostel.address}</p>
                                                            </div>
                                                            {selectedHostelId === hostel.id && (
                                                                <CheckCircle2 size={16} className="text-primary shrink-0" />
                                                            )}
                                                        </button>
                                                    ))
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Order Note */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <StickyNote size={12} />
                                        Order Note (optional)
                                    </label>
                                    <textarea
                                        value={orderNote}
                                        onChange={(e) => setOrderNote(e.target.value)}
                                        placeholder="Any special instructions..."
                                        rows={2}
                                        className="w-full p-3 bg-muted/30 border border-border/40 rounded-xl text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 resize-none transition-colors"
                                    />
                                </div>
                            </>
                        )}
                    </div>

                    {/* Cart Footer */}
                    {cart.length > 0 && !orderSuccess && (
                        <div className="p-5 border-t border-border/40 space-y-4 bg-muted/20">
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-muted-foreground">Subtotal ({cartItemCount} items)</span>
                                    <span className="font-semibold text-foreground tabular-nums">₹{cartTotal.toFixed(2)}</span>
                                </div>
                                {Object.keys(cartByVendor).length > 1 && (
                                    <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg font-medium">
                                        ⚡ Items from {Object.keys(cartByVendor).length} vendors — separate orders will be placed per vendor.
                                    </p>
                                )}
                            </div>
                            <Button
                                className="w-full h-12 gap-2 text-sm font-semibold rounded-xl shadow-md"
                                disabled={isPlacingOrder || !selectedHostelId}
                                onClick={placeOrder}
                            >
                                {isPlacingOrder ? (
                                    <>
                                        <Loader2 size={18} className="animate-spin" />
                                        Placing Order...
                                    </>
                                ) : (
                                    <>
                                        <Send size={16} />
                                        Place Order — ₹{cartTotal.toFixed(2)}
                                    </>
                                )}
                            </Button>
                            {!selectedHostelId && (
                                <p className="text-[10px] text-center text-red-500 font-medium">
                                    Please select a hostel to continue
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
