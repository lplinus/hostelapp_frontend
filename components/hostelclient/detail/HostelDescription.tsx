"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

interface HostelDescriptionProps {
    readonly description: string;
}

export default function HostelDescription({ description }: HostelDescriptionProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    
    if (!description) return null;

    const CHAR_LIMIT = 400;
    const isLongDescription = description.length > CHAR_LIMIT;
    
    // Display either the full text or truncated text
    const displayedText = isExpanded || !isLongDescription 
        ? description 
        : description.slice(0, CHAR_LIMIT).trim() + "...";

    return (
        <section className="mb-10 pt-8 border-t border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-4">
                About this Curator Space
            </h2>
            
            <div className="relative">
                <div className={`text-[15px] text-gray-600 leading-[1.8] font-normal transition-all duration-300 ${!isExpanded && isLongDescription ? "max-h-[200px] overflow-hidden" : ""}`}>
                    {displayedText.split('\n').filter(p => p.trim() !== '').map((paragraph, idx) => (
                        <p key={idx} className={idx > 0 ? "mt-3" : ""}>
                            {paragraph}
                        </p>
                    ))}
                </div>

                {isLongDescription && (
                    <div className={!isExpanded ? "relative mt-0" : "mt-4"}>
                        {!isExpanded && (
                            <div className="absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                        )}
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="relative flex items-center gap-1 text-[#312E81] font-semibold text-sm hover:text-[#1E1B4B] transition-colors group"
                        >
                            <span className="underline underline-offset-4 decoration-indigo-200 group-hover:decoration-indigo-400">
                                {isExpanded ? "Show less" : "Read more"}
                            </span>
                            <ChevronRight size={16} className={`transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
}
