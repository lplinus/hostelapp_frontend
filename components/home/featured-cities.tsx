import FeaturedCitiesCarousel from "./featured-cities-carousel";

interface City {
  id: number;
  name: string;
  slug: string;
  city_image: string | null;
  latitude: string | null;
  longitude: string | null;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

async function getCities(): Promise<City[]> {
  try {
    if (!BASE_URL) {
      console.error("[FeaturedCities] NEXT_PUBLIC_API_BASE_URL is not defined");
      return [];
    }

    const res = await fetch(`${BASE_URL}/api/locations/cities/`, {
      next: { revalidate: 60 },
    });

    if (!res.ok) {
      console.error("[FeaturedCities] Fetch failed:", res.status);
      return [];
    }

    return res.json();
  } catch (err) {
    console.error("[FeaturedCities] Network error:", err);
    return [];
  }
}

export default async function FeaturedCities() {
  const cities = await getCities();

  if (!cities?.length) return null;

  return (
    <section className="pt-10 pb-6 bg-[#F8FAFC] font-inter">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <div className="flex items-center gap-3 text-[#8B5CF6] mb-4">
              <span className="text-[11px] tracking-[0.25em] font-bold uppercase">Locations</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-[#0F172A] tracking-tight">
              Popular <span className="italic text-[#64748B] font-medium">Cities</span>
            </h2>
          </div>
        </div>

        <FeaturedCitiesCarousel cities={cities} />
      </div>
    </section>
  );
}