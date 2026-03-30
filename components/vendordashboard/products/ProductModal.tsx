'use client';

import { Check, Loader2, Upload, Edit2 } from 'lucide-react';
import { Category, Product } from '@/types/marketplace.types';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectSeparator, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

interface ProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (e: React.FormEvent) => void;
    editingProduct: Product | null;
    formData: {
        name: string;
        description: string;
        price: string;
        stock: string;
        category_id: string;
        is_active: boolean;
        is_featured: boolean;
    };
    setFormData: (data: any) => void;
    categories: Category[];
    allCategories: Category[];
    imagePreview: string | null;
    setImagePreview: (preview: string | null) => void;
    setSelectedImage: (file: File | null) => void;
    isSubmitting: boolean;
}

export default function ProductModal({
    isOpen, onClose, onSubmit, editingProduct, formData, setFormData,
    categories, allCategories, imagePreview, setImagePreview, setSelectedImage, isSubmitting
}: ProductModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
                <div className="p-6 pb-0">
                    <DialogHeader>
                        <DialogTitle className="text-lg">
                            {editingProduct ? 'Edit Product' : 'Add New Product'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingProduct
                                ? 'Update the product details below.'
                                : 'Fill in the details to list a new product.'
                            }
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={onSubmit} className="px-6 pb-6 space-y-6">
                    {/* Image Upload */}
                    <div className="space-y-2">
                        <Label>Product Image</Label>
                        {imagePreview ? (
                            <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-muted group">
                                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                >
                                    <Button type="button" variant="secondary" size="sm" className="gap-2">
                                        <Edit2 size={14} />
                                        Replace Image
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="w-full h-40 border-2 border-dashed border-muted-foreground/20 rounded-lg flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/40 hover:bg-muted/50 transition-all"
                            >
                                <div className="p-3 rounded-lg bg-muted">
                                    <Upload size={24} className="text-muted-foreground" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm font-medium text-foreground">Click to upload</p>
                                    <p className="text-xs text-muted-foreground">JPEG, PNG up to 5MB</p>
                                </div>
                            </div>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
                    </div>

                    {/* Product Name */}
                    <div className="space-y-2">
                        <Label htmlFor="p_name">Product Name</Label>
                        <Input
                            id="p_name"
                            placeholder="Enter product name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    {/* Price & Stock */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="p_price">Price (₹)</Label>
                            <Input
                                id="p_price"
                                type="number"
                                placeholder="0.00"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="p_stock">Stock Quantity</Label>
                            <Input
                                id="p_stock"
                                type="number"
                                placeholder="0"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    {/* Category Selection (Limited to Vendor Types) */}
                    <div className="space-y-2">
                        <Label>Product Type / Category</Label>
                        <Select
                            value={formData.category_id}
                            onValueChange={(value) => setFormData({ ...formData, category_id: value })}
                            required
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={categories.length === 0 ? "Loading categories..." : "Select a type"} />
                            </SelectTrigger>
                            <SelectContent position="popper" className="z-[10001]">
                                {allCategories.length === 0 ? (
                                    <div className="p-2 text-xs text-muted-foreground text-center">
                                        No categories found
                                    </div>
                                ) : (
                                    <>
                                        {/* Recommended Group */}
                                        {categories.length > 0 && (
                                            <SelectGroup>
                                                <SelectLabel className="text-[11px] font-bold uppercase tracking-wider text-primary/70 px-3 py-1">
                                                    Recommended for You
                                                </SelectLabel>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectGroup>
                                        )}
                                        
                                        {categories.length > 0 && <SelectSeparator />}

                                        {/* All Categories Group */}
                                        <SelectGroup>
                                            <SelectLabel className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground px-3 py-1">
                                                All Categories
                                            </SelectLabel>
                                            {allCategories
                                                .filter((cat: Category) => !categories.some(c => c.id === cat.id))
                                                .map((cat: Category) => (
                                                    <SelectItem key={cat.id} value={cat.id.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))
                                            }
                                            {/* In case no recommendations, show all without filter */}
                                            {categories.length === 0 && allCategories.map((cat: Category) => (
                                                <SelectItem key={cat.id} value={cat.id.toString()}>
                                                    {cat.name}
                                                </SelectItem>
                                            ))}
                                        </SelectGroup>
                                    </>
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="p_desc">Description</Label>
                        <Textarea
                            id="p_desc"
                            placeholder="Describe your product..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={4}
                            required
                        />
                    </div>

                    <Separator />

                    {/* Toggles */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm">Active Listing</Label>
                                <p className="text-xs text-muted-foreground">Product will be visible in the marketplace</p>
                            </div>
                            <Switch
                                checked={formData.is_active}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm">Featured Product</Label>
                                <p className="text-xs text-muted-foreground">Promote this product on the homepage</p>
                            </div>
                            <Switch
                                checked={formData.is_featured}
                                onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* Actions */}
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting} className="gap-2">
                            {isSubmitting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Check size={16} />
                            )}
                            {isSubmitting ? 'Saving...' : (editingProduct ? 'Update Product' : 'Add Product')}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
