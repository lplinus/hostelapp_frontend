"use client";

import { motion } from "framer-motion";

interface ChartItem {
    month: string;
    count: number;
}

interface Props {
    readonly data: ChartItem[] | undefined;
    readonly isLoading: boolean;
}

export default function BookingChart({ data, isLoading }: Props) {
    const maxCount = data?.reduce((max, item) => Math.max(max, item.count), 0) || 10;
    const displayData = data || [];

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Booking Trends</h3>
                    <p className="text-sm text-gray-500">Monthly booking performance</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-600" />
                        <span className="text-xs font-medium text-gray-600">Total Bookings</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 flex items-end justify-between gap-4 min-h-[220px] relative pt-6">
                {/* Grid Lines */}
                <div className="absolute inset-x-0 bottom-0 flex flex-col justify-between h-full pointer-events-none">
                    {[0, 20, 40, 60, 80].map((v) => (
                        <div key={v} className="w-full border-t border-gray-50 flex-1" />
                    ))}
                </div>

                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!isLoading && displayData.length === 0 && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-sm text-gray-400 italic">Insufficient data for chart</p>
                    </div>
                )}

                {!isLoading && displayData.length > 0 && displayData.map((item, index) => {
                    const height = (item.count / maxCount) * 100;
                    return (
                        <div key={item.month} className="flex-1 flex flex-col items-center gap-3 group relative z-10">
                            {/* Bar */}
                            <div className="w-full max-w-[40px] relative h-[200px] flex items-end">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: `${height}%` }}
                                    transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
                                    className="w-full bg-blue-600 rounded-t-lg group-hover:bg-blue-700 transition-colors relative"
                                >
                                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-xl pointer-events-none">
                                        {item.count} Bookings
                                    </div>
                                </motion.div>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 group-hover:text-gray-900 transition-colors">
                                {item.month.split(' ')[0]}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
