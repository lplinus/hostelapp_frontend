"use client";

import { Info } from "lucide-react";

interface HostelDescriptionProps {
    readonly description: string;
}

export default function HostelDescription({ description }: HostelDescriptionProps) {
    if (!description) return null;

    return (
        <div className="mb-12 pt-6 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Info className="text-blue-500" size={24} />
                About this hostel
            </h2>
            <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed font-medium">
                {description.split('\n').map((paragraph, idx) => (
                    <p key={idx} className={idx > 0 ? "mt-4" : ""}>
                        {paragraph}
                    </p>
                ))}
            </div>
        </div>
    );
}
