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

        // Try getting location with high accuracy first
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude, accuracy } = position.coords;

                // If accuracy is worse than 5km, the result is likely unreliable (wrong city/country)
                if (accuracy > 5000) {
                    toast.warning(
                        `Location accuracy is ~${Math.round(accuracy / 1000)}km (unreliable). Please use "Select on Map" for precise results.`,
                        { duration: 6000 }
                    );
                }

                try {
                    const formattedAddress = await reverseGeocode(latitude, longitude);
                    onLocationDetected(latitude, longitude, formattedAddress);

                    if (accuracy <= 5000) {
                        toast.success(`Location detected (accuracy: ~${accuracy < 1000 ? Math.round(accuracy) + 'm' : Math.round(accuracy / 1000) + 'km'})`);
                    }
                } catch (error) {
                    console.error("Reverse geocoding error:", error);
                    onLocationDetected(latitude, longitude, "");
                    toast.warning("Coordinates detected, but failed to fetch detailed address. Try the Map Picker.");
                } finally {
                    setIsLoading(false);
                }
            },
            (error) => {
                setIsLoading(false);
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        toast.error("Location permission denied. Please allow location access in your browser settings, or use the Map Picker.");
                        break;
                    case error.POSITION_UNAVAILABLE:
                        toast.error("Location unavailable. Please use 'Select on Map' to pick your location manually.");
                        break;
                    case error.TIMEOUT:
                        toast.error("Location request timed out. Please use 'Select on Map' instead.");
                        break;
                    default:
                        toast.error("Failed to detect location. Please use 'Select on Map' instead.");
                        break;
                }
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
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
