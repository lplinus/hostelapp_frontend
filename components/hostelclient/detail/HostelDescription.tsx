"use client";

import { useState } from "react";
import { Info, ChevronDown, ChevronUp } from "lucide-react";

interface HostelDescriptionProps {
    readonly description: string;
}

export default function HostelDescription({ description }: HostelDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!description) return null;

    const CHAR_LIMIT = 450;
    const isLongDescription = description.length > CHAR_LIMIT;
    
    // Display either the full text or truncated text
    const displayedText = isExpanded || !isLongDescription 
        ? description 
        : description.slice(0, CHAR_LIMIT).trim() + "...";

    return (
        <div className="mb-12 pt-10 border-t border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2.5">
                <Info className="text-slate-900" size={24} />
                About this hostel
            </h2>
            
            <div className="relative group/desc">
                <div className={`prose prose-slate max-w-none text-slate-600 leading-relaxed font-medium text-[1.05rem] transition-all duration-300 ${!isExpanded && isLongDescription ? "max-h-[300px] overflow-hidden" : ""}`}>
                    {displayedText.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                        <p key={idx} className={idx > 0 ? "mt-4" : ""}>
                            {paragraph}
                        </p>
                    ))}
                </div>

                {isLongDescription && (
                    <div className={!isExpanded ? "relative" : "mt-6"}>
                        {!isExpanded && (
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white/80 to-transparent pointer-events-none" />
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="relative flex items-center gap-2 text-slate-900 font-bold hover:text-black transition-all group/btn"
                        >
                            <span className="border-b-2 border-slate-200 group-hover/btn:border-slate-900 pb-0.5">
                                {isExpanded ? "Show less" : "Read more"}
                            </span>
                            {isExpanded ? (
                                <ChevronUp size={18} className="translate-y-[1px]" />
                            ) : (
                                <ChevronDown size={18} className="animate-bounce-slow" />
                            )}
                        </button>
                    </div>
                )}
            </div>
            
            <style jsx>{`
                .animate-bounce-slow {
                    animation: bounce-slow 2s infinite;
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(-10%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); }
                    50% { transform: translateY(10%); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); }
                }
            `}</style>
        </div>
    );
}
