import HostelCard from "@/components/hostels/hostel-card";
import { HostelListItem } from "@/types/hostel.types";

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
  return (
    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-8">
      {hostels.map((hostel) => (
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
        />
      ))}
    </div>
  );
}