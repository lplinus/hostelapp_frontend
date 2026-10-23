interface PricingComparisonProps {
  title?: string;
  description?: string;
}

export default function PricingComparison({ title, description }: PricingComparisonProps) {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto text-center max-w-3xl">
        <h2 className="text-3xl font-bold mb-6">
          {title || "Why Upgrade?"}
        </h2>
        <p className="text-gray-600">
          {description ||
            "Upgrading gives your hostel more visibility, advanced analytics, and priority support."}
        </p>
      </div>
    </section>
  );
}