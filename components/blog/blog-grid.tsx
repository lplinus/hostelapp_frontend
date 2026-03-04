import BlogCard from "./blog-card";
import { BlogPostListItem } from "@/types/blog.types";

interface BlogGridProps {
  posts: readonly BlogPostListItem[];
}

export default function BlogGrid({ posts }: BlogGridProps) {
  return (
    <section className="py-16 px-6">
      <div className="container mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            title={post.title}
            description={post.short_description}
            image={post.banner_image || post.featured_image || "/images/placeholder.jpg"}
            category={post.category.name}
            readTime={post.read_time}
            slug={post.slug}
          />
        ))}
      </div>
    </section>
  );
}