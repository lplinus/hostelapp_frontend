export interface FAQCategory {
    id: number;
    name: string;
    slug: string;
    description: string;
    order: number;
    is_active: boolean;
}

export interface FAQ {
    id: number;
    category: number;
    question: string;
    answer: string;
    slug: string;
    order: number;
    is_active: boolean;
    view_count: number;
}
