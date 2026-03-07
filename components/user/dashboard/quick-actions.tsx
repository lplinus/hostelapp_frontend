import Link from "next/link";
import { Building2, BedDouble, CalendarCheck } from "lucide-react";

export default function QuickActions() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">

      <h3 className="font-semibold text-lg mb-4 text-gray-800">
        Quick Actions
      </h3>

      <div className="space-y-3">

        <Link
          href="/hostel"
          className="flex items-center justify-center gap-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Building2 size={18} />
          Manage Hostels
        </Link>

        <Link
          href="/rooms"
          className="flex items-center justify-center gap-2 p-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
        >
          <BedDouble size={18} />
          Manage Rooms
        </Link>

        <Link
          href="/bookings"
          className="flex items-center justify-center gap-2 p-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
        >
          <CalendarCheck size={18} />
          View Bookings
        </Link>

      </div>

    </div>
  );
}