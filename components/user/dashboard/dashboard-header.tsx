"use client";

import { Bell, UserCircle, LogOut, Loader2, Menu } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toLocalMediaPath } from "@/lib/utils";

export default function DashboardHeader() {
    const { user, logout, isLoggingOut } = useAuth();
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
                    <p className="text-sm text-gray-500 hidden sm:block">
                        Welcome back{user?.first_name ? `, ${user.first_name}` : ""}, manage your hostels easily.
                    </p>
                </div>
            </div>

            <div className="flex items-center gap-4">

                <button className="p-2 rounded-lg hover:bg-gray-100">
                    <Bell size={20} />
                </button>

                <button className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all">
                    {user?.profile_picture ? (
                        <div className="w-8 h-8 rounded-full overflow-hidden border border-blue-100 shadow-sm">
                            <img src={toLocalMediaPath(user.profile_picture) || ""} alt="Profile" className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <UserCircle size={24} className="text-gray-600" />
                    )}
                    <span className="hidden md:block text-sm font-medium text-gray-700">{user?.first_name || user?.username || "Profile"}</span>
                </button>

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

            </div>
        </div>
    );
}