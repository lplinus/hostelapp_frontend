"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ShieldCheck, Sparkles, X } from "lucide-react";

interface FullPageAvailabilityLoaderProps {
    readonly isChecking: boolean;
    readonly onClose?: () => void;
    readonly title?: string;
    readonly subtitle?: string;
}

export function FullPageAvailabilityLoader({
    isChecking,
    onClose,
    title = "Checking Live Availability",
    subtitle = "Verifying room & date inventory with host...",
}: FullPageAvailabilityLoaderProps) {
    return (
        <AnimatePresence>
            {isChecking && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/60 px-4 select-none"
                    aria-live="polite"
                    aria-busy="true"
                >
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: 8 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 8 }}
                        transition={{ duration: 0.22, ease: "easeOut" }}
                        className="relative max-w-[320px] w-full bg-white border border-slate-300 rounded-md p-5 shadow-2xl flex flex-col items-center text-center"
                    >
                        {/* Close (X) Button */}
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="absolute top-2.5 right-2.5 w-7 h-7 rounded-sm flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                                aria-label="Cancel check"
                                title="Cancel"
                            >
                                <X size={15} />
                            </button>
                        )}

                        {/* Spinner */}
                        <div className="mb-3.5 mt-1 flex items-center justify-center">
                            <div className="w-10 h-10 rounded-sm bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs">
                                <Loader2 size={20} className="text-[#003580] animate-spin" />
                            </div>
                        </div>

                        {/* Heading & Subtext */}
                        <h3 className="text-sm font-semibold text-slate-900 tracking-tight mb-1 flex items-center gap-1 justify-center">
                            <span>{title}</span>
                            <Sparkles size={13} className="text-amber-500 fill-amber-400" />
                        </h3>
                        <p className="text-[11px] text-slate-600 font-normal leading-relaxed max-w-[240px]">
                            {subtitle}
                        </p>

                        {/* Progress Bar Animation */}
                        <div className="w-full bg-slate-100 rounded-xs h-1 mt-4 overflow-hidden border border-slate-200">
                            <motion.div
                                initial={{ width: "0%" }}
                                animate={{ width: "95%" }}
                                transition={{ duration: 5.8, ease: "easeInOut" }}
                                className="h-full bg-[#003580] rounded-xs"
                            />
                        </div>

                        {/* Security Tagline */}
                        <div className="mt-3 flex items-center gap-1 text-[10px] font-normal text-slate-500">
                            <ShieldCheck size={11} className="text-emerald-600" />
                            <span>Real-time instant synchronization</span>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
