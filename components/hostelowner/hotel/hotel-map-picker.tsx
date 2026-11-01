"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { reverseGeocode, forwardGeocode, type GeocodeSuggestion } from "@/components/hostelowner/location/location-utils";
import { toast } from "sonner";
import { Search, MapPin, X, Loader2 } from "lucide-react";

// Fix default marker icon for Leaflet + Next.js with high-DPI Retina icon support
const DefaultIcon = L.icon({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

export interface HotelMapPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number, address: string) => void;
    onClose: () => void;
}

/**
 * Ensures Leaflet calculates its container dimensions correctly when rendered inside a modal.
 * Triggers multiple invalidation passes so tiles load immediately without any grey blank frames.
 */
function MapResizeFix() {
    const map = useMap();

    useEffect(() => {
        map.invalidateSize();
        const t1 = setTimeout(() => map.invalidateSize(), 80);
        const t2 = setTimeout(() => map.invalidateSize(), 200);
        const t3 = setTimeout(() => map.invalidateSize(), 450);

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [map]);

    return null;
}

/**
 * Smoothly animates the map to the target coordinates when an address is chosen.
 */
function FlyToHandler({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();
    const prevRef = useRef({ lat, lng });

    useEffect(() => {
        if (lat !== prevRef.current.lat || lng !== prevRef.current.lng) {
            map.flyTo([lat, lng], 16, { duration: 1.2 });
            prevRef.current = { lat, lng };
        }
    }, [lat, lng, map]);

    return null;
}

function LocationMarker({
    lat,
    lng,
    onChange
}: {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number, address: string) => void;
}) {
    const map = useMap();
    const [markerPos, setMarkerPos] = useState<[number, number]>([lat, lng]);
    const [isGeocoding, setIsGeocoding] = useState(false);

    useEffect(() => {
        setMarkerPos([lat, lng]);
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);

    const handleNewPosition = async (newLat: number, newLng: number) => {
        setMarkerPos([newLat, newLng]);
        setIsGeocoding(true);
        try {
            const address = await reverseGeocode(newLat, newLng);
            onChange(newLat, newLng, address);
            toast.success("Location selected! Address updated.");
        } catch {
            toast.error("Failed to get address for this location.");
            onChange(newLat, newLng, "");
        } finally {
            setIsGeocoding(false);
        }
    };

    useMapEvents({
        click(e) {
            if (isGeocoding) return;
            const { lat: clickLat, lng: clickLng } = e.latlng;
            handleNewPosition(clickLat, clickLng);
        },
    });

    return (
        <>
            <Marker
                position={markerPos}
                draggable={true}
                eventHandlers={{
                    dragend(e) {
                        const marker = e.target;
                        const position = marker.getLatLng();
                        handleNewPosition(position.lat, position.lng);
                    }
                }}
            />
            {isGeocoding && (
                <div
                    style={{
                        position: "absolute",
                        top: "12px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 1000,
                    }}
                    className="bg-white border border-slate-200 px-3.5 py-1.5 rounded-full shadow-lg text-xs font-medium text-blue-600 flex items-center gap-2"
                >
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    <span>Resolving address...</span>
                </div>
            )}
        </>
    );
}

/**
 * Compact address search bar overlay.
 */
function AddressSearchBar({
    onSelectLocation
}: {
    onSelectLocation: (lat: number, lng: number, address: string) => void;
}) {
    const [searchText, setSearchText] = useState("");
    const [suggestions, setSuggestions] = useState<GeocodeSuggestion[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const doSearch = useCallback(async (query: string) => {
        if (query.trim().length < 3) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }
        setIsSearching(true);
        try {
            const results = await forwardGeocode(query);
            setSuggestions(results);
            setShowDropdown(results.length > 0);
            if (results.length === 0) {
                toast.error("No locations found. Try a simpler address.");
            }
        } catch {
            setSuggestions([]);
            setShowDropdown(false);
            toast.error("Search failed. Please try again.");
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setSearchText(val);

        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.trim().length >= 3) {
            debounceRef.current = setTimeout(() => doSearch(val), 700);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData("text");
        if (pasted && pasted.trim().length >= 3) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            setTimeout(() => doSearch(pasted), 100);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            if (debounceRef.current) clearTimeout(debounceRef.current);
            doSearch(searchText);
        }
    };

    const handleSelectSuggestion = (s: GeocodeSuggestion) => {
        setSearchText(s.displayName);
        setShowDropdown(false);
        setSuggestions([]);
        onSelectLocation(s.lat, s.lng, s.displayName);
        toast.success("Location found! Marker moved to the address.");
    };

    return (
        <div
            ref={containerRef}
            className="absolute top-3 left-3 right-3 sm:right-auto z-[1000] w-auto sm:w-[380px]"
        >
            <div className="flex items-center bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
                <div className="pl-3 pr-1 text-slate-400">
                    <Search className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={searchText}
                    onChange={handleInputChange}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    placeholder="Search or paste address..."
                    className="flex-1 py-2 px-2 text-xs text-slate-800 bg-transparent outline-none placeholder:text-slate-400 font-sans"
                    autoFocus
                />
                {isSearching && (
                    <div className="px-2.5">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                    </div>
                )}
                {!isSearching && searchText.length >= 3 && (
                    <button
                        type="button"
                        onClick={() => doSearch(searchText)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium transition"
                    >
                        Search
                    </button>
                )}
            </div>

            {/* Suggestions dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div className="mt-1 bg-white rounded-lg shadow-xl border border-slate-200 max-h-48 overflow-y-auto divide-y divide-slate-100">
                    {suggestions.map((s, i) => (
                        <button
                            key={`${s.lat}-${s.lng}-${i}`}
                            type="button"
                            onClick={() => handleSelectSuggestion(s)}
                            className="flex items-start gap-2 w-full p-2.5 text-left text-xs text-slate-700 hover:bg-blue-50 transition-colors"
                        >
                            <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                            <span className="line-clamp-2 leading-relaxed">{s.displayName}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const HotelMapPicker: React.FC<HotelMapPickerProps> = ({ lat, lng, onChange, onClose }) => {
    const initialLat = lat || 20.5937;
    const initialLng = lng || 78.9629;

    const [searchLat, setSearchLat] = useState(initialLat);
    const [searchLng, setSearchLng] = useState(initialLng);

    const handleSearchSelect = (newLat: number, newLng: number, address: string) => {
        setSearchLat(newLat);
        setSearchLng(newLng);
        onChange(newLat, newLng, address);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-3 sm:p-4">
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col overflow-hidden border border-slate-200"
                style={{ height: "490px", maxHeight: "82vh" }}
            >
                {/* Compact Modal Header */}
                <div className="px-4 py-2.5 border-b border-slate-200 flex justify-between items-center bg-slate-50 shrink-0">
                    <div>
                        <h3 className="text-sm font-semibold text-slate-900">Select Hotel Location on Map</h3>
                        <p className="text-xs text-slate-500">Search address or drag the marker to pinpoint exact location.</p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
                        title="Close"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Map Body */}
                <div style={{ flex: 1, position: "relative", minHeight: "260px" }}>
                    <MapContainer
                        center={[initialLat, initialLng]}
                        zoom={lat ? 15 : 5}
                        style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0 }}
                        scrollWheelZoom={true}
                    >
                        <MapResizeFix />
                        <FlyToHandler lat={searchLat} lng={searchLng} />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            maxZoom={19}
                        />
                        <LocationMarker lat={searchLat} lng={searchLng} onChange={onChange} />
                    </MapContainer>

                    {/* Search bar overlay */}
                    <AddressSearchBar onSelectLocation={handleSearchSelect} />
                </div>

                {/* Compact Modal Footer */}
                <div className="px-4 py-2 border-t border-slate-200 bg-slate-50 flex justify-between items-center shrink-0">
                    <p className="text-[11px] text-slate-500">Tip: Zoom in or drag pin for building-level precision</p>
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold rounded-lg shadow-sm transition"
                    >
                        Confirm Location
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HotelMapPicker;
