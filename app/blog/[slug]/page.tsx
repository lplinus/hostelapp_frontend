import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ArrowLeft } from "lucide-react";
import { getBlogPostBySlug, getBlogPosts } from "@/services/blog.service";
import { Metadata } from "next";
import {
  Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious,
} from "@/components/ui/carousel";
export async function generateStaticParams() {
  try {
    const posts = await getBlogPosts();
    return posts.map((post) => ({
      slug: post.slug,
    }));
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  try {
    const { slug } = await params;
    const post = await getBlogPostBySlug(slug);

    return {
      title: post.title,
      description: post.short_description,
      openGraph: {
        title: post.title,
        description: post.short_description,
        images: post.featured_image ? [post.featured_image] : [],
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description: post.short_description,
        images: post.featured_image ? [post.featured_image] : [],
      },
    };
  } catch (error) {
    return {
      title: "Post Not Found",
      description: "This blog post could not be found.",
    };
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function BlogDetailPage({ params }: Props) {
  const { slug } = await params;

  let post;
  try {
    post = await getBlogPostBySlug(slug);
  } catch (error) {
    notFound();
  }

  if (!post) {
    notFound();
  }

  return (
    <main className="flex flex-col">
      {/* Hero Carousel */}
      <section className="relative w-full overflow-hidden bg-gray-100">
        {(post.featured_image || post.featured_image2 || post.featured_image3) ? (
          <Carousel className="w-full">
            <CarouselContent>
              {post.featured_image && (
                <CarouselItem>
                  <div className="relative h-[40vh] md:h-[50vh] w-full">
                    <Image src={post.featured_image} alt={`${post.title} - Image 1`} fill className="object-cover" priority />
                  </div>
                </CarouselItem>
              )}
              {post.featured_image2 && (
                <CarouselItem>
                  <div className="relative h-[40vh] md:h-[50vh] w-full">
                    <Image src={post.featured_image2} alt={`${post.title} - Image 2`} fill className="object-cover" />
                  </div>
                </CarouselItem>
              )}
              {post.featured_image3 && (
                <CarouselItem>
                  <div className="relative h-[40vh] md:h-[50vh] w-full">
                    <Image src={post.featured_image3} alt={`${post.title} - Image 3`} fill className="object-cover" />
                  </div>
                </CarouselItem>
              )}
            </CarouselContent>
            {(post.featured_image2 || post.featured_image3) && (
              <>
                <CarouselPrevious className="absolute left-6 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white" />
                <CarouselNext className="absolute right-6 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white" />
              </>
            )}
          </Carousel>
        ) : (
          <div className="relative h-[40vh] md:h-[50vh] w-full">
            <Image
              src={post.banner_image || "/images/placeholder.jpg"}
              alt={post.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}
      </section>

      {/* Content */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto">
          {/* Back */}
          <Link
            href="/blog"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Category + Read Time */}
          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <span className="bg-gray-100 px-3 py-1 rounded-full">
              {post.category.name}
            </span>

            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {post.read_time}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-3xl md:text-4xl font-bold leading-tight mb-6">
            {post.title}
          </h1>

          {/* Description */}
          <p className="text-lg text-gray-600 mb-8">
            {post.short_description}
          </p>

          {/* Article Body */}
          <div
            className="prose prose-lg max-w-none text-gray-700 whitespace-pre-wrap mb-12"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

        </div>
      </section>
    </main>
  );
}