"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DollarSign, Eye, MousePointerClick, TrendingUp, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

export default function AdSenseOverview() {
    const [adEnabled, setAdEnabled] = useState(true);

    const stats = [
        { label: "Estimated Earnings", value: "₹4,820.50", change: "+12.4%", icon: DollarSign, color: "text-emerald-600 bg-emerald-50" },
        { label: "Ad Impressions", value: "28,450", change: "+8.1%", icon: Eye, color: "text-blue-600 bg-blue-50" },
        { label: "Total Clicks", value: "942", change: "+5.3%", icon: MousePointerClick, color: "text-indigo-600 bg-indigo-50" },
        { label: "Page RPM", value: "₹169.40", change: "+3.8%", icon: TrendingUp, color: "text-amber-600 bg-amber-50" },
    ];

    return (
        <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-xl border border-border shadow-xs">
                <div>
                    <h2 className="text-xl font-bold text-foreground">Google AdSense Manager</h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                        Monetize your property listings and guest portal pages with targeted advertising.
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="text-xs font-medium text-slate-500">Ad Serving Status:</span>
                    <button
                        type="button"
                        onClick={() => setAdEnabled(!adEnabled)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            adEnabled
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                        }`}
                    >
                        {adEnabled ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                        {adEnabled ? "Active & Serving" : "Paused"}
                    </button>
                </div>
            </div>

            {/* Performance Metrics Row */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((st) => {
                    const Icon = st.icon;
                    return (
                        <Card key={st.label} className="rounded-xl border border-border shadow-2xs hover:shadow-xs transition-shadow">
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{st.label}</p>
                                    <h3 className="text-2xl font-black text-foreground mt-1">{st.value}</h3>
                                    <span className="text-[11px] font-semibold text-emerald-600 inline-block mt-0.5">{st.change} vs last month</span>
                                </div>
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${st.color}`}>
                                    <Icon size={20} />
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* How It Works & Ad Units Setup */}
            <div className="grid gap-6 lg:grid-cols-3">
                <Card className="lg:col-span-2 rounded-xl border border-border shadow-2xs">
                    <CardHeader className="pb-3 border-b border-border/60">
                        <CardTitle className="text-base font-bold">Property Ad Placements</CardTitle>
                        <CardDescription className="text-xs">
                            Active ad unit slots rendered across your hostel, hotel, and guest booking pages.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 space-y-4">
                        {[
                            { name: "Listing Sidebar Banner", size: "300 x 250 (Medium Rectangle)", placement: "Hostel & Hotel detail pages", status: "Active" },
                            { name: "Booking Confirmation Banner", size: "728 x 90 (Leaderboard)", placement: "Post-reservation receipt screen", status: "Active" },
                            { name: "Guest Portal Footer", size: "Responsive Fluid", placement: "Mobile & desktop guest views", status: "Active" },
                        ].map((unit, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all gap-2">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{unit.name}</p>
                                    <p className="text-xs text-slate-500">{unit.placement} • <span className="font-mono text-slate-600">{unit.size}</span></p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md self-start sm:self-auto border border-emerald-100">
                                    <CheckCircle size={12} /> {unit.status}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* How it works info */}
                <Card className="rounded-xl border border-border shadow-2xs bg-gradient-to-br from-blue-50/30 to-indigo-50/30">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Sparkles size={16} />
                            <CardTitle className="text-base font-bold text-slate-800">How AdSense Works</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-5 pt-2 space-y-3 text-xs text-slate-600 leading-relaxed">
                        <p>
                            1. <strong>Contextual Matching</strong>: Google scans guest browsing queries and displays relevant local travel, transit, and food ads.
                        </p>
                        <p>
                            2. <strong>Revenue Share</strong>: You receive monthly automated payouts directly to your linked bank account based on valid impressions and clicks.
                        </p>
                        <p>
                            3. <strong>Brand Safety</strong>: Restricted categories (competitor accommodation banners) are blocked automatically.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

