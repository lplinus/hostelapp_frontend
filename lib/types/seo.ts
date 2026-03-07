export interface SeoMeta {
    id: number;
    meta_title: string;
    meta_description: string;
    meta_keywords?: string;
    canonical_url?: string;
    og_title?: string;
    og_description?: string;
    og_image?: string;
    is_indexed?: boolean;
    robots_directives?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    structured_data?: any;
    content_type: number;
}
