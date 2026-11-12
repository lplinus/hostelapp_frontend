"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
    CheckCircle2,
    XCircle,
    TrendingUp,
    Sparkles,
    PieChart as PieChartIcon,
    BarChart3,
    Activity,
    Calendar,
    Building2,
    Hotel,
    Home,
    Layers,
} from "lucide-react";

export interface TimelinePoint {
    date: string; // "YYYY-MM-DD"
    label: string; // "Nov 07"
    day: string; // "Fri"
    confirmed: number;
    cancelled: number;
    total: number;
}

export interface StreamData {
    total: number;
    cancelled: number;
    confirmed: number;
    timeline: TimelinePoint[];
}

interface Props {
    readonly total: number;
    readonly cancelled: number;
    readonly timeline?: TimelinePoint[];
    readonly streams?: Record<string, StreamData>;
    readonly isLoading: boolean;
}

type ChartType = "donut" | "bar";
type TimeFilter = "all" | "30d" | "7d";
type StreamFilter = "all" | "hostel" | "hotel" | "vacation_rental";

export default function BookingPieChart({
    total,
    cancelled,
    timeline = [],
    streams,
    isLoading,
}: Props) {
    const [chartView, setChartView] = useState<ChartType>("donut");
    const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");
    const [streamFilter, setStreamFilter] = useState<StreamFilter>("all");

    // Resolve current active stream data
    const activeStream: StreamData = useMemo(() => {
        if (streams && streams[streamFilter]) {
            return streams[streamFilter];
        }
        return {
            total: total || 0,
            cancelled: cancelled || 0,
            confirmed: Math.max((total || 0) - (cancelled || 0), 0),
            timeline: timeline || [],
        };
    }, [streams, streamFilter, total, cancelled, timeline]);

    const confirmedCount = activeStream.confirmed;
    const cancelledCount = activeStream.cancelled;
    const sum = confirmedCount + cancelledCount;

    const confirmedPercent = sum > 0 ? Math.round((confirmedCount / sum) * 100) : 0;
    const cancelledPercent = sum > 0 ? 100 - confirmedPercent : 0;

    // SVG Geometry for prominent high-impact donut chart
    const size = 240;
    const center = size / 2; // 120
    const strokeWidth = 24;
    const radius = 92;
    const circumference = 2 * Math.PI * radius;

    const confirmedOffset = circumference - (confirmedCount / (sum || 1)) * circumference;
    const cancelledOffset = circumference - (cancelledCount / (sum || 1)) * circumference;

    // Filter timeline points by time range ("all", "30d", "7d")
    const filteredTimeline = useMemo(() => {
        const streamTimeline = activeStream.timeline || [];
        if (streamTimeline.length === 0) return [];

        if (timeFilter === "7d") {
            return streamTimeline.slice(-7);
        }
        if (timeFilter === "30d") {
            return streamTimeline.slice(-30);
        }
        return streamTimeline;
    }, [activeStream.timeline, timeFilter]);

    // Calculate maximum for Y-axis scale based on real filtered data
    const maxDayTotal = useMemo(() => {
        if (filteredTimeline.length === 0) return 4;
        const max = Math.max(...filteredTimeline.map((d) => Math.max(d.confirmed, d.cancelled, d.total)), 1);
        return Math.max(max, 2);
    }, [filteredTimeline]);

    // Stream buttons metadata
    const streamTabs = [
        { id: "all" as StreamFilter, label: "All Properties", icon: Layers },
        { id: "hostel" as StreamFilter, label: "Hostels", icon: Building2 },
        { id: "hotel" as StreamFilter, label: "Hotels", icon: Hotel },
        { id: "vacation_rental" as StreamFilter, label: "Vacation Rentals", icon: Home },
    ];

    return (
        <Card className="relative overflow-hidden border border-slate-200/80 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-xl">
            {/* Ambient background aura */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-blue-50/80 via-indigo-50/20 to-transparent -mr-28 -mt-28 pointer-events-none blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-50/40 via-sky-50/20 to-transparent -ml-24 -mb-24 pointer-events-none blur-2xl" />

            <CardHeader className="pb-3.5 relative z-10 border-b border-slate-100">
                <div className="flex flex-col gap-3">
                    {/* Top Row: Title, Stream Category Selector & Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className="p-2 rounded-lg bg-blue-50 text-blue-600 shadow-2xs">
                                    <Activity className="w-4 h-4" />
                                </span>
                                <CardTitle className="text-base font-bold text-slate-800">Booking Analytics</CardTitle>
                            </div>
                            <CardDescription className="text-xs text-slate-500 font-normal">
                                Real database statistics across your property streams
                            </CardDescription>
                        </div>

                        {/* Top Right Controls: Views & Rates */}
                        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
                            {/* Interactive View Switcher: Donut vs Bar Graph (Smooth soft-corner pill container) */}
                            <div className="inline-flex p-1 rounded-lg bg-slate-100 border border-slate-200/80">
                                <button
                                    type="button"
                                    onClick={() => setChartView("donut")}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                                        chartView === "donut"
                                            ? "bg-white text-blue-600 shadow-xs"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                    title="Circular Donut View"
                                >
                                    <PieChartIcon className="w-3.5 h-3.5" />
                                    <span>Donut</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChartView("bar")}
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                                        chartView === "bar"
                                            ? "bg-white text-blue-600 shadow-xs"
                                            : "text-slate-500 hover:text-slate-800"
                                    }`}
                                    title="Timeline Bar Graph"
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    <span>Bar Graph</span>
                                </button>
                            </div>

                            {!isLoading && sum > 0 && (
                                <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-lg text-emerald-700 text-xs font-semibold shadow-2xs">
                                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                    <span>{confirmedPercent}% Success</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Second Row: Property Stream Tabs (Smooth soft-corner buttons matching dashboard) */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100/80 flex-wrap">
                        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                            {streamTabs.map((tab) => {
                                const TabIcon = tab.icon;
                                const isSelected = streamFilter === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setStreamFilter(tab.id)}
                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                            isSelected
                                                ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs"
                                                : "text-slate-500 hover:text-slate-800 hover:bg-slate-50 border border-transparent"
                                        }`}
                                    >
                                        <TabIcon className="w-3.5 h-3.5" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Date Range Filter (Soft-corner rounded-lg container) */}
                        {chartView === "bar" && (
                            <div className="inline-flex p-1 rounded-lg bg-slate-100/90 border border-slate-200/80 text-[11px]">
                                {(["all", "30d", "7d"] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        type="button"
                                        onClick={() => setTimeFilter(filter)}
                                        className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                                            timeFilter === filter
                                                ? "bg-white text-blue-600 shadow-xs border border-slate-200/40"
                                                : "text-slate-400 hover:text-slate-700"
                                        }`}
                                    >
                                        {filter === "all" ? "All Time" : filter.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-0 relative z-10">
                {isLoading ? (
                    <div className="py-20 flex flex-col items-center justify-center gap-3">
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 rounded-full border-4 border-blue-100" />
                            <div className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
                        </div>
                        <span className="text-xs text-slate-400 font-medium">Loading distribution metrics...</span>
                    </div>
                ) : sum === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-xs">
                            <PieChartIcon className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700">No bookings for this stream</p>
                        <p className="text-xs text-slate-400 max-w-[260px] mt-1">
                            Reservations for {streamTabs.find((t) => t.id === streamFilter)?.label} will appear here
                            once recorded.
                        </p>
                    </div>
                ) : (
                    /* Strict Side-by-Side Flex Layout: Left Chart | Border Divider | Right Data Metrics */
                    <div className="flex flex-col md:flex-row items-stretch w-full min-h-[300px]">
                        {/* LEFT SECTION: Prominent Large Chart */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col items-center justify-center min-w-0">
                            <AnimatePresence mode="wait">
                                {chartView === "donut" ? (
                                    <motion.div
                                        key={`donut-${streamFilter}`}
                                        initial={{ opacity: 0, scale: 0.94 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.94 }}
                                        transition={{ duration: 0.25 }}
                                        className="relative flex items-center justify-center"
                                    >
                                        <svg
                                            width={size}
                                            height={size}
                                            viewBox={`0 0 ${size} ${size}`}
                                            className="transform -rotate-90 filter drop-shadow-[0_8px_20px_rgba(37,99,235,0.15)]"
                                        >
                                            <defs>
                                                <linearGradient
                                                    id="confirmedDonutGrad"
                                                    x1="0%"
                                                    y1="0%"
                                                    x2="100%"
                                                    y2="100%"
                                                >
                                                    <stop offset="0%" stopColor="#3b82f6" />
                                                    <stop offset="100%" stopColor="#1d4ed8" />
                                                </linearGradient>
                                                <linearGradient
                                                    id="cancelledDonutGrad"
                                                    x1="0%"
                                                    y1="0%"
                                                    x2="100%"
                                                    y2="100%"
                                                >
                                                    <stop offset="0%" stopColor="#fb7185" />
                                                    <stop offset="100%" stopColor="#e11d48" />
                                                </linearGradient>
                                            </defs>

                                            {/* Track Background */}
                                            <circle
                                                cx={center}
                                                cy={center}
                                                r={radius}
                                                stroke="#f1f5f9"
                                                strokeWidth={strokeWidth}
                                                fill="transparent"
                                            />

                                            {/* Cancelled Segment */}
                                            {cancelledCount > 0 && (
                                                <motion.circle
                                                    cx={center}
                                                    cy={center}
                                                    r={radius}
                                                    stroke="url(#cancelledDonutGrad)"
                                                    strokeWidth={strokeWidth}
                                                    fill="transparent"
                                                    strokeDasharray={circumference}
                                                    initial={{ strokeDashoffset: circumference }}
                                                    animate={{ strokeDashoffset: cancelledOffset }}
                                                    transition={{ duration: 1.2, ease: "easeOut" }}
                                                    strokeLinecap="round"
                                                />
                                            )}

                                            {/* Confirmed Segment */}
                                            {confirmedCount > 0 && (
                                                <motion.circle
                                                    cx={center}
                                                    cy={center}
                                                    r={radius}
                                                    stroke="url(#confirmedDonutGrad)"
                                                    strokeWidth={strokeWidth}
                                                    fill="transparent"
                                                    strokeDasharray={circumference}
                                                    initial={{ strokeDashoffset: circumference }}
                                                    animate={{ strokeDashoffset: confirmedOffset }}
                                                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                                                    strokeLinecap="round"
                                                    style={{
                                                        transformOrigin: "center",
                                                        rotate:
                                                            cancelledCount > 0
                                                                ? `${(cancelledCount / sum) * 360}deg`
                                                                : "0deg",
                                                    }}
                                                />
                                            )}
                                        </svg>

                                        {/* Center Display with clean bold hierarchy */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                            <span className="text-[11px] font-bold tracking-widest text-slate-400 uppercase">
                                                Total Bookings
                                            </span>
                                            <span className="text-4xl font-black text-slate-800 tracking-tight leading-none my-1">
                                                {sum}
                                            </span>
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50/90 border border-blue-100 px-2.5 py-0.5 rounded-md mt-1">
                                                {confirmedPercent}% active rate
                                            </span>
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* REAL-WORLD TIMELINE BAR GRAPH WITH SOFT RECTANGULAR EDGES */
                                    <motion.div
                                        key={`bar-${streamFilter}-${timeFilter}`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.25 }}
                                        className="w-full max-w-lg flex flex-col justify-between h-full py-1"
                                    >
                                        <div className="flex items-center justify-between mb-3 px-1">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                                                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                                <span>
                                                    {timeFilter === "all"
                                                        ? "All-Time Timeline"
                                                        : `Recent ${timeFilter.toUpperCase()} Activity`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2.5 h-2.5 rounded-xs bg-blue-600" /> Confirmed
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Cancelled
                                                </span>
                                            </div>
                                        </div>

                                        {filteredTimeline.length === 0 ? (
                                            <div className="h-48 flex items-center justify-center text-xs text-slate-400 italic">
                                                No timeline records for this selection
                                            </div>
                                        ) : (
                                            <div className="flex items-stretch gap-2 h-48 w-full pt-2">
                                                {/* Y-Axis Value Labels */}
                                                <div className="flex flex-col justify-between text-[10px] font-semibold text-slate-400 select-none pb-7 pt-1 text-right pr-1 w-6 shrink-0">
                                                    <span>{maxDayTotal}</span>
                                                    <span>{Math.round(maxDayTotal / 2)}</span>
                                                    <span>0</span>
                                                </div>

                                                {/* Plot area */}
                                                <div className="relative flex-1 flex flex-col justify-between h-full border-l border-b border-slate-300">
                                                    {/* Background horizontal guideline ticks */}
                                                    <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-200 pointer-events-none" />
                                                    <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-200 pointer-events-none" />

                                                    {/* Columns container */}
                                                    <div className="relative w-full h-[calc(100%-28px)] flex items-end justify-between px-2 pt-2">
                                                        {filteredTimeline.map((item, idx) => {
                                                            const confirmedHeight =
                                                                (item.confirmed / maxDayTotal) * 100;
                                                            const cancelledHeight =
                                                                (item.cancelled / maxDayTotal) * 100;

                                                            return (
                                                                <div
                                                                    key={item.date || idx}
                                                                    className="flex-1 flex flex-col items-center h-full justify-end group relative px-0.5"
                                                                >
                                                                    {/* Tooltip on hover */}
                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 bg-slate-900 text-white text-[10px] py-1 px-2.5 rounded-md shadow-md pointer-events-none whitespace-nowrap z-30">
                                                                        {item.label || item.date}: {item.confirmed}{" "}
                                                                        confirmed, {item.cancelled} cancelled
                                                                    </div>

                                                                    {/* Dual Rectangular Bars container with crisp rectangular notation */}
                                                                    <div className="w-full flex items-end justify-center gap-1 h-full">
                                                                        {/* Confirmed Column */}
                                                                        <div className="w-3 sm:w-4.5 bg-slate-100 h-full flex items-end">
                                                                            <motion.div
                                                                                initial={{ height: 0 }}
                                                                                animate={{
                                                                                    height: `${
                                                                                        item.confirmed > 0
                                                                                            ? Math.max(
                                                                                                  confirmedHeight,
                                                                                                  14
                                                                                              )
                                                                                            : 0
                                                                                    }%`,
                                                                                }}
                                                                                transition={{
                                                                                    duration: 0.7,
                                                                                    ease: "easeOut",
                                                                                    delay: idx * 0.04,
                                                                                }}
                                                                                className="w-full bg-blue-600 hover:bg-blue-700 transition-colors"
                                                                            />
                                                                        </div>
                                                                        {/* Cancelled Column */}
                                                                        <div className="w-3 sm:w-4.5 bg-slate-100 h-full flex items-end">
                                                                            <motion.div
                                                                                initial={{ height: 0 }}
                                                                                animate={{
                                                                                    height: `${
                                                                                        item.cancelled > 0
                                                                                            ? Math.max(
                                                                                                  cancelledHeight,
                                                                                                  14
                                                                                              )
                                                                                            : 0
                                                                                    }%`,
                                                                                }}
                                                                                transition={{
                                                                                    duration: 0.7,
                                                                                    ease: "easeOut",
                                                                                    delay: 0.08 + idx * 0.04,
                                                                                }}
                                                                                className="w-full bg-rose-500 hover:bg-rose-600 transition-colors"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* X-Axis Day & Date labels directly under bottom border */}
                                                    <div className="h-7 w-full flex items-center justify-between px-2 pt-1 border-t border-slate-200 overflow-hidden">
                                                        {filteredTimeline.map((item, idx) => (
                                                            <div
                                                                key={item.date || idx}
                                                                className="flex-1 flex flex-col items-center select-none min-w-0"
                                                            >
                                                                <span className="text-[10px] font-bold text-slate-700 leading-none truncate">
                                                                    {item.day || item.label}
                                                                </span>
                                                                <span className="text-[9px] text-slate-400 mt-0.5 leading-none font-medium truncate">
                                                                    {item.label}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* DISTINCT BORDER DIVIDER BETWEEN LEFT AND RIGHT SIDES */}
                        <div className="w-full md:w-px h-px md:h-auto bg-gradient-to-r md:bg-gradient-to-b from-transparent via-slate-200 to-transparent self-stretch" />

                        {/* RIGHT SECTION: Compact Data Breakdown & Health Card */}
                        <div className="w-full md:w-[280px] lg:w-[320px] p-5 md:p-6 flex flex-col justify-center gap-3 shrink-0 bg-slate-50/30">
                            {/* Stream Indicator Pill (Matching app soft corners) */}
                            <div className="px-3 py-1.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-between text-[11px]">
                                <span className="text-slate-500 font-medium">Viewing Stream</span>
                                <span className="font-bold text-blue-700">
                                    {streamTabs.find((t) => t.id === streamFilter)?.label}
                                </span>
                            </div>

                            {/* Confirmed Metric Card (Matching app rounded-lg/rounded-xl) */}
                            <div className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-blue-200 transition-all duration-200 shadow-2xs">
                                <div className="flex items-center justify-between gap-3 mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 leading-none">Confirmed</p>
                                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Valid bookings</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-extrabold text-slate-900">{confirmedCount}</span>
                                        <span className="text-[10px] text-slate-400 ml-1">({confirmedPercent}%)</span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-600 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${confirmedPercent}%` }}
                                        transition={{ duration: 0.9, ease: "easeOut" }}
                                    />
                                </div>
                            </div>

                            {/* Cancelled Metric Card (Matching app rounded-lg/rounded-xl) */}
                            <div className="p-3.5 rounded-xl border border-slate-100 bg-white hover:border-rose-200 transition-all duration-200 shadow-2xs">
                                <div className="flex items-center justify-between gap-3 mb-1.5">
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                                            <XCircle className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 leading-none">Cancelled</p>
                                            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">Revoked stays</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-extrabold text-slate-900">{cancelledCount}</span>
                                        <span className="text-[10px] text-slate-400 ml-1">({cancelledPercent}%)</span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-rose-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cancelledPercent}%` }}
                                        transition={{ duration: 0.9, ease: "easeOut" }}
                                    />
                                </div>
                            </div>

                            {/* Short, Compact Health Pill */}
                            <div className="p-2.5 rounded-lg bg-white border border-slate-200/60 flex items-center justify-between shadow-2xs">
                                <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                                    Health Status
                                </span>
                                <span
                                    className={`text-[11px] font-bold ${
                                        confirmedPercent >= 80 ? "text-emerald-600" : "text-amber-600"
                                    }`}
                                >
                                    {confirmedPercent >= 80 ? "Optimal" : "Needs attention"}
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
