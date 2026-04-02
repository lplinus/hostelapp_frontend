'use client';

import { useEffect, useState } from 'react';
import { Plus, Loader2, Package } from 'lucide-react';
import { vendorService } from '@/services/marketplaceservices/vendor.service';
import { Product, Category } from '@/types/marketplace.types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

import ProductCard from '@/components/vendordashboard/products/ProductCard';
import ProductModal from '@/components/vendordashboard/products/ProductModal';
import ProductStats from '@/components/vendordashboard/products/ProductStats';

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '0',
        category_id: '',
        quantity_unit: 'number',
        quantity_steps: '',
        is_active: true,
        is_featured: false
    });
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        setIsLoading(true);
        try {
            const [productsData, categoriesData, vendorProfile] = await Promise.all([
                vendorService.getMyProducts(),
                vendorService.getCategories(),
                vendorService.getMyVendorProfile()
            ]);

            // Filter categories based on vendor types
            const vendorTypes = vendorProfile.vendor_types || [];
            const filtered = categoriesData.filter((cat: Category) =>
                vendorTypes.includes(cat.slug) || vendorTypes.includes(cat.name.toLowerCase())
            );

            setProducts(productsData);
            setAllCategories(categoriesData);
            setCategories(filtered);
        } catch (error) {
            console.error('Error fetching data:', error);
            toast.error('Failed to load products. Please check your connection.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenModal = (product: Product | null = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price.toString(),
                stock: (product.stock || '').toString(),
                category_id: typeof product.category === 'object' ? product.category?.id?.toString() : (product.category?.toString() || ''),
                quantity_unit: product.quantity_unit || 'number',
                quantity_steps: product.quantity_steps?.join(', ') || '',
                is_active: product.is_active ?? true,
                is_featured: product.is_featured ?? false
            });
            setImagePreview(product.image || null);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                stock: '',
                category_id: categories.length > 0 ? categories[0].id.toString() : '',
                quantity_unit: 'number',
                quantity_steps: '',
                is_active: true,
                is_featured: false
            });
            setImagePreview(null);
        }
        setSelectedImage(null);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();
            
            // Format steps: "5, 10, 15" -> ["5", "10", "15"]
            const steps = formData.quantity_steps
                .split(',')
                .map(s => s.trim())
                .filter(s => s !== '' && !isNaN(Number(s)));

            Object.entries(formData).forEach(([key, value]) => {
                if (key === 'quantity_steps') {
                    data.append(key, JSON.stringify(steps));
                } else if (key === 'stock' && value === '') {
                    // Skip stock if empty (nullable)
                } else {
                    data.append(key, String(value));
                }
            });

            if (selectedImage) data.append('image', selectedImage);

            if (editingProduct) {
                await vendorService.updateProduct(editingProduct.id, data);
                toast.success('Product updated successfully.');
            } else {
                await vendorService.createProduct(data);
                toast.success('Product added successfully.');
            }

            setIsModalOpen(false);
            fetchInitialData();
        } catch (error) {
            console.error('Submission error:', error);
            toast.error('Failed to save product. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await vendorService.deleteProduct(id);
            toast.success('Product deleted successfully.');
            setProducts(products.filter(p => p.id !== id));
        } catch (error) {
            console.error('Deletion error:', error);
            toast.error('Failed to delete product.');
        }
    };

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Products</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage your product catalog and inventory.</p>
                </div>
                <Button onClick={() => handleOpenModal()} className="gap-2">
                    <Plus size={16} />
                    Add Product
                </Button>
            </div>

            {/* Stats */}
            <ProductStats products={products} />

            {/* Product Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-xl border bg-card overflow-hidden">
                            <Skeleton className="aspect-[4/3] rounded-none" />
                            <div className="p-4 space-y-3">
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                                <div className="flex justify-between pt-2">
                                    <Skeleton className="h-5 w-16" />
                                    <Skeleton className="h-5 w-20" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            onEdit={handleOpenModal}
                            onDelete={handleDelete}
                        />
                    ))}
                </div>
            ) : (
                <div className="rounded-xl border border-dashed bg-card flex flex-col items-center justify-center py-24 px-6 text-center">
                    <div className="p-4 rounded-2xl bg-muted mb-4">
                        <Package size={40} strokeWidth={1.5} className="text-muted-foreground" />
                    </div>
                    <h2 className="text-lg font-semibold text-foreground mb-2">No products yet</h2>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        Start building your catalog by adding your first product listing.
                    </p>
                    <Button onClick={() => handleOpenModal()} className="gap-2">
                        <Plus size={16} />
                        Add Your First Product
                    </Button>
                </div>
            )}

            {/* Modal */}
            <ProductModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                editingProduct={editingProduct}
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                allCategories={allCategories}
                imagePreview={imagePreview}
                setImagePreview={setImagePreview}
                setSelectedImage={setSelectedImage}
                isSubmitting={isSubmitting}
            />
        </div>
    );
}
