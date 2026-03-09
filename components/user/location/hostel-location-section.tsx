"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Map as MapIcon } from "lucide-react";
import UseCurrentLocation from "./use-current-location";

// Dynamically import MapLocationPicker to avoid SSR issues with Leaflet
const MapLocationPicker = dynamic(() => import("./map-location-picker"), {
    ssr: false,
    loading: () => <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm"><div className="animate-pulse text-white font-bold">Loading Map...</div></div>
});

interface HostelLocationSectionProps {
    lat: string;
    lng: string;
    address: string;
    setLat: (val: string) => void;
    setLng: (val: string) => void;
    setAddress: (val: string) => void;
    idPrefix: string; // "create" or "edit"
}

const HostelLocationSection: React.FC<HostelLocationSectionProps> = ({
    lat,
    lng,
    address,
    setLat,
    setLng,
    setAddress,
    idPrefix
}) => {
    const [isMapOpen, setIsMapOpen] = useState(false);

    const handleLocationChange = (newLat: number, newLng: number, newAddress: string) => {
        setLat(newLat.toFixed(6));
        setLng(newLng.toFixed(6));
        if (newAddress) setAddress(newAddress);
    };

    return (
        <div className="space-y-4 contents">
            <div className="col-span-1">
                <label htmlFor={`${idPrefix}-lat`} className="block text-sm font-semibold text-gray-700">Latitude</label>
                <input
                    id={`${idPrefix}-lat`}
                    type="number"
                    step="0.000001"
                    name="latitude"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="e.g. 17.385044"
                />
            </div>
            <div className="col-span-1">
                <label htmlFor={`${idPrefix}-lng`} className="block text-sm font-semibold text-gray-700">Longitude</label>
                <input
                    id={`${idPrefix}-lng`}
                    type="number"
                    step="0.000001"
                    name="longitude"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    className="w-full border border-gray-300 p-2.5 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                    placeholder="e.g. 78.486671"
                />
            </div>

            <div className="col-span-1 md:col-span-2">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-1.5">
                    <label htmlFor={`${idPrefix}-address`} className="block text-sm font-semibold text-gray-700">Detailed Address</label>
                    <div className="flex flex-wrap gap-2">
                        <UseCurrentLocation onLocationDetected={handleLocationChange} />
                        <button
                            type="button"
                            onClick={() => setIsMapOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-all text-sm font-semibold border border-gray-300"
                        >
                            <MapIcon className="w-4 h-4" />
                            <span>Select on Map</span>
                        </button>
                    </div>
                </div>
                <textarea
                    id={`${idPrefix}-address`}
                    name="address"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter detailed address or use location buttons above"
                    className="w-full border border-gray-300 p-3 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none min-h-[80px]"
                    rows={2}
                />
            </div>

            {isMapOpen && (
                <MapLocationPicker
                    lat={Number.parseFloat(lat) || 0}
                    lng={Number.parseFloat(lng) || 0}
                    onChange={handleLocationChange}
                    onClose={() => setIsMapOpen(false)}
                />
            )}
        </div>
    );
};

export default HostelLocationSection;
