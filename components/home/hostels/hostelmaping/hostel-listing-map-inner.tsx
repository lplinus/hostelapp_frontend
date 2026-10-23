"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import Image from "next/image";
import { Star, MapPin, ExternalLink, Search } from "lucide-react";
import { CityHostel } from "@/types/hostel.types";
import { toLocalMediaPath } from "@/lib/utils";
import { CITY_COORDINATES, getHostelCoordinates } from "./hostel-coordinates";

// Controller component to auto-fit map bounds dynamically (Airbnb style)
function AutoFitBounds({
    bounds,
    center,
}: {
    bounds: L.LatLngBoundsExpression | null;
    center: [number, number];
}) {
    const map = useMap();
    const prevKey = useRef<string>("");

    useEffect(() => {
        map.invalidateSize();

        if (bounds && Array.isArray(bounds) && bounds.length > 0) {
            const serialized = JSON.stringify(bounds);
            if (prevKey.current !== serialized) {
                prevKey.current = serialized;
                if (bounds.length === 1) {
                    const single = bounds[0] as [number, number];
                    map.setView(single, 14, { animate: true });
                } else {
                    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: true });
                }
            }
        } else {
            const centerKey = `center-${center[0]}-${center[1]}`;
            if (prevKey.current !== centerKey) {
                prevKey.current = centerKey;
                map.setView(center, 12, { animate: true });
            }
        }
    }, [map, bounds, center]);

    return null;
}

// Controller component to smoothly pan map when hovering hostel cards in the list (Airbnb style)
function HoverController({
    hoveredHostelId,
    hostelPoints,
}: {
    hoveredHostelId?: number | string | null;
    hostelPoints: Array<{ hostel: CityHostel; coords: [number, number] }>;
}) {
    const map = useMap();

    useEffect(() => {
        if (!hoveredHostelId) return;
        const target = hostelPoints.find(
            (p) => String(p.hostel.id) === String(hoveredHostelId)
        );
        if (target) {
            const bounds = map.getBounds();
            if (!bounds.contains(target.coords)) {
                map.panTo(target.coords, { animate: true, duration: 0.35 });
            }
        }
    }, [hoveredHostelId, hostelPoints, map]);

    return null;
}

// Map event listener to track user panning/zooming to another place (Airbnb style)
function MapEventsHandler({
    onMapMoved,
}: {
    onMapMoved: (bounds: L.LatLngBounds) => void;
}) {
    useMapEvents({
        dragend: (e) => {
            onMapMoved(e.target.getBounds());
        },
        zoomend: (e) => {
            onMapMoved(e.target.getBounds());
        },
    });
    return null;
}

interface HostelListingMapInnerProps {
    readonly hostels: readonly CityHostel[];
    readonly allHostels?: readonly CityHostel[];
    readonly cityName: string;
    readonly hoveredHostelId?: number | string | null;
    readonly onMarkerClick?: (hostel: CityHostel) => void;
    readonly onSearchThisArea?: (bounds: L.LatLngBounds) => void;
}

