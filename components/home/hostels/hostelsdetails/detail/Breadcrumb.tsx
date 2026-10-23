"use client";

import { useRouter } from "next/navigation";

interface BreadcrumbProps {
    readonly hostelName: string;
    readonly className?: string;
}

export default function Breadcrumb({ hostelName, className = "" }: BreadcrumbProps) {
    const router = useRouter();

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        router.back();
    };

    return (
        <nav aria-label="Breadcrumb" className={`w-full py-3.5 text-sm text-gray-700 font-semibold ${className}`.trim()}>
            <ol className="flex items-center gap-2 flex-wrap">
                <li>
                    <button 
                        onClick={() => router.push("/home")}
                        className="hover:text-teal-600 transition-colors"
                    >
                        Home
                    </button>
                </li>
                <li className="text-gray-400">/</li>
                <li>
                    <button 
                        onClick={handleBack}
                        className="hover:text-teal-600 transition-colors"
                    >
                        Hostels
                    </button>
                </li>
                <li className="text-gray-400">/</li>
                <li className="text-black font-extrabold truncate max-w-[200px]">{hostelName}</li>
            </ol>
        </nav>
    );
}
