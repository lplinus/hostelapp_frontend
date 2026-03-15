"use client";

import Image from "next/image";
import { useState, FormEvent } from "react";
import { sendContactMessage } from "@/services/public.service";
import { toast } from "sonner";
import Link from "next/link";
import HostelMap from "@/components/hostelclient/hostelmaps";
import {
    Star,
    Heart,
    Share2,
    Phone,
    Wifi,
    Wind,
    Droplets,
    ShieldCheck,
    Dumbbell,
    Lightbulb,
    Zap,
    UtensilsCrossed,
    Tv,
    WashingMachine,
    ParkingCircle,
    BookOpen,
    Cctv,
    BedDouble,
    Shirt,
    CircleDot,
    Volume2,
    Users,
    Snowflake,
    Fan,
    LayoutGrid,
    X,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";
import type { HostelDetail } from "@/types/hostel.types";

/* ------------------------------------------------------------------ */
/*  Amenity-icon mapping                                               */
/* ------------------------------------------------------------------ */
const AMENITY_ICON_MAP: Record<string, React.ElementType> = {
    wifi: Wifi,
    ac: Wind,
    "hot water": Droplets,
    "hot-water": Droplets,
    laundry: WashingMachine,
    gym: Dumbbell,
    light: Lightbulb,
    "power backup": Zap,
    "power-backup": Zap,
    food: UtensilsCrossed,
    mess: UtensilsCrossed,
    tv: Tv,
    parking: ParkingCircle,
    cctv: Cctv,
    security: ShieldCheck,
    "study room": BookOpen,
    "study-room": BookOpen,
    bed: BedDouble,
    "washing machine": WashingMachine,
    "iron": Shirt,
    noise: Volume2,
};

function getAmenityIcon(name: string): React.ElementType {
    const lower = name.toLowerCase().trim();
    for (const key of Object.keys(AMENITY_ICON_MAP)) {
        if (lower.includes(key)) return AMENITY_ICON_MAP[key];
    }
    return CircleDot;
}

/* ------------------------------------------------------------------ */
/*  Star renderer                                                      */
/* ------------------------------------------------------------------ */
function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <span className="inline-flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={size}
                    className={
                        i <= Math.round(rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                    }
                />
            ))}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/*  Default / placeholder reviews                                      */
/* ------------------------------------------------------------------ */
const DEFAULT_REVIEWS = [
    {
        id: -1,
        user_name: "Aarav S.",
        rating: 5,
        comment:
            "Great place to stay! Clean rooms and friendly staff. Highly recommended for students.",
        created_at: new Date().toISOString(),
    },
    {
        id: -2,
        user_name: "Priya M.",
        rating: 4,
        comment:
            "Lovely hostel. Modern amenities and excellent food service.",
        created_at: new Date().toISOString(),
    },
    {
        id: -3,
        user_name: "Rohan K.",
        rating: 5,
        comment:
            "Excellent hostel! Close to colleges and very well maintained.",
        created_at: new Date().toISOString(),
    },
];

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */
import { toLocalMediaPath } from "@/lib/utils";

interface Props {
    hostel: HostelDetail;
}

