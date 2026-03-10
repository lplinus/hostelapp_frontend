"use client";

import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { reverseGeocode } from "./location-utils";
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

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ lat, lng, onChange, onClose }) => {
    // Center map on coordinates, or fallback to India center
    const initialLat = lat || 20.5937;
    const initialLng = lng || 78.9629;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden"
                style={{ height: "80vh" }}
            >
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 shrink-0">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Select Location on Map</h3>
                        <p className="text-sm text-gray-500">Click anywhere on the map or drag the marker to select your hostel&apos;s exact location.</p>
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
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker lat={initialLat} lng={initialLng} onChange={onChange} />
                    </MapContainer>
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
