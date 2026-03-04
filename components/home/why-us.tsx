"use client";

import * as LucideIcons from "lucide-react";

interface WhyUsItem {
  id?: number;
  title: string;
  description: string;
  icon: string | any;
}

interface WhyUsProps {
  title?: string;
  items?: WhyUsItem[];
}

export default function WhyUs({ title, items }: WhyUsProps) {
  const defaultFeatures: WhyUsItem[] = [
    {
      id: 1,
      icon: "ShieldCheck",
      title: "Verified Listings",
      description: "Every hostel is physically verified by our team for quality assurance.",
    },
    {
      id: 2,
      icon: "Shield",
      title: "Safe & Secure",
      description: "We prioritize your safety with background checks and audits.",
    },
    {
      id: 3,
      icon: "Search",
      title: "Easy Discovery",
      description: "Find your perfect hostel with smart filters and search.",
    },
    {
      id: 4,
      icon: "Star",
      title: "Honest Reviews",
      description: "Read genuine reviews from real students.",
    },
  ];

  const featuresToRender = items && items.length > 0 ? items : defaultFeatures;

  return (
    <section className="py-10 sm:py-12 bg-gray-50">
      <div className="max-w-[1280px] mx-auto px-6 sm:px-8 lg:px-12 text-center">
        {/* Heading */}
        <h2 className="text-3xl md:text-4xl font-semibold text-gray-900">
          {title || "Why Choose StayNest"}
        </h2>

        {/* Subtitle */}
        <p className="mt-3 text-base text-gray-500">
          We make hostel hunting simple and safe
        </p>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {featuresToRender.map((feature, index) => {
            // Dynamic Icon Resolution
            let IconComponent: any;
            if (typeof feature.icon === 'string') {
              IconComponent = (LucideIcons as any)[feature.icon] || LucideIcons.Shield;
            } else {
              IconComponent = feature.icon || LucideIcons.Shield;
            }

            return (
              <div
                key={feature.id || index}
                className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1"
              >
                {/* Icon */}
                <div className="w-10 h-10 mx-auto mb-4 rounded-lg bg-blue-50 flex items-center justify-center">
                  <IconComponent className="w-5 h-5 text-blue-600" />
                </div>

                {/* Title */}
                <h3 className="text-lg font-medium text-gray-900">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}