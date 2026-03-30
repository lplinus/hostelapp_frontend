'use client';

import { Edit2, Trash2, Package } from 'lucide-react';
import { Product } from '@/types/marketplace.types';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface ProductCardProps {
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (id: number) => void;
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
    const isOutOfStock = (product.stock || 0) === 0;

    return (
        <Card className={`group overflow-hidden py-0 gap-0 hover:shadow-lg transition-all duration-300 ${!product.is_active ? 'opacity-60' : ''}`}>
            {/* Image */}
            <div className="aspect-[4/3] relative bg-muted overflow-hidden">
                {product.image ? (
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
                        <Package size={48} strokeWidth={1.5} />
                    </div>
                )}

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                    {product.is_featured && (
                        <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px]">
                            Featured
                        </Badge>
                    )}
                    {!product.is_active && (
                        <Badge variant="secondary" className="text-[10px]">
                            Draft
                        </Badge>
                    )}
                </div>

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <Button
                        size="icon"
                        variant="secondary"
                        className="rounded-lg h-9 w-9"
                        onClick={() => onEdit(product)}
                    >
                        <Edit2 size={15} />
                    </Button>
                    <Button
                        size="icon"
                        variant="destructive"
                        className="rounded-lg h-9 w-9"
                        onClick={() => onDelete(product.id)}
                    >
                        <Trash2 size={15} />
                    </Button>
                </div>
            </div>

            {/* Content */}
            <CardContent className="p-4 flex flex-col flex-1 gap-0">
                <p className="text-[11px] text-muted-foreground font-medium mb-1">
                    {product.category_name || 'Uncategorized'}
                </p>
                <h3 className="text-sm font-semibold text-foreground leading-snug line-clamp-1 mb-1 group-hover:text-primary transition-colors">
                    {product.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[32px]">
                    {product.description}
                </p>

                <Separator className="my-3" />

                <div className="flex items-center justify-between">
                    <span className="text-base font-semibold text-foreground">₹{product.price}</span>
                    <Badge
                        variant={isOutOfStock ? 'destructive' : 'outline'}
                        className="text-[10px] font-medium gap-1"
                    >
                        <span className={`w-1.5 h-1.5 rounded-full ${isOutOfStock ? 'bg-white animate-pulse' : 'bg-emerald-500'}`} />
                        {product.stock} units
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
