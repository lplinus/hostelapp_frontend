"use client";

import { useState } from "react";
import BlogHero from "@/components/blog/blog-hero";
import BlogCategories from "@/components/blog/blog-categories";
import BlogGrid from "@/components/blog/blog-grid";
import SectionReveal from "@/components/ui/section-reveal";
import { BlogHero as BlogHeroType, BlogCategory, BlogPostListItem } from "@/types/blog.types";

interface BlogClientProps {
    heroData: BlogHeroType;
    categories: BlogCategory[];
    posts: BlogPostListItem[];
}

export default function BlogClient({ heroData, categories, posts }: BlogClientProps) {
    const [activeCategory, setActiveCategory] = useState("All");

    const displayedPosts =
        activeCategory === "All"
            ? posts
            : posts.filter((post) => post.category.name === activeCategory);

    return (
        <main className="flex flex-col overflow-hidden">
            <BlogHero title={heroData.hero_title} subtitle={heroData.hero_subtitle} />

            {/* Content sections with breathing room */}
            <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6 lg:mt-8">
                <SectionReveal>
                    <BlogCategories
                        categories={categories}
                        activeCategory={activeCategory}
                        onCategoryChange={setActiveCategory}
                    />
                </SectionReveal>

                <SectionReveal delay={0.05}>
                    <BlogGrid posts={displayedPosts} />
                </SectionReveal>
            </div>
        </main>
    );
}
