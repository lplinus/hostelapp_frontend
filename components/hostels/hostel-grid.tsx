"use client";

import { useState, useMemo } from "react";
import HostelCard from "@/components/hostels/hostel-card";
import { HostelListItem } from "@/types/hostel.types";
import { Button } from "@/components/ui/button";

interface HostelGridProps {
  readonly hostels: readonly HostelListItem[];
}

function getPrimaryImage(hostel: HostelListItem): string | null {
  // 1. Try hostel-specific images first
  const primaryImg = hostel.images.find((img) => img.is_primary);
  const firstImg = hostel.images[0];
  const img = primaryImg || firstImg;

  if (img?.image) {
    return img.image;
  }

  // 2. Fallback to default images from backend
  if (hostel.default_images) {
    const d = hostel.default_images;
    return d.image1 || d.image2 || d.image3 || d.image4 || null;
  }

  return null;
}

export default function HostelGrid({ hostels }: HostelGridProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Apply priority sorting:
  // 1. Discounts & Verified
  // 2. Verified
  // 3. Discounts
  // 4. Others
  const sortedHostels = useMemo(() => {
    return [...hostels].sort((a, b) => {
      const getPriority = (h: any) => {
        if (h.is_verified && h.is_discounted) return 1;
        if (h.is_verified) return 2;
        if (h.is_discounted) return 3;
        return 4;
      };
      return getPriority(a) - getPriority(b);
    });
  }, [hostels]);

  const totalPages = Math.ceil(sortedHostels.length / itemsPerPage);
  
  const paginatedHostels = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedHostels.slice(start, start + itemsPerPage);
  }, [sortedHostels, currentPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 150, behavior: "smooth" });
  };

  return (
    <div className="flex flex-col gap-10 w-full mb-10">
      <div className="grid grid-cols-1 gap-6 w-full min-h-[600px]">
        {paginatedHostels.map((hostel) => (
          <HostelCard
            key={hostel.id}
            id={String(hostel.id)}
            slug={hostel.slug}
            name={hostel.name}
            location={`${hostel.area?.name || ""}, ${hostel.city.name}`}
            price={hostel.final_price ?? (Number(hostel.price) || 0)}
            originalPrice={hostel.is_discounted ? Number(hostel.price) || 0 : undefined}
            isDiscounted={!!hostel.is_discounted}
            discountPercentage={hostel.discount_percentage ? Number(hostel.discount_percentage) : undefined}
            rating={hostel.rating_avg}
            reviewsCount={hostel.rating_count}
            image={getPrimaryImage(hostel)}
            gender={hostel.hostel_type || "coed"}
            features={hostel.amenities.slice(0, 3).map((a) => a.name)}
            distance=""
            isFeatured={hostel.is_featured}
            isVerified={!!hostel.is_verified}
            availableRooms={hostel.available_rooms}
          />
        ))}

        {paginatedHostels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
             <p className="text-lg font-medium">No hostels found matching your criteria.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-2 mt-4" aria-label="Pagination">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded-xl border-slate-200 text-slate-600 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-50 h-10 px-4 font-semibold transition-all"
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1.5 mx-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
              // Only show first page, last page, and pages around current
              if (
                page === 1 || 
                page === totalPages || 
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-xl font-bold transition-all ${
                      currentPage === page 
                        ? "bg-teal-600 hover:bg-teal-700 text-white shadow-md shadow-teal-600/20" 
                        : "border-slate-200 text-slate-600 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-600"
                    }`}
                  >
                    {page}
                  </Button>
                );
              } else if (
                (page === currentPage - 2 && page > 1) || 
                (page === currentPage + 2 && page < totalPages)
              ) {
                return <span key={page} className="text-slate-400 font-bold px-1 select-none">...</span>;
              }
              return null;
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded-xl border-slate-200 text-slate-600 hover:border-teal-600 hover:bg-teal-50 hover:text-teal-600 disabled:opacity-50 h-10 px-4 font-semibold transition-all"
          >
            Next
          </Button>
        </nav>
      )}
    </div>
  );
}