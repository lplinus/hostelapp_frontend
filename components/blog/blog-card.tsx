
import Image from "next/image";
import Link from "next/link";
import { Clock } from "lucide-react";
import { toLocalMediaPath, isExternalImage } from "@/lib/utils";

interface BlogCardProps {
  title: string;
  description: string;
  image: string;
  category: string;
  readTime: string;
  slug: string;
}

export default function BlogCard({
  title,
  description,
  image,
  category,
  readTime,
  slug,
}: BlogCardProps) {
  const imageSrc = toLocalMediaPath(image) || "/images/placeholder.jpg";
  return (
    <div className="rounded-3xl border shadow-sm hover:shadow-lg transition overflow-hidden bg-white">
      {/* Image */}
      <div className="relative h-56 w-full">
        <Image
          src={imageSrc}
          alt={title}
          fill
          className="object-cover"
          unoptimized={isExternalImage(image)}
        />
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Category + Read Time */}
        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="bg-gray-100 px-3 py-1 rounded-full">
            {category}
          </span>

          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {readTime}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold leading-snug">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm">
          {description}
        </p>

        {/* Read More */}
        <Link
          href={`/blog/${slug}`}
          className="text-blue-600 font-medium text-sm hover:underline"
        >
          Read More →
        </Link>
      </div>
    </div>
  );
}
