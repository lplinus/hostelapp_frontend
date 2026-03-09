"use client";

import React, { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { reverseGeocode } from "./location-utils";

interface UseCurrentLocationProps {
    onLocationDetected: (lat: number, lng: number, address: string) => void;
}

const UseCurrentLocation: React.FC<UseCurrentLocationProps> = ({ onLocationDetected }) => {
    const [isLoading, setIsLoading] = useState(false);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
        }

        setIsLoading(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;

                try {
                    const formattedAddress = await reverseGeocode(latitude, longitude);
                    onLocationDetected(latitude, longitude, formattedAddress);
                    toast.success("Precise location detected successfully");
                } catch (error) {
                    console.error("Reverse geocoding error:", error);
                    onLocationDetected(latitude, longitude, "");
                    toast.warning("Coordinates detected, but failed to fetch detailed address.");
                } finally {
                    setIsLoading(false);
                }
            },
            (error) => {
                setIsLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error("User denied the request for Geolocation. Please check browser settings.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error("Location information is unavailable. Try the Map Picker.");
                        break;
                    case error.TIMEOUT:
                        toast.error("The request to get user location timed out.");
                        break;
                    default:
                        toast.error("An unknown error occurred while detecting location.");
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    return (
        <button
            type="button"
            onClick={handleGetLocation}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-md transition-all text-sm font-semibold border border-blue-200"
            title="Use current high-accuracy GPS location"
        >
            {isLoading ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Detecting location...</span>
                </>
            ) : (
                <>
                    <MapPin className="w-4 h-4" />
                    <span>Use Current Location</span>
                </>
            )}
        </button>
    );
};

export default UseCurrentLocation;
