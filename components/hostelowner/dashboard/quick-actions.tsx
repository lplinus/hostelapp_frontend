import Link from "next/link";
import { Building2, BedDouble, CalendarCheck, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function QuickActions() {
  const actions = [
    {
      href: "/hostel",
      label: "Manage Hostels",
      description: "Update details, photos & amenities",
      icon: Building2,
      color: "bg-[#DBD5C8] text-[#1F1E1B]"
    },
    {
      href: "/rooms",
      label: "Manage Rooms",
      description: "Configure pricing, types & availability",
      icon: BedDouble,
      color: "bg-[#DBD5C8] text-[#7A5C28]"
    },
    {
      href: "/bookings",
      label: "View Bookings",
      description: "Review reservations & guest check-ins",
      icon: CalendarCheck,
      color: "bg-[#DBD5C8] text-[#1F1E1B]"
    }
  ];

  return (
    <Card className="border border-[#D2CABC] bg-[#E5DFD4] shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold text-[#1A1916]">Quick Actions</CardTitle>
        <CardDescription className="text-xs text-[#686259]">Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((act) => (
          <Link
            key={act.href}
            href={act.href}
            className="flex items-center gap-3 p-3 rounded-lg border border-[#D2CABC]/60 hover:bg-[#DBD5C8]/50 hover:border-[#D2CABC] transition-all duration-200 group"
          >
            <div className={`p-2.5 rounded-lg shrink-0 transition-transform group-hover:scale-105 ${act.color}`}>
              <act.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#1A1916] group-hover:text-[#1F1E1B] transition-colors">
                {act.label}
              </p>
              <p className="text-xs text-[#686259] truncate">
                {act.description}
              </p>
            </div>
            <ChevronRight size={16} className="text-[#686259] group-hover:text-[#1A1916] group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}