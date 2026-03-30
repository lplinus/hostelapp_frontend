'use client';

import { Package, CheckCircle, Star, AlertTriangle } from 'lucide-react';
import { Product } from '@/types/marketplace.types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductStatsProps {
    products: Product[];
}

export default function ProductStats({ products }: ProductStatsProps) {
    const activeCount = products.filter(p => p.is_active).length;
    const featuredCount = products.filter(p => p.is_featured).length;
    const lowStockCount = products.filter(p => (p.stock || 0) < 5).length;

    const stats = [
        {
            label: 'Total Products',
            value: products.length,
            icon: Package,
            badge: 'Inventory',
            iconBg: 'bg-blue-50',
            iconColor: 'text-blue-600',
        },
        {
            label: 'Active Listings',
            value: activeCount,
            icon: CheckCircle,
            badge: 'Live',
            iconBg: 'bg-emerald-50',
            iconColor: 'text-emerald-600',
        },
        {
            label: 'Featured',
            value: featuredCount,
            icon: Star,
            badge: 'Promoted',
            iconBg: 'bg-amber-50',
            iconColor: 'text-amber-600',
        },
        {
            label: 'Low Stock',
            value: lowStockCount,
            icon: AlertTriangle,
            badge: 'Attention',
            iconBg: 'bg-rose-50',
            iconColor: 'text-rose-600',
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
                <Card key={i} className="py-5 hover:shadow-md transition-shadow duration-300">
                    <CardContent className="px-5 py-0">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-lg ${stat.iconBg}`}>
                                <stat.icon size={18} className={stat.iconColor} />
                            </div>
                            <Badge variant="secondary" className="text-[10px] font-medium">
                                {stat.badge}
                            </Badge>
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground font-medium mb-1">{stat.label}</p>
                            <p className="text-2xl font-semibold tracking-tight text-foreground">{stat.value}</p>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
