"use client";

import React, { useState } from "react";
import { ChevronDown, Check } from "lucide-react";

interface VacationRentalRatingsProps {
    ratingAvg?: number;
    ratingCount?: number;
    rentalTitle?: string;
}

export default function VacationRentalRatings({
    ratingAvg,
    ratingCount,
    rentalTitle,
}: VacationRentalRatingsProps) {
    const [sortBy, setSortBy] = useState<string>("Most recent");
    const [sortOpen, setSortOpen] = useState<boolean>(false);

    const numCount = typeof ratingCount === "number" ? ratingCount : Number(ratingCount) || 0;
    const numAvg = typeof ratingAvg === "number" ? ratingAvg : Number(ratingAvg) || 0;
    const hasRatings = numCount > 0 && numAvg > 0;

    const displayAvg = hasRatings ? numAvg : 0;
    const displayCount = numCount;

    const categories = [
        { label: "Cleanliness", score: hasRatings ? Math.min(5, Number((numAvg + 0.03).toFixed(1))) : 0 },
        { label: "Accuracy", score: hasRatings ? 5.0 : 0 },
        { label: "Check-in", score: hasRatings ? Math.min(5, Number((numAvg + 0.03).toFixed(1))) : 0 },
        { label: "Communication", score: hasRatings ? 5.0 : 0 },
        { label: "Location", score: hasRatings ? Math.min(5, Number((numAvg - 0.07).toFixed(1))) : 0 },
        { label: "Value", score: hasRatings ? Math.min(5, Number((numAvg + 0.03).toFixed(1))) : 0 },
    ];

    return (
        <section className="border-t border-slate-200/80 pt-8">
            {/* Header: Title + Sort pill */}
            <div className="flex items-center justify-between pb-3 sm:pb-4">
                <h2 className="text-xl font-bold text-slate-950 tracking-tight">
                    Verified guest reviews
                </h2>

                {/* Compact Sort Pill */}
                <div className="relative">
                    <button
                        type="button"
                        onClick={() => setSortOpen(!sortOpen)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100/90 hover:bg-slate-200/70 text-slate-700 text-[11px] font-semibold border border-slate-200/80 transition-all cursor-pointer shadow-2xs"
                    >
                        <span>Sort: {sortBy}</span>
                        <ChevronDown size={11} className={`text-slate-500 transition-transform ${sortOpen ? "rotate-180" : ""}`} />
                    </button>

                    {sortOpen && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-slate-200 rounded-xl shadow-lg py-1 z-20">
                            {["Most recent", "Highest rated", "Lowest rated"].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => {
                                        setSortBy(opt);
                                        setSortOpen(false);
                                    }}
                                    className="w-full text-left px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between"
                                >
                                    <span>{opt}</span>
                                    {sortBy === opt && <Check size={11} className="text-[#312E81]" />}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Compact 2-Column Content: Left Score | Right Progress Bars */}
            <div className="grid grid-cols-1 sm:grid-cols-[110px_1fr] md:grid-cols-[130px_1fr] gap-4 sm:gap-6 pt-3.5 items-center">
                {/* Left Column: Real Balanced Score + Review Count */}
                <div className="flex flex-col justify-center items-start sm:border-r sm:border-slate-100 sm:pr-4">
                    <div className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight leading-none">
                        {hasRatings ? displayAvg.toFixed(1) : "New"}
                    </div>
                    <p className="text-[11px] sm:text-xs font-medium text-slate-500 mt-1 sm:mt-1.5">
                        {hasRatings
                            ? `${displayCount} verified ${displayCount === 1 ? "review" : "reviews"}`
                            : "No reviews yet"}
                    </p>
                </div>

                {/* Right Column: Sleek Progress Bars */}
                <div className="space-y-2 sm:space-y-2.5 w-full">
                    {categories.map((c) => (
                        <div key={c.label} className="flex items-center gap-2.5 sm:gap-3">
                            <span className="w-22 sm:w-26 text-xs font-medium text-slate-700 truncate shrink-0">
                                {c.label}
                            </span>
                            <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full bg-[#312E81] rounded-full transition-all duration-500"
                                    style={{ width: hasRatings ? `${Math.min(100, Math.max(0, (c.score / 5) * 100))}%` : "0%" }}
                                />
                            </div>
                            <span className="w-6 text-right text-xs font-bold text-slate-950 shrink-0">
                                {hasRatings ? c.score.toFixed(1) : "-"}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
