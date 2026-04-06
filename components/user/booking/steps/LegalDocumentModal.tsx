"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LegalDocumentModalProps {
    isOpen: boolean;
    onClose: () => void;
    legalLoading: boolean;
    legalModalContent: { title: string, content: string, effective_date?: string } | null;
}

export function LegalDocumentModal({
    isOpen,
    onClose,
    legalLoading,
    legalModalContent
}: LegalDocumentModalProps) {
    return (
        <div className={cn("fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 transition-all", isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none")}>
            <div className={cn("bg-white rounded-3xl shadow-xl w-full max-w-[600px] max-h-[80vh] flex flex-col p-6 transition-transform duration-300", isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-8")}>
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                    <h2 className="text-xl font-bold">{legalModalContent?.title || (legalLoading ? "Loading..." : "")}</h2>
                    <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center transition-colors">✕</button>
                </div>
                {legalLoading ? (
                    <div className="flex-1 flex justify-center items-center py-10">
                        <span className="text-gray-500 font-medium">Loading Document...</span>
                    </div>
                ) : legalModalContent ? (
                    <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                        {legalModalContent.effective_date && (
                            <p className="text-sm text-gray-500 font-medium tracking-wide border-b pb-2">
                                Effective Date: <span className="text-gray-900 font-bold">{legalModalContent.effective_date}</span>
                            </p>
                        )}
                        <div className="text-gray-700 text-sm whitespace-pre-line leading-relaxed" dangerouslySetInnerHTML={{ __html: legalModalContent.content }} />
                    </div>
                ) : null}
                <div className="mt-4 pt-4 border-t flex justify-end">
                    <Button onClick={onClose} className="h-10 rounded-xl px-6 bg-[#312E81] hover:bg-[#1E1B4B] text-white shadow-md font-semibold font-sans">Done</Button>
                </div>
            </div>
        </div>
    );
}
