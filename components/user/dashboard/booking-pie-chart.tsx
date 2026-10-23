"use client";

import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

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
        <Card className="h-full flex flex-col shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-base font-bold">Booking Distribution</CardTitle>
                <CardDescription>Comparison of confirmed vs cancelled reservations</CardDescription>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col md:flex-row items-center justify-around gap-6 pt-2">
                <div className="relative w-44 h-44 flex items-center justify-center shrink-0">
                    {isLoading && (
                        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                    )}

                    {!isLoading && sum === 0 && (
                        <div className="text-center text-muted-foreground text-sm italic">No data yet</div>
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
                                    stroke="#3b82f6"
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
                                <span className="text-2xl font-bold text-foreground">{sum}</span>
                                <span className="text-[10px] uppercase font-semibold text-muted-foreground">Total</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="flex flex-col gap-3 w-full md:w-auto">
                    <div className="flex items-center justify-between gap-6 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full bg-blue-500 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-foreground">Confirmed / Active</p>
                                <p className="text-[10px] text-muted-foreground">Valid bookings</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-foreground">{total}</span>
                    </div>

                    <div className="flex items-center justify-between gap-6 p-2.5 rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center gap-2.5">
                            <div className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
                            <div>
                                <p className="text-xs font-semibold text-foreground">Cancelled</p>
                                <p className="text-[10px] text-muted-foreground">Revoked stays</p>
                            </div>
                        </div>
                        <span className="text-sm font-bold text-foreground">{cancelled}</span>
                    </div>

                    <div className="pt-2 border-t border-border flex justify-between items-center px-2.5">
                        <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Success Rate</span>
                        <span className="text-xs font-bold text-primary">
                            {sum > 0 ? Math.round((total / sum) * 100) : 0}%
                        </span>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
