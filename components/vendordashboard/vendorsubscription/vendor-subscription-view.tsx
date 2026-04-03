"use client";

import { useState, useEffect } from "react";
import { Check, Sparkles, Zap, Shield, CreditCard, Loader2 } from "lucide-react";
import { authApiClient } from "@/lib/api/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fallbackPlans = [
    {
        name: "Basic",
        description: "Perfect for starting your vendor journey.",
        price: "0.00",
        currency_symbol: "₹",
        period: "/3 months",
        features: [{ feature_text: "Up to 50 products" }, { feature_text: "Basic analytics" }, { feature_text: "Standard support" }],
        is_popular: false,
    },
    {
        name: "Pro",
        description: "Everything you need to scale your business.",
        price: "999.00",
        currency_symbol: "₹",
        period: "/3 months",
        features: [{ feature_text: "Unlimited products" }, { feature_text: "Advanced analytics" }, { feature_text: "Priority 24/7 support" }],
        is_popular: true,
        gradient: "from-blue-600 to-indigo-600",
    },
    {
        name: "Enterprise",
        description: "Maximum visibility and dedicated management.",
        price: "2499.00",
        currency_symbol: "₹",
        period: "/3 months",
        features: [{ feature_text: "Everything in Pro" }, { feature_text: "Dedicated Account Manager" }, { feature_text: "0% commission fee" }],
        is_popular: false,
        gradient: "from-violet-600 to-fuchsia-600",
    }
];

