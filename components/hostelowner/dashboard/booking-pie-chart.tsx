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
} from "lucide-react";
import { HomeOutlineRoundedIcon } from "./dashboard-stats";

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

    // SVG Geometry for balanced compact donut chart
    const size = 190;
    const center = size / 2; // 95
    const strokeWidth = 18;
    const radius = 74;
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

    // Stream buttons metadata (Hostels disabled to match unified property stats)
    const streamTabs = [
        { id: "all" as StreamFilter, label: "All Properties", icon: HomeOutlineRoundedIcon },
        // { id: "hostel" as StreamFilter, label: "Hostels", icon: Building2 },
        { id: "hotel" as StreamFilter, label: "Hotels", icon: Hotel },
        { id: "vacation_rental" as StreamFilter, label: "Vacation Rentals", icon: Home },
    ];

    return (
        <Card className="relative overflow-hidden border border-[#D2CABC] dark:border-slate-800 bg-[#E5DFD4] dark:bg-slate-900 shadow-xs rounded-md">
            {/* Ambient background aura */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-black/5 dark:from-indigo-500/10 via-black/2 dark:via-indigo-500/5 to-transparent -mr-28 -mt-28 pointer-events-none blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-black/5 dark:from-indigo-500/5 to-transparent -ml-24 -mb-24 pointer-events-none blur-2xl" />

            <CardHeader className="p-3 sm:p-4 pb-2 sm:pb-2.5 relative z-10 border-b border-[#D2CABC] dark:border-slate-800">
                <div className="flex flex-col gap-2.5">
                    {/* Top Row: Title, Stream Category Selector & Switcher */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5">
                        <div className="space-y-0.5">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-md bg-[#DBD5C8] dark:bg-slate-800 text-[#1F1E1B] dark:text-indigo-400 shadow-2xs">
                                    <Activity className="w-3.5 h-3.5" />
                                </span>
                                <CardTitle className="text-sm sm:text-base font-bold text-[#1A1916] dark:text-slate-100">Booking Analytics</CardTitle>
                            </div>
                            <CardDescription className="text-[11px] sm:text-xs text-[#686259] dark:text-slate-400 font-normal">
                                Real database statistics across your property streams
                            </CardDescription>
                        </div>

                        {/* Top Right Controls: Views & Rates */}
                        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            {/* Interactive View Switcher: Donut vs Bar Graph (Clean rectangular styling) */}
                            <div className="inline-flex p-0.5 rounded-md bg-[#DBD5C8]/80 dark:bg-slate-800/80 border border-[#D2CABC] dark:border-slate-700">
                                <button
                                    type="button"
                                    onClick={() => setChartView("donut")}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                        chartView === "donut"
                                            ? "bg-[#1F1E1B] text-white dark:bg-indigo-600 shadow-xs"
                                            : "text-[#5A544A] hover:text-[#1A1916] dark:text-slate-400 dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-slate-700/50"
                                    }`}
                                    title="Circular Donut View"
                                >
                                    <PieChartIcon className="w-3.5 h-3.5" />
                                    <span>Donut</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setChartView("bar")}
                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-sm text-xs font-semibold transition-all duration-200 cursor-pointer ${
                                        chartView === "bar"
                                            ? "bg-[#1F1E1B] text-white dark:bg-indigo-600 shadow-xs"
                                            : "text-[#5A544A] hover:text-[#1A1916] dark:text-slate-400 dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-slate-700/50"
                                    }`}
                                    title="Timeline Bar Graph"
                                >
                                    <BarChart3 className="w-3.5 h-3.5" />
                                    <span>Bar Graph</span>
                                </button>
                            </div>

                            {!isLoading && sum > 0 && (
                                <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#DBD5C8] dark:bg-slate-800/80 border border-[#D2CABC] dark:border-slate-700 rounded-md text-[#1F1E1B] dark:text-slate-200 text-xs font-semibold shadow-2xs">
                                    <TrendingUp className="w-3.5 h-3.5 text-[#1F1E1B] dark:text-emerald-400" />
                                    <span>{confirmedPercent}% Success</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Second Row: Property Stream Tabs (Clean rectangular buttons matching dashboard) */}
                    <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#D2CABC] dark:border-slate-800 flex-wrap">
                        <div className="flex items-center gap-1.5 overflow-x-auto py-0.5 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden scroll-smooth [-webkit-overflow-scrolling:touch]">
                            {streamTabs.map((tab) => {
                                const TabIcon = tab.icon;
                                const isSelected = streamFilter === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setStreamFilter(tab.id)}
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                                            isSelected
                                                ? "bg-[#1F1E1B] text-white border border-[#1F1E1B] dark:bg-indigo-600 dark:border-indigo-600 shadow-2xs"
                                                : "text-[#5A544A] hover:text-[#1A1916] hover:bg-[#DBD5C8]/50 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60 border border-transparent"
                                        }`}
                                    >
                                        <TabIcon className="w-3.5 h-3.5" />
                                        <span>{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        {/* Date Range Filter (Clean rectangular container) */}
                        {chartView === "bar" && (
                            <div className="inline-flex p-0.5 rounded-md bg-[#DBD5C8]/80 dark:bg-slate-800/80 border border-[#D2CABC] dark:border-slate-700 text-[11px]">
                                {(["all", "30d", "7d"] as const).map((filter) => (
                                    <button
                                        key={filter}
                                        type="button"
                                        onClick={() => setTimeFilter(filter)}
                                        className={`px-2 py-0.5 rounded-sm font-semibold transition-all cursor-pointer ${
                                            timeFilter === filter
                                                ? "bg-[#1F1E1B] text-white shadow-xs border border-[#1F1E1B] dark:bg-indigo-600 dark:border-indigo-600"
                                                : "text-[#5A544A] hover:text-[#1A1916] dark:text-slate-400 dark:hover:text-slate-100 hover:bg-black/5 dark:hover:bg-slate-700/50"
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
                            <div className="absolute inset-0 rounded-full border-4 border-blue-100 dark:border-slate-800" />
                            <div className="absolute inset-0 rounded-full border-4 border-blue-600 dark:border-indigo-500 border-t-transparent animate-spin" />
                        </div>
                        <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Loading distribution metrics...</span>
                    </div>
                ) : sum === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center">
                        <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3 shadow-xs">
                            <PieChartIcon className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">No bookings for this stream</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[260px] mt-1">
                            Reservations for {streamTabs.find((t) => t.id === streamFilter)?.label} will appear here
                            once recorded.
                        </p>
                    </div>
                ) : (
                    /* Strict Side-by-Side Flex Layout: Left Chart | Border Divider | Right Data Metrics */
                    <div className="flex flex-col md:flex-row items-stretch w-full min-h-[250px]">
                        {/* LEFT SECTION: Balanced Compact Chart */}
                        <div className="flex-1 p-4 sm:p-5 md:p-6 flex flex-col items-center justify-center min-w-0">
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
                                            className="transform -rotate-90 filter drop-shadow-[0_8px_20px_rgba(37,99,235,0.12)] dark:drop-shadow-[0_8px_25px_rgba(99,102,241,0.25)] transition-transform duration-300"
                                        >
                                            <defs>
                                                {/* Confirmed Gradients: Light mode warm charcoal, Dark mode luminous indigo */}
                                                <linearGradient
                                                    id="confirmedDonutGradLight"
                                                    x1="0%"
                                                    y1="0%"
                                                    x2="100%"
                                                    y2="100%"
                                                >
                                                    <stop offset="0%" stopColor="#1F1E1B" />
                                                    <stop offset="100%" stopColor="#4A453C" />
                                                </linearGradient>
                                                <linearGradient
                                                    id="confirmedDonutGradDark"
                                                    x1="0%"
                                                    y1="0%"
                                                    x2="100%"
                                                    y2="100%"
                                                >
                                                    <stop offset="0%" stopColor="#6366F1" />
                                                    <stop offset="100%" stopColor="#818CF8" />
                                                </linearGradient>

                                                {/* Cancelled Gradients: Light mode rose-red, Dark mode vibrant crimson/rose */}
                                                <linearGradient
                                                    id="cancelledDonutGradLight"
                                                    x1="0%"
                                                    y1="0%"
                                                    x2="100%"
                                                    y2="100%"
                                                >
                                                    <stop offset="0%" stopColor="#C25E5E" />
                                                    <stop offset="100%" stopColor="#A83B3B" />
                                                </linearGradient>
                                                <linearGradient
                                                    id="cancelledDonutGradDark"
                                                    x1="0%"
                                                    y1="0%"
                                                    x2="100%"
                                                    y2="100%"
                                                >
                                                    <stop offset="0%" stopColor="#F43F5E" />
                                                    <stop offset="100%" stopColor="#FB7185" />
                                                </linearGradient>
                                            </defs>

                                            {/* Track Background */}
                                            <circle
                                                cx={center}
                                                cy={center}
                                                r={radius}
                                                stroke="currentColor"
                                                strokeWidth={strokeWidth}
                                                fill="transparent"
                                                className="text-[#D2CABC] dark:text-slate-800 transition-colors"
                                            />

                                            {/* Cancelled Segment */}
                                            {cancelledCount > 0 && (
                                                <>
                                                    <motion.circle
                                                        cx={center}
                                                        cy={center}
                                                        r={radius}
                                                        stroke="url(#cancelledDonutGradLight)"
                                                        strokeWidth={strokeWidth}
                                                        fill="transparent"
                                                        strokeDasharray={circumference}
                                                        initial={{ strokeDashoffset: circumference }}
                                                        animate={{ strokeDashoffset: cancelledOffset }}
                                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                                        strokeLinecap="round"
                                                        className="dark:hidden"
                                                    />
                                                    <motion.circle
                                                        cx={center}
                                                        cy={center}
                                                        r={radius}
                                                        stroke="url(#cancelledDonutGradDark)"
                                                        strokeWidth={strokeWidth}
                                                        fill="transparent"
                                                        strokeDasharray={circumference}
                                                        initial={{ strokeDashoffset: circumference }}
                                                        animate={{ strokeDashoffset: cancelledOffset }}
                                                        transition={{ duration: 1.2, ease: "easeOut" }}
                                                        strokeLinecap="round"
                                                        className="hidden dark:block"
                                                    />
                                                </>
                                            )}

                                            {/* Confirmed Segment */}
                                            {confirmedCount > 0 && (
                                                <>
                                                    <motion.circle
                                                        cx={center}
                                                        cy={center}
                                                        r={radius}
                                                        stroke="url(#confirmedDonutGradLight)"
                                                        strokeWidth={strokeWidth}
                                                        fill="transparent"
                                                        strokeDasharray={circumference}
                                                        initial={{ strokeDashoffset: circumference }}
                                                        animate={{ strokeDashoffset: confirmedOffset }}
                                                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                                                        strokeLinecap="round"
                                                        className="dark:hidden"
                                                        style={{
                                                            transformOrigin: "center",
                                                            rotate:
                                                                cancelledCount > 0
                                                                    ? `${(cancelledCount / sum) * 360}deg`
                                                                    : "0deg",
                                                        }}
                                                    />
                                                    <motion.circle
                                                        cx={center}
                                                        cy={center}
                                                        r={radius}
                                                        stroke="url(#confirmedDonutGradDark)"
                                                        strokeWidth={strokeWidth}
                                                        fill="transparent"
                                                        strokeDasharray={circumference}
                                                        initial={{ strokeDashoffset: circumference }}
                                                        animate={{ strokeDashoffset: confirmedOffset }}
                                                        transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                                                        strokeLinecap="round"
                                                        className="hidden dark:block"
                                                        style={{
                                                            transformOrigin: "center",
                                                            rotate:
                                                                cancelledCount > 0
                                                                    ? `${(cancelledCount / sum) * 360}deg`
                                                                    : "0deg",
                                                        }}
                                                    />
                                                </>
                                            )}
                                        </svg>

                                        {/* Center Display with clean bold hierarchy showing both metrics steadily */}
                                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                                            <span className="text-[10px] font-bold tracking-widest text-[#686259] dark:text-slate-400 uppercase">
                                                Total Bookings
                                            </span>
                                            <span className="text-2xl md:text-3xl font-black text-[#1A1916] dark:text-slate-100 tracking-tight leading-none my-0.5">
                                                {sum}
                                            </span>
                                            <div className="text-[11px] font-semibold text-[#1F1E1B] dark:text-slate-200 bg-[#DBD5C8] dark:bg-slate-800 border border-[#D2CABC] dark:border-slate-700 px-2 py-0.5 rounded-sm mt-0.5 flex items-center gap-1.5 shadow-2xs">
                                                <span>{confirmedPercent}% active</span>
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-emerald-700 dark:text-emerald-400 font-bold">{confirmedCount}C</span>
                                                <span className="text-muted-foreground">•</span>
                                                <span className="text-rose-700 dark:text-rose-400 font-bold">{cancelledCount}X</span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    /* REAL-WORLD TIMELINE BAR GRAPH WITH CRISP RECTANGULAR EDGES */
                                    <motion.div
                                        key={`bar-${streamFilter}-${timeFilter}`}
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -8 }}
                                        transition={{ duration: 0.25 }}
                                        className="w-full max-w-md flex flex-col justify-between h-full py-1"
                                    >
                                        <div className="flex items-center justify-between mb-2.5 px-1">
                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
                                                <Calendar className="w-3.5 h-3.5 text-[#1F1E1B] dark:text-indigo-400" />
                                                <span>
                                                    {timeFilter === "all"
                                                        ? "All-Time Timeline"
                                                        : `Recent ${timeFilter.toUpperCase()} Activity`}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2.5 h-2.5 rounded-xs bg-[#1F1E1B] dark:bg-indigo-500" /> Confirmed
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2.5 h-2.5 rounded-xs bg-rose-500" /> Cancelled
                                                </span>
                                            </div>
                                        </div>

                                        {filteredTimeline.length === 0 ? (
                                            <div className="h-36 sm:h-40 flex items-center justify-center text-xs text-slate-400 dark:text-slate-500 italic">
                                                No timeline records for this selection
                                            </div>
                                        ) : (
                                            <div className="flex items-stretch gap-2 h-36 sm:h-40 w-full pt-1">
                                                {/* Y-Axis Value Labels */}
                                                <div className="flex flex-col justify-between text-[10px] font-semibold text-slate-400 dark:text-slate-500 select-none pb-7 pt-1 text-right pr-1 w-6 shrink-0">
                                                    <span>{maxDayTotal}</span>
                                                    <span>{Math.round(maxDayTotal / 2)}</span>
                                                    <span>0</span>
                                                </div>

                                                {/* Plot area */}
                                                <div className="relative flex-1 flex flex-col justify-between h-full border-l border-b border-slate-300 dark:border-slate-800">
                                                    {/* Background horizontal guideline ticks */}
                                                    <div className="absolute inset-x-0 top-0 border-b border-dashed border-slate-200 dark:border-slate-800/60 pointer-events-none" />
                                                    <div className="absolute inset-x-0 top-1/2 border-b border-dashed border-slate-200 dark:border-slate-800/60 pointer-events-none" />

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
                                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150 absolute -top-8 bg-slate-900/95 dark:bg-slate-800 border border-transparent dark:border-slate-700 text-white text-[10px] py-1 px-2.5 rounded-sm shadow-xl pointer-events-none whitespace-nowrap z-30 backdrop-blur-xs">
                                                                        {item.label || item.date}: {item.confirmed}{" "}
                                                                        confirmed, {item.cancelled} cancelled
                                                                    </div>

                                                                    {/* Dual Rectangular Bars container with crisp rectangular notation */}
                                                                    <div className="w-full flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                                                                        {/* Confirmed Column */}
                                                                        <div className="w-2.5 sm:w-3.5 bg-slate-100 dark:bg-slate-800/80 h-full flex items-end rounded-xs overflow-hidden">
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
                                                                                className="w-full bg-[#1F1E1B] dark:bg-indigo-500 hover:bg-[#33312B] dark:hover:bg-indigo-400 hover:brightness-110 transition-all rounded-xs cursor-pointer"
                                                                            />
                                                                        </div>
                                                                        {/* Cancelled Column */}
                                                                        <div className="w-2.5 sm:w-3.5 bg-slate-100 dark:bg-slate-800/80 h-full flex items-end rounded-xs overflow-hidden">
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
                                                                                className="w-full bg-rose-500 hover:bg-rose-600 dark:hover:bg-rose-400 hover:brightness-110 transition-all rounded-xs cursor-pointer"
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* X-Axis Day & Date labels directly under bottom border */}
                                                    <div className="h-7 w-full flex items-center justify-between px-2 pt-1 border-t border-slate-200 dark:border-slate-800 overflow-hidden">
                                                        {filteredTimeline.map((item, idx) => (
                                                            <div
                                                                key={item.date || idx}
                                                                className="flex-1 flex flex-col items-center select-none min-w-0"
                                                            >
                                                                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 leading-none truncate">
                                                                    {item.day || item.label}
                                                                </span>
                                                                <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5 leading-none font-medium truncate">
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
                        <div className="w-full md:w-px h-px md:h-auto bg-gradient-to-r md:bg-gradient-to-b from-transparent via-[#D2CABC] dark:via-slate-800 to-transparent self-stretch" />

                        {/* RIGHT SECTION: Compact Data Breakdown & Health Card (Outer box removed) */}
                        <div className="w-full md:w-[260px] lg:w-[280px] p-3.5 sm:p-4 md:p-4.5 flex flex-col justify-center gap-2.5 shrink-0">
                            {/* Stream Indicator Pill (Clean rectangular container) */}
                            <div className="px-2.5 py-1 rounded-md bg-[#DBD5C8] dark:bg-slate-800/80 border border-[#D2CABC] dark:border-slate-700 flex items-center justify-between text-[11px]">
                                <span className="text-[#686259] dark:text-slate-400 font-medium">Viewing Stream</span>
                                <span className="font-bold text-[#1F1E1B] dark:text-slate-100">
                                    {streamTabs.find((t) => t.id === streamFilter)?.label}
                                </span>
                            </div>

                            {/* Confirmed Metric Card (Clean rectangular container) */}
                            <div className="p-2.5 sm:p-3 rounded-md border border-[#D2CABC] dark:border-slate-800 bg-[#E5DFD4] dark:bg-slate-900/90 hover:border-emerald-500/70 dark:hover:border-emerald-400/70 transition-all duration-200 shadow-2xs">
                                <div className="flex items-center justify-between gap-2.5 mb-1">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-[#1A1916] dark:text-slate-100 leading-none">Confirmed</p>
                                            <p className="text-[10px] text-[#686259] dark:text-slate-400 leading-tight mt-0.5">Valid bookings</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-extrabold text-[#1A1916] dark:text-slate-100">{confirmedCount}</span>
                                        <span className="text-[10px] text-[#686259] dark:text-slate-400 ml-1">({confirmedPercent}%)</span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-[#DBD5C8] dark:bg-slate-800 rounded-xs overflow-hidden">
                                    <motion.div
                                        className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-xs"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${confirmedPercent}%` }}
                                        transition={{ duration: 0.9, ease: "easeOut" }}
                                    />
                                </div>
                            </div>

                            {/* Cancelled Metric Card (Clean rectangular container) */}
                            <div className="p-2.5 sm:p-3 rounded-md border border-[#D2CABC] dark:border-slate-800 bg-[#E5DFD4] dark:bg-slate-900/90 hover:border-rose-400 dark:hover:border-rose-400/70 transition-all duration-200 shadow-2xs">
                                <div className="flex items-center justify-between gap-2.5 mb-1">
                                    <div className="flex items-center gap-2">
                                        <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                                        <div>
                                            <p className="text-xs font-bold text-[#1A1916] dark:text-slate-100 leading-none">Cancelled</p>
                                            <p className="text-[10px] text-[#686259] dark:text-slate-400 leading-tight mt-0.5">Revoked stays</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-extrabold text-[#1A1916] dark:text-slate-100">{cancelledCount}</span>
                                        <span className="text-[10px] text-[#686259] dark:text-slate-400 ml-1">({cancelledPercent}%)</span>
                                    </div>
                                </div>
                                <div className="w-full h-1.5 bg-[#DBD5C8] dark:bg-slate-800 rounded-xs overflow-hidden">
                                    <motion.div
                                        className="h-full bg-rose-500 rounded-xs"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${cancelledPercent}%` }}
                                        transition={{ duration: 0.9, ease: "easeOut" }}
                                    />
                                </div>
                            </div>

                            {/* Short, Compact Health Pill */}
                            <div className="p-2 rounded-md bg-[#DBD5C8] dark:bg-slate-800/80 border border-[#D2CABC] dark:border-slate-700 flex items-center justify-between shadow-2xs">
                                <span className="text-[11px] font-medium text-[#686259] dark:text-slate-400 flex items-center gap-1.5">
                                    <Sparkles className="w-3.5 h-3.5 text-[#7A5C28] dark:text-amber-400 shrink-0" />
                                    Health Status
                                </span>
                                <span
                                    className={`text-[11px] font-bold ${
                                        confirmedPercent >= 80 ? "text-[#1F1E1B] dark:text-emerald-400" : "text-amber-700 dark:text-amber-400"
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
