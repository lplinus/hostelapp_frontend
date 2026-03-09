"use client";

import React, { useEffect } from "react";
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

function LocationMarker({ lat, lng, onChange }: { lat: number; lng: number, onChange: (lat: number, lng: number, address: string) => void }) {
    const map = useMap();

    useEffect(() => {
        map.setView([lat, lng], map.getZoom());
    }, [lat, lng, map]);

    useMapEvents({
        async click(e) {
            const { lat, lng } = e.latlng;
            try {
                const address = await reverseGeocode(lat, lng);
                onChange(lat, lng, address);
            } catch (error) {
                toast.error("Failed to get address for this location.");
                onChange(lat, lng, "");
            }
        },
    });

    return <Marker position={[lat, lng]} draggable={true} eventHandlers={{
        async dragend(e) {
            const marker = e.target;
            const position = marker.getLatLng();
            try {
                const address = await reverseGeocode(position.lat, position.lng);
                onChange(position.lat, position.lng, address);
            } catch (error) {
                toast.error("Failed to get address for this location.");
                onChange(position.lat, position.lng, "");
            }
        }
    }} />;
}

const MapLocationPicker: React.FC<MapLocationPickerProps> = ({ lat, lng, onChange, onClose }) => {
    // Center map on coordinates, or fallback to a default (e.g., India)
    const initialLat = lat || 20.5937;
    const initialLng = lng || 78.9629;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Select Location on Map</h3>
                        <p className="text-sm text-gray-500">Click anywhere or drag the marker for exact building-level accuracy.</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                        title="Close"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 relative">
                    <MapContainer
                        center={[initialLat, initialLng]}
                        zoom={lat ? 15 : 5}
                        style={{ height: "100%", width: "100%" }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker lat={initialLat} lng={initialLng} onChange={onChange} />
                    </MapContainer>
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
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