export default function HostelDetailClient({ hostel }: Props) {
    /* ---------- images ---------- */
    const hostelImages: { src: string; alt: string }[] = [];
    
    // Process hostel's specific images (up to 10 fields per image object)
    for (const img of hostel.images) {
        for (let i = 1; i <= 10; i++) {
            const field = (i === 1 ? "image" : `image${i}`) as keyof typeof img;
            const src = img[field];
            if (typeof src === "string" && src) {
              hostelImages.push({ 
                src: toLocalMediaPath(src) || src, 
                alt: i === 1 ? img.alt_text : `${img.alt_text} ${i}` 
              });
            }
        }
    }

    // Fallback to default images from backend when hostel has no images
    if (hostelImages.length === 0 && hostel.default_images) {
        const d = hostel.default_images;
        const altText = d.alt_text || "Default hostel image";
        for (let i = 1; i <= 10; i++) {
            const field = `image${i}` as keyof typeof d;
            const src = d[field];
            if (typeof src === "string" && src) {
              hostelImages.push({ 
                src: toLocalMediaPath(src) || src, 
                alt: i === 1 ? altText : `${altText} ${i}`
              });
            }
        }
    }

    const allImages = hostelImages;
    const [activeImg, setActiveImg] = useState(0);
    const [saved, setSaved] = useState(false);
    const [showAllRooms, setShowAllRooms] = useState(false);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const INITIAL_ROOM_LIMIT = 4;
    const INITIAL_AMENITY_LIMIT = 6;
    const [priceMode, setPriceMode] = useState<"monthly" | "daily">("monthly");
    const [showGallery, setShowGallery] = useState(false);

    /* ---------- contact form ---------- */
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        message: "",
    });
    const [formSending, setFormSending] = useState(false);
    const [formSent, setFormSent] = useState(false);

    const handleFormSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setFormSending(true);
        try {
            await sendContactMessage({
                name: formData.name,
                phone: formData.phone,
                message: formData.message || "Requesting callback from hostel page",
                hostel: hostel.id,
            });
            setFormSent(true);
            setFormData({ name: "", phone: "", message: "" });
            setTimeout(() => setFormSent(false), 3000);
        } catch (error) {
            console.error("Failed to send callback request:", error);
            toast.error("Failed to send request. Please try again.");
        } finally {
            setFormSending(false);
        }
    };

    /* ---------- map ---------- */
    // const hasCoords = hostel.latitude && hostel.longitude;
    // const mapSrc = hasCoords
    //     ? `https://maps.google.com/maps?q=${hostel.latitude},${hostel.longitude}&z=15&output=embed`
    //     : hostel.address
    //         ? `https://maps.google.com/maps?q=${encodeURIComponent(
    //             hostel.address + ", " + hostel.city.name
    //         )}&z=15&output=embed`
    //         : null;

    const hasCoords =
        hostel.latitude !== null &&
        hostel.latitude !== undefined &&
        hostel.longitude !== null &&
        hostel.longitude !== undefined;

    const mapSrc = hasCoords
        ? `https://www.google.com/maps?q=${hostel.latitude},${hostel.longitude}&z=16&output=embed`
        : hostel.address
            ? `https://www.google.com/maps?q=${encodeURIComponent(
                `${hostel.address}, ${hostel.city?.name ?? ""}`
            )}&z=15&output=embed`
            : null;

    return (
        <div className="hostel-detail-page bg-white min-h-screen pb-24 lg:pb-0">
            {/* ===== Breadcrumb ===== */}
            <nav className="max-w-[1200px] mx-auto px-5 py-3 text-sm text-gray-500">
                <ol className="flex items-center gap-1.5 flex-wrap">
                    <li>
                        <a href="/" className="hover:text-blue-600 transition-colors">
                            Home
                        </a>
                    </li>
                    <li>/</li>
                    <li>
                        <a
                            href="/hostels"
                            className="hover:text-blue-600 transition-colors"
                        >
                            Hostels
                        </a>
                    </li>
                    <li>/</li>
                    <li className="text-gray-900 font-medium truncate max-w-[200px]">
                        {hostel.name}
                    </li>
                </ol>
            </nav>

            {/* ===== Main Layout ===== */}
            <div className="max-w-[1200px] mx-auto px-5 pb-16">
                
                {/* ---------- Image Gallery (Now at the very top) ---------- */}
                <div className="mb-8">
                    <div className="relative group">
                        {/* Desktop Bento Grid (Hidden on Mobile) */}
                        <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-3 h-[480px] rounded-3xl overflow-hidden shadow-sm">
                            {/* Main Image (Slot 1) */}
                            <div 
                                className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden"
                                onClick={() => setShowGallery(true)}
                            >
                                <Image
                                    src={allImages[0]?.src || "/images/hero1.webp"}
                                    alt={allImages[0]?.alt || hostel.name}
                                    fill
                                    className="object-cover hover:brightness-75 transition-all duration-300"
                                    priority
                                    sizes="800px"
                                />
                            </div>

                            {/* Slot 2 (Top Middle) */}
                            <div 
                                className="col-span-1 row-span-1 relative cursor-pointer overflow-hidden"
                                onClick={() => setShowGallery(true)}
                            >
                                <Image
                                    src={allImages[1]?.src || allImages[0]?.src || "/images/hero1.webp"}
                                    alt={allImages[1]?.alt || hostel.name}
                                    fill
                                    className="object-cover hover:brightness-75 transition-all duration-300"
                                    sizes="400px"
                                />
                            </div>

                            {/* Slot 3 (Top Right) */}
                            <div 
                                className="col-span-1 row-span-1 relative cursor-pointer overflow-hidden"
                                onClick={() => setShowGallery(true)}
                            >
                                <Image
                                    src={allImages[2]?.src || allImages[0]?.src || "/images/hero1.webp"}
                                    alt={allImages[2]?.alt || hostel.name}
                                    fill
                                    className="object-cover hover:brightness-75 transition-all duration-300"
                                    sizes="400px"
                                />
                            </div>

                            {/* Slot 4 (Bottom Middle) */}
                            <div 
                                className="col-span-1 row-span-1 relative cursor-pointer overflow-hidden"
                                onClick={() => setShowGallery(true)}
                            >
                                <Image
                                    src={allImages[3]?.src || allImages[0]?.src || "/images/hero1.webp"}
                                    alt={allImages[3]?.alt || hostel.name}
                                    fill
                                    className="object-cover hover:brightness-75 transition-all duration-300"
                                    sizes="400px"
                                />
                            </div>

                            {/* Slot 5 (Bottom Right) */}
                            <div 
                                className="col-span-1 row-span-1 relative cursor-pointer overflow-hidden"
                                onClick={() => setShowGallery(true)}
                            >
                                <Image
                                    src={allImages[4]?.src || allImages[0]?.src || "/images/hero1.webp"}
                                    alt={allImages[4]?.alt || hostel.name}
                                    fill
                                    className="object-cover hover:brightness-75 transition-all duration-300"
                                    sizes="400px"
                                />
                            </div>
                        </div>

                        {/* Mobile View remains unchanged ... */}
                        <div className="md:hidden relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                            {allImages.length > 0 ? (
                                <Image
                                    src={allImages[activeImg].src}
                                    alt={allImages[activeImg].alt}
                                    fill
                                    className="object-cover"
                                    priority
                                    sizes="100vw"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                                    No images
                                </div>
                            )}

                            {allImages.length > 1 && (
                                <div className="absolute inset-0 flex items-center justify-between px-4 pointer-events-none">
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveImg((prev) => (prev > 0 ? prev - 1 : allImages.length - 1));
                                        }}
                                        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-800 shadow-lg pointer-events-auto active:scale-90"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveImg((prev) => (prev < allImages.length - 1 ? prev + 1 : 0));
                                        }}
                                        className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm border border-gray-100 flex items-center justify-center text-gray-800 shadow-lg pointer-events-auto active:scale-90"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            )}

                            <div className="absolute bottom-4 right-4 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full border border-white/10">
                                {activeImg + 1} / {allImages.length}
                            </div>
                        </div>

                        {/* "Show all photos" Button (Desktop) */}
                        <button
                            onClick={() => setShowGallery(true)}
                            className="hidden md:flex absolute bottom-6 right-6 bg-white hover:bg-gray-50 text-slate-900 border border-slate-200 px-5 py-2.5 rounded-xl shadow-xl shadow-slate-900/10 font-bold text-sm items-center gap-2.5 transition-all active:scale-95 z-20"
                        >
                            <LayoutGrid size={18} className="text-slate-600" />
                            <span>Show all photos</span>
                        </button>
                    </div>
                </div>

                {/* ---------- Title & Meta Details (Moved below Image) ---------- */}
                <div className="mt-8 mb-6">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-2">
                                {hostel.name}
                            </h1>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 font-medium">
                                <span>
                                    {hostel.area?.name ? `${hostel.area.name}, ` : ""}
                                    {hostel.city.name}
                                </span>
                                <span className="text-gray-300 hidden sm:inline">|</span>
                                <div className="flex items-center gap-1">
                                    <StarRating rating={hostel.rating_avg} />
                                    <span className="ml-1 text-gray-900 font-bold">
                                        {hostel.rating_avg.toFixed(1)}
                                    </span>
                                    <span className="text-gray-400 font-normal">
                                        ({hostel.rating_count} reviews)
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 flex-shrink-0">
                            <button
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold text-gray-700 underline underline-offset-4"
                                onClick={() => {
                                    navigator.share?.({
                                        title: hostel.name,
                                        url: window.location.href,
                                    });
                                }}
                            >
                                <Share2 size={16} />
                                <span>Share</span>
                            </button>
                            <button
                                onClick={() => setSaved(!saved)}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors text-sm font-bold text-gray-700 underline underline-offset-4"
                            >
                                <Heart
                                    size={16}
                                    className={saved ? "fill-red-500 text-red-500" : ""}
                                />
                                <span>{saved ? "Saved" : "Save"}</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">
                    {/* ===== LEFT COLUMN ===== */}
                    <div>


                        {/* ---------- Gallery Modal ---------- */}
                        {showGallery && (
                            <div className="fixed inset-0 z-[999] bg-white flex flex-col animate-in fade-in duration-300">
                                {/* Header */}
                                <div className="flex items-center justify-between px-6 py-4 border-b">
                                    <button 
                                        onClick={() => setShowGallery(false)}
                                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                    >
                                        <X size={24} />
                                    </button>
                                    <div className="text-sm font-semibold text-gray-500">
                                        {activeImg + 1} / {allImages.length}
                                    </div>
                                    <div className="w-10"></div> {/* Spacer */}
                                </div>

                                {/* Content */}
                                <div className="flex-1 overflow-y-auto bg-gray-50/50 p-6 md:p-12">
                                    <div className="max-w-4xl mx-auto space-y-6">
                                        {allImages.map((img, idx) => (
                                            <div key={idx} className="relative aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl bg-white border border-gray-100">
                                                <Image
                                                    src={img.src}
                                                    alt={img.alt}
                                                    fill
                                                    className="object-cover"
                                                    sizes="(max-width: 1200px) 100vw, 1000px"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}



                        {/* ---------- Tags ---------- */}
                        <div className="flex flex-wrap gap-2 mb-5">
                            {hostel.is_verified && (
                                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-white text-gray-800 border shadow-sm">
                                    ✔ Verified
                                </span>
                            )}
                            {hostel.is_featured && (
                                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-blue-600 text-white">
                                    Girls
                                </span>
                            )}
                            <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                                ✓ Best Hostel
                            </span>
                            {hostel.is_featured && (
                                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-orange-500 text-white">
                                    Premium
                                </span>
                            )}

                            {hostel.room_types && Array.from(new Set(hostel.room_types.map((r) => r.sharing_display).filter(Boolean))).map((sharing, idx) => (
                                <span key={`sharing-${idx}`} className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full bg-purple-50 text-purple-700 border border-purple-200 shadow-sm">
                                    <Users size={12} className="mr-1.5" />
                                    {sharing}
                                </span>
                            ))}
                        </div>

                        {/* ---------- Description ---------- */}
                        <p className="text-gray-600 leading-relaxed text-[15px] mb-8 whitespace-pre-wrap">
                            {hostel.description}
                        </p>

                        {/* ---------- Amenities ---------- */}
                        {hostel.amenities.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Amenities
                                </h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {(showAllAmenities ? hostel.amenities : hostel.amenities.slice(0, INITIAL_AMENITY_LIMIT)).map((amenity) => {
                                        const IconComp = getAmenityIcon(
                                            amenity.name
                                        );
                                        return (
                                            <div
                                                key={amenity.id}
                                                className="flex items-center gap-3 px-4 py-3 rounded-xl border border-black bg-gray-50/50 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                                            >
                                                <IconComp
                                                    size={18}
                                                    className="text-blue-600 flex-shrink-0"
                                                />
                                                <span className="text-sm text-gray-700 font-medium">
                                                    {amenity.name}
                                                </span>
                                            </div>
                                        );
                                    })}
                                </div>

                                {hostel.amenities.length > INITIAL_AMENITY_LIMIT && (
                                    <button
                                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                                        className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        {showAllAmenities ? (
                                            "Show Less"
                                        ) : (
                                            <>
                                                View All Amenities (+{hostel.amenities.length - INITIAL_AMENITY_LIMIT} more)
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* ---------- Room Types & Availability ---------- */}
                        {hostel.room_types && hostel.room_types.length > 0 && (
                            <div className="mb-8">
                                <h2 className="text-lg font-bold text-gray-900 mb-4">
                                    Room Types & Availability
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {(showAllRooms ? hostel.room_types : hostel.room_types.slice(0, INITIAL_ROOM_LIMIT)).map((room) => (
                                        <div
                                            key={room.id}
                                            className={`rounded-xl border border-black p-4 transition-all duration-200 ${room.is_available
                                                ? "bg-white hover:border-blue-200 hover:shadow-sm"
                                                : "bg-gray-50 opacity-60"
                                                }`}
                                        >
                                            {/* Room category & sharing */}
                                            <div className="flex items-center gap-2 mb-3">
                                                {room.room_category === "AC" ? (
                                                    <Snowflake size={16} className="text-blue-500" />
                                                ) : (
                                                    <Fan size={16} className="text-gray-500" />
                                                )}
                                                <span className="text-sm font-semibold text-gray-900">
                                                    {room.category_display}
                                                </span>
                                                <span className="text-gray-300">|</span>
                                                <Users size={14} className="text-gray-500" />
                                                <span className="text-sm text-gray-600">
                                                    {room.sharing_display}
                                                </span>
                                            </div>

                                            {/* Price */}
                                            {(priceMode === "monthly" ? room.base_price : room.price_per_day) && (
                                                <div className="text-sm text-gray-700 mb-2">
                                                    <span className="font-semibold text-blue-600">
                                                        ₹{Number(priceMode === "monthly" ? room.base_price : room.price_per_day).toLocaleString()}
                                                    </span>
                                                    <span className="text-gray-400"> {priceMode === "monthly" ? "/month" : "/day"}</span>
                                                </div>
                                            )}

                                            {/* Beds Available */}
                                            <div className="flex items-center gap-2 mt-2">
                                                <BedDouble size={15} className="text-gray-500" />
                                                <span className="text-sm">
                                                    {room.available_beds > 0 ? (
                                                        <span className="text-green-600 font-medium">
                                                            {room.available_beds} bed{room.available_beds > 1 ? "s" : ""} available
                                                        </span>
                                                    ) : (
                                                        <span className="text-red-500 font-medium">
                                                            No beds available
                                                        </span>
                                                    )}
                                                </span>
                                            </div>

                                            {!room.is_available && (
                                                <div className="mt-2 text-xs text-red-500 font-medium">
                                                    Currently unavailable
                                                </div>
                                            )}

                                            {room.is_available && (
                                                <Link
                                                    href={`/hostels/${hostel.slug}/book?roomId=${room.id}`}
                                                    className="mt-3 w-full flex items-center justify-center py-2 text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-lg transition-all"
                                                >
                                                    Book This Room
                                                </Link>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {hostel.room_types.length > INITIAL_ROOM_LIMIT && (
                                    <button
                                        onClick={() => setShowAllRooms(!showAllRooms)}
                                        className="mt-4 w-full py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 hover:border-blue-200 hover:text-blue-600 transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        {showAllRooms ? (
                                            "Show Less"
                                        ) : (
                                            <>
                                                View More Rooms (+{hostel.room_types.length - INITIAL_ROOM_LIMIT} options available)
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>
                        )}

                        {/* ---------- Location ---------- */}
                        <div className="mb-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">
                                Location
                            </h2>
                            <div className="rounded-2xl overflow-hidden border border-black bg-gray-100 h-[220px]">
                                {mapSrc ? (
                                    <iframe
                                        src={mapSrc}
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title={`${hostel.name} location`}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                        📍 Map data currently unavailable
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* ---------- Reviews ---------- */}
                        <div className="mb-8">
                            {(() => {
                                const hasRealReviews =
                                    hostel.reviews && hostel.reviews.length > 0;
                                const reviewsToShow = hasRealReviews
                                    ? hostel.reviews
                                    : DEFAULT_REVIEWS;
                                const reviewCount = hasRealReviews
                                    ? hostel.reviews.length
                                    : hostel.rating_count || DEFAULT_REVIEWS.length;
                                const avgRating = hasRealReviews
                                    ? hostel.rating_avg
                                    : 4.5;

                                return (
                                    <>
                                        <div className="flex items-center gap-3 mb-5">
                                            <h2 className="text-lg font-bold text-gray-900">
                                                Reviews ({reviewCount})
                                            </h2>
                                            <StarRating
                                                rating={avgRating}
                                                size={16}
                                            />
                                            <span className="text-sm text-gray-500">
                                                {avgRating.toFixed(1)}/5
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            {reviewsToShow.map((review) => (
                                                <div
                                                    key={review.id}
                                                    className="border border-black rounded-xl px-5 py-4 hover:shadow-sm transition-shadow"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <div className="flex items-center gap-2">
                                                                <p className="font-semibold text-gray-900 text-sm">
                                                                    {review.user_name}
                                                                </p>
                                                                {!hasRealReviews && (
                                                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                                                                        Sample Review
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-gray-600 text-sm mt-1 leading-relaxed">
                                                                {review.comment}
                                                            </p>
                                                            <p className="text-xs text-gray-400 mt-2">
                                                                {new Date(
                                                                    review.created_at
                                                                ).toLocaleDateString(
                                                                    "en-IN",
                                                                    {
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    }
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="ml-4 flex-shrink-0">
                                                            <StarRating
                                                                rating={
                                                                    review.rating
                                                                }
                                                                size={13}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>

                    {/* ===== RIGHT SIDEBAR ===== */}
                    <div className="lg:self-start lg:sticky lg:top-28">
                        <div className="border border-black rounded-2xl p-6 shadow-sm bg-white">
                            {/* Price */}
                            <div className="text-center mb-4">
                                <div className="flex justify-center mb-3">
                                    <div className="inline-flex p-1 bg-gray-100 rounded-lg">
                                        <button
                                            onClick={() => setPriceMode("monthly")}
                                            className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${priceMode === "monthly" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                        >
                                            MONTHLY
                                        </button>
                                        <button
                                            onClick={() => setPriceMode("daily")}
                                            className={`px-3 py-1 text-[11px] font-bold rounded-md transition-all ${priceMode === "daily" ? "bg-white text-blue-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                                        >
                                            DAILY
                                        </button>
                                    </div>
                                </div>

                                {priceMode === "monthly" ? (
                                    hostel.is_discounted && hostel.discounted_price ? (
                                        <>
                                            <div className="inline-flex items-center gap-2 mb-1">
                                                <span className="text-lg text-gray-400 line-through">
                                                    ₹{Number(hostel.price).toLocaleString()}
                                                </span>
                                                <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                    {Math.round(Number(hostel.discount_percentage))}% OFF
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-3xl font-bold text-green-600">
                                                    ₹{Number(hostel.discounted_price).toLocaleString()}
                                                </span>
                                                <span className="text-gray-500 text-sm">
                                                    /month
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-3xl font-bold text-blue-600">
                                                ₹{Number(hostel.price).toLocaleString()}
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                                /month
                                            </span>
                                        </>
                                    )
                                ) : (
                                    hostel.is_discounted && hostel.discounted_price_per_day ? (
                                        <>
                                            <div className="inline-flex items-center gap-2 mb-1">
                                                <span className="text-lg text-gray-400 line-through">
                                                    ₹{Number(hostel.price_per_day).toLocaleString()}
                                                </span>
                                                <span className="text-xs font-semibold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                    {Math.round(Number(hostel.discount_percentage))}% OFF
                                                </span>
                                            </div>
                                            <div>
                                                <span className="text-3xl font-bold text-green-600">
                                                    ₹{Number(hostel.discounted_price_per_day).toLocaleString()}
                                                </span>
                                                <span className="text-gray-500 text-sm">
                                                    /day
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-3xl font-bold text-blue-600">
                                                ₹{Number(hostel.price_per_day || 0).toLocaleString()}
                                            </span>
                                            <span className="text-gray-500 text-sm">
                                                /day
                                            </span>
                                        </>
                                    )
                                )}
                                <div className="flex items-center justify-center gap-1 mt-1.5">
                                    <StarRating
                                        rating={hostel.rating_avg}
                                        size={13}
                                    />
                                    <span className="text-xs text-gray-400 ml-1">
                                        ({hostel.rating_count} reviews)
                                    </span>
                                </div>
                            </div>

                            {/* Book Now Button */}
                            <Link
                                href={`/hostels/${hostel.slug}/book`}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 mb-5 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                            >
                                <Phone size={16} />
                                Book Now
                            </Link>

                            <div className="relative mb-5">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-200"></div>
                                </div>
                                <div className="relative flex justify-center text-xs">
                                    <span className="bg-white px-3 text-gray-400">
                                        or
                                    </span>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <h3 className="text-sm font-bold text-gray-900 mb-3">
                                Request Callback
                            </h3>
                            <form
                                onSubmit={handleFormSubmit}
                                className="space-y-3"
                            >
                                <input
                                    type="text"
                                    placeholder="Your Name"
                                    required
                                    value={formData.name}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            name: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                                />
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    required
                                    value={formData.phone}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            phone: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                                />
                                <textarea
                                    placeholder="Message (optional)"
                                    rows={3}
                                    value={formData.message}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            message: e.target.value,
                                        })
                                    }
                                    className="w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none placeholder:text-gray-400"
                                />
                                <button
                                    type="submit"
                                    disabled={formSending}
                                    className="w-full bg-gray-900 hover:bg-gray-800 disabled:opacity-60 text-white font-medium py-2.5 rounded-lg transition-colors duration-200 text-sm"
                                >
                                    {formSending
                                        ? "Sending..."
                                        : formSent
                                            ? "✓ Request Sent!"
                                            : "Send Request"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            {/* ===== Mobile Sticky Booking Bar ===== */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-6 py-5 z-[100] flex items-center justify-between shadow-[0_-15px_35px_-5px_rgba(0,0,0,0.1)]">
                <div className="flex flex-col gap-0.5">
                    <div className="flex items-center gap-1">
                        <span className="text-2xl font-black text-blue-600 tracking-tight">
                            ₹{Number(priceMode === "monthly"
                                ? (hostel.is_discounted && hostel.discounted_price ? hostel.discounted_price : hostel.price)
                                : (hostel.is_discounted && hostel.discounted_price_per_day ? hostel.discounted_price_per_day : (hostel.price_per_day || 0))
                            ).toLocaleString()}
                        </span>
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                            /{priceMode === "monthly" ? "mo" : "day"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <StarRating rating={hostel.rating_avg} size={11} />
                        <span className="text-[11px] text-gray-400 font-bold">
                            {hostel.rating_avg.toFixed(1)} ({hostel.rating_count})
                        </span>
                    </div>
                </div>
                <Link
                    href={`/hostels/${hostel.slug}/book`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-black px-8 py-4 rounded-2xl transition-all active:scale-[0.95] shadow-2xl shadow-blue-600/40 flex items-center justify-center gap-2 text-base ml-6 flex-shrink-0"
                >
                    <Phone size={18} fill="currentColor" />
                    Book Now
                </Link>
            </div>
        </div>
    );
}
