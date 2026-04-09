"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { reverseGeocode, forwardGeocode, type GeocodeSuggestion } from "./location-utils";
import { toast } from "sonner";

// Fix for default marker icon in Leaflet + Next.js
const DefaultIcon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapLocationPickerProps {
    lat: number;
    lng: number;
    onChange: (lat: number, lng: number, address: string) => void;
    onClose: () => void;
}

/**
 * Forces Leaflet to recalculate its container size after mount.
 * Without this, the map shows blank tiles in modals/dynamic containers.
 */
function MapResizeFix() {
    const map = useMap();

    useEffect(() => {
        // Small delay to let the modal fully render before recalculating
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 200);

        return () => clearTimeout(timer);
    }, [map]);

    return null;
}

/**
 * Flies the map to a new position when lat/lng props change.
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

    // Sync marker when parent lat/lng changes
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
                <div style={{
                    position: "absolute",
                    top: "12px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    zIndex: 1000,
                    background: "rgba(255,255,255,0.9)",
                    backdropFilter: "blur(4px)",
                    padding: "8px 16px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#1d4ed8",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                }}>
                    <div style={{
                        width: "16px",
                        height: "16px",
                        border: "2px solid #2563eb",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite"
                    }} />
                    Fetching address...
                </div>
            )}
        </>
    );
}

/**
 * Address search bar overlay on the map.
 * User can paste/type an address, pick from suggestions, and the map jumps there.
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

    // Close dropdown on outside click
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

        // Debounce: search after 800ms of no typing
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (val.trim().length >= 3) {
            debounceRef.current = setTimeout(() => doSearch(val), 800);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        const pasted = e.clipboardData.getData("text");
        if (pasted && pasted.trim().length >= 3) {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            // Immediate search on paste
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
            style={{
                position: "absolute",
                top: "12px",
                left: "12px",
                right: "12px",
                zIndex: 1000,
                maxWidth: "500px",
            }}
        >
            <div style={{
                display: "flex",
                alignItems: "center",
                background: "white",
                borderRadius: "10px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
            }}>
                {/* Search icon */}
                <div style={{
                    padding: "0 4px 0 14px",
                    display: "flex",
                    alignItems: "center",
                    color: "#9ca3af"
                }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                    </svg>
                </div>
                <input
                    type="text"
                    value={searchText}
                    onChange={handleInputChange}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    placeholder="Paste or type address to search..."
                    style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        padding: "12px 8px",
                        fontSize: "14px",
                        fontFamily: "inherit",
                        background: "transparent",
                    }}
                    autoFocus
                />
                {isSearching && (
                    <div style={{
                        padding: "0 14px 0 4px",
                        display: "flex",
                        alignItems: "center",
                    }}>
                        <div style={{
                            width: "18px",
                            height: "18px",
                            border: "2px solid #3b82f6",
                            borderTop: "2px solid transparent",
                            borderRadius: "50%",
                            animation: "spin 1s linear infinite",
                        }} />
                    </div>
                )}
                {!isSearching && searchText.length >= 3 && (
                    <button
                        onClick={() => doSearch(searchText)}
                        style={{
                            padding: "8px 14px",
                            background: "#2563eb",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: 600,
                            fontFamily: "inherit",
                            borderRadius: "0 8px 8px 0",
                            height: "100%",
                        }}
                    >
                        Search
                    </button>
                )}
            </div>

            {/* Suggestions dropdown */}
            {showDropdown && suggestions.length > 0 && (
                <div style={{
                    marginTop: "4px",
                    background: "white",
                    borderRadius: "10px",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.16)",
                    border: "1px solid #e5e7eb",
                    maxHeight: "240px",
                    overflowY: "auto",
                }}>
                    {suggestions.map((s, i) => (
                        <button
                            key={`${s.lat}-${s.lng}-${i}`}
                            onClick={() => handleSelectSuggestion(s)}
                            style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "10px",
                                width: "100%",
                                padding: "10px 14px",
                                border: "none",
                                borderBottom: i < suggestions.length - 1 ? "1px solid #f3f4f6" : "none",
                                background: "transparent",
                                cursor: "pointer",
                                textAlign: "left",
                                fontSize: "13px",
                                lineHeight: "1.4",
                                color: "#374151",
                                fontFamily: "inherit",
                                transition: "background 0.15s",
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                            {/* Pin icon */}
                            <span style={{
                                flexShrink: 0,
                                color: "#ef4444",
                                marginTop: "1px",
                            }}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                                </svg>
                            </span>
                            <span>{s.displayName}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ lat, lng, onChange, onClose }) => {
    // Center map on coordinates, or fallback to India center
    const initialLat = lat || 20.5937;
    const initialLng = lng || 78.9629;

    // Track the "search-selected" position to fly the map there
    const [searchLat, setSearchLat] = useState(initialLat);
    const [searchLng, setSearchLng] = useState(initialLng);

    const handleSearchSelect = (newLat: number, newLng: number, address: string) => {
        setSearchLat(newLat);
        setSearchLng(newLng);
        onChange(newLat, newLng, address);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
                style={{ height: "80vh" }}
            >
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Select Location on Map</h3>
                        <p className="text-sm text-gray-500">Paste an address in the search bar, or click/drag the marker on the map.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                <div style={{ flex: 1, position: "relative", minHeight: "300px" }}>
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
                        />
                        <LocationMarker lat={searchLat} lng={searchLng} onChange={onChange} />
                    </MapContainer>

                    {/* Search bar overlay on top of the map */}
                    <AddressSearchBar onSelectLocation={handleSearchSelect} />
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-between items-center shrink-0">
                    <p className="text-xs text-gray-400">Tip: Zoom in for building-level accuracy</p>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 shadow-md transition"
                    >
                        Confirm Location
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MapLocationPicker;
