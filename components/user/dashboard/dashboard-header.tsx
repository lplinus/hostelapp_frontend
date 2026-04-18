"use client";

import { useEffect, useState } from "react";
import { Bell, UserCircle, Menu } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { authApiClient } from "@/lib/api/auth-client";
import { useAuth } from "@/hooks/useAuth";
import { toLocalMediaPath } from "@/lib/utils";
import NotificationBell from "@/components/user/notification/NotificationBell";

export default function DashboardHeader() {
    const { user, logout, isLoggingOut } = useAuth();
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const { data: subscription } = useQuery<any>({
        queryKey: ["currentOwnerSubscription"],
        queryFn: () => authApiClient.get('/api/payments/subscriptions/current/'),
        enabled: !!user && user.role !== 'vendor',
        refetchInterval: 5000, // Instantly catches updates behind the scenes
        retry: false
    });

    return (
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm">

            <div className="flex items-center gap-3">
                <button
                    onClick={() => window.dispatchEvent(new Event("toggle-sidebar"))}
                    className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100"
                >
                    <Menu size={24} />
                </button>
                <div>
                    <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
                    <p className="text-sm text-gray-500 hidden sm:block mb-1">
                        Welcome back{isMounted && user?.first_name ? `, ${user.first_name}` : ""}, manage your hostels easily.
                    </p>
                    {subscription && subscription.end_date && (
                        <div className="relative inline-flex items-center gap-2 px-4 py-1.5 mt-2 rounded-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 text-white text-[10px] sm:text-xs font-medium shadow-[0_0_20px_rgba(79,70,229,0.25)] overflow-hidden group animate-in fade-in slide-in-from-top-1">
                            {/* Glossy top highlight */}
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none"></div>
                            {/* Shimmer sweeping effect */}
                            <div className="absolute inset-0 translate-x-[-100%] animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"></div>

                            <span className="relative flex h-2 w-2 z-10 shrink-0">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="relative z-10 drop-shadow-sm flex items-center">
                                <strong className="font-black tracking-widest uppercase mr-1.5 text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-400 drop-shadow-lg">{subscription.plan_name}</strong>
                                <span className="opacity-80 text-[10px] tracking-wide">Valid until {new Date(subscription.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-4">

                <NotificationBell />

                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all">
                    {isMounted && user?.profile_picture ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-100 shadow-sm">
                            <img src={toLocalMediaPath(user.profile_picture) || ""} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <UserCircle size={24} className="text-gray-600" />
                    )}
                    <span className="hidden md:block text-sm font-medium text-gray-700">{isMounted ? (user?.first_name || user?.username || "Profile") : "Profile"}</span>
                </button>

                {/* 
                <button
                    onClick={logout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Logout"
                >
                    {isLoggingOut ? <Loader2 size={20} className="animate-spin" /> : <LogOut size={20} />}
                    <span className="hidden md:block text-sm font-medium">
                        {isLoggingOut ? "Logging out..." : "Logout"}
                    </span>
                </button>
                */}

            </div>
        </div>
    );
}