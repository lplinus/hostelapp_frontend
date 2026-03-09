"use client";

import { motion } from "framer-motion";

interface Props {
    readonly total: number;
    readonly cancelled: number;
    readonly isLoading: boolean;
}

export default function BookingPieChart({ total, cancelled, isLoading }: Props) {
    const sum = total + cancelled;

    // SVG parameters for the pie
    const radius = 70;
    const centerX = 100;
    const centerY = 100;
    const strokeWidth = 25;
    const normalizedRadius = radius - strokeWidth / 2;
    const circumference = normalizedRadius * 2 * Math.PI;

    const totalStrokeDashoffset = circumference - (total / (sum || 1)) * circumference;
    const cancelledStrokeDashoffset = circumference - (cancelled / (sum || 1)) * circumference;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Booking Distribution</h3>
                <p className="text-sm text-gray-500">Comparison of successful vs cancelled</p>
            </div>

            <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-8">
                <div className="relative w-48 h-48 flex items-center justify-center">
                    {isLoading && (
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    )}

                    {!isLoading && sum === 0 && (
                        <div className="text-center text-gray-400 text-sm italic">No data</div>
                    )}

                    {!isLoading && sum > 0 && (
                        <>
                            <svg viewBox="0 0 200 200" className="transform -rotate-90 w-full h-full">
                                {/* Background segment */}
                                <circle
                                    cx={centerX}
                                    cy={centerY}
                                    r={normalizedRadius}
                                    stroke="#fee2e2"
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                />

                                {/* Cancelled Segment */}
                                <motion.circle
                                    cx={centerX}
                                    cy={centerY}
                                    r={normalizedRadius}
                                    stroke="#ef4444"
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset: cancelledStrokeDashoffset }}
                                    transition={{ duration: 1.5, ease: "easeInOut" }}
                                    strokeLinecap="round"
                                />

                                {/* Total Segment */}
                                <motion.circle
                                    cx={centerX}
                                    cy={centerY}
                                    r={normalizedRadius}
                                    stroke="#2563eb"
                                    strokeWidth={strokeWidth}
                                    fill="transparent"
                                    strokeDasharray={circumference}
                                    initial={{ strokeDashoffset: circumference }}
                                    animate={{ strokeDashoffset: totalStrokeDashoffset }}
                                    transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
                                    strokeLinecap="round"
                                    style={{
                                        transformOrigin: 'center',
                                        rotate: `${(cancelled / sum) * 360}deg`
                                    }}
                                />
                            </svg>

                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-black text-gray-900">{sum}</span>
                                <span className="text-[10px] uppercase font-bold text-gray-400">Total</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-4 w-full md:w-auto">
                    <div className="flex items-center justify-between gap-6 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-blue-600" />
                            <div>
                                <p className="text-xs font-bold text-gray-900">Total Bookings</p>
                                <p className="text-[10px] text-gray-500 font-medium">Successful/Pending</p>
                            </div>
                        </div>
                        <span className="text-sm font-black text-gray-900">{total}</span>
                    </div>

                    <div className="flex items-center justify-between gap-6 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div>
                                <p className="text-xs font-bold text-gray-900">Cancellations</p>
                                <p className="text-[10px] text-gray-500 font-medium">Revoked bookings</p>
                            </div>
                        </div>
                        <span className="text-sm font-black text-gray-900">{cancelled}</span>
                    </div>

                    <div className="mt-2 pt-2 border-t border-gray-100 flex justify-between items-center px-3">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Success Rate</span>
                        <span className="text-xs font-black text-green-600">
                            {sum > 0 ? Math.round((total / sum) * 100) : 0}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
