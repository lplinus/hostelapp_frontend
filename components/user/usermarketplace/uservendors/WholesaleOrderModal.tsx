"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { 
    Plus, 
    Trash2, 
    Loader2, 
    Minus, 
    ShoppingCart, 
    Info, 
    Search as SearchIcon, 
    Store,
    XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { marketplaceService } from '@/services/marketplaceservices/marketplace.service';
import { orderService } from '@/services/marketplaceservices/order.service';
import { toLocalMediaPath } from '@/lib/utils';
import { Vendor } from '@/types/marketplace.types';

interface WholesaleOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    vendor: Vendor;
    hostelId: number | null;
}

export function WholesaleOrderModal({ isOpen, onClose, vendor, hostelId }: WholesaleOrderModalProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedItems, setSelectedItems] = useState<{ [productId: number]: number }>({});
    const [manualItems, setManualItems] = useState<{ name: string; quantity: number }[]>([]);
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [productSearch, setProductSearch] = useState('');

    useEffect(() => {
        if (isOpen && vendor) {
            fetchVendorProducts();
        }
    }, [isOpen, vendor]);

    const fetchVendorProducts = async () => {
        setIsLoading(true);
        try {
            const response = await marketplaceService.getVendorDetail(vendor.id);
            if (response && response.products) {
                setProducts(response.products);
            }
        } catch (error) {
            console.error('Error fetching vendor products:', error);
            toast.error('Failed to load vendor catalog.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuantityChange = (productId: number, delta: number) => {
        setSelectedItems(prev => {
            const currentQty = prev[productId] || 0;
            const newQty = Math.max(0, currentQty + delta);
            if (newQty === 0) {
                const { [productId]: _, ...rest } = prev;
                return rest;
            }
            return { ...prev, [productId]: newQty };
        });
    };

    const addManualItem = () => {
        setManualItems([...manualItems, { name: '', quantity: 1 }]);
    };

    const removeManualItem = (index: number) => {
        setManualItems(manualItems.filter((_, i) => i !== index));
    };

    const updateManualItem = (index: number, field: 'name' | 'quantity', value: any) => {
        const updated = [...manualItems];
        updated[index] = { ...updated[index], [field]: value };
        setManualItems(updated);
    };

    const filteredProducts = products.filter(p => 
        p.name.toLowerCase().includes(productSearch.toLowerCase())
    );

    const totalUniqueItems = Object.keys(selectedItems).length + manualItems.filter(i => i.name.trim()).length;

    const handleSubmit = async () => {
        if (!hostelId) {
            toast.error('No hostel found. Please set up your hostel first.');
            return;
        }

        if (totalUniqueItems < 5) {
            toast.error('Wholesale orders must contain at least 5 distinct items.');
            return;
        }

        const items = [
            ...Object.entries(selectedItems).map(([id, qty]) => ({
                product_id: parseInt(id),
                quantity: qty
            })),
            ...manualItems.filter(i => i.name.trim()).map(i => ({
                manual_name: i.name,
                quantity: i.quantity
            }))
        ];

        setIsSubmitting(true);
        try {
            const response = await orderService.createWholesaleOrder({
                hostel_id: hostelId,
                vendor_id: vendor.id,
                items,
                note
            });

            if (response.success) {
                toast.success('Wholesale order placed successfully!');
                onClose();
                // Reset state
                setSelectedItems({});
                setManualItems([]);
                setNote('');
            }
        } catch (error: any) {
            console.error('Error placing order:', error);
            toast.error(error.message || 'Failed to place order.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <ShoppingCart size={20} />
                        </div>
                        <div>
                            <DialogTitle className="text-xl">Wholesale Order</DialogTitle>
                            <DialogDescription>
                                Placing order with <span className="font-semibold text-foreground">{vendor.business_name}</span>
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Catalog Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                Catalog Items
                                <Badge variant="secondary" className="text-[10px] py-0">
                                    {Object.keys(selectedItems).length} Selected
                                </Badge>
                            </h4>
                            <div className="relative w-48">
                                <SearchIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                                <Input 
                                    placeholder="Search products..." 
                                    className="pl-8 h-8 text-xs bg-muted/30"
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
                            </div>
                        ) : filteredProducts.length > 0 ? (
                            <div className="grid grid-cols-1 gap-2">
                                {filteredProducts.map((product) => (
                                    <div 
                                        key={product.id} 
                                        className="flex items-center justify-between p-3 rounded-xl border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                                                {product.image ? (
                                                    <Image 
                                                        src={toLocalMediaPath(product.image) ?? '/images/icon.webp'} 
                                                        alt={product.name} 
                                                        width={40} 
                                                        height={40} 
                                                        className="object-cover h-full w-full"
                                                    />
                                                ) : (
                                                    <Store size={18} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-foreground">{product.name}</p>
                                                <p className="text-xs text-primary font-semibold">₹{product.price}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-3">
                                            {selectedItems[product.id] ? (
                                                <div className="flex items-center gap-2.5 bg-background border border-border/60 rounded-lg p-1 shadow-sm">
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-7 w-7 rounded-md hover:bg-muted"
                                                        onClick={() => handleQuantityChange(product.id, -1)}
                                                    >
                                                        <Minus size={14} />
                                                    </Button>
                                                    <span className="text-sm font-bold min-w-[20px] text-center">
                                                        {selectedItems[product.id]}
                                                    </span>
                                                    <Button 
                                                        variant="ghost" 
                                                        size="icon" 
                                                        className="h-7 w-7 rounded-md hover:bg-muted"
                                                        onClick={() => handleQuantityChange(product.id, 1)}
                                                    >
                                                        <Plus size={14} />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    className="h-8 text-xs gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleQuantityChange(product.id, 1)}
                                                >
                                                    <Plus size={14} />
                                                    Add
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 rounded-xl border border-dashed border-border/60 bg-muted/10">
                                <p className="text-sm text-muted-foreground">No products found in catalog.</p>
                            </div>
                        )}
                    </div>

                    <Separator className="bg-border/40" />

                    {/* Manual Items */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-semibold flex items-center gap-2">
                                Add Custom Items
                                <Badge variant="secondary" className="text-[10px] py-0 bg-emerald-50 text-emerald-700 border-emerald-100">
                                    {manualItems.length} Added
                                </Badge>
                            </h4>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 text-xs gap-1.5 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                                onClick={addManualItem}
                            >
                                <Plus size={14} />
                                New Entry
                            </Button>
                        </div>

                        <div className="space-y-2">
                            {manualItems.map((item, index) => (
                                <div key={index} className="flex gap-2 items-center animate-in slide-in-from-left-2 duration-300">
                                    <Input 
                                        placeholder="Item Name (e.g. Fresh Milk)" 
                                        className="text-sm h-10 flex-1"
                                        value={item.name}
                                        onChange={(e) => updateManualItem(index, 'name', e.target.value)}
                                    />
                                    <div className="flex items-center gap-2 bg-muted/30 border border-border/50 rounded-lg p-1 shrink-0">
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 hover:bg-background"
                                            onClick={() => updateManualItem(index, 'quantity', Math.max(1, item.quantity - 1))}
                                        >
                                            <Minus size={14} />
                                        </Button>
                                        <span className="text-sm font-medium w-6 text-center">{item.quantity}</span>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-8 w-8 hover:bg-background"
                                            onClick={() => updateManualItem(index, 'quantity', item.quantity + 1)}
                                        >
                                            <Plus size={14} />
                                        </Button>
                                    </div>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-10 w-10 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                                        onClick={() => removeManualItem(index)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            ))}
                            {manualItems.length === 0 && (
                                <p className="text-xs text-muted-foreground italic text-center py-4">
                                    Need something not listed above? Add it manually.
                                </p>
                            )}
                        </div>
                    </div>

                    <Separator className="bg-border/40" />

                    {/* Notes */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold">Special Instructions</label>
                        <Input 
                            placeholder="Add notes for the vendor..." 
                            className="text-sm"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 bg-muted/30 border-t border-border/50">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${totalUniqueItems >= 5 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                            <span className="text-sm font-medium text-muted-foreground">
                                {totalUniqueItems} of 5 minimum items selected
                            </span>
                        </div>
                        {totalUniqueItems < 5 && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-600 font-medium animate-pulse">
                                <Info size={14} />
                                Add {5 - totalUniqueItems} more
                            </div>
                        )}
                    </div>
                    
                    <Button 
                        className="w-full h-12 text-base font-semibold gap-2" 
                        disabled={totalUniqueItems < 5 || isSubmitting}
                        onClick={handleSubmit}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin" size={20} />
                                Placing Order...
                            </>
                        ) : (
                            <>
                                <ShoppingCart size={20} />
                                Place Wholesale Order
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
