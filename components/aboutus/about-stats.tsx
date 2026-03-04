import type { AboutStat } from "@/types/public.types";

interface AboutStatsProps {
  stats?: AboutStat[];
}

const defaultStats: AboutStat[] = [
  { label: "Verified Hostels", value: "1,200+" },
  { label: "Students Helped", value: "25,000+" },
  { label: "Cities Covered", value: "45+" },
  { label: "Average Rating", value: "4.6★" },
];

export default function AboutStats({ stats }: AboutStatsProps) {
  const displayStats = stats && stats.length > 0 ? stats : defaultStats;

  return (
    <section className="bg-gray-50 py-20 px-6">
      <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-10 text-center">
        {displayStats.map((stat) => (
          <div key={stat.label}>
            <h3 className="text-3xl font-bold text-blue-600">
              {stat.value}
            </h3>
            <p className="text-gray-600 mt-2">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}