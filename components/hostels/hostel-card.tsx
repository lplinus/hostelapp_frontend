"use client";

import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  Heart,
  Building2,
  MapPin
} from "lucide-react";
import { isExternalImage } from "@/lib/utils";

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
  distance,
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

  if (layout === "grid") {
    return (
      <div className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#0F172A]/5 transition-all duration-500 hover:-translate-y-1 border border-slate-200/60 flex flex-col h-full">
        {/* IMAGE BOX */}
        <Link href={`/hostels/${slug}`} className="relative block h-56 overflow-hidden shrink-0">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-110"
              unoptimized={isExternalImage(image)}
            />
          ) : (
            <div className="w-full h-full bg-[#F8FAFC] flex items-center justify-center">
              <Building2 className="w-12 h-12 text-slate-200" />
            </div>
          )}

          {/* BADGES */}
          <div className="absolute top-4 left-4 flex flex-col gap-2">
            {isVerified && (
              <div className="bg-white/95 backdrop-blur-md text-[#8B5CF6] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1.5 border border-[#8B5CF6]/10">
                <CheckCircle className="w-3 h-3" />
                Verified
              </div>
            )}
            {isFeatured && (
              <div className="bg-[#0F172A]/80 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm border border-white/10">
                Popular
              </div>
            )}
          </div>

          <button
            className="absolute top-4 right-4 bg-white/95 backdrop-blur-md hover:bg-[#0F172A] text-[#0F172A] hover:text-white rounded-full p-2.5 shadow-sm transition-all duration-300 group-hover:scale-110"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
          >
            <Heart className="w-4 h-4" />
          </button>
        </Link>

        {/* CONTENT */}
        <div className="p-6 flex flex-col flex-1">
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1.5 bg-[#F5F3FF] text-[#7C3AED] text-[10px] font-bold px-3 py-1.5 rounded-full border border-[#DDD6FE]/50 shadow-[0_2px_10px_rgba(124,58,237,0.05)] uppercase tracking-tight">
              <Building2 className="w-3 h-3 transition-transform group-hover:scale-110" />
              {gender.replace('_', ' ')}
            </div>
            {isDiscounted && discountPercentage && (
              <div className="bg-red-50 text-red-600 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase border border-red-100/50">
                {discountPercentage}% OFF
              </div>
            )}
          </div>

          <Link href={`/hostels/${slug}`} className="block mb-2 group/title">
            <h2 className="text-xl font-bold text-[#0F172A] leading-tight group-hover/title:text-[#8B5CF6] transition-colors">
              {name}
            </h2>
          </Link>

          <div className="flex items-center gap-1.5 text-sm text-[#64748B] mb-6 line-clamp-1">
            <MapPin className="w-4 h-4 shrink-0" />
            {location}
          </div>

          <div className="mt-auto space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                {isDiscounted && originalPrice && (
                  <span className="text-xs text-slate-400 line-through mb-0.5">₹{originalPrice.toLocaleString()}</span>
                )}
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-bold text-[#0F172A]">₹{price.toLocaleString()}</span>
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">/ Mo</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex flex-col items-end">
                  {/* <span className="text-[11px] font-bold text-[#0F172A] leading-none mb-0.5">{getRatingText(rating)}</span> */}
                  {/* <span className="text-[10px] text-[#64748B] leading-none font-bold italic tracking-tight">({reviewsCount || 0}) Reviews</span> */}
                </div>
                <div className="w-10 h-10 bg-[#0F172A] text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-sm group-hover:bg-[#8B5CF6] transition-colors">
                  {rating.toFixed(1)}
                </div>
              </div>
            </div>

            <Link
              href={`/hostels/${slug}`}
              className="w-full bg-[#0F172A] hover:bg-[#8B5CF6] text-white py-4 rounded-2xl font-bold transition-all shadow-xl shadow-[#0F172A]/10 hover:shadow-[#8B5CF6]/20 text-center text-[15px] group-hover:scale-[1.02] active:scale-95 block"
            >
              View Property
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // LIST LAYOUT
  return (
    <div className="group bg-white rounded-[2rem] p-4 sm:p-5 flex flex-col md:flex-row gap-6 md:gap-8 items-stretch shadow-sm hover:shadow-2xl hover:shadow-[#0F172A]/5 transition-all duration-500 border border-slate-200/60 w-full">

      {/* LEFT SECTION (IMAGE) */}
      <Link href={`/hostels/${slug}`} className="relative w-full md:w-72 h-52 md:h-auto rounded-[1.5rem] overflow-hidden shrink-0 shadow-inner group/img block">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 group-hover/img:scale-110"
            unoptimized={isExternalImage(image)}
          />
        ) : (
          <div className="w-full h-full bg-[#F8FAFC] flex items-center justify-center font-bold">
            <Building2 className="w-14 h-14 text-slate-200" />
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {isVerified && (
            <div className="bg-white/95 backdrop-blur-md text-[#8B5CF6] text-[10px] font-bold px-3 py-1.5 rounded-full uppercase border border-[#8B5CF6]/10 shadow-sm flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Verified
            </div>
          )}
        </div>

        <button
          className="absolute top-4 right-4 bg-white/95 backdrop-blur-md hover:bg-[#0F172A] text-[#0F172A] hover:text-white rounded-full p-2.5 shadow-sm transition-all duration-300 hover:scale-110 z-10"
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
        >
          <Heart className="w-4 h-4" />
        </button>
      </Link>

      {/* RIGHT SIDE CONTAINER */}
      <div className="flex-1 flex flex-col justify-between py-2">

        <div>
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-[#F5F3FF] text-[#7C3AED] text-[10px] font-bold px-4 py-2 rounded-full border border-[#DDD6FE]/50 shadow-[0_2px_10px_rgba(124,58,237,0.05)] uppercase tracking-wide flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full bg-[#7C3AED]" />
                  {gender.replace('_', ' ')}
                </div>
                {isFeatured && (
                  <div className="bg-[#0F172A] text-white text-[10px] font-bold px-3 py-1.5 rounded-full uppercase border border-slate-100">
                    Hostel Hub Choice
                  </div>
                )}
              </div>

              <Link href={`/hostels/${slug}`} className="block group/title">
                <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] leading-tight group-hover/title:text-[#8B5CF6] transition-colors">
                  {name}
                </h2>
              </Link>

              <div className="flex items-center gap-2 text-sm text-[#64748B] font-medium">
                <MapPin className="w-4 h-4 text-[#8B5CF6]" />
                {location}
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-slate-50 self-start">
              <div className="w-12 h-12 bg-[#0F172A] text-white rounded-xl flex items-center justify-center font-bold text-lg shadow-sm">
                {rating.toFixed(1)}
              </div>
              <div className="flex flex-col">
                {/* <span className="text-[13px] font-bold text-[#0F172A] leading-tight">
                  {getRatingText(rating)}
                </span> */}
                {/* <span className="text-[12px] font-black text-[#64748B] tracking-tight">
                  ({reviewsCount || 0}) Reviews
                </span> */}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {features.map((feature) => (
              <span key={feature} className="text-[11px] font-bold text-[#64748B] bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                {feature}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-t border-slate-50 pt-6">
          <div className="flex flex-col min-w-0">
            <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.1em] mb-2">Price starts from</span>
            <div className="flex items-center flex-nowrap gap-2 whitespace-nowrap">
              <span className="text-2xl font-bold text-[#0F172A]">₹{price.toLocaleString()}</span>
              {isDiscounted && originalPrice && (
                <div className="flex items-center flex-nowrap gap-2">
                  <span className="text-sm text-slate-400 line-through">₹{originalPrice.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-white bg-red-600 px-3 py-1.5 rounded-full shadow-sm">
                    {discountPercentage}% OFF
                  </span>
                </div>
              )}
            </div>
            <span className="text-[11px] font-bold text-[#64748B] mt-2">Inclusive of all local taxes</span>
          </div>

          <Link
            href={`/hostels/${slug}`}
            className="bg-[#0F172A] hover:bg-[#8B5CF6] text-white px-8 py-4 rounded-2xl font-bold transition-all shadow-xl shadow-[#0F172A]/10 hover:shadow-[#8B5CF6]/20 text-center hover:-translate-y-1 active:scale-95 whitespace-nowrap shrink-0 sm:mt-0 mt-4"
          >
            Explore Selection
          </Link>
        </div>
      </div>
    </div>
  );
}
