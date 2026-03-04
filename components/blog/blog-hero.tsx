export default function BlogHero({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <section className="py-20 px-6 text-center">
      <h1 className="text-4xl md:text-5xl font-bold">
        {title}
      </h1>

      <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
        {subtitle}
      </p>
    </section>
  );
}