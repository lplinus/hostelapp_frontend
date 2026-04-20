"use client";

import { Users, BadgeCheck, Sparkles } from "lucide-react";

interface HostelTagsProps {
    isVerified?: boolean | null;
    isFeatured?: boolean | null;
    sharingOptions: string[];
}

export default function HostelTags({ isVerified, isFeatured, sharingOptions }: HostelTagsProps) {
    if (!isVerified && !isFeatured && sharingOptions.length === 0) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 mb-6">
            {isVerified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-indigo-50 text-[#312E81] border border-indigo-200 transition-all hover:bg-indigo-100">
                    <BadgeCheck size={14} className="fill-[#312E81] text-white" />
                    Verified
                </span>
            )}
            {isFeatured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 transition-all hover:bg-amber-100">
                    <Sparkles size={14} className="text-amber-500" />
                    Featured
                </span>
            )}
            {sharingOptions.map((sharing, idx) => (
                <span
                    key={`sharing-${idx}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gray-50 text-gray-600 border border-gray-200 transition-all hover:bg-gray-100"
                >
                    <Users size={13} className="text-gray-400" />
                    {sharing} Sharing
                </span>
            ))}
        </div>
    );
}
