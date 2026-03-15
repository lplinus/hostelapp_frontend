"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  Heart,
  Building2,
  MapPin,
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

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
  distance = "1.2 miles to city centre",
  isFeatured = false,
  isVerified = false,
  isApproved = false,
  isTopRated = false,
  layout = "list",
  availableRooms
}: HostelCardProps) {

  const getRatingText = (rating: number) => {
    if (rating >= 9) return "Outstanding";
    if (rating >= 8) return "Excellent";
    if (rating >= 7) return "Great";
    return "Good";
  };

  return (
    <div className="bg-white rounded-[14px] p-3 sm:p-4 flex flex-col md:flex-row gap-4 md:gap-6 items-start shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all hover:shadow-md w-full border border-black">

      {/* LEFT SECTION (IMAGE) */}
      <Link href={`/hostels/${slug}`} className="relative w-full md:w-[220px] h-[150px] aspect-[4/3] md:aspect-auto rounded-xl overflow-hidden shrink-0 shadow-sm block">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center">
            <Building2 className="w-10 h-10 text-slate-300" />
          </div>
        )}

        <div className="absolute top-2 left-2">
          <button className="bg-white/90 backdrop-blur-sm hover:bg-white text-slate-600 hover:text-red-500 rounded-full p-2 shadow-sm transition-all duration-200" onClick={(e) => e.preventDefault()}>
            <Heart className="w-4 h-4" />
          </button>
        </div>
      </Link>

      {/* RIGHT SIDE CONTAINER (DETAILS + PRICE/ACTION) */}
      <div className="flex-1 flex flex-col md:flex-row justify-between w-full h-full min-w-0 gap-6">

        {/* MIDDLE SECTION (HOSTEL DETAILS) */}
        <div className="flex-1 min-w-0 flex flex-col pt-1">
          <div className="flex flex-col mb-4">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <h2 className="text-[20px] md:text-[22px] font-bold text-slate-900 leading-tight">
                {name}
              </h2>
              {isVerified && (
                <div className="flex items-center gap-1 bg-blue-50 text-blue-600 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider border border-blue-100">
                  <CheckCircle className="w-2.5 h-2.5" />
                  Verified
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] xs:text-[11px] font-bold px-1.5 py-0.5 xs:px-2 xs:py-1 rounded uppercase tracking-wider border border-blue-100 shadow-sm whitespace-nowrap">
                <Building2 className="w-3 h-3" />
                {gender.replace('_', ' ')}
              </div>
              <div className="flex items-center gap-1 bg-orange-50 text-orange-700 text-[10px] xs:text-[11px] font-bold px-1.5 py-0.5 xs:px-2 xs:py-1 rounded uppercase tracking-wider border border-orange-100 shadow-sm">
                <MapPin className="w-3 h-3 shrink-0" />
                <span className="xs:max-w-none">{location}</span>
              </div>
            </div>
          </div>

          {isFeatured && (
            <div className="mb-4">
              <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                Popular Choice
              </span>
            </div>
          )}

          <div className="mt-auto flex items-center gap-3 pt-4">
            <div className="w-[38px] h-[38px] bg-[#1e40af] text-white rounded-[8px] flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
              {rating.toFixed(1)}
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-sm font-bold text-slate-900 leading-none mb-1">
                {getRatingText(rating)}
              </span>
              <span className="text-[12px] text-slate-500 leading-none">
                {reviewsCount?.toLocaleString() || "0"} reviews
              </span>
            </div>
          </div>
        </div>

        {/* PRICE + ACTION SECTION (RIGHT ALIGNED) */}
        <div className="flex flex-col items-start md:items-end justify-between md:text-right md:border-l md:border-gray-100 md:pl-6 min-w-[160px] gap-4">
          <div className="space-y-1">
            <div className="flex flex-col gap-0.5">
              {isDiscounted && originalPrice && (
                <div className="flex items-center gap-2 md:justify-end mb-1">
                  <span className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                  {discountPercentage && (
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      {discountPercentage}% OFF
                    </span>
                  )}
                </div>
              )}
              <span className="text-lg font-semibold text-slate-700">
                From ₹{price.toLocaleString()} / month
              </span>
            </div>
            {availableRooms !== undefined && (
              <span className="text-sm text-gray-500 block">
                {availableRooms} {availableRooms === 1 ? 'room' : 'rooms'} left
              </span>
            )}
          </div>

          <Link
            href={`/hostels/${slug}`}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition text-center shadow-sm active:scale-[0.98]"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