export default function VendorSubscriptionView() {
    const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
    const [plans, setPlans] = useState<any[]>([]);
    const [currentSubscription, setCurrentSubscription] = useState<any>(null);
    const [isSubscribing, setIsSubscribing] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPlansAndCurrent = async () => {
            try {
                // Fetch plans
                const data: any = await authApiClient.get('/api/payments/vendor-plans/');
                if (data && data.length > 0) {
                    setPlans(data);
                } else {
                    setPlans(fallbackPlans); // Use fallback if DB is empty
                }
                
                // Fetch current active subscription
                try {
                    const currentData: any = await authApiClient.get('/api/payments/vendor-subscriptions/current/');
                    if (currentData && currentData.plan) {
                        setCurrentSubscription(currentData);
                    }
                } catch (subError) {
                    // Typically 404 if no subscription exists
                    setCurrentSubscription(null);
                }
            } catch (error) {
                console.error("Failed to fetch plans", error);
                setPlans(fallbackPlans);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPlansAndCurrent();
    }, []);

    const handleSubscribe = async (planId: number | string) => {
        if (!planId) return;
        try {
            setIsSubscribing(planId.toString());
            // Create a 3-month vendor subscription
            const newSub: any = await authApiClient.post('/api/payments/vendor-subscriptions/', { plan: planId });
            setCurrentSubscription(newSub);
        } catch (error) {
            console.error("Subscription failed:", error);
        } finally {
            setIsSubscribing(null);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-12 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header Section */}
            <div className="text-center space-y-4 pt-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary mb-4 ring-1 ring-primary/20">
                    <Sparkles size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Upgrade Your Plan</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                    Unlock Your Vendor Potential
                </h1>
                <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                    Choose the perfect subscription plan to maximize your reach, get priority support, and increase your sales.
                </p>

                {currentSubscription && currentSubscription.end_date && currentSubscription.start_date && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 max-w-2xl mx-auto mt-6 text-green-700 dark:text-green-400 flex text-sm items-center justify-center gap-2 animate-in fade-in zoom-in-95 duration-500">
                        <Check size={16} className="shrink-0" />
                        <span>
                            Your <strong className="font-bold text-green-800 dark:text-green-200">{currentSubscription.plan_name}</strong> plan is active from <strong className="font-bold text-green-800 dark:text-green-200">{new Date(currentSubscription.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong> to <strong className="font-bold text-green-800 dark:text-green-200">{new Date(currentSubscription.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>.
                        </span>
                    </div>
                )}

                {/* Billing Toggle */}
                <div className="flex items-center justify-center gap-4 mt-8">
                    <span className={cn("text-sm font-medium", billingCycle === "monthly" ? "text-slate-900" : "text-slate-500")}>Monthly</span>
                    <button
                        onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
                        className="relative w-16 h-8 rounded-full bg-slate-200 dark:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                    >
                        <div className={cn(
                            "absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-300 ease-in-out",
                            billingCycle === "yearly" ? "translate-x-8" : "translate-x-0"
                        )} />
                    </button>
                    <span className={cn("text-sm font-medium", billingCycle === "yearly" ? "text-slate-900" : "text-slate-500")}>
                        Yearly <span className="ml-1.5 text-xs text-green-600 font-bold bg-green-100 px-2 py-0.5 rounded-full">Save 20%</span>
                    </span>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 items-stretch pt-4">
                {plans.map((plan, index) => {
                    const PlanIcon = index === 0 ? Shield : index === 1 ? Zap : Sparkles;
                    
                    // Identify if this is the currently active plan
                    const isCurrent = currentSubscription 
                        ? currentSubscription.plan === plan.id 
                        : (index === 0); // Default 'Basic' to current if no DB subscription exists

                    const isFree = Number.parseFloat(plan.price) === 0;
                    const displayPrice = isFree ? "Free" : `${plan.currency_symbol}${Math.floor(Number.parseFloat(plan.price))}`;
                    const customGradient = plan.gradient || "from-blue-600 to-indigo-600";
                    
                    return (
                        <div
                            key={plan.name}
                            className={cn(
                                "relative flex flex-col rounded-3xl p-8 transition-all duration-300",
                                "hover:shadow-2xl hover:-translate-y-2",
                                plan.is_popular
                                    ? "bg-slate-900 text-white shadow-xl ring-1 ring-slate-800"
                                    : "bg-white text-slate-900 border border-slate-200 shadow-sm md:mt-8"
                            )}
                        >
                            {plan.is_popular && (
                                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                                    <span className={cn(
                                        "text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow-lg bg-gradient-to-r",
                                        customGradient
                                    )}>
                                        Most Popular
                                    </span>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                                    plan.is_popular ? "bg-white/10 text-blue-400" : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                                )}>
                                    <PlanIcon size={24} />
                                </div>
                                <h3 className="text-2xl font-bold">{plan.name}</h3>
                                <p className={cn("text-sm mt-2", plan.is_popular ? "text-slate-300" : "text-slate-500")}>
                                    {plan.description}
                                </p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-end gap-1">
                                    <span className="text-4xl font-extrabold">
                                        {!isFree && billingCycle === "yearly"
                                            ? `${plan.currency_symbol}${Math.floor(Number.parseFloat(plan.price) * 0.8)}`
                                            : displayPrice}
                                    </span>
                                    {(plan.period || "/3 months") && (
                                        <span className={cn("text-lg font-medium", plan.is_popular ? "text-slate-300" : "text-slate-500")}>
                                            {plan.period || "/3 months"}
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 space-y-4 mb-8">
                                {plan.features && plan.features.map((feature: any) => (
                                    <div key={`${plan.name}-${feature.feature_text}`} className="flex items-center gap-3">
                                        <div className={cn(
                                            "flex items-center justify-center w-5 h-5 rounded-full shrink-0",
                                            plan.is_popular ? "bg-blue-500/20 text-blue-400" : "bg-green-100 text-green-600 dark:bg-green-900/30"
                                        )}>
                                            <Check size={12} strokeWidth={3} />
                                        </div>
                                        <span className={cn("text-sm font-medium", plan.is_popular ? "text-slate-200" : "text-slate-700 dark:text-slate-300")}>
                                            {feature.feature_text}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <Button
                                onClick={() => !isCurrent && plan.id && handleSubscribe(plan.id)}
                                disabled={isCurrent || isSubscribing === plan.id?.toString()}
                                variant={isCurrent ? "outline" : "default"}
                                size="lg"
                                className={cn(
                                    "w-full rounded-xl font-bold transition-all",
                                    isCurrent && "pointer-events-none opacity-50",
                                    !isCurrent && plan.is_popular && `bg-gradient-to-r text-white border-0 hover:shadow-lg hover:shadow-blue-500/25 ${customGradient}`,
                                    !isCurrent && !plan.is_popular && "hover:scale-[1.02]"
                                )}
                            >
                                {isSubscribing === plan.id?.toString() ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : isCurrent ? (
                                    "Current Plan (3 Months)"
                                ) : (
                                    "Upgrade Now"
                                )}
                            </Button>
                        </div>
                    );
                })}
            </div>

            {/* Payment Methods Section */}
            <div className="mt-16 pt-12 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-sm text-slate-500 mb-6 font-medium">Secure payments powered by leading providers</p>
                <div className="flex justify-center items-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-300">
                    <CreditCard className="w-8 h-8" />
                    <span className="font-bold text-xl tracking-tighter">Razorpay</span>
                    <span className="font-bold text-xl tracking-tighter italic">Stripe</span>
                </div>
            </div>
        </div>
    );
}
