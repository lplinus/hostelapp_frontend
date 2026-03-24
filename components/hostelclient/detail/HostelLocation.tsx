import { MapPin, Star, Building2, Navigation } from "lucide-react";

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
    const lat = typeof latitude === 'string' ? Number.parseFloat(latitude) : latitude;
    const lng = typeof longitude === 'string' ? Number.parseFloat(longitude) : longitude;

    const hasCoords = lat !== null && !Number.isNaN(lat) && lng !== null && !Number.isNaN(lng);
    const mapSrc = hasCoords
        ? `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`
        : address
            ? `https://www.google.com/maps?q=${encodeURIComponent(`${address}, ${cityName ?? ""}`)}&z=15&output=embed`
            : null;

    return (
        <div className="mb-12 pt-6 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                Where you'll be
            </h2>

            <div className="relative group rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-gray-100 h-[380px] w-full mb-8">
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
                            className="transition-transform duration-[10s] group-hover:scale-105 ease-out grayscale-[0.2] contrast-[1.1]"
                        />
                        <div className="absolute inset-0 bg-black/5 pointer-events-none group-hover:bg-transparent transition-colors duration-300" />
                        <a
                            href={hasCoords ? `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}` : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${address}, ${cityName ?? ""}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="absolute top-6 right-6 px-5 py-3 bg-white hover:bg-gray-50 text-gray-900 rounded-xl shadow-xl font-bold text-[14px] flex items-center gap-2 transition-all hover:scale-105 active:scale-[0.98] border border-gray-200"
                        >
                            <Navigation size={18} className="text-blue-600" />
                            Get Directions
                        </a>
                    </>
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-sm font-medium">
                        <MapPin className="mr-2" size={20} /> Map data currently unavailable
                    </div>
                )}
            </div>

            {landmarks && landmarks.length > 0 && (
                <div>
                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-5">
                        What's nearby?
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {landmarks.map((landmark) => (
                            <div
                                key={landmark.id}
                                className="flex items-center gap-3 py-2 px-4 rounded-full bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group hover:-translate-y-0.5"
                            >
                                {landmark.is_popular ? (
                                    <Star size={16} className="fill-amber-400 text-amber-400 group-hover:scale-110 transition-transform" />
                                ) : (
                                    <Building2 size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="text-[14px] font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                                        {landmark.name}
                                    </span>
                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded flex-shrink-0 font-semibold group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                        {landmark.distance}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
