"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Sparkles, ChevronLeft, ChevronRight, MapPin, Star, ArrowRight, ShieldCheck } from "lucide-react";
import { getActiveSponsoredAds, trackAdImpression, trackAdClick } from "@/services/adsense.service";
import type { AdCampaignItem } from "@/types/adsense.types";
import { isExternalImage } from "@/lib/utils";

interface HotelAdBannerProps {
    readonly activeCity?: string;
    readonly onSponsoredLoaded?: (campaigns: AdCampaignItem[]) => void;
}

export default function HotelAdBanner({ activeCity, onSponsoredLoaded }: HotelAdBannerProps) {
    const [campaigns, setCampaigns] = useState<AdCampaignItem[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const trackedImpressions = useRef<Set<string | number>>(new Set());

    // ── Fetch dynamic active ads for Hotels filtered by city ────────────────
    useEffect(() => {
        let isMounted = true;
        const fetchAds = async () => {
            setIsLoading(true);
            try {
                const ads = await getActiveSponsoredAds({
                    property_type: "hotel",
                    city: activeCity?.trim() || undefined,
                    limit: 10,
                });
                if (!isMounted) return;
                setCampaigns(ads);
                setCurrentIndex(0);
                if (onSponsoredLoaded) {
                    onSponsoredLoaded(ads);
                }
            } catch (err) {
                console.error("[HotelAdBanner] Failed to fetch sponsored ads:", err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchAds();
        return () => {
            isMounted = false;
        };
    }, [activeCity, onSponsoredLoaded]);

    // ── Compulsory Auto-Change Rotation (every 5 seconds) ──────────────────
    useEffect(() => {
        if (campaigns.length <= 1 || isHovered) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % campaigns.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [campaigns.length, isHovered]);

    // ── Real-time Impression Tracking ──────────────────────────────────────
    const activeCampaign = campaigns[currentIndex];
    useEffect(() => {
        if (!activeCampaign) return;
        if (!trackedImpressions.current.has(activeCampaign.id)) {
            trackedImpressions.current.add(activeCampaign.id);
            trackAdImpression(activeCampaign.id).catch(() => {});
        }
    }, [activeCampaign]);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + campaigns.length) % campaigns.length);
    }, [campaigns.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % campaigns.length);
    }, [campaigns.length]);

    const handleClickAd = (campaign: AdCampaignItem) => {
        trackAdClick(campaign.id).catch(() => {});
    };

    if (isLoading) {
        return (
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-5 pb-1">
                <div className="w-full h-32 sm:h-36 md:h-44 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 animate-pulse border border-slate-200/80" />
            </div>
        );
    }

    if (!campaigns.length || !activeCampaign) {
        return null;
    }

    const currentSlug = activeCampaign.target_property_slug || activeCampaign.hotel;
    const targetUrl = activeCampaign.destination_url || (currentSlug ? `/home/hotels/${currentSlug}` : "#");
    const bannerImg = activeCampaign.banner_image_url || activeCampaign.property_image_url;
    const priceFormatted = activeCampaign.target_property_price
        ? `₹${Number(activeCampaign.target_property_price).toLocaleString("en-IN")}`
        : null;

    return (
        <section
            className="w-full max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            aria-label="Sponsored Hotel Promotions"
        >
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E1B4B] to-[#312E81] border border-indigo-950/40 shadow-md text-white group">
                {/* Background Artwork / Photo */}
                {bannerImg && (
                    <div className="absolute inset-0 z-0 opacity-40 mix-blend-overlay scale-105 group-hover:scale-100 transition-transform duration-700 ease-out">
                        <Image
                            src={bannerImg}
                            alt={activeCampaign.target_property_title || activeCampaign.campaign_name}
                            fill
                            priority
                            unoptimized={isExternalImage(bannerImg)}
                            className="object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0F172A] via-[#0F172A]/85 to-transparent" />
                    </div>
                )}

                {/* Content Container */}
                <div className="relative z-10 px-5 sm:px-8 py-4 sm:py-5 md:py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    {/* Left Details */}
                    <div className="space-y-1.5 max-w-2xl">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 shadow-xs">
                                <Sparkles size={11} className="text-slate-950" /> Featured Hotel Partner
                            </span>
                            {activeCampaign.target_property_city && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-300 bg-white/10 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/10">
                                    <MapPin size={10} className="text-amber-400" />
                                    {activeCampaign.target_property_city}
                                </span>
                            )}
                            {activeCampaign.target_property_rating && (
                                <span className="inline-flex items-center gap-1 text-[11px] text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                    <Star size={10} className="fill-amber-400 text-amber-400" />
                                    {activeCampaign.target_property_rating.toFixed(1)}
                                </span>
                            )}
                        </div>

                        <h3 className="text-base sm:text-lg md:text-xl font-extrabold tracking-tight text-white line-clamp-1">
                            {activeCampaign.target_property_title || activeCampaign.campaign_name}
                        </h3>

                        <p className="text-xs text-slate-300 line-clamp-1 flex items-center gap-2">
                            <span>{activeCampaign.target_property_address || "Exclusive verified stay with premium amenities & prime location."}</span>
                            {priceFormatted && (
                                <span className="text-white font-semibold">
                                    Starts at <span className="text-amber-400 font-bold">{priceFormatted}</span>/night
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Right Action */}
                    <div className="shrink-0 flex items-center gap-3 w-full sm:w-auto justify-between md:justify-end pt-1 md:pt-0">
                        <Link
                            href={targetUrl}
                            onClick={() => handleClickAd(activeCampaign)}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-95 transition-all shadow-md cursor-pointer"
                        >
                            <span>Explore Stays</span>
                            <ArrowRight size={13} />
                        </Link>
                    </div>
                </div>

                {/* Carousel Controls (when multiple campaigns exist) */}
                {campaigns.length > 1 && (
                    <>
                        <button
                            type="button"
                            onClick={handlePrev}
                            aria-label="Previous promotional slide"
                            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <button
                            type="button"
                            onClick={handleNext}
                            aria-label="Next promotional slide"
                            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                            <ChevronRight size={14} />
                        </button>

                        {/* Dot indicator pills */}
                        <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1">
                            {campaigns.map((c, i) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setCurrentIndex(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                    className={`h-1 rounded-full transition-all cursor-pointer ${
                                        i === currentIndex ? "w-5 bg-amber-400" : "w-1.5 bg-white/40 hover:bg-white/70"
                                    }`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
