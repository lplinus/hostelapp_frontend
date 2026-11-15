import Link from "next/link";
import { Building2, BedDouble, CalendarCheck, ChevronRight, Hotel, Palmtree } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function QuickActions() {
  const actions = [
    // {
    //   href: "/hostel",
    //   label: "Manage Hostels",
    //   description: "Update details, photos & amenities",
    //   icon: Building2,
    //   color: "bg-[#DBD5C8] text-[#1F1E1B]"
    // },
    // {
    //   href: "/rooms",
    //   label: "Manage Rooms",
    //   description: "Configure pricing, types & availability",
    //   icon: BedDouble,
    //   color: "bg-[#DBD5C8] text-[#7A5C28]"
    // },
    // {
    //   href: "/bookings",
    //   label: "View Bookings",
    //   description: "Review reservations & guest check-ins",
    //   icon: CalendarCheck,
    //   color: "bg-[#DBD5C8] text-[#1F1E1B]"
    // }
    {
      href: "/hotel?tab=property",
      label: "Manage Hotels",
      description: "Update hotel details, rooms & pricing",
      icon: Hotel,
      color: "bg-[#DBD5C8] text-[#1F1E1B]"
    },
    {
      href: "/vacanrentalbooking?tab=property",
      label: "Manage Vacation Rentals",
      description: "Configure homes, photos & availability",
      icon: Palmtree,
      color: "bg-[#DBD5C8] text-[#7A5C28]"
    },
    {
      href: "/hotel?tab=bookings",
      label: "Hotel Bookings",
      description: "Review reservations & guest check-ins",
      icon: CalendarCheck,
      color: "bg-[#DBD5C8] text-[#1F1E1B]"
    }
  ];

  return (
    <Card className="border border-[#D2CABC] bg-[#E5DFD4] shadow-xs rounded-md overflow-hidden">
      <CardHeader className="p-3 sm:p-4 md:p-4.5 pb-1.5 sm:pb-2">
        <CardTitle className="text-sm sm:text-base font-bold text-[#1A1916]">Quick Actions</CardTitle>
        <CardDescription className="text-xs text-[#686259]">Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-4.5 pt-0 space-y-2">
        {actions.map((act) => (
          <Link
            key={act.href}
            href={act.href}
            className="flex items-center gap-2.5 p-2.5 sm:p-2.5 rounded-md border border-[#D2CABC]/70 hover:bg-[#DBD5C8]/50 hover:border-[#D2CABC] transition-all duration-200 group active:scale-[0.98]"
          >
            <div className={`p-2 sm:p-2 rounded-md shrink-0 transition-transform group-hover:scale-105 ${act.color}`}>
              <act.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#1A1916] group-hover:text-[#1F1E1B] transition-colors truncate">
                {act.label}
              </p>
              <p className="text-[11px] sm:text-xs text-[#686259] truncate mt-0.5">
                {act.description}
              </p>
            </div>
            <ChevronRight size={16} className="text-[#686259] group-hover:text-[#1A1916] group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}