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
      color: "bg-[#DBD5C8] dark:bg-slate-800 text-[#1F1E1B] dark:text-indigo-400"
    },
    {
      href: "/vacanrentalbooking?tab=property",
      label: "Manage Vacation Rentals",
      description: "Configure homes, photos & availability",
      icon: Palmtree,
      color: "bg-[#DBD5C8] dark:bg-slate-800 text-[#7A5C28] dark:text-emerald-400"
    },
    {
      href: "/hotel?tab=bookings",
      label: "Hotel Bookings",
      description: "Review reservations & guest check-ins",
      icon: CalendarCheck,
      color: "bg-[#DBD5C8] dark:bg-slate-800 text-[#1F1E1B] dark:text-indigo-400"
    }
  ];

  return (
    <Card className="border border-[#D2CABC] dark:border-slate-800 bg-[#E5DFD4] dark:bg-slate-900 shadow-xs rounded-md overflow-hidden">
      <CardHeader className="p-3 sm:p-4 md:p-4.5 pb-1.5 sm:pb-2">
        <CardTitle className="text-sm sm:text-base font-bold text-[#1A1916] dark:text-slate-100">Quick Actions</CardTitle>
        <CardDescription className="text-xs text-[#686259] dark:text-slate-400">Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="p-3 sm:p-4 md:p-4.5 pt-0 space-y-2">
        {actions.map((act) => (
          <Link
            key={act.href}
            href={act.href}
            className="flex items-center gap-2.5 p-2.5 sm:p-2.5 rounded-md border border-[#D2CABC]/70 dark:border-slate-800/80 bg-transparent dark:bg-slate-900/40 hover:bg-[#DBD5C8]/30 dark:hover:bg-slate-800 hover:border-[#D2CABC] dark:hover:border-slate-700 transition-all duration-200 group active:scale-[0.98]"
          >
            <div className={`p-2 sm:p-2 rounded-md shrink-0 transition-transform group-hover:scale-105 ${act.color}`}>
              <act.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-[#1A1916] dark:text-slate-100 group-hover:text-[#1F1E1B] dark:group-hover:text-white transition-colors truncate">
                {act.label}
              </p>
              <p className="text-[11px] sm:text-xs text-[#686259] dark:text-slate-400 group-hover:text-[#4A453C] dark:group-hover:text-slate-300 truncate mt-0.5 transition-colors">
                {act.description}
              </p>
            </div>
            <ChevronRight size={16} className="text-[#686259] dark:text-slate-500 group-hover:text-[#1A1916] dark:group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}