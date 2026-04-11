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
    return (
      <div className="group bg-white rounded-2xl overflow-hidden transition-all duration-500 hover:-translate-y-1 border border-slate-200/80 hover:border-slate-300/80 flex flex-col h-full"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.03)' }}
        onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 30px rgba(49,46,129,0.08), 0 2px 8px rgba(0,0,0,0.04)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.03)'; }}
      >
        {/* IMAGE */}
        <Link href={`/hostels/${slug}`} className="relative block aspect-[5/4] sm:aspect-[4/3] overflow-hidden shrink-0">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              unoptimized={isExternalImage(image)}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
              <Building2 className="w-10 h-10 text-slate-200" />
            </div>
          )}

          {/* Top-right Rating Badge (Matching Image) - hidden when rating is 0 */}
          {rating > 0 && (
            <div className="absolute top-3 right-3 z-10">
              <div className="bg-[#312E81] text-white rounded-lg px-2.5 py-1.5 font-bold text-[14px] shadow-lg flex items-center justify-center min-w-[38px]">
                {rating.toFixed(1)}
              </div>
            </div>
          )}

          {/* Top-left badges */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 z-10">
            {isVerified && (
              <div 
                className="group/badge bg-white/90 backdrop-blur-md text-[#10B981] p-1.5 rounded-lg shadow-sm flex items-center border border-white/50 transition-all duration-300 cursor-default"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span className="max-w-0 overflow-hidden opacity-0 group-hover/badge:max-w-[60px] group-hover/badge:opacity-100 group-hover/badge:ml-1 transition-all duration-300 ease-in-out whitespace-nowrap text-[10px] font-bold uppercase tracking-wider">
                  Verified
                </span>
              </div>
            )}
            {isFeatured && (
              <div className="bg-gradient-to-br from-[#312E81]/95 to-[#4F46E5]/95 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-[0_4px_12px_rgba(49,46,129,0.4),inset_0_1px_1px_rgba(255,255,255,0.4)]">
                Featured
              </div>
            )}
            {isTopRated && (
              <div className="bg-gradient-to-br from-amber-500/95 to-orange-500/95 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-[0_4px_12px_rgba(249,115,22,0.4),inset_0_1px_1px_rgba(255,255,255,0.5)]">
                Top Rated
              </div>
            )}
          </div>

          {/* Discount badge bottom-left */}
          {isDiscounted && discountPercentage && (
            <div className="absolute bottom-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wide z-10">
              {discountPercentage}% OFF
            </div>
          )}
        </Link>

        {/* CONTENT */}
        <div className="p-4 sm:p-5 flex flex-col flex-1">
          {/* Title */}
          <Link href={`/hostels/${slug}`} className="block mb-2 group/title">
            <h2 className="text-[17px] font-bold text-gray-900 leading-tight group-hover/title:text-[#10B981] transition-colors line-clamp-1">
              {name}
            </h2>
          </Link>

          {/* Stars + Location */}
          <div className="flex flex-col gap-1.5 mb-auto">
            {rating > 0 && (
              <div className="flex items-center gap-1 text-orange-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={cn("w-3.5 h-3.5 fill-current", i >= Math.round(rating) && "text-slate-200 fill-none")} />
                ))}
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[13px] text-[#64748B] line-clamp-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-[#10B981]" />
              <span className="truncate">{location}</span>
            </div>
          </div>

          {/* Price Section */}
          <div className="mt-4 pt-4 border-t border-slate-50">
            <p className="text-[11px] text-slate-500 font-medium mb-1">Starting from per night</p>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-extrabold text-[#312E81]">
                    INR {pricePerDay ? pricePerDay.toLocaleString() : (price / 30).toFixed(0)}
                  </span>
                  <span className="text-[10px] font-bold text-[#64748B]">/ day</span>
                </div>
                {isDiscounted && originalPrice && (
                  <span className="text-[10px] text-slate-400 line-through">₹{originalPrice.toLocaleString()} / mo</span>
                )}
              </div>
              
              <div className="flex items-center gap-1 text-[11px] font-bold text-[#10B981] group-hover:translate-x-1 transition-transform">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ──────────────────── LIST LAYOUT ────────────────────
  return (
    <Link
      href={`/hostels/${slug}`}
      className="group block bg-white rounded-2xl overflow-hidden transition-all duration-400 border border-slate-200/80 hover:border-slate-300/80 w-full"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.03)' }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 12px 40px rgba(49,46,129,0.08), 0 2px 8px rgba(0,0,0,0.04)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.03)'; }}
    >
      <div className="flex flex-col sm:flex-row sm:items-stretch min-h-[280px]">
        {/* IMAGE SECTION */}
        <div className="relative w-full sm:w-[280px] md:w-[300px] aspect-[4/3] sm:aspect-auto shrink-0 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
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
                className="group/badge bg-white/90 backdrop-blur-md text-[#10B981] p-1.5 rounded-lg shadow-sm flex items-center border border-white/50 transition-all duration-300 cursor-default"
              >
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span className="max-w-0 overflow-hidden opacity-0 group-hover/badge:max-w-[60px] group-hover/badge:opacity-100 group-hover/badge:ml-1 transition-all duration-300 ease-in-out whitespace-nowrap text-[10px] font-bold uppercase tracking-wider">
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
            className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm hover:bg-white text-slate-400 hover:text-red-500 rounded-full p-2 shadow-sm transition-all duration-300 hover:scale-110 z-10"
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
                <div className="w-10 h-10 bg-[#312E81] text-white rounded-lg flex items-center justify-center font-bold text-sm transition-colors duration-300 group-hover:bg-[#10B981]">
                  {rating.toFixed(1)}
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <h2 className="text-xl md:text-[22px] font-bold text-[#312E81] leading-snug group-hover:text-[#10B981] transition-colors mb-1.5 line-clamp-1">
            {name}
          </h2>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-[13px] text-[#64748B] font-medium mb-3">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-[#10B981]" />
            <span className="truncate">{location}</span>
          </div>

          {/* Features row */}
          {features.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {features.map((feature) => (
                <span key={feature} className="text-[10px] font-semibold text-[#64748B] bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
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
              <span className="text-[10px] font-semibold text-[#64748B] uppercase tracking-wider mb-0.5">Price starts from</span>
              <div className="flex items-baseline flex-wrap gap-2">
                <span className="text-2xl font-extrabold text-[#312E81]">₹{price.toLocaleString()}</span>
                {isDiscounted && originalPrice && (
                  <span className="text-sm text-slate-400 line-through">₹{originalPrice.toLocaleString()}</span>
                )}
              </div>
              <span className="text-[10px] text-[#94A3B8] mt-0.5">Inclusive of all local taxes</span>
            </div>

            <div
              className="bg-[#312E81] hover:bg-[#10B981] text-white px-6 py-3 rounded-xl font-bold transition-all text-[13px] shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap shrink-0"
            >
              Explore Selection
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
