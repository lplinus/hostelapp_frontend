"use client";

import React, { useRef, useState, useEffect } from "react";
import { Star, ShieldCheck, ChevronRight, ChevronLeft, MessageSquare } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export interface VacationRentalReviewItem {
    id: number | string;
    user_name?: string;
    rating: number;
    comment: string;
    created_at: string;
}

interface VacationRentalReviewsProps {
    rentalId: string;
    rentalTitle: string;
    ratingAvg?: number;
    ratingCount?: number;
    reviews?: VacationRentalReviewItem[];
}

export default function VacationRentalReviews({
    rentalId,
    rentalTitle,
    ratingAvg,
    ratingCount,
    reviews,
}: VacationRentalReviewsProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const realReviews = Array.isArray(reviews) ? reviews : [];
    const reviewsToShow = realReviews;
    const displayCount = realReviews.length || (Number(ratingCount) || 0);

    const checkScrollButtons = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        checkScrollButtons();
    }, [reviewsToShow]);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = Math.min(340, scrollContainerRef.current.clientWidth * 0.85);
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
            setTimeout(checkScrollButtons, 350);
        }
    };

    return (
        <section className="space-y-4 pt-6 border-t border-slate-100">
            {/* Scoped CSS to completely remove browser scrollbars */}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                }
                .no-scrollbar {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                }
            `}</style>

            {/* Responsive Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={17} className="text-[#312E81] shrink-0" />
                        <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                            What Guests Say
                        </h2>
                    </div>
                    <p className="text-xs text-slate-500 truncate sm:whitespace-normal">
                        Authentic guest feedback from confirmed stays at {rentalTitle}.
                    </p>
                </div>

                {reviewsToShow.length > 0 && (
                    <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0 pt-1 sm:pt-0">
                        <Dialog>
                            <DialogTrigger asChild>
                                <button
                                    type="button"
                                    className="text-xs font-bold text-[#312E81] hover:text-[#1E1B4B] flex items-center gap-0.5 transition-colors cursor-pointer"
                                >
                                    View all ({displayCount})
                                    <ChevronRight size={14} />
                                </button>
                            </DialogTrigger>
                            <DialogContent className="max-w-xl rounded-2xl p-5 sm:p-6 max-h-[85vh] overflow-y-auto w-[94%] border-0 shadow-2xl">
                                <DialogHeader className="mb-4">
                                    <DialogTitle className="text-base sm:text-lg font-bold text-slate-950">
                                        All Guest Reviews for {rentalTitle}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-slate-500">
                                        Verified guest reviews from completed stays.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-3">
                                    {reviewsToShow.map((rev) => (
                                        <div key={rev.id} className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2.5">
                                                    <div className="w-8 h-8 rounded-full bg-indigo-100/80 text-[#312E81] font-bold text-xs flex items-center justify-center shrink-0">
                                                        {rev.user_name?.charAt(0)?.toUpperCase() || "G"}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-slate-950 text-xs flex items-center gap-1">
                                                            {rev.user_name || "Verified Guest"}
                                                            <ShieldCheck size={13} className="text-emerald-600" />
                                                        </p>
                                                        <span className="text-[10px] text-slate-500">
                                                            {new Date(rev.created_at).toLocaleDateString("en-IN", {
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200/80">
                                                    <Star size={12} className="fill-amber-400 text-amber-400" />
                                                    <span>{typeof rev.rating === "number" ? rev.rating.toFixed(1) : rev.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-slate-800 leading-relaxed font-normal">
                                                "{rev.comment}"
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Compact Arrow Buttons */}
                        <div className="flex items-center gap-1 pl-2 border-l border-slate-200">
                            <button
                                type="button"
                                onClick={() => scroll("left")}
                                disabled={!canScrollLeft}
                                aria-label="Scroll reviews left"
                                className="w-6 h-6 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs"
                            >
                                <ChevronLeft size={13} />
                            </button>
                            <button
                                type="button"
                                onClick={() => scroll("right")}
                                disabled={!canScrollRight}
                                aria-label="Scroll reviews right"
                                className="w-6 h-6 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs"
                            >
                                <ChevronRight size={13} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Content: Real Reviews Carousel or Empty State */}
            {reviewsToShow.length === 0 ? (
                <div className="py-7 px-4 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800">No verified reviews yet</p>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Be the first verified guest to share a review after your vacation stay at {rentalTitle}.
                    </p>
                </div>
            ) : (
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScrollButtons}
                    className="flex overflow-x-auto gap-3 pb-1 scroll-smooth snap-x snap-mandatory no-scrollbar [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {reviewsToShow.map((rev) => (
                        <div
                            key={rev.id}
                            className="p-3.5 sm:p-4 rounded-xl border border-slate-200/90 bg-white space-y-2.5 snap-start w-[80vw] xs:w-[280px] sm:w-[320px] max-w-[340px] shrink-0 shadow-2xs hover:border-slate-300 transition-colors"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 border border-indigo-200/60 text-[#312E81] font-bold text-xs flex items-center justify-center shrink-0">
                                        {rev.user_name?.charAt(0)?.toUpperCase() || "G"}
                                    </div>
                                    <div className="truncate">
                                        <p className="font-bold text-slate-950 text-xs flex items-center gap-1 truncate">
                                            <span className="truncate">{rev.user_name || "Verified Guest"}</span>
                                            <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
                                        </p>
                                        <span className="text-[10px] text-slate-500 font-medium block">
                                            {new Date(rev.created_at).toLocaleDateString("en-IN", {
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-1 text-[11px] font-bold text-slate-900 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 shrink-0">
                                    <Star size={11} className="fill-amber-400 text-amber-400" />
                                    <span>{typeof rev.rating === "number" ? rev.rating.toFixed(1) : rev.rating}</span>
                                </div>
                            </div>

                            <p className="text-xs text-slate-800 leading-relaxed font-normal line-clamp-3">
                                "{rev.comment}"
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}
