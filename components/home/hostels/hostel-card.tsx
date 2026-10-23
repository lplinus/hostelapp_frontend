"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  Heart,
  Building2,
  MapPin,
  Star,
  ArrowRight
} from "lucide-react";
import { isExternalImage, cn } from "@/lib/utils";

export interface HostelCardProps {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly location: string;
  readonly price: number;
  readonly originalPrice?: number;
  readonly isDiscounted?: boolean;
  readonly discountPercentage?: number;
  readonly rating: number;
  readonly reviewsCount: number;
  readonly image: string | null;
  readonly gender: string;
  readonly features: readonly string[];
  readonly distance?: string;
  readonly isFeatured?: boolean;
  readonly isVerified?: boolean;
  readonly isApproved?: boolean;
  readonly isTopRated?: boolean;
  readonly layout?: "grid" | "list";
  readonly availableRooms?: number;
  readonly pricePerDay?: number;
}

export default function HostelCard({
  slug,
  name,
  location,
  price,
  originalPrice,
  isDiscounted = false,
  discountPercentage,
  rating,
  reviewsCount,
  image,
  gender,
  features,
  distance,
  isFeatured = false,
  isVerified = false,
  isApproved = false,
  isTopRated = false,
  layout = "list",
  availableRooms,
  pricePerDay
}: HostelCardProps) {

  const getRatingText = (rating: number) => {
    if (rating >= 9) return "Outstanding";
    if (rating >= 8) return "Excellent";
    if (rating >= 7) return "Great";
    return "Good";
  };

  if (layout === "grid") {
    const nightlyPrice = pricePerDay && pricePerDay > 0
      ? Math.round(pricePerDay)
      : (price && price > 0 ? Math.round(price / 30) : null);

    return (
      <Link
        href={`/hostels/${slug}`}
        className="flex flex-col h-full cursor-pointer select-none"
      >
        {/* IMAGE */}
        <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover"
              unoptimized={isExternalImage(image)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
              <Building2 className="w-8 h-8 text-slate-300" />
            </div>
          )}

          {/* Top-right: Heart wishlist button */}
          <div className="absolute top-2.5 right-2.5 p-1 text-white/90 hover:text-white transition-colors">
            <Heart className="w-5 h-5 fill-black/25 stroke-white stroke-[2]" />
          </div>
        </div>

        {/* CONTENT - Exact Airbnb Style */}
        <div className="pt-2.5 flex flex-col min-w-0">
          {/* Line 1: Title */}
          <h3 className="font-medium text-[14px] sm:text-[15px] text-black truncate leading-tight">
            {name}
          </h3>

          {/* Line 2: Pricing & Rating */}
          <div className="text-[13px] sm:text-[14px] text-black mt-1 flex items-center gap-1 truncate leading-snug">
            {nightlyPrice ? (
              <span className="truncate">
                <span className="font-medium text-black">₹{nightlyPrice.toLocaleString()}</span>{" "}
                <span className="font-normal text-black">for 1 night</span>
              </span>
            ) : (
              <span className="font-medium text-black">₹{price.toLocaleString()}</span>
            )}
            {rating > 0 && (
              <>
                <span className="text-neutral-400 font-normal shrink-0">·</span>
                <span className="inline-flex items-center gap-0.5 font-medium text-black shrink-0">
                  <Star className="w-3.5 h-3.5 fill-black text-black shrink-0 inline mb-0.5" />
                  <span>{rating.toFixed(rating % 1 === 0 ? 1 : 2)}</span>
                </span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  }

  // ──────────────────── LIST LAYOUT ────────────────────
  return (
    <Link
      href={`/hostels/${slug}`}
      className="block bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-sm w-full"
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch min-h-[280px]">
        {/* IMAGE SECTION */}
        <div className="relative w-full sm:w-[280px] md:w-[300px] aspect-[4/3] sm:aspect-auto shrink-0 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover object-center"
              unoptimized={isExternalImage(image)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
              <Building2 className="w-12 h-12 text-slate-200" />
            </div>
          )}

          {/* Badges on image */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5">
            {isVerified && (
              <div
                className="bg-white/90 backdrop-blur-md text-[#10B981] p-1.5 rounded-lg shadow-sm flex items-center border border-white/50 cursor-default"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span className="ml-1 text-[10px] font-bold uppercase tracking-wider">
                  Verified
                </span>
              </div>
            )}
            {isFeatured && (
              <div className="bg-gradient-to-br from-[#312E81]/95 to-[#4F46E5]/95 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-[0_4px_12px_rgba(49,46,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                Featured Selection
              </div>
            )}
            {isTopRated && (
              <div className="bg-gradient-to-br from-amber-500/95 to-orange-500/95 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-[0_4px_12px_rgba(249,115,22,0.4),inset_0_1px_1px_rgba(255,255,255,0.5)]">
                Top Rated
              </div>
            )}
          </div>

          {/* Wishlist button */}
          <button
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-400 hover:text-red-500 rounded-full p-2 shadow-sm transition-colors z-10"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <Heart className="w-4 h-4" />
          </button>

          {/* Discount tag on image */}
          {isDiscounted && discountPercentage && (
            <div className="absolute bottom-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wide">
              {discountPercentage}% OFF
            </div>
          )}
        </div>

        {/* CONTENT SECTION */}
        <div className="flex-1 flex flex-col p-5 sm:py-4 sm:px-5 md:px-6 min-w-0">
          {/* Top row: Type badge + Rating */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="bg-[#F0FDF4] text-[#059669] text-[10px] font-bold px-2.5 py-1 rounded-md border border-[#DCFCE7] uppercase tracking-wide flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-[#059669]" />
                {gender.replace('_', ' ')}
              </div>
            </div>

            {/* Rating badge - hidden when rating is 0 */}
            {rating > 0 && (
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex flex-col items-end">
                  <span className="text-[11px] font-bold text-[#312E81] leading-none">{getRatingText(rating)}</span>
                </div>
                <div className="w-10 h-10 bg-[#312E81] text-white rounded-lg flex items-center justify-center font-bold text-sm">
                  {rating.toFixed(1)}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-[22px] font-medium text-black leading-snug mb-1.5 line-clamp-1">
            {name}
          </h2>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-[13px] text-black font-medium mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#10B981]" />
            <span className="truncate">{location}</span>
          </div>

          {/* Features row */}
          {features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {features.map((feature) => (
                <span key={feature} className="text-[10px] font-medium text-black bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200">
                  {feature}
                </span>
              ))}
            </div>
          )}

          {/* Spacer to push price/CTA to bottom */}
          <div className="flex-1" />

          {/* Price + CTA row */}
          <div className="flex items-end justify-between gap-4 border-t border-slate-100 pt-3 mt-1">
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-medium text-black uppercase tracking-wider mb-0.5">Price starts from</span>
              <div className="flex items-baseline flex-wrap gap-2">
                <span className="text-2xl font-semibold text-black">₹{price.toLocaleString()}</span>
                {isDiscounted && originalPrice && (
                  <span className="text-sm text-slate-400 line-through">₹{originalPrice.toLocaleString()}</span>
                )}
              </div>
              <span className="text-[10px] text-black font-medium mt-0.5">Inclusive of all local taxes</span>
            </div>

            <div
              className="bg-[#312E81] hover:bg-[#1E1B4B] text-white px-6 py-3 rounded-xl font-bold transition-colors text-[13px] shadow-sm whitespace-nowrap shrink-0"
            >
              view details
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