export default function HostelListingMapInner({
    hostels,
    allHostels,
    cityName,
    hoveredHostelId,
    onMarkerClick,
    onSearchThisArea,
}: HostelListingMapInnerProps) {
    const [visibleBounds, setVisibleBounds] = useState<L.LatLngBounds | null>(null);
    const [hasMovedManually, setHasMovedManually] = useState(false);

    const handleMapMoved = useCallback((b: L.LatLngBounds) => {
        setVisibleBounds(b);
        setHasMovedManually(true);
    }, []);

    const defaultCenter = useMemo<[number, number]>(() => {
        const cityLower = cityName.toLowerCase().trim();
        return CITY_COORDINATES[cityLower] || [13.0827, 80.2707];
    }, [cityName]);

    const activeHostelIds = useMemo(() => {
        return new Set(hostels.map((h) => String(h.id)));
    }, [hostels]);

    // Use all available hostels in this city if provided, so moving around shows hostels in other areas
    const sourceHostels = useMemo(() => {
        if (allHostels && allHostels.length > 0) {
            return allHostels;
        }
        return hostels;
    }, [allHostels, hostels]);

    const hostelPoints = useMemo(() => {
        return sourceHostels.map((hostel) => ({
            hostel,
            coords: getHostelCoordinates(hostel, hostel.city_name || cityName),
            isActive: activeHostelIds.has(String(hostel.id)),
        }));
    }, [sourceHostels, cityName, activeHostelIds]);

    const bounds = useMemo<L.LatLngBoundsExpression | null>(() => {
        const targetHostels = hostelPoints.filter((p) => p.isActive);
        if (targetHostels.length > 0) {
            return targetHostels.map((p) => p.coords);
        }
        return null;
    }, [hostelPoints]);

    return (
        <div className="relative w-full h-full min-h-[500px]">
            {/* DNS Preconnect for fast free OpenStreetMap tile delivery */}
            <link rel="preconnect" href="https://a.tile.openstreetmap.org" crossOrigin="" />
            <link rel="preconnect" href="https://b.tile.openstreetmap.org" crossOrigin="" />
            <link rel="preconnect" href="https://c.tile.openstreetmap.org" crossOrigin="" />

            {/* Floating 'Search this area' pill when user moves the map (Airbnb style) */}
            {hasMovedManually && onSearchThisArea && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] animate-in fade-in slide-in-from-top-2 duration-200">
                    <button
                        type="button"
                        onClick={() => {
                            if (visibleBounds && onSearchThisArea) {
                                onSearchThisArea(visibleBounds);
                                setHasMovedManually(false);
                            }
                        }}
                        className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-900 px-4 py-2 rounded-full shadow-xl border border-slate-200 text-xs font-bold transition-all active:scale-95 hover:shadow-2xl"
                    >
                        <Search size={13} className="text-[#10B981]" />
                        <span>Search this area</span>
                    </button>
                </div>
            )}

            {/* Scoped CSS for Airbnb Price Badges & Popups */}
            <style jsx global>{`
                .airbnb-price-marker {
                    background: transparent;
                    border: none;
                }
                .airbnb-pill {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: #ffffff;
                    color: #0f172a;
                    font-family: inherit;
                    font-weight: 700;
                    font-size: 12px;
                    padding: 5px 10px;
                    border-radius: 9999px;
                    border: 1px solid #cbd5e1;
                    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.16);
                    white-space: nowrap;
                    cursor: pointer;
                    transition: transform 0.15s ease, background-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
                }
                .airbnb-pill:hover,
                .airbnb-pill.active {
                    background: #0f172a !important;
                    color: #ffffff !important;
                    border-color: #0f172a !important;
                    transform: scale(1.15) !important;
                    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.35) !important;
                    z-index: 9999 !important;
                }
                .leaflet-popup-content-wrapper {
                    padding: 0 !important;
                    border-radius: 16px !important;
                    overflow: hidden !important;
                    box-shadow: 0 12px 30px rgba(0,0,0,0.2) !important;
                    border: 1px solid #e2e8f0 !important;
                }
                .leaflet-popup-content {
                    margin: 0 !important;
                    line-height: 1.4 !important;
                }
                .leaflet-popup-tip {
                    background: #ffffff !important;
                }
                /* Refined map styling for modern aesthetic */
                .leaflet-tile-pane {
                    filter: saturate(0.92) contrast(1.02);
                }
            `}</style>

            <MapContainer
                bounds={bounds || undefined}
                boundsOptions={{ padding: [40, 40], maxZoom: 15 }}
                center={defaultCenter}
                zoom={12}
                scrollWheelZoom={true}
                className="w-full h-full rounded-[22px] z-10"
                style={{ height: "100%", width: "100%", minHeight: "480px" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    subdomains={["a", "b", "c"]}
                    maxZoom={19}
                    minZoom={3}
                    keepBuffer={8}
                />

                <AutoFitBounds bounds={bounds} center={defaultCenter} />
                <HoverController hoveredHostelId={hoveredHostelId} hostelPoints={hostelPoints} />
                <MapEventsHandler onMapMoved={handleMapMoved} />

                {hostelPoints.map(({ hostel, coords, isActive }) => {
                    const price = hostel.final_price ?? (Number(hostel.price) || 0);
                    const isHovered = String(hoveredHostelId) === String(hostel.id);
                    const priceFormatted = `₹${price.toLocaleString("en-IN")}`;
                    const pillStateClass = isHovered ? "active" : !isActive ? "other-area" : "";

                    const customIcon = L.divIcon({
                        className: "airbnb-price-marker",
                        html: `
                            <div class="airbnb-pill ${pillStateClass}">
                                <span>${priceFormatted}</span>
                            </div>
                        `,
                        iconSize: [64, 28],
                        iconAnchor: [32, 14],
                        popupAnchor: [0, -16],
                    });

                    return (
                        <Marker
                            key={hostel.id}
                            position={coords}
                            icon={customIcon}
                            eventHandlers={{
                                click: () => onMarkerClick?.(hostel),
                            }}
                        >
                            <Popup minWidth={240} maxWidth={280}>
                                <div className="flex flex-col bg-white">
                                    {/* Thumbnail */}
                                    <div className="relative w-full h-36 bg-slate-100 overflow-hidden">
                                        <Image
                                            src={toLocalMediaPath(hostel.thumbnail) || "/images/hero1.webp"}
                                            alt={hostel.name}
                                            fill
                                            sizes="280px"
                                            className="object-cover"
                                        />
                                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white text-[11px] font-bold px-2 py-0.5 rounded-full">
                                            <Star size={11} className="fill-amber-400 text-amber-400" />
                                            <span>{hostel.rating ? Number(hostel.rating).toFixed(1) : "New"}</span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-3.5 flex flex-col gap-1.5">
                                        <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
                                            <MapPin size={12} />
                                            <span className="truncate">{hostel.area_name || hostel.city_name}</span>
                                        </div>

                                        <h4 className="text-sm font-bold text-slate-900 leading-snug line-clamp-1">
                                            {hostel.name}
                                        </h4>

                                        <div className="flex items-baseline gap-1 mt-0.5">
                                            <span className="text-xs text-slate-500 font-medium">Starts from</span>
                                            <span className="text-base font-extrabold text-slate-900">
                                                ₹{price.toLocaleString("en-IN")}
                                            </span>
                                            <span className="text-[10px] text-slate-400 font-medium">/mo</span>
                                        </div>

                                        <Link
                                            href={`/hostels/${hostel.slug}`}
                                            className="mt-2 w-full py-2 bg-[#312E81] hover:bg-[#1E1B4B] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                        >
                                            <span>View Details</span>
                                            <ExternalLink size={12} />
                                        </Link>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
