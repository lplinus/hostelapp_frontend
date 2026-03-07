export const dynamic = "force-dynamic"

import { getBlogHero, getBlogCategories, getBlogPosts } from "@/services/blog.service";
import BlogClient from "./blog-client";
import { getSEO } from "@/lib/seo";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const seo = await getSEO("blog");

  return {
    title: seo.meta_title,
    description: seo.meta_description,
    keywords: seo.meta_keywords,

    openGraph: {
      title: seo.og_title || seo.meta_title,
      description: seo.og_description || seo.meta_description,
      images: seo.og_image ? [seo.og_image] : [],
    },

    twitter: {
      card: "summary_large_image",
      title: seo.og_title || seo.meta_title,
      description: seo.og_description || seo.meta_description,
      images: seo.og_image ? [seo.og_image] : []
    }
  };
}

export default async function BlogPage() {
  const seo = await getSEO("blog");
  const [heroData, categories, posts] = await Promise.all([
    getBlogHero(),
    getBlogCategories(),
    getBlogPosts(),
  ]);

  return (
    <>
      {seo?.structured_data && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: typeof seo.structured_data === 'string'
              ? seo.structured_data
              : JSON.stringify(seo.structured_data),
          }}
        />
      )}
      <BlogClient heroData={heroData} categories={categories} posts={posts} />
    </>
  );
}