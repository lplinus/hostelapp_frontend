import { redirect } from "next/navigation";

export default function HotelBookingPage() {
    redirect("/hotel?tab=bookings");
}
