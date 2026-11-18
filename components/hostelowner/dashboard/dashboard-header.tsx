"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { UserCircle, Menu, Sparkles, ShieldCheck, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import { getMyDocuments } from "@/services/document-verification.service";
import { useAuth } from "@/hooks/useAuth";
import { toLocalMediaPath } from "@/lib/utils";
import NotificationBell from "@/components/hostelowner/notification/NotificationBell";
import { usePathname } from "next/navigation";

export default function DashboardHeader() {
    const pathname = usePathname();
    const { user } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const normalizedPath = pathname?.replace(/\/$/, "") || "";
    const isUserDashboardTab = normalizedPath === "/dashboard";
    const isVendorDashboardTab = normalizedPath === "/vendordashboard/vendors" || normalizedPath === "/vendordashboard";

    const { data: subscription } = useQuery<any>({
        queryKey: ["currentOwnerSubscription"],
        queryFn: () => authApiClient.get('/api/payments/subscriptions/current/'),
        enabled: !!user && user.role !== 'vendor' && isUserDashboardTab,
        refetchInterval: 5000,
        retry: false
    });

    const { data: docVerification } = useQuery({
        queryKey: ["myDocuments"],
        queryFn: getMyDocuments,
        enabled: !!user,
        retry: false,
        staleTime: 30000,
    });

    const isOwnerVerified = Boolean(user?.is_verified || docVerification?.status === "verified");

    const displayName = isMounted ? (user?.first_name || user?.username || "Owner") : "Owner";

    // Only visible in the dashboard tab
    if (!isUserDashboardTab && !isVendorDashboardTab) {
        return (
            <div className="md:hidden flex items-center mb-1">
                <button
                    onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
                    className="p-1.5 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    aria-label="Toggle Navigation"
                >
                    <Menu size={20} />
                </button>
            </div>
        );
    }

    return (
        <header className="flex items-center justify-between bg-[#E5DFD4] px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-md border border-[#D2CABC] shadow-xs transition-all">
            {/* Left: Greeting + Compact Subscription Pill */}
            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                <button
                    onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
                    className="md:hidden p-1.5 -ml-1 rounded-md text-[#686259] hover:text-[#1A1916] hover:bg-[#DBD5C8] transition-colors shrink-0"
                    aria-label="Toggle Navigation"
                >
                    <Menu size={18} />
                </button>

                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                        <div className="flex items-center gap-1 min-w-0">
                            <span className="text-xs sm:text-xs font-medium text-[#686259]">Welcome,</span>
                            <span className="text-xs sm:text-sm font-bold text-[#1A1916] truncate">
                                {displayName}
                            </span>
                        </div>

                        {/* Subscription Badge */}
                        {isMounted && subscription && subscription.end_date && (
                            <div className="relative inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#DBD5C8] border border-[#D2CABC] overflow-hidden group shrink-0">
                                <span className="relative flex h-1.5 w-1.5 shrink-0 z-10">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-600" />
                                </span>

                                <span className="relative z-10 flex items-center gap-1 text-[10px] sm:text-[11px]">
                                    <strong className="font-extrabold tracking-wider uppercase text-[#1A1916]">
                                        {subscription.plan_name}
                                    </strong>
                                    <span className="text-[#686259] font-semibold hidden sm:inline">
                                        • Till {new Date(subscription.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </span>
                                </span>
                            </div>
                        )}
                    </div>

                    <p className="text-[11px] sm:text-xs text-[#686259] font-medium hidden sm:block truncate mt-0.5">
                        Manage properties, room configurations, and guest bookings
                    </p>
                </div>
            </div>

            {/* Right: Verification Status + Notifications + Profile */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
                {isMounted && (
                    isOwnerVerified ? (
                        <Link
                            href="/mydocuements"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-100/90 hover:bg-emerald-200 border border-emerald-300 text-emerald-900 text-[11px] font-bold shadow-xs transition-all shrink-0"
                            title="Owner Account Verified by Super Admin"
                        >
                            <ShieldCheck size={13} className="text-emerald-700" />
                            <span>Verified</span>
                        </Link>
                    ) : (
                        <Link
                            href="/mydocuements"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#DBD5C8] hover:bg-[#D2CABC] border border-[#D2CABC] text-[#1A1916] text-[11px] font-bold shadow-xs transition-all shrink-0 group"
                            title="Account Unverified - Click to upload documents for verification"
                        >
                            <ShieldAlert size={13} className="text-amber-700 group-hover:scale-105 transition-transform" />
                            <span>Unverified</span>
                        </Link>
                    )
                )}

                <NotificationBell />

                <div className="h-4 w-px bg-[#D2CABC] hidden sm:block" />

                <Link
                    href="/profile"
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-md hover:bg-[#DBD5C8]/80 border border-transparent hover:border-[#D2CABC] transition-all group"
                    title="View Profile"
                >
                    {isMounted && user?.profile_picture ? (
                        <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-md overflow-hidden border border-[#D2CABC] ring-1 ring-[#1F1E1B]/15 group-hover:ring-[#1F1E1B]/30 transition-all shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={toLocalMediaPath(user.profile_picture) || ""}
                                alt={displayName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    ) : (
                        <div className="w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <UserCircle size={20} />
                        </div>
                    )}

                    <div className="hidden md:flex flex-col text-left">
                        <span className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-primary transition-colors truncate max-w-[100px]">
                            {displayName}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider" suppressHydrationWarning>
                            {isMounted ? (user?.role || "Owner") : "Owner"}
                        </span>
                    </div>
                </Link>
            </div>
        </header>
    );
}