export interface BlogCategory {
    id: number;
    name: string;
    slug: string;
}

export interface BlogPostListItem {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    banner_image: string | null;
    featured_image: string | null;
    read_time: string;
    created_at: string;
    category: BlogCategory;
}

export interface BlogPostDetail {
    id: number;
    title: string;
    slug: string;
    short_description: string;
    content: string;
    banner_image: string | null;
    featured_image: string | null;
    featured_image2: string | null;
    featured_image3: string | null;
    read_time: string;
    created_at: string;
    updated_at: string;
    category: BlogCategory;
}

export interface BlogHero {
    hero_title: string;
    hero_subtitle: string;
}
