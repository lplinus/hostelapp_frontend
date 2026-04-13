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
        <div className="flex flex-col gap-3 mb-8">
            {(isVerified || isFeatured) && (
                <div className="flex flex-wrap gap-2.5">
                    {isVerified && (
                        <span className="inline-flex items-center px-3 sm:px-4 py-1.5 text-[12px] sm:text-sm font-bold rounded-full bg-indigo-50 text-[#312E81] border border-indigo-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap shrink-0">
                            <BadgeCheck className="mr-1.5 fill-[#312E81] text-white w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Verified Choice
                        </span>
                    )}
                    {isFeatured && (
                        <span className="inline-flex items-center px-3 sm:px-4 py-1.5 text-[12px] sm:text-sm font-bold rounded-full bg-emerald-50 text-[#10B981] border border-emerald-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap shrink-0">
                            <Sparkles className="mr-1.5 text-[#10B981] w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            Premium Selection
                        </span>
                    )}
                </div>
            )}
            
            {sharingOptions.length > 0 && (
                <div className="flex flex-wrap gap-2.5">
                    {sharingOptions.map((sharing, idx) => (
                        <span key={`sharing-${idx}`} className="inline-flex items-center px-4 py-1.5 text-sm font-bold rounded-full bg-gray-50 text-gray-700 border border-gray-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                            <Users size={16} className="mr-1.5 text-gray-500" />
                            {sharing} Sharing
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
