export interface Category {
    id: number;
    name: string;
    slug: string;
    icon: string | null;
    description: string;
    is_active: boolean;
}

export interface Product {
    id: number;
    vendor: number;
    vendor_name?: string;
    category?: number | Category;
    category_name?: string;
    name: string;
    description: string;
    price: string;
    image: string | null;
    stock: number | null;
    quantity_unit?: string;
    quantity_steps?: number[];
    is_active: boolean;
    is_featured: boolean;
}

export interface Vendor {
    id: number;
    owner: number;
    business_name: string;
    slug: string;
    description: string;
    logo: string | null;
    address: string;
    contact_phone: string;
    contact_email: string;
    vendor_types: string[];
    is_active: boolean;
    product_count: number;
}

export interface VendorDetail extends Vendor {
    products: Product[];
}

export interface OrderItem {
    id: number;
    product: number;
    product_name_at_order: string;
    quantity: number;
    unit_price: string;
    total_price: string;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type OrderType = 'structured' | 'image_scan';

export interface Order {
    id: number;
    hostel: number;
    hostel_name: string;
    hostel_address?: string;
    vendor: number;
    vendor_name: string;
    status: OrderStatus;
    order_type: OrderType;
    scan_image: string | null;
    note: string;
    total_amount: string;
    items: OrderItem[];
    created_at: string;
    updated_at: string;
}

export interface StructuredOrderCreate {
    hostel_id: number;
    vendor_id: number;
    items: {
        product_id: number;
        quantity: number;
    }[];
    note?: string;
}

export interface ImageScanOrderCreate {
    hostel_id: number;
    vendor_id: number;
    scan_image: File;
    note?: string;
}
