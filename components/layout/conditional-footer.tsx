"use client";

import { usePathname } from "next/navigation";
import Footer from "./footer";

export default function ConditionalFooter() {
    const pathname = usePathname();

    // If we are on these dashboard-related routes, don't show the footer
    const isDashboardRoute =
        // pathname === "/" ||
        pathname === "/dashboard" ||
        pathname.startsWith("/dashboard/") ||
        pathname === "/profile" ||
        pathname.startsWith("/profile/") ||
        pathname === "/hostel" ||
        pathname.startsWith("/hostel/") ||
        pathname === "/hotel" ||
        pathname.startsWith("/hotel/") ||
        pathname === "/rooms" ||
        pathname.startsWith("/rooms/") ||
        pathname === "/bookings" ||
        pathname.startsWith("/bookings/") ||
        pathname === "/hotelbooking" ||
        pathname.startsWith("/hotelbooking/") ||
        pathname === "/vacanrentalbooking" ||
        pathname.startsWith("/vacanrentalbooking/") ||
        pathname === "/subscription" ||
        pathname.startsWith("/subscription/") ||
        pathname === "/settings" ||
        pathname.startsWith("/settings/") ||
        pathname === "/notification" ||
        pathname.startsWith("/notification/") ||
        pathname === "/help&support" ||
        pathname.startsWith("/help&support/") ||
        pathname.startsWith("/vendordashboard") ||
        pathname.startsWith("/usermarketplace") ||
        pathname === "/login" ||
        pathname === "/register" ||
        pathname === "/verify-email";

    if (isDashboardRoute) {
        return null;
    }

    return <Footer />;
}
