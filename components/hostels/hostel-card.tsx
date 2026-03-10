"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Star,
  MapPin,
  Heart,
  Share2,
  Building2,
} from "lucide-react";

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
  readonly distance: string;
  readonly isFeatured?: boolean;
  readonly isVerified?: boolean;
  readonly isApproved?: boolean;
  readonly isTopRated?: boolean;
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
}: HostelCardProps) {
  return (
    <Link href={`/hostels/${slug}`} className="block h-full">
      <div className="h-full flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-xl transition-all duration-300 group">
        {/* Image Section — fixed height */}
        <div className="relative h-44 w-full shrink-0 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 flex flex-col items-center justify-center gap-2">
              <Building2 className="w-12 h-12 text-blue-300" />
              <span className="text-sm text-gray-400 font-medium">
                No image available
              </span>
            </div>
          )}

          {/* Top Left Badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {isDiscounted && discountPercentage && (
              <Badge className="bg-red-500 text-white text-xs px-2 py-0.5 shadow-sm">
                {Math.round(discountPercentage)}% OFF
              </Badge>
            )}
            {isFeatured && (
              <Badge className="bg-orange-500 text-white text-xs px-2 py-0.5 shadow-sm">
                ⭐ Featured
              </Badge>
            )}

            {isTopRated && (
              <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white text-xs px-2 py-0.5 shadow-sm">
                🏆 Top Rated
              </Badge>
            )}

            {isVerified && (
              <Badge className="bg-white text-gray-800 border text-xs px-2 py-0.5 shadow-sm">
                ✔ Verified
              </Badge>
            )}


          </div>

          {/* Top Right Icons */}
          <div className="absolute top-3 right-3 flex gap-1.5">
            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow cursor-pointer hover:scale-110 transition">
              <Heart className="w-4 h-4 text-gray-600" />
            </div>

            <div className="bg-white/90 backdrop-blur-sm rounded-full p-1.5 shadow cursor-pointer hover:scale-110 transition">
              <Share2 className="w-4 h-4 text-gray-600" />
            </div>
          </div>

          {/* Price Badge */}
          <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-md">
            {isDiscounted && originalPrice ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-xs text-gray-400 line-through">
                  ₹{originalPrice.toLocaleString()}
                </span>
                <span className="text-base font-bold text-green-600">
                  ₹{price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500"> /mo</span>
              </div>
            ) : (
              <>
                <span className="text-base font-bold text-gray-900">
                  ₹{price.toLocaleString()}
                </span>
                <span className="text-xs text-gray-500"> /mo</span>
              </>
            )}
          </div>
        </div>

        {/* Content — flex-1 so it stretches to fill remaining height */}
        <div className="flex flex-col flex-1 px-3.5 pt-3 pb-3 gap-2">
          {/* Title — clamped to 1 line */}
          <h3 className="text-sm font-semibold leading-snug text-gray-900 line-clamp-1">
            {name}
          </h3>

          {/* Location + Rating */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 text-gray-500 min-w-0 flex-1 mr-2">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate">{location}</span>
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
              <span className="font-semibold text-gray-800">{rating}</span>
              <span className="text-gray-400 text-xs">
                ({reviewsCount})
              </span>
            </div>
          </div>

          {/* Feature Chips — fixed min-height for alignment */}
          <div className="flex flex-wrap gap-1 min-h-[26px]">
            <Badge variant="secondary" className="rounded-full text-[11px] px-2 py-0.5">
              {gender === "boys" ? "Boys"
                : gender === "girls" ? "Girls"
                  : gender === "co_living" ? "Co-Living"
                    : gender === "working_professional" ? "Working Pro"
                      : gender === "student" ? "Student"
                        : gender === "luxury" ? "Luxury"
                          : gender === "budget" ? "Budget"
                            : gender === "pg" ? "PG"
                              : "Coed"}
            </Badge>

            {features.map((feature, index) => (
              <Badge
                key={index}
                variant="outline"
                className="rounded-full text-[11px] px-2 py-0.5"
              >
                {feature}
              </Badge>
            ))}

            {distance && (
              <Badge variant="outline" className="rounded-full text-[11px] px-2 py-0.5">
                {distance}
              </Badge>
            )}
          </div>

          {/* Button — pushed to the bottom */}
          <div className="mt-auto pt-1">
            <Button className="w-full h-9 text-sm rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200">
              View Details
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}
