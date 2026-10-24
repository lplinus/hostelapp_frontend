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
    Clock,
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';

import { marketplaceSearchService } from '@/services/marketplaceservices/marketplace-search.service';
import { toLocalMediaPath } from '@/lib/utils';

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
                <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,210px))] gap-3 sm:gap-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 space-y-2.5 bg-white dark:bg-card">
                            <Skeleton className="h-36 w-full rounded-md" />
                            <Skeleton className="h-4 w-16 rounded" />
                            <Skeleton className="h-4 w-4/5 rounded" />
                            <Skeleton className="h-3 w-1/3 rounded" />
                            <div className="flex items-center justify-between pt-2">
                                <Skeleton className="h-4 w-12 rounded" />
                                <Skeleton className="h-8 w-16 rounded-md" />
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        if (products.length > 0) {
            return (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(175px,210px))] gap-3 sm:gap-4">
                    {products.map((product) => {
                        const cartItem = getCartItem(product.id);
                        const inCart = !!cartItem;

                        return (
                            <div
                                key={product.id}
                                className="group relative rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-card p-3 flex flex-col justify-between hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-200 h-full"
                            >
                                {/* Top: Image, Timer Badge & Product Details */}
                                <div>
                                    {/* Product Image Centered with Crisp Border */}
                                    <div className="relative h-36 w-full flex items-center justify-center overflow-hidden py-1 rounded-md bg-slate-50/60 dark:bg-slate-900/40 mb-2">
                                        <Image
                                            src={toLocalMediaPath(product.image) || '/images/icon.webp'}
                                            alt={product.name}
                                            fill
                                            className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                                        />
                                        {(product.stock ?? 0) === 0 && (
                                            <div className="absolute inset-0 bg-black/45 backdrop-blur-[1px] flex items-center justify-center">
                                                <span className="bg-red-600 text-white text-[9px] font-medium px-2 py-0.5 rounded uppercase tracking-wider">
                                                    Sold Out
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Timer Badge (e.g. ⏱ 18 MINS) */}
                                    <div className="flex items-center gap-1 bg-[#FFF7ED] text-[#9A3412] border border-[#FFEDD5] text-[10px] font-medium px-1.5 py-0.5 rounded w-fit">
                                        <Clock size={10} className="stroke-[2]" />
                                        <span>{product.is_featured ? '10 MINS' : '18 MINS'}</span>
                                    </div>

                                    {/* Title - smooth, simple, classical */}
                                    <h3 className="text-[13px] font-medium text-foreground leading-snug line-clamp-2 mt-1.5 min-h-[36px] tracking-tight group-hover:text-emerald-700 transition-colors">
                                        {product.name}
                                    </h3>

                                    {/* Weight / Unit */}
                                    <p className="text-xs text-muted-foreground mt-0.5 font-normal">
                                        {product.quantity_unit ? (product.quantity_unit === 'number' ? '1 unit' : product.quantity_unit) : '1 unit'}
                                    </p>
                                </div>

                                {/* Bottom Row: Price & Green Blinkit ADD Button */}
                                <div className="flex items-end justify-between gap-2 mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-foreground tabular-nums leading-none">
                                            ₹{parseFloat(product.price).toFixed(0)}
                                        </span>
                                        <span className="text-[11px] text-muted-foreground line-through tabular-nums leading-none mt-1 font-normal">
                                            ₹{(parseFloat(product.price) * 1.15).toFixed(0)}
                                        </span>
                                    </div>

                                    {inCart ? (
                                        <div className="flex items-center justify-between border border-emerald-600 bg-emerald-600 text-white rounded-md h-[32px] px-1 min-w-[70px] shadow-xs">
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(product.id, -1)}
                                                className="w-5 h-5 flex items-center justify-center hover:bg-emerald-700 rounded transition-colors"
                                                aria-label="Decrease quantity"
                                            >
                                                <Minus size={11} strokeWidth={2.5} />
                                            </button>
                                            <span className="text-xs font-medium tabular-nums px-1">
                                                {cartItem!.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => updateQuantity(product.id, 1)}
                                                disabled={(product.stock ?? Infinity) <= cartItem!.quantity}
                                                className="w-5 h-5 flex items-center justify-center hover:bg-emerald-700 rounded transition-colors disabled:opacity-50"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus size={11} strokeWidth={2.5} />
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            disabled={(product.stock ?? 0) === 0}
                                            onClick={() => addToCart(product)}
                                            className="border border-emerald-600 bg-[#F0FDF4] hover:bg-[#DCFCE7] active:bg-[#BBF7D0] text-emerald-700 rounded-md px-2.5 py-1 flex flex-col items-center justify-center min-w-[68px] h-[34px] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
                                        >
                                            <span className="text-xs font-semibold tracking-wide leading-none">
                                                ADD
                                            </span>
                                            <span className="text-[9px] text-emerald-600/90 font-normal leading-none mt-0.5">
                                                {product.quantity_steps && product.quantity_steps.length > 1
                                                    ? `${product.quantity_steps.length} options`
                                                    : 'options'}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
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
            </div>            {/* Cart Modal */}
            {isCartOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200"
                    onClick={() => setIsCartOpen(false)}
                >
                    <div
                        className="bg-white rounded-md border border-border/40 shadow-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Cart Header */}
                        <div className="flex items-center justify-between p-5 border-b border-border/40 bg-muted/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary">
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
                                        className="text-xs text-red-500 hover:text-red-600 hover:bg-red-50 gap-1 rounded-md h-8"
                                        onClick={clearCart}
                                    >
                                        <Trash2 size={14} />
                                        Clear
                                    </Button>
                                )}
                                <button
                                    onClick={() => setIsCartOpen(false)}
                                    className="p-1.5 hover:bg-muted rounded-md transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Cart Content */}
                        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                            {orderSuccess ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center animate-in fade-in zoom-in duration-300">
                                    <div className="w-16 h-16 rounded-md bg-emerald-50 flex items-center justify-center mb-4">
                                        <CheckCircle2 size={36} className="text-emerald-500" />
                                    </div>
                                    <h3 className="text-xl font-bold text-foreground mb-2">Order Placed!</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mb-6">
                                        Your order has been sent to the vendor. Track it in "My Orders".
                                    </p>
                                    <Button
                                        className="rounded-md text-xs font-semibold"
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        Continue Shopping
                                    </Button>
                                </div>
                            ) : cart.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="w-16 h-16 rounded-md bg-muted/50 flex items-center justify-center mb-4">
                                        <ShoppingCart size={28} className="text-muted-foreground/40" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-foreground mb-1">Cart is empty</h3>
                                    <p className="text-sm text-muted-foreground max-w-xs mb-6">
                                        Browse the kirana and add essentials to get started.
                                    </p>
                                    <Button
                                        variant="outline"
                                        className="rounded-md text-xs"
                                        onClick={() => setIsCartOpen(false)}
                                    >
                                        Browse Essentials
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    {/* Cart Items grouped by Vendor */}
                                    {Object.entries(cartByVendor).map(([vendorId, group]) => (
                                        <div key={vendorId} className="space-y-2">
                                            <div className="flex items-center gap-2 px-1">
                                                <div className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center">
                                                    <Package size={12} className="text-indigo-500" />
                                                </div>
                                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                    {group.vendorName}
                                                </span>
                                            </div>
                                            {group.items.map((item) => (
                                                <div
                                                    key={item.product.id}
                                                    className="relative overflow-hidden rounded-2xl border border-border/50 bg-background/50 dark:bg-card/40 backdrop-blur-md p-3 sm:p-3.5 hover:border-primary/40 hover:bg-background/80 transition-all shadow-xs flex items-center justify-between gap-3 group"
                                                >
                                                    <div className="flex items-center gap-3 min-w-0">
                                                        <div className="relative w-14 h-14 rounded-xl bg-white dark:bg-slate-900 border border-border/30 p-1.5 shrink-0 flex items-center justify-center overflow-hidden shadow-inner group-hover:scale-105 transition-transform duration-300">
                                                            <Image
                                                                src={toLocalMediaPath(item.product.image) || '/images/icon.webp'}
                                                                alt={item.product.name}
                                                                fill
                                                                className="object-contain p-1"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 space-y-0.5">
                                                            <h4 className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                                                {item.product.name}
                                                            </h4>
                                                            <p className="text-xs text-muted-foreground font-medium">
                                                                ₹{item.product.price}/{item.product.quantity_unit || 'unit'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2.5 shrink-0">
                                                        <div className="flex items-center gap-1 bg-muted/40 rounded-xl p-0.5 border border-border/40">
                                                            <button
                                                                onClick={() => updateQuantity(item.product.id, -1)}
                                                                className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center text-foreground hover:text-primary transition-colors shadow-xs"
                                                            >
                                                                <Minus size={12} />
                                                            </button>
                                                            <span className="w-6 text-center text-xs font-bold tabular-nums">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => updateQuantity(item.product.id, 1)}
                                                                className="w-7 h-7 rounded-lg hover:bg-background flex items-center justify-center text-foreground hover:text-primary transition-colors shadow-xs"
                                                            >
                                                                <Plus size={12} />
                                                            </button>
                                                        </div>
                                                        <div className="text-right min-w-[60px]">
                                                            <p className="text-sm font-bold text-foreground tabular-nums">
                                                                ₹{(parseFloat(item.product.price) * item.quantity).toFixed(2)}
                                                            </p>
                                                        </div>
                                                        <button
                                                            onClick={() => removeFromCart(item.product.id)}
                                                            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors rounded-lg"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
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
                                                className="w-full flex items-center justify-between p-3 bg-muted/30 border border-border/40 rounded-md text-sm hover:border-border/80 transition-colors"
                                            >
                                                <span className={selectedHostelId ? "text-foreground font-medium" : "text-muted-foreground"}>
                                                    {selectedHostelId
                                                        ? hostels.find(h => h.id === selectedHostelId)?.name || 'Selected Hostel'
                                                        : 'Select your hostel'}
                                                </span>
                                                <ChevronDown size={16} className={`text-muted-foreground transition-transform ${isHostelDropdownOpen ? 'rotate-180' : ''}`} />
                                            </button>
                                            {isHostelDropdownOpen && (
                                                <div className="absolute z-10 mt-1 w-full bg-white border border-border/60 rounded-md shadow-lg overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150 max-h-48 overflow-y-auto">
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
                                                                className={`w-full text-left px-4 py-3 text-sm hover:bg-muted/50 transition-colors flex items-center justify-between ${selectedHostelId === hostel.id ? 'bg-primary/5 text-primary font-medium' : 'text-foreground'
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
                                            className="w-full p-3 bg-muted/30 border border-border/40 rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 resize-none transition-colors"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Cart Footer */}
                        {cart.length > 0 && !orderSuccess && (
                            <div className="p-5 border-t border-border/40 space-y-3 bg-muted/20">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Subtotal ({cartItemCount} items)</span>
                                        <span className="text-base font-bold text-foreground tabular-nums">₹{cartTotal.toFixed(2)}</span>
                                    </div>
                                    {Object.keys(cartByVendor).length > 1 && (
                                        <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-md font-medium border border-amber-200/60">
                                            ⚡ Items from {Object.keys(cartByVendor).length} vendors — separate orders will be placed per vendor.
                                        </p>
                                    )}
                                </div>
                                <Button
                                    className="w-full h-11 gap-2 text-sm font-semibold rounded-md shadow-sm"
                                    disabled={isPlacingOrder || !selectedHostelId}
                                    onClick={placeOrder}
                                >
                                    {isPlacingOrder ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Placing Order...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={15} />
                                            Place Order — ₹{cartTotal.toFixed(2)}
                                        </>
                                    )}
                                </Button>
                                {!selectedHostelId && (
                                    <p className="text-[11px] text-center text-red-500 font-medium">
                                        Please select a hostel to continue
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
