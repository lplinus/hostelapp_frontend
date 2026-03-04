"use client";

import clsx from "clsx";
import { BlogCategory } from "@/types/blog.types";

interface BlogCategoriesProps {
  categories: readonly BlogCategory[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

export default function BlogCategories({
  categories,
  activeCategory,
  onCategoryChange
}: BlogCategoriesProps) {
  return (
    <section className="pb-16 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onCategoryChange("All")}
            className={clsx(
              "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
              activeCategory === "All"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.name)}
              className={clsx(
                "px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200",
                activeCategory === cat.name
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}