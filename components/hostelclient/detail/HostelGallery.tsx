"use client";

import Image from "next/image";
import { useState, useCallback, useEffect } from "react";
import { LayoutGrid, X, ChevronLeft, ChevronRight, Share2, Heart } from "lucide-react";
import { isExternalImage } from "@/lib/utils";

interface HostelGalleryProps {
    images: { src: string; alt: string }[];
    hostelName: string;
    ratingAvg?: number;
    ratingCount?: number;
    areaName?: string;
    cityName?: string;
    isTopRated?: boolean | null;
    isFeatured?: boolean | null;
}

export default function HostelGallery({
    images,
    hostelName,
    ratingAvg = 0,
    ratingCount = 0,
    areaName,
    cityName,
    isTopRated,
    isFeatured
}: HostelGalleryProps) {
    const [activeImg, setActiveImg] = useState(0);
    const [showGallery, setShowGallery] = useState(false);
    const [saved, setSaved] = useState(false);

    // Keyboard navigation for gallery modal
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!showGallery) return;
        if (e.key === "Escape") setShowGallery(false);
    }, [showGallery]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Touch swipe for mobile
    const [touchStart, setTouchStart] = useState<number | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (touchStart === null) return;
        const diff = touchStart - e.changedTouches[0].clientX;
        if (Math.abs(diff) > 50) {
            if (diff > 0) {
                setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0));
            } else {
                setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1));
            }
        }
        setTouchStart(null);
    };

    return (
        <div className="gallery-section">
            {/* ─── Desktop Hero Grid ─── */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-[6px] h-[480px] lg:h-[520px] rounded-2xl overflow-hidden relative">

                {/* Main Full-Height Left Image */}
                <div
                    className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden group/main"
                    onClick={() => setShowGallery(true)}
                >
                    <Image
                        src={images[0]?.src || "/images/hero1.webp"}
                        alt={images[0]?.alt || hostelName}
                        fill
                        className="object-cover group-hover/main:scale-[1.03] transition-transform duration-700 ease-out"
                        priority
                        sizes="(max-width: 1200px) 50vw, 600px"
                        unoptimized={isExternalImage(images[0]?.src)}
                    />
                    <div className="absolute inset-0 bg-black/[0.03] group-hover/main:bg-black/[0.08] transition-colors duration-300" />
                </div>

                {/* Right Side 4 smaller images */}
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="col-span-1 row-span-1 relative cursor-pointer overflow-hidden group/thumb"
                        onClick={() => setShowGallery(true)}
                    >
                        <Image
                            src={images[i]?.src || images[0]?.src || "/images/hero1.webp"}
                            alt={images[i]?.alt || hostelName}
                            fill
                            className="object-cover group-hover/thumb:scale-110 transition-transform duration-500 ease-out"
                            sizes="(max-width: 1200px) 25vw, 300px"
                            unoptimized={isExternalImage(images[i]?.src || images[0]?.src)}
                        />
                        <div className="absolute inset-0 bg-black/[0.03] group-hover/thumb:bg-black/[0.08] transition-colors duration-300" />

                        {/* "View all photos" overlay on last image */}
                        {i === 4 && images.length > 5 && (
                            <div className="absolute inset-0 bg-black/40 flex items-end justify-end p-4 pointer-events-none">
                                <span className="flex items-center gap-2 bg-white/95 backdrop-blur-sm text-gray-900 text-xs font-semibold px-4 py-2 rounded-lg shadow-md">
                                    <LayoutGrid size={14} />
                                    View all photos
                                </span>
                            </div>
                        )}
                    </div>
                ))}

                {/* Top Right Actions */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                    <button
                        className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:shadow-lg hover:scale-105 active:scale-95 text-gray-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.share?.({
                                title: hostelName,
                                url: typeof window !== "undefined" ? window.location.href : "",
                            });
                        }}
                    >
                        <Share2 size={15} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSaved(!saved);
                        }}
                        className="w-9 h-9 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:shadow-lg hover:scale-105 active:scale-95 text-gray-700"
                    >
                        <Heart
                            size={15}
                            className={saved ? "fill-red-500 text-red-500 transition-colors" : "transition-colors"}
                        />
                    </button>
                </div>
            </div>

            {/* ─── Mobile Swipe Gallery ─── */}
            <div
                className="md:hidden relative aspect-[4/3] rounded-xl overflow-hidden shadow-sm -mx-1"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                {images.length > 0 ? (
                    <Image
                        src={images[activeImg].src}
                        alt={images[activeImg].alt}
                        fill
                        className="object-cover transition-opacity duration-300"
                        priority
                        sizes="100vw"
                        unoptimized={isExternalImage(images[activeImg]?.src)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400">
                        No images
                    </div>
                )}

                {/* Mobile Top Right Actions */}
                <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                    <button
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-700"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.share?.({
                                title: hostelName,
                                url: typeof window !== "undefined" ? window.location.href : "",
                            });
                        }}
                    >
                        <Share2 size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSaved(!saved);
                        }}
                        className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-gray-700"
                    >
                        <Heart
                            size={14}
                            className={saved ? "fill-red-500 text-red-500" : ""}
                        />
                    </button>
                </div>

                {/* Mobile Arrows */}
                {images.length > 1 && (
                    <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex items-center justify-between px-2 pointer-events-none z-20">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                            }}
                            className="w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-700 pointer-events-auto active:scale-90 transition-all"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                            }}
                            className="w-8 h-8 rounded-full bg-white/90 shadow-sm flex items-center justify-center text-gray-700 pointer-events-auto active:scale-90 transition-all"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>
                )}

                {/* Dot indicators */}
                {images.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20">
                        {images.slice(0, Math.min(images.length, 7)).map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImg(idx)}
                                className={`rounded-full transition-all duration-300 ${
                                    idx === activeImg
                                        ? "w-6 h-2 bg-white"
                                        : "w-2 h-2 bg-white/50"
                                }`}
                            />
                        ))}
                        {images.length > 7 && (
                            <span className="text-[9px] text-white/70 font-medium ml-1">+{images.length - 7}</span>
                        )}
                    </div>
                )}
            </div>

            {/* ─── Full-screen Gallery Modal ─── */}
            {showGallery && (
                <div className="fixed inset-0 z-[9999] bg-white flex flex-col animate-in fade-in duration-200">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                        <button
                            onClick={() => setShowGallery(false)}
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <span className="text-sm font-semibold text-gray-800">
                            {images.length} Photos
                        </span>
                        <div className="w-10" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 pb-24 bg-gray-50/50 scroll-smooth">
                        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative w-full aspect-[3/2] rounded-xl overflow-hidden bg-gray-100 transition-transform hover:scale-[1.01] hover:shadow-md cursor-pointer">
                                    <Image
                                        src={img.src}
                                        alt={img.alt}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                        unoptimized={isExternalImage(img.src)}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
