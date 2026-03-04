interface CTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export default function CTA({ title, subtitle, buttonText }: CTAProps) {
  return (
    <section className="py-24 bg-indigo-600 text-white text-center">
      <h2 className="text-4xl font-bold">
        {title || "Ready to Book Your Stay?"}
      </h2>
      <p className="mt-4 text-lg text-gray-200">
        {subtitle || "Discover amazing hostels at unbeatable prices."}
      </p>

      <button className="mt-8 bg-white text-indigo-600 px-8 py-3 rounded-xl font-semibold">
        {buttonText || "Start Exploring"}
      </button>
    </section>
  );
}