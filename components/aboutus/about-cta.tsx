import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AboutCTAProps {
  title?: string;
  buttonText?: string;
  buttonUrl?: string;
}

export default function AboutCTA({ title, buttonText, buttonUrl }: AboutCTAProps) {
  return (
    <section className="py-24 px-6 text-center bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
      <h2 className="text-4xl font-bold mb-6">
        {title || "Ready to Find Your Stay?"}
      </h2>

      <Button
        className="bg-white text-blue-600 hover:bg-gray-100 rounded-xl px-8 py-3 text-lg"
        asChild={!!buttonUrl}
      >
        {buttonUrl ? (
          <Link href={buttonUrl}>{buttonText || "Explore Hostels"}</Link>
        ) : (
          <>{buttonText || "Explore Hostels"}</>
        )}
      </Button>
    </section>
  );
}