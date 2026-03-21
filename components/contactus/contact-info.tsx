import { Mail, Phone, MapPin, type LucideIcon } from "lucide-react";
import type { ContactInfoItem } from "@/types/public.types";

interface ContactInfoProps {
  items?: ContactInfoItem[];
}

// Map backend icon_name strings to Lucide icon components
const iconMap: Record<string, LucideIcon> = {
  Mail,
  Phone,
  MapPin,
};

const defaultItems: { icon: LucideIcon; title: string; value: string }[] = [
  {
    icon: Mail,
    title: "Email Us",
    value: "support@hostelin.com",
  },
  {
    icon: Phone,
    title: "Call Us",
    value: "+91 98765 43210",
  },
  {
    icon: MapPin,
    title: "Office Location",
    value: "Bangalore, India",
  },
];

export default function ContactInfo({ items }: ContactInfoProps) {
  const displayItems =
    items && items.length > 0
      ? items.map((item) => ({
        icon: iconMap[item.icon_name] || Mail,
        title: item.title,
        value: item.value,
      }))
      : defaultItems;

  return (
    <section className="py-20 px-6">
      <div className="container mx-auto grid md:grid-cols-3 gap-10">
        {displayItems.map((item) => (
          <div
            key={item.title}
            className="p-8 rounded-3xl border shadow-sm hover:shadow-lg transition text-center"
          >
            <item.icon className="w-10 h-10 text-blue-600 mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-3">
              {item.title}
            </h3>
            <p className="text-gray-600">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}