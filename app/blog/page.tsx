import { getBlogHero, getBlogCategories, getBlogPosts } from "@/services/blog.service";
import BlogClient from "./blog-client";

export default async function BlogPage() {
  const [heroData, categories, posts] = await Promise.all([
    getBlogHero(),
    getBlogCategories(),
    getBlogPosts(),
  ]);

  return <BlogClient heroData={heroData} categories={categories} posts={posts} />;
}