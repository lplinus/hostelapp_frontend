"use client";

import { useRouter } from "next/navigation";

interface BreadcrumbProps {
    readonly hostelName: string;
}

export default function Breadcrumb({ hostelName }: BreadcrumbProps) {
    const router = useRouter();

    const handleBack = (e: React.MouseEvent) => {
        e.preventDefault();
        router.back();
    };

    return (
        <nav className="max-w-[1200px] mx-auto px-5 py-3 text-sm text-gray-400 font-medium">
            <ol className="flex items-center gap-2 flex-wrap">
                <li>
                    <button 
                        onClick={() => router.push("/home")}
                        className="hover:text-teal-600 transition-colors"
                    >
                        Home
                    </button>
                </li>
                <li className="text-slate-300">/</li>
                <li>
                    <button 
                        onClick={handleBack}
                        className="hover:text-teal-600 transition-colors"
                    >
                        Hostels
                    </button>
                </li>
                <li className="text-slate-300">/</li>
                <li className="text-slate-900 font-semibold truncate max-w-[200px]">{hostelName}</li>
            </ol>
        </nav>
    );
}
