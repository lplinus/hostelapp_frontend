"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserCircle, Menu, Sparkles } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import { useAuth } from "@/hooks/useAuth";
import { toLocalMediaPath } from "@/lib/utils";
import NotificationBell from "@/components/user/notification/NotificationBell";

export default function DashboardHeader() {
    const { user } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { data: subscription } = useQuery<any>({
        queryKey: ["currentOwnerSubscription"],
        queryFn: () => authApiClient.get('/api/payments/subscriptions/current/'),
        enabled: !!user && user.role !== 'vendor',
        refetchInterval: 5000,
        retry: false
    });

    const displayName = isMounted ? (user?.first_name || user?.username || "Owner") : "Owner";

    return (
        <header className="flex items-center justify-between bg-white/95 backdrop-blur-md px-4 sm:px-5 py-2.5 rounded-md border border-slate-200/90 shadow-[0_1px_2px_rgba(0,0,0,0.02)] transition-all">
            {/* Left: Greeting + Compact Subscription Pill */}
            <div className="flex items-center gap-3 min-w-0">
                <button
                    onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
                    className="md:hidden p-1.5 -ml-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors shrink-0"
                    aria-label="Toggle Navigation"
                >
                    <Menu size={20} />
                </button>

                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                        <div className="flex items-center gap-1.5 min-w-0">
                            <span className="text-xs sm:text-sm font-medium text-slate-500">Welcome,</span>
                            <span className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                                {displayName}
                            </span>
                        </div>

                        {/* Glossy Subscription Badge with Brighter Dark Blue Text */}
                        {isMounted && subscription && subscription.end_date && (
                            <div className="relative inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-gradient-to-b from-white/90 via-blue-50/40 to-white/70 backdrop-blur-md border border-blue-900/25 shadow-[0_1px_4px_rgba(29,78,216,0.08),inset_0_1px_1px_rgba(255,255,255,1)] overflow-hidden group shrink-0">
                                {/* Top Gloss Highlight Bar */}
                                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/90 via-white/40 to-transparent pointer-events-none rounded-t-md" />

                                {/* Ambient Shimmer Sweep */}
                                <div className="absolute inset-0 -translate-x-full animate-[shimmer_3s_infinite] bg-gradient-to-r from-transparent via-white/60 to-transparent skew-x-12 pointer-events-none" />

                                <span className="relative flex h-1.5 w-1.5 shrink-0 z-10">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-blue-700" />
                                </span>

                                <span className="relative z-10 flex items-center gap-1">
                                    <strong className="font-extrabold tracking-wider uppercase text-blue-800 drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                                        {subscription.plan_name}
                                    </strong>
                                    <span className="text-blue-700/90 text-[9px] font-semibold hidden sm:inline">
                                        • Till {new Date(subscription.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>

                    <p className="text-[11px] text-slate-400 font-medium hidden sm:block truncate mt-0.5">
                        Manage properties, room configurations, and guest bookings
                    </p>
                </div>
            </div>

            {/* Right: Notifications + Profile */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <NotificationBell />

                <div className="h-5 w-px bg-slate-200/80 hidden sm:block" />

                <Link
                    href="/profile"
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-md hover:bg-slate-100/80 border border-transparent hover:border-slate-200/60 transition-all group"
                    title="View Profile"
                >
                    {isMounted && user?.profile_picture ? (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md overflow-hidden border border-slate-200/80 ring-1 ring-primary/15 group-hover:ring-primary/30 transition-all shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={toLocalMediaPath(user.profile_picture) || ""}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <UserCircle size={20} />
                        </div>
                    )}

                    <div className="hidden md:flex flex-col text-left">
                        <span className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-primary transition-colors truncate max-w-[100px]">
                            {displayName}
                        </span>
                        <span className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">
                            {user?.role || "Owner"}
                        </span>
                    </div>
                </Link>
            </div>
        </header>
    );
}