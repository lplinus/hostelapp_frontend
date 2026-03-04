import { ShieldCheck, Heart, Sparkles, type LucideIcon } from "lucide-react";
import type { AboutValue } from "@/types/public.types";

interface AboutValuesProps {
  values?: AboutValue[];
}

// Map backend icon_name strings to Lucide icon components
const iconMap: Record<string, LucideIcon> = {
  ShieldCheck,
  Heart,
  Sparkles,
};

const defaultValues: { icon: LucideIcon; title: string; desc: string }[] = [
  {
    icon: ShieldCheck,
    title: "Trust & Safety",
    desc: "All hostels are verified for safety and quality.",
  },
  {
    icon: Heart,
    title: "Student First",
    desc: "We prioritize affordability and comfort.",
  },
  {
    icon: Sparkles,
    title: "Transparency",
    desc: "Clear pricing, real photos, real reviews.",
  },
];

export default function AboutValues({ values }: AboutValuesProps) {
  // If API data is available, use it; otherwise fall back to hardcoded defaults
  const displayValues =
    values && values.length > 0
      ? values.map((v) => ({
        icon: iconMap[v.icon_name] || ShieldCheck,
        title: v.title,
        desc: v.description,
      }))
      : defaultValues;

  return (
    <section className="py-24 px-6">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-12">
          Our Core Values
        </h2>

        <div className="grid md:grid-cols-3 gap-12">
          {displayValues.map((value) => (
            <div
              key={value.title}
              className="p-8 rounded-3xl border shadow-sm hover:shadow-lg transition"
            >
              <value.icon className="w-10 h-10 text-blue-600 mx-auto mb-6" />
              <h3 className="text-xl font-semibold mb-3">
                {value.title}
              </h3>
              <p className="text-gray-600">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}