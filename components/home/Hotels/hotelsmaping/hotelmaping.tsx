"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Hotel,
    Building2,
    Sparkles,
    Calendar,
    Clock,
    BedDouble,
    ShieldCheck,
    Star,
    Coffee,
    ArrowRight,
    CheckCircle2,
    MapPin,
    Users,
    KeyRound,
    ConciergeBell,
    TrendingUp,
    UtensilsCrossed,
    Crown,
    BellRing,
    ChevronRight,
    Wifi,
    Car,
    Waves
} from "lucide-react";
import DashboardSidebar from "@/components/user/dashboard/dashboard-sidebar";
import DashboardHeader from "@/components/user/dashboard/dashboard-header";
import { toast } from "sonner";

export default function HotelManagement() {
    const [email, setEmail] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [activeTab, setActiveTab] = useState<"overview" | "features" | "preview">("overview");

    const handleSubscribe = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !email.includes("@")) {
            toast.error("Please enter a valid email address.");
            return;
        }
        setIsSubscribed(true);
        toast.success("You're on the VIP waitlist!", {
            description: "We'll notify you as soon as Hotel Management goes live."
        });
        setEmail("");
    };

    return (
        <div className="flex min-h-screen bg-muted/30">
            <DashboardSidebar />
            <main className="flex-1 p-6 space-y-6">
                <DashboardHeader />

                <div className="flex-1 max-w-[1400px] w-full mx-auto space-y-6">

                    {/* Top Header */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                                    <Sparkles size={12} className="text-amber-500" />
                                    Dedicated Hotel Architecture
                                </span>
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                                    Coming Soon
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
                                Hotel & Resort Management
                            </h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Distinct property management tailored for private suites, per-night stays, and premium hospitality.
                            </p>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <Link
                                href="/hostel"
                                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-border/70 bg-card hover:bg-muted text-foreground transition-all shadow-xs"
                            >
                                <Building2 size={15} className="text-muted-foreground" />
                                Switch to Hostels
                            </Link>

                            <button
                                onClick={() => {
                                    toast.info("Hotel listing creation will be available upon module launch.", {
                                        description: "Join early access below to receive priority onboarding."
                                    });
                                }}
                                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-sm transition-all"
                            >
                                <Hotel size={15} />
                                Add Hotel (Early Access)
                            </button>
                        </div>
                    </div>

                    {/* HERO COMING SOON BANNER */}
                    <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-br from-amber-500/[0.04] via-card to-primary/[0.03] p-6 sm:p-8 shadow-sm">
                        {/* Background subtle radial blurs */}
                        <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                        <div className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

                        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                            <div className="lg:col-span-7 space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-700 text-xs font-semibold">
                                    <Crown size={14} className="text-amber-600" />
                                    <span>Built for Hotels, Not Shared Hostels</span>
                                </div>

                                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground leading-tight">
                                    Next-Gen Hotel Operations & Daily Tariff Engine
                                </h2>

                                <p className="text-muted-foreground text-sm leading-relaxed">
                                    Unlike student or co-living hostels with monthly bed-sharing rents, our upcoming <strong className="text-foreground">Hotel Management Suite</strong> delivers full control over private room categories (Deluxe, Presidential, Executive), per-night dynamic pricing, front-desk concierge check-ins, and luxury amenities.
                                </p>

                                {/* Key Highlights Pills */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-border/50 text-xs font-medium text-foreground backdrop-blur-xs">
                                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                        <span>Per-Night Tariffs</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-border/50 text-xs font-medium text-foreground backdrop-blur-xs">
                                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                        <span>100% Private Suites</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-border/50 text-xs font-medium text-foreground backdrop-blur-xs">
                                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                        <span>Front Desk Concierge</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-border/50 text-xs font-medium text-foreground backdrop-blur-xs">
                                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                        <span>12 PM / 11 AM Check-in</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-border/50 text-xs font-medium text-foreground backdrop-blur-xs">
                                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                        <span>Room Service POS</span>
                                    </div>
                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white/70 border border-border/50 text-xs font-medium text-foreground backdrop-blur-xs">
                                        <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                                        <span>Star Rating System</span>
                                    </div>
                                </div>

                                {/* VIP Waitlist Input */}
                                <form onSubmit={handleSubscribe} className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md">
                                    <input
                                        type="email"
                                        placeholder="Enter owner email for VIP access..."
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-border bg-white text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all shadow-xs"
                                    />
                                    <button
                                        type="submit"
                                        className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold transition-all shrink-0 shadow-xs flex items-center justify-center gap-1.5"
                                    >
                                        <BellRing size={14} />
                                        Notify Me First
                                    </button>
                                </form>
                            </div>

                            {/* Right Sneak Peek Badge Card */}
                            <div className="lg:col-span-5">
                                <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm space-y-4 relative overflow-hidden">
                                    <div className="absolute top-3 right-3">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            Architecture Ready
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 shrink-0">
                                            <Hotel size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-sm text-foreground">Hotel Engine vs Hostel Engine</h3>
                                            <p className="text-xs text-muted-foreground">Clean separation of business models</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div className="p-2.5 rounded-xl bg-muted/40 border border-border/40 flex items-start gap-2.5">
                                            <Building2 size={16} className="text-muted-foreground mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-semibold text-foreground">Hostel Module:</span>
                                                <p className="text-muted-foreground text-[11px] mt-0.5">Focuses on student/working shared rooms (1-share, 2-share), monthly security deposits, and mess meal schedules.</p>
                                            </div>
                                        </div>

                                        <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 flex items-start gap-2.5">
                                            <Hotel size={16} className="text-amber-600 mt-0.5 shrink-0" />
                                            <div>
                                                <span className="font-semibold text-amber-900">Hotel Module (This Page):</span>
                                                <p className="text-amber-800/80 text-[11px] mt-0.5">Focuses on travelers, dynamic daily tariffs, private occupancy, star grading, and express digital check-ins.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-1 flex items-center justify-between text-[11px] text-muted-foreground border-t border-border/40">
                                        <span>Status: Backend & UI Blueprinting</span>
                                        <span className="text-amber-600 font-semibold flex items-center gap-1">
                                            Phase 1 Preview <ArrowRight size={12} />
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FEATURE HIGHLIGHTS GRID */}
                    <div>
                        <div className="mb-4">
                            <h3 className="text-base font-bold text-foreground tracking-tight">Core Features in Hotel Management</h3>
                            <p className="text-xs text-muted-foreground">What you can look forward to managing from this panel:</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Feature 1 */}
                            <div className="p-5 rounded-2xl border border-border/50 bg-card hover:border-amber-500/30 transition-all hover:shadow-xs group">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <TrendingUp size={20} />
                                </div>
                                <h4 className="font-semibold text-sm text-foreground mb-1">Per-Night Tariff Control</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Set seasonal, weekday, and holiday rates per night with instant discount coupon controls.
                                </p>
                            </div>

                            {/* Feature 2 */}
                            <div className="p-5 rounded-2xl border border-border/50 bg-card hover:border-primary/30 transition-all hover:shadow-xs group">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <BedDouble size={20} />
                                </div>
                                <h4 className="font-semibold text-sm text-foreground mb-1">Deluxe & Suite Inventory</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Individual room numbering, bed sizes (King, Queen, Twin), view types, and balcony specs.
                                </p>
                            </div>

                            {/* Feature 3 */}
                            <div className="p-5 rounded-2xl border border-border/50 bg-card hover:border-emerald-500/30 transition-all hover:shadow-xs group">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <ConciergeBell size={20} />
                                </div>
                                <h4 className="font-semibold text-sm text-foreground mb-1">Front Desk & Express Pass</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Rapid guest ID scanning, keycard allotment, guest check-in (12 PM) and check-out (11 AM) logs.
                                </p>
                            </div>

                            {/* Feature 4 */}
                            <div className="p-5 rounded-2xl border border-border/50 bg-card hover:border-indigo-500/30 transition-all hover:shadow-xs group">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                                    <UtensilsCrossed size={20} />
                                </div>
                                <h4 className="font-semibold text-sm text-foreground mb-1">In-Room Dining & Services</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Track dining orders, laundry requests, minibar usage, and add billable services to check-out invoice.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SAMPLE HOTEL PREVIEW CARD */}
                    <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-xs space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-border/40">
                            <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Interactive Mockup Preview</span>
                                <h3 className="text-lg font-bold text-foreground">Sample Enrolled Hotel Profile</h3>
                            </div>
                            <span className="text-xs px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-semibold border border-amber-200 w-fit">
                                Preview Mode Only
                            </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                            <div className="lg:col-span-4 rounded-xl overflow-hidden border border-border/50 bg-slate-100 h-48 relative flex items-center justify-center">
                                <div className="text-center p-4">
                                    <Hotel size={40} className="mx-auto text-amber-600 mb-2 opacity-80" />
                                    <p className="text-xs font-semibold text-slate-700">The Grand Horizon Palace</p>
                                    <p className="text-[11px] text-slate-500">5-Star Luxury Resort & Spa</p>
                                </div>
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-medium backdrop-blur-xs">
                                    5.0 ★ Luxury
                                </div>
                            </div>

                            <div className="lg:col-span-8 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-base font-bold text-foreground">The Grand Horizon Palace & Suites</h4>
                                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <MapPin size={12} className="text-muted-foreground" />
                                            Banjara Hills, Hyderabad • 24 Suites Configured
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-extrabold text-foreground">₹4,499</span>
                                        <span className="text-xs text-muted-foreground"> / night</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-1">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-foreground">
                                        <Wifi size={12} /> High-Speed Wi-Fi
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-foreground">
                                        <Waves size={12} /> Infinity Pool
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-foreground">
                                        <Car size={12} /> Valet Parking
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-foreground">
                                        <Coffee size={12} /> Complimentary Breakfast
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-muted text-[11px] font-medium text-foreground">
                                        <Clock size={12} /> 24/7 Room Service
                                    </span>
                                </div>

                                <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>Check-in: 12:00 PM • Check-out: 11:00 AM</span>
                                    <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                        <ShieldCheck size={14} /> Ready for Deployment
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
