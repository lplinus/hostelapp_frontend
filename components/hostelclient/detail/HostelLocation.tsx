"use client";

import { useState } from "react";
import { MapPin, Star, Building2, Navigation, Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Landmark {
    id: number;
    name: string;
    distance: string;
    is_popular?: boolean;
}

interface HostelLocationProps {
    name: string;
    address?: string;
    cityName?: string;
    latitude?: string | number | null;
    longitude?: string | number | null;
    landmarks?: readonly Landmark[];
}

export default function HostelLocation({
    name,
    address,
    cityName,
    latitude,
    longitude,
    landmarks,
}: HostelLocationProps) {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        const fullAddress = `${address}${cityName ? `, ${cityName} ` : ""}`;
        navigator.clipboard.writeText(fullAddress);
        toast.success("Address copied to clipboard!");
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const lat = typeof latitude === 'string' ? Number.parseFloat(latitude) : latitude;
    const lng = typeof longitude === 'string' ? Number.parseFloat(longitude) : longitude;

    const hasCoords = lat !== null && !Number.isNaN(lat) && lng !== null && !Number.isNaN(lng);
    const mapSrc = hasCoords
        ? `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`
        : address
            ? `https://www.google.com/maps?q=${encodeURIComponent(`${address}, ${cityName ?? ""}`)}&z=15&output=embed`
            : null;

    return (
        <section className="mb-10 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Where you'll be</h2>

            {/* Map Container */}
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 h-[240px] sm:h-[280px] w-full mb-5 group">
                {mapSrc ? (
                    <>
                        <iframe
                            src={mapSrc}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title={`${name} location`}
                            className="grayscale-[0.15] contrast-[1.05]"
                        />
                        <a
                            href={hasCoords ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${address}, ${cityName ?? ""}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute bottom-4 left-4 px-4 py-2.5 bg-white hover:bg-gray-50 text-gray-900 rounded-xl shadow-lg font-semibold text-sm flex items-center gap-2 transition-all hover:shadow-xl active:scale-[0.98] border border-gray-100"
                        >
                            <Navigation size={15} className="text-[#312E81]" />
                            Get Directions
                        </a>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm font-medium">
                        <MapPin className="mr-2" size={18} /> Map data currently unavailable
                    </div>
                )}
            </div>

            {/* Address Block */}
            {address && (
                <div 
                    className="flex items-start gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100 mb-5 cursor-pointer group/address hover:border-indigo-100 transition-colors"
                    onClick={handleCopy}
                >
                    <div className="mt-0.5 flex-shrink-0">
                        <MapPin size={16} className="text-[#312E81]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-800 leading-relaxed">
                            {address}
                        </p>
                        {cityName && (
                            <p className="text-xs text-gray-400 mt-0.5">{cityName}</p>
                        )}
                    </div>
                    <div className="flex-shrink-0 self-center text-gray-400 group-hover/address:text-[#312E81] transition-colors">
                        {copied ? <Check size={16} className="text-[#10B981]" /> : <Copy size={16} />}
                    </div>
                </div>
            )}

            {/* Nearby Landmarks */}
            {landmarks && landmarks.length > 0 && (
                <div>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Nearby
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {landmarks.map((landmark) => (
                            <div
                                key={landmark.id}
                                className="flex items-center gap-2 py-2 px-3 rounded-full bg-white border border-gray-200 text-sm hover:border-indigo-200 transition-colors cursor-default group"
                            >
                                {landmark.is_popular ? (
                                    <Star size={13} className="fill-amber-400 text-amber-400" />
                                ) : (
                                    <Building2 size={13} className="text-gray-400 group-hover:text-[#312E81] transition-colors" />
                                )}
                                <span className="font-medium text-gray-700 text-[13px]">
                                    {landmark.name}
                                </span>
                                <span className="text-[10px] text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded font-medium">
                                    {landmark.distance}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </section>
    );
}
