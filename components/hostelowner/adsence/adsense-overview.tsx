"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Sparkles,
    Eye,
    MousePointerClick,
    TrendingUp,
    Plus,
    CheckCircle2,
    Clock,
    PauseCircle,
    PlayCircle,
    Trash2,
    ExternalLink,
    Building2,
    Palmtree,
    MapPin,
    Star,
    Layers,
    Info,
    Check,
    ArrowRight,
    ArrowLeft,
    Calendar,
    DollarSign,
    Target,
    Loader2,
    AlertCircle,
    CreditCard,
    ShieldCheck,
    ChevronRight,
    ChevronDown,
    Smartphone,
    Wallet,
    BarChart3,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    getOwnerCampaigns,
    createAdCampaign,
    toggleCampaignStatus,
    deleteCampaign,
    getOwnerPropertiesForAd,
    getAdPlans,
} from "@/services/adsense.service";
import type { AdCampaignItem, OwnerPropertyOption, AdPlanItem } from "@/types/adsense.types";

export default function AdSenseOverview() {
    const queryClient = useQueryClient();

    // Navigation & Views
    const [viewMode, setViewMode] = useState<"dashboard" | "create">("dashboard");
    const [createStep, setCreateStep] = useState<1 | 2 | 3>(1);
    const [selectedTab, setSelectedTab] = useState<"analytics" | "campaigns" | "placements" | "preview">("analytics");
    const [statusFilter, setStatusFilter] = useState<"All" | "Active" | "Paused" | "Completed">("All");

    // Collapsible dropdown sections for property selection in Step 1
    const [isHotelsDropdownOpen, setIsHotelsDropdownOpen] = useState(true);
    const [isRentalsDropdownOpen, setIsRentalsDropdownOpen] = useState(true);

    // Modal States for Live View simulation
    const [previewItem, setPreviewItem] = useState<AdCampaignItem | null>(null);

    // Form State for new campaign
    const [selectedPropertyKey, setSelectedPropertyKey] = useState<string>("");
    const [campaignName, setCampaignName] = useState("");
    const [selectedAdType, setSelectedAdType] = useState<"sponsored_listing" | "display_banner">("sponsored_listing");
    const [selectedPlacement, setSelectedPlacement] = useState<"search_feed_top" | "listing_sidebar" | "city_header">("search_feed_top");
    const [selectedPackageId, setSelectedPackageId] = useState("pkg-15");

    // 1. Fetch real campaigns from backend
    const { data: serverData, isLoading: isCampaignsLoading } = useQuery({
        queryKey: ["ownerCampaigns", statusFilter],
        queryFn: () => getOwnerCampaigns(statusFilter),
        refetchOnWindowFocus: true,
    });

    // 2. Fetch real properties owned by this user
    const { data: serverProperties, isLoading: isPropertiesLoading } = useQuery({
        queryKey: ["ownerAdProperties"],
        queryFn: getOwnerPropertiesForAd,
        refetchOnWindowFocus: false,
    });

    // 3. Fetch real Ad Plans configured in backend
    const { data: serverPlans, isLoading: isPlansLoading } = useQuery({
        queryKey: ["adPlans"],
        queryFn: getAdPlans,
        refetchOnWindowFocus: false,
    });

    const packagesList: AdPlanItem[] = serverPlans || [];
    const propertiesList: OwnerPropertyOption[] = serverProperties || [];
    const hotelsList = propertiesList.filter((p) => p.property_type === "hotel");
    const rentalsList = propertiesList.filter((p) => p.property_type === "vacation_rental");
    const campaigns: AdCampaignItem[] = serverData?.campaigns || [];

    // Real summary statistics from backend
    const stats = serverData?.stats || {
        active_campaigns: campaigns.filter((c) => c.status === "active").length,
        total_impressions: campaigns.reduce((acc, c) => acc + (c.impressions_count || 0), 0),
        total_clicks: campaigns.reduce((acc, c) => acc + (c.clicks_count || 0), 0),
        avg_ctr: 0.0,
    };

    // Filter campaigns by tab filter
    const filteredCampaigns = campaigns.filter((c) => {
        if (statusFilter === "All") return true;
        return c.status.toLowerCase() === statusFilter.toLowerCase();
    });

    // Currently selected property for the creation flow
    const effectiveSelectedPropertyId = selectedPropertyKey || propertiesList[0]?.id;
    const selectedProperty = propertiesList.find((p) => p.id === effectiveSelectedPropertyId) || propertiesList[0];
    const selectedPkg =
        packagesList.find((p) => p.plan_code === selectedPackageId) ||
        packagesList.find((p) => p.is_popular) ||
        packagesList[0] || {
            id: 2,
            plan_code: "pkg-15",
            name: "Growth Spotlight",
            duration_days: 15,
            duration_display: "15 Days",
            price: 699,
            description: "15 continuous days in top 2 positions.",
            is_popular: true,
            is_active: true,
            order: 2,
        };

    // Calculated dates for display
    const startDateFormatted = new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(new Date());

    const endDate = new Date();
    endDate.setDate(endDate.getDate() + (selectedPkg?.duration_days || 15));
    const endDateFormatted = new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
    }).format(endDate);

    // 3. Mutations for real backend operations
    const toggleMutation = useMutation({
        mutationFn: (id: number | string) => toggleCampaignStatus(id),
        onSuccess: (res) => {
            toast.success(res.message || "Campaign status updated.");
            queryClient.invalidateQueries({ queryKey: ["ownerCampaigns"] });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.message || "Failed to update campaign.";
            toast.error(msg);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number | string) => deleteCampaign(id),
        onSuccess: () => {
            toast.success("Campaign archived successfully.");
            queryClient.invalidateQueries({ queryKey: ["ownerCampaigns"] });
        },
        onError: (err: any) => {
            const msg = err?.response?.data?.message || err?.message || "Failed to archive campaign.";
            toast.error(msg);
        },
    });

    const createMutation = useMutation({
        mutationFn: (payload: any) => createAdCampaign(payload),
        onSuccess: (res) => {
            toast.success(res.message || "Ad campaign launched successfully!");
            queryClient.invalidateQueries({ queryKey: ["ownerCampaigns"] });
            setViewMode("dashboard");
            setCreateStep(1);
            setCampaignName("");
        },
        onError: (err: any) => {
            const errorData = err?.response?.data;
            const msg =
                errorData?.hotel?.[0] ||
                errorData?.vacation_rental?.[0] ||
                errorData?.detail ||
                err?.message ||
                "Failed to create campaign.";
            toast.error(msg);
        },
    });

    const handleLaunchCampaign = () => {
        if (!selectedProperty) {
            toast.error("Please select a Hotel or Vacation Rental to launch your campaign.");
            return;
        }

        const payload: any = {
            campaign_name: campaignName.trim() || `${selectedProperty.title} - ${selectedPkg.duration_display} Boost`,
            ad_type: selectedAdType,
            placement: selectedPlacement,
            property_type: selectedProperty.property_type,
            duration_days: selectedPkg.duration_days,
            budget: selectedPkg.price,
        };

        if (selectedProperty.property_type === "hotel") {
            payload.hotel = selectedProperty.id;
        } else {
            payload.vacation_rental = selectedProperty.id;
        }

        createMutation.mutate(payload);
    };

    const startCreationFlow = (packageId?: string) => {
        if (packageId) setSelectedPackageId(packageId);
        if (propertiesList.length > 0 && !selectedPropertyKey) {
            setSelectedPropertyKey(propertiesList[0].id);
        }
        setCreateStep(1);
        setViewMode("create");
    };

    // Primary property for simulator preview
    const previewProperty = propertiesList[0];

    // ==========================================
    // VIEW: IN-PAGE STEP-BY-STEP CREATION FLOW
    // ==========================================
    if (viewMode === "create") {
        return (
            <div className="space-y-6 w-full pb-16">
                {/* 1. Header with Breadcrumb Back Navigation */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card dark:bg-slate-900/90 p-5 rounded-md border border-border dark:border-slate-800 shadow-xs">
                    <div className="space-y-1">
                        <button
                            type="button"
                            onClick={() => {
                                setViewMode("dashboard");
                                setCreateStep(1);
                            }}
                            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground dark:text-slate-400 dark:hover:text-slate-100 transition-colors cursor-pointer mb-1"
                        >
                            <ArrowLeft size={13} />
                            <span>Back to Campaigns Dashboard</span>
                        </button>
                        <div className="flex items-center gap-2">
                            <span className="p-1.5 rounded-sm bg-primary/10 text-primary dark:bg-indigo-950/60 dark:text-indigo-400 border border-primary/20 dark:border-indigo-800/40">
                                <Sparkles size={16} />
                            </span>
                            <h2 className="text-lg sm:text-xl font-bold text-foreground dark:text-slate-100">
                                Launch Sponsored Ad Campaign
                            </h2>
                        </div>
                        <p className="text-xs text-muted-foreground dark:text-slate-400 max-w-2xl">
                            Follow the 3-step setup to feature your property at the top of guest search queries and checkout via Razorpay.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                setViewMode("dashboard");
                                setCreateStep(1);
                            }}
                            className="h-8 px-3 text-xs rounded-sm border-border dark:border-slate-800 text-foreground dark:text-slate-200 cursor-pointer"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>

                {/* 2. Visual Step Progress Bar */}
                <div className="bg-card dark:bg-slate-900/80 p-4 rounded-md border border-border dark:border-slate-800">
                    <div className="grid grid-cols-3 gap-2 sm:gap-4 relative">
                        {/* Step 1 Indicator */}
                        <div
                            onClick={() => setCreateStep(1)}
                            className={`flex items-center gap-2.5 p-2 rounded-sm cursor-pointer transition-colors ${
                                createStep === 1
                                    ? "bg-primary/10 dark:bg-indigo-950/40 border border-primary/30 dark:border-indigo-800/40"
                                    : "hover:bg-muted/40 dark:hover:bg-slate-800/40"
                            }`}
                        >
                            <div
                                className={`w-7 h-7 shrink-0 rounded-sm flex items-center justify-center text-xs font-bold transition-all ${
                                    createStep > 1
                                        ? "bg-emerald-600 text-white"
                                        : createStep === 1
                                        ? "bg-primary text-primary-foreground dark:bg-indigo-600 shadow-xs"
                                        : "bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400"
                                }`}
                            >
                                {createStep > 1 ? <Check size={14} /> : "1"}
                            </div>
                            <div className="hidden sm:block min-w-0">
                                <p className="text-xs font-semibold text-foreground dark:text-slate-100 truncate">Property & Format</p>
                                <p className="text-[10px] text-muted-foreground dark:text-slate-400 truncate">Select listing</p>
                            </div>
                        </div>

                        {/* Step 2 Indicator */}
                        <div
                            onClick={() => {
                                if (propertiesList.length > 0) setCreateStep(2);
                            }}
                            className={`flex items-center gap-2.5 p-2 rounded-sm cursor-pointer transition-colors ${
                                createStep === 2
                                    ? "bg-primary/10 dark:bg-indigo-950/40 border border-primary/30 dark:border-indigo-800/40"
                                    : "hover:bg-muted/40 dark:hover:bg-slate-800/40"
                            }`}
                        >
                            <div
                                className={`w-7 h-7 shrink-0 rounded-sm flex items-center justify-center text-xs font-bold transition-all ${
                                    createStep > 2
                                        ? "bg-emerald-600 text-white"
                                        : createStep === 2
                                        ? "bg-primary text-primary-foreground dark:bg-indigo-600 shadow-xs"
                                        : "bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400"
                                }`}
                            >
                                {createStep > 2 ? <Check size={14} /> : "2"}
                            </div>
                            <div className="hidden sm:block min-w-0">
                                <p className="text-xs font-semibold text-foreground dark:text-slate-100 truncate">Placement & Plan</p>
                                <p className="text-[10px] text-muted-foreground dark:text-slate-400 truncate">Duration & reach</p>
                            </div>
                        </div>

                        {/* Step 3 Indicator */}
                        <div
                            onClick={() => {
                                if (propertiesList.length > 0) setCreateStep(3);
                            }}
                            className={`flex items-center gap-2.5 p-2 rounded-sm cursor-pointer transition-colors ${
                                createStep === 3
                                    ? "bg-primary/10 dark:bg-indigo-950/40 border border-primary/30 dark:border-indigo-800/40"
                                    : "hover:bg-muted/40 dark:hover:bg-slate-800/40"
                            }`}
                        >
                            <div
                                className={`w-7 h-7 shrink-0 rounded-sm flex items-center justify-center text-xs font-bold transition-all ${
                                    createStep === 3
                                        ? "bg-primary text-primary-foreground dark:bg-indigo-600 shadow-xs"
                                        : "bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400"
                                }`}
                            >
                                3
                            </div>
                            <div className="hidden sm:block min-w-0">
                                <p className="text-xs font-semibold text-foreground dark:text-slate-100 truncate">Razorpay Checkout</p>
                                <p className="text-[10px] text-muted-foreground dark:text-slate-400 truncate">Review & launch</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Empty State if Owner Has No Properties */}
                {isPropertiesLoading ? (
                    <Card className="rounded-md border border-border p-12 text-center">
                        <Loader2 size={24} className="animate-spin text-primary mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Loading your properties...</p>
                    </Card>
                ) : propertiesList.length === 0 ? (
                    <Card className="rounded-md border border-amber-300/40 bg-amber-500/10 p-8 text-center space-y-3">
                        <AlertCircle size={28} className="mx-auto text-amber-600 dark:text-amber-400" />
                        <div className="space-y-1">
                            <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                                No Hotel or Vacation Rental Registered
                            </h3>
                            <p className="text-xs text-muted-foreground max-w-md mx-auto">
                                You do not have any active properties registered under your owner account. Please register a Hotel or Vacation Rental first before launching a sponsored ad campaign.
                            </p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setViewMode("dashboard")}
                            className="h-8 px-4 text-xs rounded-sm border-border cursor-pointer"
                        >
                            Return to Overview
                        </Button>
                    </Card>
                ) : (
                    <div className="w-full">
                        {/* STEP 1: SELECT PROPERTY & FORMAT */}
                        {createStep === 1 && (
                            <div className="space-y-6">
                                <Card className="rounded-md border border-border bg-card dark:bg-slate-900/90 shadow-xs">
                                    <CardHeader className="p-5 border-b border-border">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</span>
                                            <CardTitle className="text-sm sm:text-base font-bold">Select Target Property</CardTitle>
                                        </div>
                                        <CardDescription className="text-xs text-muted-foreground">
                                            Choose the Hotel or Vacation Rental you want to promote across guest searches.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5 space-y-6">
                                        {/* Application-Type Property Dropdown */}
                                        <div className="space-y-1.5 pb-2 border-b border-border dark:border-slate-800">
                                            <label className="text-xs font-semibold text-foreground dark:text-slate-100 flex items-center justify-between">
                                                <span>Choose Property (Application Dropdown)</span>
                                                <span className="text-[11px] text-muted-foreground dark:text-slate-400 font-normal">
                                                    {hotelsList.length} Hotels • {rentalsList.length} Vacation Rentals available
                                                </span>
                                            </label>
                                            <Select
                                                value={effectiveSelectedPropertyId || ""}
                                                onValueChange={(val) => setSelectedPropertyKey(val)}
                                            >
                                                <SelectTrigger className="w-full h-10 px-3 text-xs rounded-sm border-border dark:border-slate-800 bg-muted/20 dark:bg-slate-950 text-foreground dark:text-slate-100 cursor-pointer shadow-2xs">
                                                    <SelectValue placeholder="Choose a Hotel or Vacation Rental" />
                                                </SelectTrigger>
                                                <SelectContent
                                                    position="popper"
                                                    sideOffset={4}
                                                    className="w-[var(--radix-select-trigger-width)] max-h-60 overflow-y-auto rounded-md border border-border dark:border-slate-800 bg-popover dark:bg-slate-900 text-popover-foreground dark:text-slate-100 shadow-xl z-[10001] [&_[data-radix-select-viewport]]:!h-auto [&_[data-radix-select-viewport]]:max-h-60 [&>div]:!h-auto"
                                                >
                                                    {hotelsList.length > 0 && (
                                                        <SelectGroup>
                                                            <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-primary dark:text-indigo-400 flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/30 dark:bg-slate-800/40 sticky top-0 z-10 backdrop-blur-xs">
                                                                <Building2 size={12} />
                                                                <span>Hotels ({hotelsList.length})</span>
                                                            </SelectLabel>
                                                            {hotelsList.map((h) => (
                                                                <SelectItem
                                                                    key={h.id}
                                                                    value={h.id}
                                                                    className="group text-xs cursor-pointer rounded-sm py-2 px-2.5 transition-colors text-foreground dark:text-slate-100 focus:bg-primary/10 focus:text-foreground hover:bg-primary/10 hover:text-foreground data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground dark:focus:bg-slate-800 dark:focus:text-white dark:hover:bg-slate-800 dark:data-[highlighted]:bg-slate-800 dark:data-[highlighted]:text-white data-[state=checked]:bg-primary/15 dark:data-[state=checked]:bg-indigo-950/50"
                                                                >
                                                                    <div className="flex items-center justify-between w-full gap-3">
                                                                        <span className="font-semibold text-foreground dark:text-slate-100 truncate">{h.title}</span>
                                                                        <span className="text-[10px] text-muted-foreground dark:text-slate-400 shrink-0">
                                                                            {h.city_name} • ₹{h.price ? h.price.toLocaleString("en-IN") : "0"}/night
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    )}
                                                    {rentalsList.length > 0 && (
                                                        <SelectGroup className="border-t border-border/60 dark:border-slate-800 mt-1 pt-1">
                                                            <SelectLabel className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/30 dark:bg-slate-800/40 sticky top-0 z-10 backdrop-blur-xs">
                                                                <Palmtree size={12} />
                                                                <span>Vacation Rentals ({rentalsList.length})</span>
                                                            </SelectLabel>
                                                            {rentalsList.map((r) => (
                                                                <SelectItem
                                                                    key={r.id}
                                                                    value={r.id}
                                                                    className="group text-xs cursor-pointer rounded-sm py-2 px-2.5 transition-colors text-foreground dark:text-slate-100 focus:bg-primary/10 focus:text-foreground hover:bg-primary/10 hover:text-foreground data-[highlighted]:bg-primary/10 data-[highlighted]:text-foreground dark:focus:bg-slate-800 dark:focus:text-white dark:hover:bg-slate-800 dark:data-[highlighted]:bg-slate-800 dark:data-[highlighted]:text-white data-[state=checked]:bg-primary/15 dark:data-[state=checked]:bg-indigo-950/50"
                                                                >
                                                                    <div className="flex items-center justify-between w-full gap-3">
                                                                        <span className="font-semibold text-foreground dark:text-slate-100 truncate">{r.title}</span>
                                                                        <span className="text-[10px] text-muted-foreground dark:text-slate-400 shrink-0">
                                                                            {r.city_name} • ₹{r.price ? r.price.toLocaleString("en-IN") : "0"}/night
                                                                        </span>
                                                                    </div>
                                                                </SelectItem>
                                                            ))}
                                                        </SelectGroup>
                                                    )}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* SECTION 1: HOTELS (COLLAPSIBLE DROPDOWN) */}
                                        <div className="space-y-3 rounded-md border border-border dark:border-slate-800 bg-card/60 dark:bg-slate-900/40 overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setIsHotelsDropdownOpen(!isHotelsDropdownOpen)}
                                                className="w-full flex items-center justify-between p-3.5 bg-muted/30 hover:bg-muted/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className="p-1.5 rounded-sm bg-primary/10 text-primary dark:bg-indigo-950/60 dark:text-indigo-400">
                                                        <Building2 size={16} />
                                                    </span>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-foreground dark:text-slate-100 flex items-center gap-2">
                                                            <span>Hotels</span>
                                                            <span className="px-1.5 py-0.5 rounded-xs bg-primary/10 text-primary dark:bg-indigo-950/80 dark:text-indigo-300 text-[10px] font-bold">
                                                                {hotelsList.length} Available
                                                            </span>
                                                        </h4>
                                                        <p className="text-[10px] text-muted-foreground dark:text-slate-400">
                                                            Click to {isHotelsDropdownOpen ? "collapse" : "view"} your boutique hotels and luxury suites
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-medium text-muted-foreground dark:text-slate-400 hidden sm:inline">
                                                        {isHotelsDropdownOpen ? "Hide list" : "Show list"}
                                                    </span>
                                                    <ChevronDown
                                                        size={16}
                                                        className={`text-muted-foreground dark:text-slate-400 transition-transform duration-200 ${
                                                            isHotelsDropdownOpen ? "rotate-180" : ""
                                                        }`}
                                                    />
                                                </div>
                                            </button>

                                            {isHotelsDropdownOpen && (
                                                <div className="p-3.5 pt-1 space-y-3">
                                                    {hotelsList.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                                                            {hotelsList.map((p) => {
                                                                const isSelected = p.id === effectiveSelectedPropertyId;
                                                                return (
                                                                    <div
                                                                        key={p.id}
                                                                        onClick={() => setSelectedPropertyKey(p.id)}
                                                                        className={`p-3 rounded-md border text-left cursor-pointer transition-all flex gap-3 relative ${
                                                                            isSelected
                                                                                ? "border-primary bg-primary/5 dark:border-indigo-500 dark:bg-indigo-950/30 ring-1 ring-primary dark:ring-indigo-500"
                                                                                : "border-border dark:border-slate-800 bg-card dark:bg-slate-900/60 hover:bg-muted/30 dark:hover:bg-slate-800/40"
                                                                        }`}
                                                                    >
                                                                        <div className="w-20 h-20 rounded-sm bg-muted dark:bg-slate-800 overflow-hidden shrink-0 relative">
                                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                            <img
                                                                                src={p.image_url || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=400&q=80"}
                                                                                alt={p.title}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-xs bg-slate-950/80 text-white text-[9px] font-semibold uppercase">
                                                                                Hotel
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex-1 min-w-0 space-y-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-[10px] text-muted-foreground dark:text-slate-400 flex items-center gap-1 truncate">
                                                                                    <MapPin size={11} />
                                                                                    {p.city_name}
                                                                                </span>
                                                                                <div className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                                                                                    <Star size={11} fill="currentColor" />
                                                                                    <span>{p.rating || 5.0}</span>
                                                                                </div>
                                                                            </div>
                                                                            <h4 className="text-xs font-bold text-foreground dark:text-slate-100 truncate">{p.title}</h4>
                                                                            <p className="text-xs font-extrabold text-foreground dark:text-slate-100">
                                                                                ₹{p.price ? p.price.toLocaleString("en-IN") : "0"} <span className="text-[10px] font-normal text-muted-foreground dark:text-slate-400">/night</span>
                                                                            </p>
                                                                        </div>

                                                                        {isSelected && (
                                                                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground dark:bg-indigo-600 flex items-center justify-center shadow-xs">
                                                                                <Check size={11} strokeWidth={3} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center text-xs text-muted-foreground dark:text-slate-400 bg-muted/20 dark:bg-slate-950/40 rounded-sm border border-dashed border-border dark:border-slate-800">
                                                            No hotels currently registered under this account.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* SECTION 2: VACATION RENTALS (COLLAPSIBLE DROPDOWN) */}
                                        <div className="space-y-3 rounded-md border border-border dark:border-slate-800 bg-card/60 dark:bg-slate-900/40 overflow-hidden">
                                            <button
                                                type="button"
                                                onClick={() => setIsRentalsDropdownOpen(!isRentalsDropdownOpen)}
                                                className="w-full flex items-center justify-between p-3.5 bg-muted/30 hover:bg-muted/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-left"
                                            >
                                                <div className="flex items-center gap-2.5">
                                                    <span className="p-1.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                                        <Palmtree size={16} />
                                                    </span>
                                                    <div>
                                                        <h4 className="text-xs font-bold text-foreground dark:text-slate-100 flex items-center gap-2">
                                                            <span>Vacation Rentals</span>
                                                            <span className="px-1.5 py-0.5 rounded-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                                                                {rentalsList.length} Available
                                                            </span>
                                                        </h4>
                                                        <p className="text-[10px] text-muted-foreground dark:text-slate-400">
                                                            Click to {isRentalsDropdownOpen ? "collapse" : "view"} your villas, cottages, and holiday stays
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[11px] font-medium text-muted-foreground dark:text-slate-400 hidden sm:inline">
                                                        {isRentalsDropdownOpen ? "Hide list" : "Show list"}
                                                    </span>
                                                    <ChevronDown
                                                        size={16}
                                                        className={`text-muted-foreground dark:text-slate-400 transition-transform duration-200 ${
                                                            isRentalsDropdownOpen ? "rotate-180" : ""
                                                        }`}
                                                    />
                                                </div>
                                            </button>

                                            {isRentalsDropdownOpen && (
                                                <div className="p-3.5 pt-1 space-y-3">
                                                    {rentalsList.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
                                                            {rentalsList.map((p) => {
                                                                const isSelected = p.id === effectiveSelectedPropertyId;
                                                                return (
                                                                    <div
                                                                        key={p.id}
                                                                        onClick={() => setSelectedPropertyKey(p.id)}
                                                                        className={`p-3 rounded-md border text-left cursor-pointer transition-all flex gap-3 relative ${
                                                                            isSelected
                                                                                ? "border-emerald-500 bg-emerald-500/5 dark:border-emerald-500 dark:bg-emerald-950/30 ring-1 ring-emerald-500"
                                                                                : "border-border dark:border-slate-800 bg-card dark:bg-slate-900/60 hover:bg-muted/30 dark:hover:bg-slate-800/40"
                                                                        }`}
                                                                    >
                                                                        <div className="w-20 h-20 rounded-sm bg-muted dark:bg-slate-800 overflow-hidden shrink-0 relative">
                                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                            <img
                                                                                src={p.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80"}
                                                                                alt={p.title}
                                                                                className="w-full h-full object-cover"
                                                                            />
                                                                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-xs bg-slate-950/80 text-white text-[9px] font-semibold uppercase">
                                                                                Rental
                                                                            </span>
                                                                        </div>

                                                                        <div className="flex-1 min-w-0 space-y-1">
                                                                            <div className="flex items-center justify-between">
                                                                                <span className="text-[10px] text-muted-foreground dark:text-slate-400 flex items-center gap-1 truncate">
                                                                                    <MapPin size={11} />
                                                                                    {p.city_name}
                                                                                </span>
                                                                                <div className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                                                                                    <Star size={11} fill="currentColor" />
                                                                                    <span>{p.rating || 5.0}</span>
                                                                                </div>
                                                                            </div>
                                                                            <h4 className="text-xs font-bold text-foreground dark:text-slate-100 truncate">{p.title}</h4>
                                                                            <p className="text-xs font-extrabold text-foreground dark:text-slate-100">
                                                                                ₹{p.price ? p.price.toLocaleString("en-IN") : "0"} <span className="text-[10px] font-normal text-muted-foreground dark:text-slate-400">/night</span>
                                                                            </p>
                                                                        </div>

                                                                        {isSelected && (
                                                                            <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-primary text-primary-foreground dark:bg-indigo-600 flex items-center justify-center shadow-xs">
                                                                                <Check size={11} strokeWidth={3} />
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center text-xs text-muted-foreground dark:text-slate-400 bg-muted/20 dark:bg-slate-950/40 rounded-sm border border-dashed border-border dark:border-slate-800">
                                                            No vacation rentals currently registered under this account.
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {/* Campaign Title & Format */}
                                        <div className="pt-4 border-t border-border dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-foreground dark:text-slate-200">
                                                    Campaign Name (Optional)
                                                </label>
                                                <Input
                                                    placeholder={`e.g. ${selectedProperty?.title || "Property"} - Surge Campaign`}
                                                    value={campaignName}
                                                    onChange={(e) => setCampaignName(e.target.value)}
                                                    className="h-9 text-xs rounded-sm bg-muted/20 dark:bg-slate-950 border-border dark:border-slate-800 text-foreground dark:text-slate-100 placeholder:text-muted-foreground dark:placeholder:text-slate-500"
                                                />
                                                <p className="text-[11px] text-muted-foreground dark:text-slate-400">
                                                    For your internal tracking only.
                                                </p>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-semibold text-foreground dark:text-slate-200">
                                                    Ad Format
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedAdType("sponsored_listing")}
                                                        className={`p-2.5 rounded-sm border text-left cursor-pointer transition-all ${
                                                            selectedAdType === "sponsored_listing"
                                                                ? "border-primary bg-primary/10 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-primary dark:ring-indigo-500"
                                                                : "border-border dark:border-slate-800 bg-card dark:bg-slate-900/60 hover:bg-muted/30 dark:hover:bg-slate-800/40"
                                                        }`}
                                                    >
                                                        <span className="block text-xs font-bold text-foreground dark:text-slate-100">Sponsored Listing</span>
                                                        <span className="block text-[10px] text-muted-foreground dark:text-slate-400 mt-0.5">Rank #1 in search grid</span>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedAdType("display_banner")}
                                                        className={`p-2.5 rounded-sm border text-left cursor-pointer transition-all ${
                                                            selectedAdType === "display_banner"
                                                                ? "border-primary bg-primary/10 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-primary dark:ring-indigo-500"
                                                                : "border-border dark:border-slate-800 bg-card dark:bg-slate-900/60 hover:bg-muted/30 dark:hover:bg-slate-800/40"
                                                        }`}
                                                    >
                                                        <span className="block text-xs font-bold text-foreground dark:text-slate-100">Featured Banner</span>
                                                        <span className="block text-[10px] text-muted-foreground dark:text-slate-400 mt-0.5">Top billboard banner</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <div className="flex items-center justify-end gap-2">
                                    <Button
                                        type="button"
                                        onClick={() => setCreateStep(2)}
                                        className="h-10 px-6 text-sm font-semibold rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer gap-2 shadow-xs transition-all"
                                    >
                                        <span>Next: Placement & Duration</span>
                                        <ArrowRight size={14} />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 2: PLACEMENT & DURATION PACKAGE */}
                        {createStep === 2 && (
                            <div className="space-y-6">
                                <Card className="rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 shadow-xs">
                                    <CardHeader className="p-5 border-b border-border dark:border-slate-800">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-sm bg-primary/10 text-primary dark:bg-indigo-950/60 dark:text-indigo-400 border border-primary/20 dark:border-indigo-800/40 flex items-center justify-center text-xs font-bold">2</span>
                                            <CardTitle className="text-sm sm:text-base font-bold text-foreground dark:text-slate-100">Choose Placement & Duration</CardTitle>
                                        </div>
                                        <CardDescription className="text-xs text-muted-foreground dark:text-slate-400">
                                            Select where your ad will appear and how long the promotion runs.
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-5 space-y-6">
                                        {/* Placements */}
                                        <div className="space-y-2">
                                            <label className="text-xs font-semibold text-foreground dark:text-slate-200">
                                                Select Advertising Placement
                                            </label>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                <div
                                                    onClick={() => setSelectedPlacement("search_feed_top")}
                                                    className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                                                        selectedPlacement === "search_feed_top"
                                                            ? "border-primary bg-primary/10 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-primary dark:ring-indigo-500"
                                                            : "border-border dark:border-slate-800 bg-card dark:bg-slate-900/60 hover:bg-muted/30 dark:hover:bg-slate-800/40"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-xs font-bold text-foreground dark:text-slate-100">Search Feed Top</span>
                                                        <span className="px-1.5 py-0.5 rounded-xs bg-amber-500/20 text-amber-700 dark:text-amber-400 text-[9px] font-bold uppercase">
                                                            High CTR
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground dark:text-slate-400 leading-relaxed">
                                                        Guaranteed top 2 positions on all guest search results for your destination.
                                                    </p>
                                                </div>

                                                <div
                                                    onClick={() => setSelectedPlacement("city_header")}
                                                    className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                                                        selectedPlacement === "city_header"
                                                            ? "border-primary bg-primary/10 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-primary dark:ring-indigo-500"
                                                            : "border-border dark:border-slate-800 bg-card dark:bg-slate-900/60 hover:bg-muted/30 dark:hover:bg-slate-800/40"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-xs font-bold text-foreground dark:text-slate-100">City Spotlight Header</span>
                                                        <span className="px-1.5 py-0.5 rounded-xs bg-indigo-500/20 text-indigo-700 dark:text-indigo-400 text-[9px] font-bold uppercase">
                                                            Brand
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground dark:text-slate-400 leading-relaxed">
                                                        Wide billboard banner visible at the top of city guides and discovery hubs.
                                                    </p>
                                                </div>

                                                <div
                                                    onClick={() => setSelectedPlacement("listing_sidebar")}
                                                    className={`p-3.5 rounded-sm border cursor-pointer transition-all ${
                                                        selectedPlacement === "listing_sidebar"
                                                            ? "border-primary bg-primary/10 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-primary dark:ring-indigo-500"
                                                            : "border-border dark:border-slate-800 bg-card dark:bg-slate-900/60 hover:bg-muted/30 dark:hover:bg-slate-800/40"
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between mb-1.5">
                                                        <span className="text-xs font-bold text-foreground dark:text-slate-100">Property Sidebar</span>
                                                        <span className="px-1.5 py-0.5 rounded-xs bg-muted dark:bg-slate-800 text-muted-foreground dark:text-slate-400 text-[9px] font-bold uppercase">
                                                            Context
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground dark:text-slate-400 leading-relaxed">
                                                        Featured on listing detail pages of nearby competing properties.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Packages from Live Backend */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <label className="text-xs font-semibold text-foreground dark:text-slate-200">
                                                    Select Duration &amp; Budget Package
                                                </label>
                                                <span className="text-[11px] text-muted-foreground dark:text-slate-400">Backend Powered • 100% Guaranteed Serving</span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                                {packagesList.map((pkg) => {
                                                    const isSelected = selectedPackageId === pkg.plan_code;
                                                    return (
                                                        <div
                                                            key={pkg.id}
                                                            onClick={() => setSelectedPackageId(pkg.plan_code)}
                                                            className={`p-4 rounded-md border cursor-pointer transition-all relative ${
                                                                isSelected
                                                                    ? "border-primary bg-primary/10 dark:border-indigo-500 dark:bg-indigo-950/40 ring-1 ring-primary dark:ring-indigo-500 shadow-xs"
                                                                    : "border-border dark:border-slate-800 bg-card dark:bg-slate-900/60 hover:bg-muted/30 dark:hover:bg-slate-800/40"
                                                            }`}
                                                        >
                                                            {pkg.is_popular && (
                                                                <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-xs bg-amber-500 text-slate-950 text-[9px] font-extrabold uppercase tracking-wider">
                                                                    Most Popular
                                                                </span>
                                                            )}
                                                            <div className="space-y-1">
                                                                <p className="text-xs font-bold text-foreground dark:text-slate-100">{pkg.name}</p>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-2xl font-black text-foreground dark:text-slate-100">₹{pkg.price}</span>
                                                                    <span className="text-xs text-muted-foreground dark:text-slate-400 font-medium">/ {pkg.duration_display}</span>
                                                                </div>
                                                                <p className="text-[11px] text-muted-foreground dark:text-slate-400 pt-1">{pkg.description}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Live Simulation Mini-Preview */}
                                        {selectedProperty && (
                                            <div className="p-4 rounded-md bg-muted/20 dark:bg-slate-950/50 border border-border dark:border-slate-800 space-y-2">
                                                <div className="flex items-center justify-between text-xs font-semibold text-foreground dark:text-slate-200">
                                                    <span className="flex items-center gap-1.5">
                                                        <Eye size={13} className="text-primary dark:text-indigo-400" />
                                                        <span>Live Guest Card Preview</span>
                                                    </span>
                                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400">
                                                        Estimated Reach: ~{selectedPkg.duration_days * 2000} impressions
                                                    </span>
                                                </div>

                                                <div className="p-3 rounded-sm bg-card dark:bg-slate-900 border border-amber-400/40 dark:border-amber-600/40 max-w-sm flex gap-3 items-center">
                                                    <div className="w-16 h-16 rounded-sm bg-muted overflow-hidden shrink-0 relative">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img
                                                            src={selectedProperty.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80"}
                                                            alt={selectedProperty.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                        <span className="absolute top-1 left-1 px-1 py-0.2 rounded-xs bg-amber-500 text-slate-950 text-[8px] font-black uppercase">
                                                            Ad
                                                        </span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h5 className="text-xs font-bold text-foreground truncate">{selectedProperty.title}</h5>
                                                        <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                                                            <MapPin size={10} />
                                                            {selectedProperty.city_name}
                                                        </p>
                                                        <p className="text-xs font-black text-foreground mt-0.5">
                                                            ₹{selectedProperty.price ? selectedProperty.price.toLocaleString("en-IN") : "0"} <span className="text-[9px] font-normal text-muted-foreground">/night</span>
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                <div className="flex items-center justify-between gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCreateStep(1)}
                                        className="h-10 px-5 text-sm font-semibold rounded-sm border-border cursor-pointer gap-2"
                                    >
                                        <ArrowLeft size={14} />
                                        <span>Back to Property</span>
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={() => setCreateStep(3)}
                                        className="h-10 px-6 text-sm font-semibold rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer gap-2 shadow-xs transition-all"
                                    >
                                        <span>Proceed to Razorpay Checkout</span>
                                        <ArrowRight size={14} />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: RAZORPAY PAYMENT & LAUNCH */}
                        {createStep === 3 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* Left: Razorpay Payment Section */}
                                    <div className="lg:col-span-7 space-y-4">
                                        <Card className="rounded-md border border-border bg-card dark:bg-slate-900/90 shadow-xs">
                                            <CardHeader className="p-5 border-b border-border">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <span className="w-5 h-5 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</span>
                                                        <CardTitle className="text-sm sm:text-base font-bold">Razorpay Secure Payment</CardTitle>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-xs bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border border-indigo-300/30 text-[10px] font-bold uppercase tracking-wider">
                                                        Razorpay Gateway
                                                    </span>
                                                </div>
                                                <CardDescription className="text-xs text-muted-foreground">
                                                    Choose your preferred payment method to initiate and activate your promotion.
                                                </CardDescription>
                                            </CardHeader>

                                            <CardContent className="p-5 space-y-4">
                                                {/* Razorpay Gateway Box */}
                                                <div className="p-4 rounded-md border-2 border-primary/50 dark:border-indigo-500/60 bg-primary/5 dark:bg-indigo-950/20 space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-8 h-8 rounded-sm bg-primary text-primary-foreground dark:bg-indigo-600 flex items-center justify-center font-black text-xs">
                                                                R
                                                            </div>
                                                            <div>
                                                                <h4 className="text-xs font-bold text-foreground">Razorpay Payment Gateway</h4>
                                                                <p className="text-[11px] text-muted-foreground">
                                                                    Instant checkout with 100% payment encryption
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                                            <ShieldCheck size={14} />
                                                            <span>Verified</span>
                                                        </span>
                                                    </div>

                                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-border/60">
                                                        <div className="p-2 rounded-sm bg-card border border-border text-center space-y-0.5">
                                                            <Smartphone size={14} className="mx-auto text-primary" />
                                                            <span className="block text-[10px] font-bold text-foreground">UPI</span>
                                                            <span className="block text-[9px] text-muted-foreground">GPay / PhonePe</span>
                                                        </div>
                                                        <div className="p-2 rounded-sm bg-card border border-border text-center space-y-0.5">
                                                            <CreditCard size={14} className="mx-auto text-primary" />
                                                            <span className="block text-[10px] font-bold text-foreground">Cards</span>
                                                            <span className="block text-[9px] text-muted-foreground">Visa / RuPay</span>
                                                        </div>
                                                        <div className="p-2 rounded-sm bg-card border border-border text-center space-y-0.5">
                                                            <Building2 size={14} className="mx-auto text-primary" />
                                                            <span className="block text-[10px] font-bold text-foreground">NetBanking</span>
                                                            <span className="block text-[9px] text-muted-foreground">All Indian Banks</span>
                                                        </div>
                                                        <div className="p-2 rounded-sm bg-card border border-border text-center space-y-0.5">
                                                            <Wallet size={14} className="mx-auto text-primary" />
                                                            <span className="block text-[10px] font-bold text-foreground">Wallets</span>
                                                            <span className="block text-[9px] text-muted-foreground">Paytm / Others</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Notice for User */}
                                                <div className="p-3.5 rounded-sm bg-muted/40 border border-border space-y-1">
                                                    <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                                                        <Info size={13} className="text-primary" />
                                                        <span>Razorpay Checkout Integration Ready</span>
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                                                        The payment gateway pipeline is prepared for live Razorpay API keys. Clicking &apos;Complete Payment &amp; Launch&apos; will create and activate the campaign immediately.
                                                    </p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Right: Order Summary & Confirmation */}
                                    <div className="lg:col-span-5 space-y-4">
                                        <Card className="rounded-md border border-border bg-card dark:bg-slate-900/90 shadow-xs">
                                            <CardHeader className="p-5 border-b border-border">
                                                <CardTitle className="text-sm sm:text-base font-bold">Campaign Order Summary</CardTitle>
                                                <CardDescription className="text-xs text-muted-foreground">
                                                    Review campaign details before launching.
                                                </CardDescription>
                                            </CardHeader>
                                            <CardContent className="p-5 space-y-4">
                                                {/* Target Property */}
                                                {selectedProperty && (
                                                    <div className="flex items-center gap-3 p-3 rounded-sm bg-muted/20 border border-border">
                                                        <div className="w-12 h-12 rounded-sm bg-muted overflow-hidden shrink-0">
                                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                                            <img
                                                                src={selectedProperty.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=300&q=80"}
                                                                alt={selectedProperty.title}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <h5 className="text-xs font-bold text-foreground truncate">{selectedProperty.title}</h5>
                                                            <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                                <MapPin size={10} />
                                                                {selectedProperty.city_name} • {selectedProperty.property_type === "hotel" ? "Hotel" : "Rental"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Line Items */}
                                                <div className="space-y-2 text-xs border-b border-border pb-3">
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Placement:</span>
                                                        <span className="font-semibold text-foreground uppercase text-[11px]">
                                                            {selectedPlacement.replace(/_/g, " ")}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Duration:</span>
                                                        <span className="font-semibold text-foreground">{selectedPkg.duration_display} ({selectedPkg.duration_days} Days)</span>
                                                    </div>
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Active Period:</span>
                                                        <span className="font-semibold text-foreground">{startDateFormatted} – {endDateFormatted}</span>
                                                    </div>
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Ad Format:</span>
                                                        <span className="font-semibold text-foreground capitalize">
                                                            {selectedAdType.replace(/_/g, " ")}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Pricing Breakdown */}
                                                <div className="space-y-1.5 text-xs">
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Package Rate:</span>
                                                        <span className="font-medium text-foreground">₹{selectedPkg.price}</span>
                                                    </div>
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>Platform Fee:</span>
                                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">FREE</span>
                                                    </div>
                                                    <div className="flex justify-between text-muted-foreground">
                                                        <span>GST / Taxes:</span>
                                                        <span className="font-medium text-muted-foreground">Included</span>
                                                    </div>
                                                    <div className="pt-2 border-t border-border flex justify-between items-baseline">
                                                        <span className="text-xs font-bold text-foreground">Total Payable via Razorpay:</span>
                                                        <span className="text-xl font-black text-primary dark:text-indigo-400">₹{selectedPkg.price}</span>
                                                    </div>
                                                </div>

                                                <Button
                                                    type="button"
                                                    disabled={createMutation.isPending}
                                                    onClick={handleLaunchCampaign}
                                                    className="w-full h-10 text-xs font-bold rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer shadow-sm gap-2"
                                                >
                                                    {createMutation.isPending ? (
                                                        <>
                                                            <Loader2 size={14} className="animate-spin" />
                                                            <span>Processing Razorpay Checkout...</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <ShieldCheck size={14} />
                                                            <span>Complete Payment of ₹{selectedPkg.price} &amp; Launch</span>
                                                        </>
                                                    )}
                                                </Button>

                                                <p className="text-[10px] text-center text-muted-foreground">
                                                    By continuing, your ad will be queued and served across guest searches.
                                                </p>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </div>

                                <div className="flex items-center justify-start gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setCreateStep(2)}
                                        className="h-10 px-5 text-sm font-semibold rounded-sm border-border cursor-pointer gap-2"
                                    >
                                        <ArrowLeft size={14} />
                                        <span>Back to Placement &amp; Plan</span>
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // ==========================================
    // VIEW: MAIN DASHBOARD OVERVIEW
    // ==========================================
    return (
        <div className="space-y-6 w-full pb-16">
            {/* 1. Header Banner & Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card dark:bg-slate-900/90 p-5 rounded-md border border-border shadow-xs">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-sm bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-300/40 dark:border-amber-800">
                            <Sparkles size={16} />
                        </span>
                        <h2 className="text-lg sm:text-xl font-bold text-foreground">
                            Ads &amp; Sponsored Promotions Manager
                        </h2>
                    </div>
                    <p className="text-xs text-muted-foreground dark:text-slate-400 max-w-2xl leading-relaxed">
                        Promote your hotel and vacation rental listings directly across our platform. Rank at the top of guest search queries with an exclusive <strong className="text-foreground">Sponsored</strong> badge or feature custom banners.
                    </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    <Button
                        type="button"
                        onClick={() => startCreationFlow()}
                        className="h-10 px-6 text-sm font-semibold sm:font-bold bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-sm shadow-xs gap-2 cursor-pointer transition-all"
                    >
                        <Plus size={16} />
                        <span>Create Ad Campaign</span>
                    </Button>
                </div>
            </div>

            {/* 2. Navigation Tabs (Directly Below Header Banner) */}
            <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
                <button
                    type="button"
                    onClick={() => setSelectedTab("analytics")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                        selectedTab === "analytics"
                            ? "bg-primary text-primary-foreground dark:bg-indigo-600 shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                    <BarChart3 size={13} />
                    <span>My Analytics</span>
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTab("campaigns")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer whitespace-nowrap ${
                        selectedTab === "campaigns"
                            ? "bg-primary text-primary-foreground dark:bg-indigo-600 shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                    My Ad Campaigns ({campaigns.length})
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTab("placements")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer whitespace-nowrap ${
                        selectedTab === "placements"
                            ? "bg-primary text-primary-foreground dark:bg-indigo-600 shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                    Ad Placements &amp; Pricing
                </button>
                <button
                    type="button"
                    onClick={() => setSelectedTab("preview")}
                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer whitespace-nowrap ${
                        selectedTab === "preview"
                            ? "bg-primary text-primary-foreground dark:bg-indigo-600 shadow-xs"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                >
                    Live Preview Simulator
                </button>
            </div>

            {/* 3. Tab 1: My Analytics (First Place) */}
            {selectedTab === "analytics" && (
                <div className="space-y-6">
                    {/* The 4 Real-Time Performance KPI Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 w-full">
                        <Card className="rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900/80 shadow-xs">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Active Campaigns</p>
                                    <h3 className="text-2xl font-black text-foreground">{stats.active_campaigns} Running</h3>
                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Serving in search feed</span>
                                </div>
                                <div className="p-2.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                                    <CheckCircle2 size={20} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900/80 shadow-xs">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Impressions</p>
                                    <h3 className="text-2xl font-black text-foreground">{stats.total_impressions.toLocaleString()}</h3>
                                    <span className="text-[11px] text-muted-foreground">Guest view counts</span>
                                </div>
                                <div className="p-2.5 rounded-sm bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <Eye size={20} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900/80 shadow-xs">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Total Clicks</p>
                                    <h3 className="text-2xl font-black text-foreground">{stats.total_clicks.toLocaleString()}</h3>
                                    <span className="text-[11px] text-muted-foreground">Direct listing opens</span>
                                </div>
                                <div className="p-2.5 rounded-sm bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <MousePointerClick size={20} />
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900/80 shadow-xs">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Avg. Click-Through (CTR)</p>
                                    <h3 className="text-2xl font-black text-foreground">{stats.avg_ctr}%</h3>
                                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Above platform average</span>
                                </div>
                                <div className="p-2.5 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400">
                                    <TrendingUp size={20} />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Performance Table */}
                    <Card className="rounded-md border border-border bg-card dark:bg-slate-900/90 shadow-xs overflow-hidden">
                        <CardHeader className="p-5 border-b border-border">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <div>
                                    <CardTitle className="text-sm sm:text-base font-bold flex items-center gap-2">
                                        <BarChart3 size={16} className="text-primary" />
                                        <span>Campaign Performance Analytics</span>
                                    </CardTitle>
                                    <CardDescription className="text-xs text-muted-foreground">
                                        Comprehensive conversion metrics, visitor traffic, and CTR breakdown for all your listings.
                                    </CardDescription>
                                </div>
                                <span className="text-xs font-semibold px-2.5 py-1 rounded-sm bg-muted text-muted-foreground self-start sm:self-auto">
                                    {campaigns.length} Campaigns Tracked
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {campaigns.length === 0 ? (
                                <div className="p-10 text-center space-y-2">
                                    <BarChart3 size={24} className="mx-auto text-muted-foreground" />
                                    <p className="text-xs text-muted-foreground">
                                        No performance data available yet. Launch an ad campaign to begin measuring live impressions and clicks.
                                    </p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] font-bold border-b border-border">
                                            <tr>
                                                <th className="py-3 px-4">Property</th>
                                                <th className="py-3 px-4">Placement &amp; Format</th>
                                                <th className="py-3 px-4">Budget &amp; Period</th>
                                                <th className="py-3 px-4 text-right">Impressions</th>
                                                <th className="py-3 px-4 text-right">Clicks</th>
                                                <th className="py-3 px-4 text-right">CTR</th>
                                                <th className="py-3 px-4 text-center">Status</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                            {campaigns.map((camp) => (
                                                <tr key={camp.id} className="hover:bg-muted/20 transition-colors">
                                                    <td className="py-3.5 px-4 font-semibold text-foreground">
                                                        <div className="flex items-center gap-2.5">
                                                            <div className="w-10 h-10 rounded-sm bg-muted overflow-hidden shrink-0">
                                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                                <img
                                                                    src={camp.property_image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=200&q=80"}
                                                                    alt={camp.target_property_title}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="font-bold text-foreground truncate max-w-[200px]">{camp.target_property_title}</p>
                                                                <p className="text-[10px] text-muted-foreground">{camp.target_property_city} • {camp.property_type_display || camp.property_type}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-muted-foreground">
                                                        <p className="font-semibold text-foreground capitalize">{camp.placement.replace(/_/g, " ")}</p>
                                                        <p className="text-[10px] capitalize">{camp.ad_type.replace(/_/g, " ")}</p>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-muted-foreground">
                                                        <p className="font-bold text-foreground">₹{camp.budget}</p>
                                                        <p className="text-[10px]">{camp.duration_days} Days ({camp.days_remaining}d remaining)</p>
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-bold text-foreground">
                                                        {camp.impressions_count.toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-bold text-foreground">
                                                        {camp.clicks_count.toLocaleString()}
                                                    </td>
                                                    <td className="py-3.5 px-4 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                                                        {camp.ctr}%
                                                    </td>
                                                    <td className="py-3.5 px-4 text-center">
                                                        <span
                                                            className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
                                                                camp.status === "active"
                                                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                                    : camp.status === "paused"
                                                                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                                                    : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                                                            }`}
                                                        >
                                                            {camp.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* 4. Tab 2: Campaigns Table / Grid */}
            {selectedTab === "campaigns" && (
                <div className="space-y-4">
                    {/* Filters Toolbar */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                            {(["All", "Active", "Paused", "Completed"] as const).map((tab) => (
                                <button
                                    key={tab}
                                    type="button"
                                    onClick={() => setStatusFilter(tab)}
                                    className={`px-2.5 py-1 text-xs font-medium rounded-sm border cursor-pointer transition-all ${
                                        statusFilter === tab
                                            ? "border-primary bg-primary/10 text-primary dark:border-indigo-500 dark:text-indigo-400 font-semibold"
                                            : "border-border text-muted-foreground hover:bg-muted/40"
                                    }`}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        <span className="text-xs text-muted-foreground">
                            Showing {filteredCampaigns.length} campaigns
                        </span>
                    </div>

                    {isCampaignsLoading ? (
                        <Card className="rounded-md border border-border p-12 text-center">
                            <Loader2 size={24} className="animate-spin text-primary mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground">Loading your campaigns...</p>
                        </Card>
                    ) : filteredCampaigns.length === 0 ? (
                        <Card className="rounded-md border border-border p-12 text-center space-y-3">
                            <div className="w-12 h-12 rounded-sm bg-muted/50 text-muted-foreground flex items-center justify-center mx-auto">
                                <Sparkles size={22} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-foreground">No Campaigns Found</h4>
                                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                                    {statusFilter === "All"
                                        ? "You haven't launched any sponsored promotions yet. Boost your Hotel or Vacation Rental to get booked faster."
                                        : `No ${statusFilter.toLowerCase()} campaigns at the moment.`}
                                </p>
                            </div>
                            <Button
                                type="button"
                                onClick={() => startCreationFlow()}
                                className="h-10 px-6 text-sm font-semibold sm:font-bold rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-indigo-600 dark:hover:bg-indigo-500 cursor-pointer gap-2 shadow-xs transition-all"
                            >
                                <Plus size={16} />
                                <span>Create Your First Ad Campaign</span>
                            </Button>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {filteredCampaigns.map((camp) => (
                                <Card
                                    key={camp.id}
                                    className="rounded-md border border-border dark:border-slate-800 bg-card dark:bg-slate-900/90 hover:border-slate-400 dark:hover:border-slate-700 transition-all shadow-xs overflow-hidden"
                                >
                                    <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        {/* Property Info */}
                                        <div className="flex items-start gap-3.5 min-w-0">
                                            <div className="w-16 h-16 rounded-sm bg-muted overflow-hidden shrink-0 relative">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={camp.property_image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80"}
                                                    alt={camp.target_property_title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <span className="absolute top-1 left-1 px-1 py-0.5 rounded-xs bg-amber-500 text-slate-950 font-bold text-[8px] uppercase">
                                                    Ad
                                                </span>
                                            </div>

                                            <div className="space-y-1 min-w-0">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <span
                                                        className={`px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider ${
                                                            camp.status === "active"
                                                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                                                : camp.status === "paused"
                                                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                                                                : "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20"
                                                        }`}
                                                    >
                                                        {camp.status}
                                                    </span>
                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                        {camp.property_type === "hotel" ? (
                                                            <Building2 size={12} className="text-primary" />
                                                        ) : (
                                                            <Palmtree size={12} className="text-emerald-500" />
                                                        )}
                                                        {camp.property_type_display || camp.property_type}
                                                    </span>
                                                    <span className="text-muted-foreground text-xs">•</span>
                                                    <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                                        <MapPin size={11} />
                                                        {camp.target_property_city}
                                                    </span>
                                                </div>

                                                <h4 className="text-sm font-bold text-foreground truncate">
                                                    {camp.target_property_title}
                                                </h4>

                                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                                    <span>{camp.campaign_name}</span>
                                                    <span>•</span>
                                                    <span className="capitalize">{camp.placement.replace(/_/g, " ")}</span>
                                                    <span>•</span>
                                                    <span className="font-semibold text-foreground">₹{camp.budget}</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* Metrics & Controls */}
                                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                                            <div className="text-left sm:text-right">
                                                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Impressions</span>
                                                <span className="block text-sm font-bold text-foreground">
                                                    {camp.impressions_count.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="text-left sm:text-right">
                                                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Clicks</span>
                                                <span className="block text-sm font-bold text-foreground">
                                                    {camp.clicks_count.toLocaleString()}
                                                </span>
                                            </div>

                                            <div className="text-left sm:text-right">
                                                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">CTR</span>
                                                <span className="block text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                    {camp.ctr}%
                                                </span>
                                            </div>

                                            <div className="text-left sm:text-right">
                                                <span className="block text-[10px] text-muted-foreground uppercase font-semibold">Remaining</span>
                                                <span className="block text-xs font-semibold text-foreground flex items-center gap-1">
                                                    <Clock size={12} className="text-muted-foreground" />
                                                    {camp.days_remaining}d
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 pl-2 border-l border-border">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={toggleMutation.isPending}
                                                    onClick={() => toggleMutation.mutate(camp.id)}
                                                    className="h-8 px-2.5 text-xs rounded-sm hover:bg-muted text-foreground cursor-pointer"
                                                    title={camp.status === "active" ? "Pause Campaign" : "Resume Campaign"}
                                                >
                                                    {camp.status === "active" ? (
                                                        <PauseCircle size={14} className="text-amber-500" />
                                                    ) : (
                                                        <PlayCircle size={14} className="text-emerald-500" />
                                                    )}
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setPreviewItem(camp)}
                                                    className="h-8 px-2.5 text-xs rounded-sm hover:bg-muted text-foreground cursor-pointer"
                                                    title="View Preview Simulator"
                                                >
                                                    <ExternalLink size={14} />
                                                </Button>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={deleteMutation.isPending}
                                                    onClick={() => {
                                                        if (confirm("Are you sure you want to archive this ad campaign?")) {
                                                            deleteMutation.mutate(camp.id);
                                                        }
                                                    }}
                                                    className="h-8 px-2.5 text-xs rounded-sm hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                                                    title="Archive Campaign"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* 3. Tab 3: Ad Placements & Packages */}
            {selectedTab === "placements" && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="rounded-md border border-border bg-card dark:bg-slate-900/90 p-5 space-y-3">
                            <div className="w-9 h-9 rounded-sm bg-primary/10 text-primary dark:bg-indigo-950/60 dark:text-indigo-400 flex items-center justify-center">
                                <Target size={18} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-foreground">Search Feed Top 2</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Pinned at the very top of guest query results with verified <strong className="text-foreground">Sponsored</strong> badge. Yields 3.5x higher booking conversion.
                                </p>
                            </div>
                            <div className="pt-2 text-xs space-y-1 border-t border-border">
                                <span className="block text-muted-foreground">Average CTR: <strong className="text-foreground">4.8%</strong></span>
                                <span className="block text-muted-foreground">Placement: <strong className="text-foreground">Hotels &amp; Rentals Search</strong></span>
                            </div>
                        </Card>

                        <Card className="rounded-md border border-border bg-card dark:bg-slate-900/90 p-5 space-y-3">
                            <div className="w-9 h-9 rounded-sm bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                <Layers size={18} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-foreground">City Spotlight Header</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Full-width prominent banner displayed to travelers browsing city-wide collections (Goa, Manali, Mumbai, Bengaluru).
                                </p>
                            </div>
                            <div className="pt-2 text-xs space-y-1 border-t border-border">
                                <span className="block text-muted-foreground">Average CTR: <strong className="text-foreground">3.2%</strong></span>
                                <span className="block text-muted-foreground">Placement: <strong className="text-foreground">Destination City Hub</strong></span>
                            </div>
                        </Card>

                        <Card className="rounded-md border border-border bg-card dark:bg-slate-900/90 p-5 space-y-3">
                            <div className="w-9 h-9 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                                <Building2 size={18} />
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-foreground">Listing Detail Sidebar</h4>
                                <p className="text-xs text-muted-foreground leading-relaxed">
                                    Displays as a &apos;Featured Nearby Stay&apos; on competing property pages in the exact same neighborhood.
                                </p>
                            </div>
                            <div className="pt-2 text-xs space-y-1 border-t border-border">
                                <span className="block text-muted-foreground">Average CTR: <strong className="text-foreground">2.7%</strong></span>
                                <span className="block text-muted-foreground">Placement: <strong className="text-foreground">Property Sidebar</strong></span>
                            </div>
                        </Card>
                    </div>

                    <div className="space-y-3">
                        <div className="space-y-0.5">
                            <h3 className="text-sm sm:text-base font-bold text-foreground">
                                Promotion Packages &amp; Pricing
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                Transparent fixed packages powered by Razorpay instant checkout. No recurring hidden fees.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {packagesList.map((pkg) => (
                                <Card
                                    key={pkg.id}
                                    className={`rounded-md p-5 border transition-all relative ${
                                        pkg.is_popular
                                            ? "border-primary bg-primary/5 dark:border-indigo-500 dark:bg-indigo-950/20 shadow-sm"
                                            : "border-border bg-card dark:bg-slate-900/80"
                                    }`}
                                >
                                    {pkg.is_popular && (
                                        <span className="absolute -top-2.5 right-4 px-2 py-0.5 rounded-xs bg-amber-500 text-slate-950 font-black text-[9px] uppercase tracking-wider">
                                            Most Popular
                                        </span>
                                    )}
                                    <div className="space-y-2">
                                        <h4 className="text-sm font-bold text-foreground">{pkg.name}</h4>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-foreground">₹{pkg.price}</span>
                                            <span className="text-xs text-muted-foreground font-medium">/ {pkg.duration_display}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                                            {pkg.description}
                                        </p>

                                        <ul className="text-xs space-y-2 pt-3 border-t border-border/60">
                                            <li className="flex items-center gap-2 text-foreground">
                                                <Check size={13} className="text-emerald-500 shrink-0" />
                                                <span>Active for <strong>{pkg.duration_days} consecutive days</strong></span>
                                            </li>
                                            <li className="flex items-center gap-2 text-foreground">
                                                <Check size={13} className="text-emerald-500 shrink-0" />
                                                <span>Verified <strong>Sponsored Badge</strong></span>
                                            </li>
                                            <li className="flex items-center gap-2 text-foreground">
                                                <Check size={13} className="text-emerald-500 shrink-0" />
                                                <span>Live impressions &amp; CTR metrics</span>
                                            </li>
                                        </ul>

                                        <Button
                                            type="button"
                                            onClick={() => startCreationFlow(pkg.plan_code)}
                                            className="mt-4 h-9 text-xs font-semibold rounded-sm w-full cursor-pointer bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                        >
                                            Select &amp; Launch
                                        </Button>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* 6. Tab 3: Interactive Live Preview Simulator */}
            {selectedTab === "preview" && (
                <div className="space-y-4">
                    <Card className="rounded-md border border-border bg-card dark:bg-slate-900/90 p-5 space-y-4">
                        <div className="space-y-1">
                            <h3 className="text-sm sm:text-base font-bold text-foreground flex items-center gap-2">
                                <Eye size={16} className="text-primary" />
                                <span>Guest Search Feed Simulator</span>
                            </h3>
                            <p className="text-xs text-muted-foreground">
                                This live preview demonstrates how your listing appears to travelers searching for stays in your destination.
                            </p>
                        </div>

                        {/* Search Bar Mockup */}
                        <div className="p-3 rounded-sm bg-muted/40 border border-border flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-2">
                                <MapPin size={13} className="text-primary" />
                                <strong className="text-foreground">
                                    {previewProperty?.city_name || "Goa, India"}
                                </strong>
                                <span>• 2 Guests • Upcoming Weekend</span>
                            </span>
                            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                                48 Stays Available
                            </span>
                        </div>

                        {/* Simulated Result Feed */}
                        <div className="space-y-3 pt-2">
                            {previewProperty ? (
                                <div className="p-4 rounded-md border-2 border-amber-400 dark:border-amber-500/70 bg-amber-500/5 dark:bg-amber-950/20 shadow-xs space-y-3">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-xs bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider">
                                            <Sparkles size={11} />
                                            <span>Sponsored • Position #1</span>
                                        </span>
                                        <span className="text-[11px] text-muted-foreground">Boosted via Ads Manager</span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                                        <div className="w-full sm:w-48 h-32 rounded-sm bg-muted overflow-hidden shrink-0 relative">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={previewProperty.image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=500&q=80"}
                                                alt={previewProperty.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>

                                        <div className="flex-1 space-y-1.5 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-xs bg-muted text-foreground">
                                                    {previewProperty.property_type_display || previewProperty.property_type}
                                                </span>
                                                <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                                    <Star size={12} fill="currentColor" />
                                                    <span>{previewProperty.rating || 5.0}</span>
                                                </div>
                                            </div>

                                            <h4 className="text-base font-bold text-foreground">{previewProperty.title}</h4>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <MapPin size={12} />
                                                <span>{previewProperty.city_name} • Prime Location</span>
                                            </p>

                                            <div className="pt-2 flex items-center justify-between">
                                                <span className="text-sm font-extrabold text-foreground">
                                                    ₹{previewProperty.price ? previewProperty.price.toLocaleString("en-IN") : "8,500"} <span className="text-xs font-normal text-muted-foreground">/night</span>
                                                </span>
                                                <span className="text-xs font-semibold text-primary">Instant Booking Available</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 text-center text-xs text-muted-foreground bg-muted/20 rounded-md">
                                    Register a Hotel or Vacation Rental to see a live simulation with your property photos.
                                </div>
                            )}

                            {/* Standard Organic Listing Mockup for Contrast */}
                            <div className="p-4 rounded-md border border-border bg-card opacity-60 flex flex-col sm:flex-row gap-4 items-start">
                                <div className="w-full sm:w-48 h-28 rounded-sm bg-muted overflow-hidden shrink-0 flex items-center justify-center text-muted-foreground text-xs">
                                    Standard Organic Listing
                                </div>
                                <div className="flex-1 space-y-1">
                                    <span className="text-[10px] text-muted-foreground">Position #3 (Organic)</span>
                                    <h4 className="text-sm font-medium text-foreground">Standard Competitor Stay</h4>
                                    <p className="text-xs text-muted-foreground">Lower page ranking without sponsored badge</p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            {/* 7. Live View Preview Modal for Table clicks */}
            <Dialog open={Boolean(previewItem)} onOpenChange={(open) => !open && setPreviewItem(null)}>
                <DialogContent
                    className="sm:max-w-md max-w-[92vw] w-full rounded-md p-5 gap-3 shadow-2xl border border-border"
                    style={{ backgroundColor: "var(--card)", color: "var(--foreground)" }}
                >
                    <DialogHeader className="pb-2 border-b border-border">
                        <DialogTitle className="text-sm font-bold flex items-center gap-1.5">
                            <Sparkles size={15} className="text-amber-500" />
                            <span>Live Guest View Simulation</span>
                        </DialogTitle>
                        <DialogDescription className="text-xs text-muted-foreground">
                            Rendered as a top-ranked Sponsored result in destination search queries.
                        </DialogDescription>
                    </DialogHeader>

                    {previewItem && (
                        <div className="p-3 rounded-sm bg-card border-2 border-amber-400/60 shadow-sm space-y-3">
                            <div className="relative w-full h-40 rounded-sm overflow-hidden bg-muted">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewItem.property_image_url || "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80"}
                                    alt={previewItem.target_property_title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-amber-500 text-slate-950 font-bold text-[10px] uppercase tracking-wider shadow-md">
                                    <Sparkles size={11} />
                                    <span>Sponsored</span>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-sm bg-muted text-muted-foreground">
                                        {previewItem.property_type_display || previewItem.property_type}
                                    </span>
                                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                                        <Star size={12} fill="currentColor" />
                                        <span>{previewItem.target_property_rating || 5.0}</span>
                                    </div>
                                </div>
                                <h4 className="text-sm font-bold text-foreground">{previewItem.target_property_title}</h4>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <MapPin size={12} />
                                    <span>{previewItem.target_property_city || "Destination"}</span>
                                </p>
                                <div className="pt-2 flex items-center justify-between text-xs">
                                    <span className="font-extrabold text-foreground">
                                        ₹{previewItem.target_property_price ? previewItem.target_property_price.toLocaleString("en-IN") : "8,500"} <span className="text-[10px] font-normal text-muted-foreground">/night</span>
                                    </span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{previewItem.days_remaining} days active remaining</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="pt-2 border-t border-border">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setPreviewItem(null)}
                            className="h-8 px-4 text-xs font-semibold rounded-sm border-border cursor-pointer w-full sm:w-auto"
                        >
                            Close Preview
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
