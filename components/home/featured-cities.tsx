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
  if (!BASE_URL) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined");
  }

  const res = await fetch(`${BASE_URL}/api/locations/cities/`, {
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    console.error("Fetch failed:", res.status);
    throw new Error("Failed to fetch cities");
  }

  return res.json();
}

export default async function FeaturedCities() {
  const cities = await getCities();

  if (!cities?.length) return null;

  return (
    <section className="py-8 sm:py-10 lg:py-12 bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12">
        <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-center mb-8">
          Popular Cities
        </h2>

        <FeaturedCitiesCarousel cities={cities} />
      </div>
    </section>
  );
}