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
      color: "bg-blue-50 text-blue-600"
    },
    {
      href: "/rooms",
      label: "Manage Rooms",
      description: "Configure pricing, types & availability",
      icon: BedDouble,
      color: "bg-amber-50 text-amber-600"
    },
    {
      href: "/bookings",
      label: "View Bookings",
      description: "Review reservations & guest check-ins",
      icon: CalendarCheck,
      color: "bg-primary/10 text-primary"
    }
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
        <CardDescription>Common administrative tasks</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((act) => (
          <Link
            key={act.href}
            href={act.href}
            className="flex items-center gap-3 p-3 rounded-lg border border-border/60 hover:bg-muted/50 hover:border-border transition-all duration-200 group"
          >
            <div className={`p-2.5 rounded-lg shrink-0 transition-transform group-hover:scale-105 ${act.color}`}>
              <act.icon size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {act.label}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {act.description}
              </p>
            </div>
            <ChevronRight size={16} className="text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all" />
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}