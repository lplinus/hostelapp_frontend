import { Users, BadgeCheck, Sparkles } from "lucide-react";

interface HostelTagsProps {
    isVerified?: boolean | null;
    isFeatured?: boolean | null;
    sharingOptions: string[];
}

export default function HostelTags({ isVerified, isFeatured, sharingOptions }: HostelTagsProps) {
    if (!isVerified && !isFeatured && sharingOptions.length === 0) return null;

    return (
        <div className="flex flex-wrap gap-2.5 mb-8">
            {isVerified && (
                <span className="inline-flex items-center px-4 py-1.5 text-sm font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                    <BadgeCheck size={16} className="mr-1.5 fill-blue-600 text-white" />
                    Verified Choice
                </span>
            )}
            {isFeatured && (
                <span className="inline-flex items-center px-4 py-1.5 text-sm font-bold rounded-full bg-amber-50 text-amber-700 border border-amber-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                    <Sparkles size={16} className="mr-1.5 text-amber-500" />
                    Premium Selection
                </span>
            )}
            {sharingOptions.map((sharing, idx) => (
                <span key={`sharing-${idx}`} className="inline-flex items-center px-4 py-1.5 text-sm font-bold rounded-full bg-gray-50 text-gray-700 border border-gray-200 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
                    <Users size={16} className="mr-1.5 text-gray-500" />
                    {sharing} Sharing
                </span>
            ))}
        </div>
    );
}
