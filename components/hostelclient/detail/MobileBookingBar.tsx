import Link from "next/link";
import { Phone, CheckCircle2 } from "lucide-react";
import StarRating from "./StarRating";

interface MobileBookingBarProps {
    hostel: {
        slug: string;
        price: string;
        price_per_day?: string | null;
        is_discounted?: boolean | null;
        discounted_price?: string | null;
        discounted_price_per_day?: string | null;
        rating_avg: number;
        rating_count: number;
    };
    priceMode: "monthly" | "daily";
}

export default function MobileBookingBar({ hostel, priceMode }: MobileBookingBarProps) {
    const currentPrice = priceMode === "monthly"
        ? (hostel.is_discounted && hostel.discounted_price ? hostel.discounted_price : hostel.price)
        : (hostel.is_discounted && hostel.discounted_price_per_day ? hostel.discounted_price_per_day : (hostel.price_per_day || 0));

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-4 z-[100] flex items-center justify-between shadow-[0_-15px_35px_-5px_rgba(0,0,0,0.1)]">
            <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xl font-black text-gray-900 tracking-tight">
                        ₹{Number(currentPrice).toLocaleString()}
                    </span>
                    <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">
                        /{priceMode === "monthly" ? "mo" : "day"}
                    </span>
                </div>
                <div className="flex items-center gap-1 font-bold text-gray-900">
                    <span className="text-[14px]">{(hostel.rating_avg || 5.0).toFixed(1)}</span>
                    <StarRating rating={hostel.rating_avg || 5.0} size={12} />
                    <span className="text-[12px] text-gray-500 flex items-center gap-1">
                        · {hostel.rating_count} reviews
                    </span>
                </div>
            </div>
            
            <Link
                href={`/hostels/${hostel.slug}/book`}
                className="bg-slate-900 hover:bg-black text-white font-bold px-8 py-3.5 rounded-2xl transition-all active:scale-[0.95] shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-center gap-2 text-[15px] ml-4 flex-shrink-0"
            >
                Reserve
            </Link>
        </div>
    );
}
