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
        pathname === "/rooms" ||
        pathname.startsWith("/rooms/") ||
        pathname === "/bookings" ||
        pathname.startsWith("/bookings/") ||
        pathname === "/subscription" ||
        pathname.startsWith("/subscription/") ||
        pathname === "/settings" ||
        pathname.startsWith("/settings/") ||
        pathname === "/help&support" ||
        pathname.startsWith("/help&support/") ||
        pathname.startsWith("/vendordashboard") ||
        pathname.startsWith("/usermarketplace") ||
        pathname === "/login" ||
        pathname === "/register";

    if (isDashboardRoute) {
        return null;
    }

    return <Footer />;
}
