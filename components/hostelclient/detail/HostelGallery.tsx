"use client";

import Image from "next/image";
import { useState } from "react";
import { LayoutGrid, X, ChevronLeft, ChevronRight, Star, ShieldCheck, Share2, Heart } from "lucide-react";
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

    return (
        <div className="mb-0 md:mb-8 relative group">
            {/* Desktop Hero Grid */}
            <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[560px] rounded-[2rem] overflow-hidden shadow-sm relative relative-overlay">
                
                {/* Main Full-Height Left Image */}
                <div 
                    className="col-span-2 row-span-2 relative cursor-pointer overflow-hidden group/main"
                    onClick={() => setShowGallery(true)}
                >
                    <Image
                        src={images[0]?.src || "/images/hero1.webp"}
                        alt={images[0]?.alt || hostelName}
                        fill
                        className="object-cover group-hover/main:scale-105 transition-transform duration-700 ease-out"
                        priority
                        sizes="(max-width: 1200px) 50vw, 800px"
                        unoptimized={isExternalImage(images[0]?.src)}
                    />
                    {/* Gradient overlay for text visibility */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent pointer-events-none" />
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
                            className="object-cover group-hover/thumb:scale-110 transition-transform duration-700 ease-out"
                            sizes="(max-width: 1200px) 25vw, 400px"
                            unoptimized={isExternalImage(images[i]?.src || images[0]?.src)}
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover/thumb:bg-transparent transition-colors duration-300 pointer-events-none" />
                    </div>
                ))}

                {/* Overlay Details (Name, Location, Badges) */}
                <div className="absolute bottom-8 left-8 pointer-events-none z-10 max-w-[50%]">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {isTopRated && (
                            <span className="backdrop-blur-md bg-white/20 border border-white/30 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                                <Star size={12} className="fill-amber-400 text-amber-400" />
                                Top Rated
                            </span>
                        )}
                        {isFeatured && (
                            <span className="backdrop-blur-md bg-blue-600/80 text-white border border-blue-400/50 px-3 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1.5">
                                <ShieldCheck size={12} />
                                Popular Choice
                            </span>
                        )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-2 drop-shadow-xl tracking-tight">
                        {hostelName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-4">
                        <div className="flex items-center gap-2.5 px-4 py-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] transition-all hover:scale-105 group/rating overflow-hidden relative">
                            <div className="absolute inset-0 bg-gradient-to-tr from-amber-400/20 to-transparent opacity-50 group-hover/rating:opacity-100 transition-opacity" />
                            <Star size={20} className="fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                            <span className="font-black text-white text-2xl leading-none tracking-tighter relative z-10">
                                {ratingAvg.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Top Right Action Buttons */}
                <div className="absolute top-6 right-6 flex items-center gap-3 z-20">
                    <button
                        className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-gray-800 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.share?.({
                                title: hostelName,
                                url: typeof window !== "undefined" ? window.location.href : "",
                            });
                        }}
                    >
                        <Share2 size={18} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSaved(!saved);
                        }}
                        className="w-11 h-11 rounded-full bg-white/90 backdrop-blur-md hover:bg-white text-gray-800 shadow-xl flex items-center justify-center transition-all hover:scale-105 active:scale-95"
                    >
                        <Heart
                            size={18}
                            className={saved ? "fill-red-500 text-red-500 transition-colors" : "transition-colors"}
                        />
                    </button>
                </div>

                <button
                    onClick={() => setShowGallery(true)}
                    className="absolute bottom-8 right-8 bg-white/90 backdrop-blur-md hover:bg-white text-slate-900 border border-white/20 px-5 py-2.5 rounded-2xl shadow-2xl font-bold text-sm flex items-center gap-2.5 transition-all active:scale-95 z-20 hover:scale-105"
                >
                    <LayoutGrid size={18} />
                    <span>View all photos</span>
                </button>
            </div>

            {/* Mobile View with swipe layout */}
            <div className="md:hidden relative aspect-[4/5] sm:aspect-[4/4] rounded-none sm:rounded-[2rem] -mx-5 sm:mx-0 overflow-hidden shadow-2xl">
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
                
                {/* Mobile Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-900/40 to-slate-900/20 pointer-events-none" />

                {/* Mobile Actions Overlay */}
                <div className="absolute top-4 right-4 flex items-center gap-2 z-20 pointer-events-auto">
                    <button
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all active:scale-90 shadow-lg"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigator.share?.({
                                title: hostelName,
                                url: typeof window !== "undefined" ? window.location.href : "",
                            });
                        }}
                    >
                        <Share2 size={16} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setSaved(!saved);
                        }}
                        className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center transition-all active:scale-90 shadow-lg"
                    >
                        <Heart
                            size={16}
                            className={saved ? "fill-red-500 text-red-500" : ""}
                        />
                    </button>
                </div>

                {/* Mobile Badges & Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6 pointer-events-none z-10 flex flex-col justify-end">
                    <div className="flex flex-wrap gap-2 mb-3">
                        {isTopRated && (
                            <span className="backdrop-blur-md bg-white/20 border border-white/30 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                                <Star size={10} className="fill-amber-400 text-amber-400" />
                                Top Rated
                            </span>
                        )}
                        {isFeatured && (
                            <span className="backdrop-blur-md bg-blue-600/80 text-white border border-blue-400/50 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-lg flex items-center gap-1">
                                <ShieldCheck size={10} />
                                Popular
                            </span>
                        )}
                    </div>
                    
                    <h1 className="text-3xl font-black text-white leading-tight mb-2 drop-shadow-xl">
                        {hostelName}
                    </h1>
                    
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-lg border border-white/30 rounded-2xl shadow-xl">
                            <Star size={16} className="fill-amber-400 text-amber-400" />
                            <span className="font-black text-white text-xl leading-none tracking-tighter">
                                {ratingAvg.toFixed(1)}
                            </span>
                        </div>
                    </div>
                </div>

                {images.length > 1 && (
                    <div className="absolute top-1/2 -translate-y-1/2 inset-x-0 flex items-center justify-between px-3 pointer-events-none z-20">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveImg((prev) => (prev > 0 ? prev - 1 : images.length - 1));
                            }}
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-xl pointer-events-auto active:scale-90 transition-all"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                setActiveImg((prev) => (prev < images.length - 1 ? prev + 1 : 0));
                            }}
                            className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center text-white shadow-xl pointer-events-auto active:scale-90 transition-all"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-md text-white text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full border border-white/20 shadow-md">
                    {activeImg + 1} / {images.length}
                </div>
            </div>

            {/* Gallery Full-screen Modal */}
            {showGallery && (
                <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col animate-in fade-in duration-300">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-10">
                        <button
                            onClick={() => setShowGallery(false)}
                            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md"
                        >
                            <X size={20} />
                        </button>
                        <div className="text-sm font-bold text-white/80 bg-white/10 px-4 py-1.5 rounded-full backdrop-blur-md">
                            {activeImg + 1} / {images.length}
                        </div>
                        <div className="w-10"></div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 md:p-12 pb-24 snap-y snap-mandatory bg-slate-950 scroll-smooth">
                        <div className="max-w-5xl mx-auto space-y-8 flex flex-col items-center">
                            {images.map((img, idx) => (
                                <div key={idx} className="relative w-full max-w-4xl aspect-[4/3] md:aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl bg-black/50 border border-white/10 snap-center">
                                    <Image
                                        src={img.src}
                                        alt={img.alt}
                                        fill
                                        className="object-contain"
                                        sizes="(max-width: 1200px) 100vw, 1000px"
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
