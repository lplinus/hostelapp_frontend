"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Zap, Sparkles, Rocket, Loader2 } from "lucide-react";
import { getPricingPage } from "@/services/public.service";
import { createSubscription, getCurrentSubscription } from "@/services/payment.service";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export default function SubscriptionClient() {
  const queryClient = useQueryClient();

  // Fetch all plans
  const { data: pricingData, isLoading: isPricingLoading, error: pricingError } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: getPricingPage,
  });

  // Fetch current active subscription
  const { data: currentSub, isLoading: isSubLoading } = useQuery({
    queryKey: ["current-subscription"],
    queryFn: getCurrentSubscription,
    retry: false,
  });

  // Mutation for activating a plan
  const activateMutation = useMutation({
    mutationFn: (planId: number) => createSubscription({ plan: planId }),
    onSuccess: (data) => {
      toast.success(`Plan "${data.plan_name}" activated successfully!`);
      queryClient.invalidateQueries({ queryKey: ["current-subscription"] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.detail || "Failed to activate plan. Please try again.";
      toast.error(message);
    },
  });

  const handleActivate = (planId: number) => {
    activateMutation.mutate(planId);
  };

  /* ---------------- Loading State ---------------- */

  const isLoading = isPricingLoading || isSubLoading;

  if (isLoading) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="space-y-3">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-5 w-96" />
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-muted">
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-full" />
              </CardHeader>

              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-24" />

                {[1, 2, 3, 4].map((j) => (
                  <div key={j} className="flex gap-2">
                    <Skeleton className="h-4 w-4 rounded-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </CardContent>

              <CardFooter>
                <Skeleton className="h-10 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  /* ---------------- Error State ---------------- */

  if (pricingError) {
    return (
      <div className="text-center p-10 border rounded-xl bg-destructive/5">
        <p className="text-destructive font-medium">
          Failed to load subscription plans.
        </p>

        <Button
          variant="outline"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  /* ---------------- Main UI ---------------- */

  return (
    <div className="space-y-14 pb-14">
      {/* Header */}

      <div className="space-y-10">
        <div className="space-y-3 max-w-2xl">
          <Badge variant="secondary">Pricing</Badge>

          <h1 className="text-4xl font-bold tracking-tight">
            Choose the perfect plan
          </h1>

          <p className="text-muted-foreground text-lg leading-relaxed">
            Upgrade your hostel management experience with powerful tools,
            better visibility, and premium features designed for growth.
          </p>
        </div>

        {currentSub && (
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4 animate-in slide-in-from-top-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Sparkles size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-primary">Your Current Plan</p>
                <h3 className="text-xl font-bold">{currentSub.plan_name}</h3>
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex flex-col">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Active Since</p>
                <p className="font-bold text-gray-900">{new Date(currentSub.start_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
              </div>
              {currentSub.end_date && (
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Expires On</p>
                  <p className="font-bold text-primary">{new Date(currentSub.end_date).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Pricing Grid */}

      <div className="grid md:grid-cols-3 gap-8">
        {pricingData?.plans.map((plan, idx) => {
          const PlanIcon = idx === 0 ? Rocket : idx === 1 ? Zap : Sparkles;
          const isCurrentPlan = currentSub?.plan === plan.id;
          const isActivating = activateMutation.isPending && activateMutation.variables === plan.id;

          return (
            <Card
              key={plan.name}
              className={`relative flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.is_highlighted || isCurrentPlan
                  ? "border-primary shadow-lg scale-[1.03]"
                  : "border-muted"
              }`}
            >
              {plan.is_highlighted && !isCurrentPlan && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
                </Badge>
              )}

              {isCurrentPlan && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 hover:bg-green-600">
                  Current Plan
                </Badge>
              )}

              <CardHeader className="space-y-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-primary/10 text-primary">
                  <PlanIcon size={22} />
                </div>

                <div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>

                  <CardDescription className="mt-1">
                    {plan.description}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="flex-1 space-y-6">
                {/* Price */}

                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {plan.currency_symbol}
                    {plan.price}
                  </span>

                  <span className="text-muted-foreground text-sm">
                    {plan.period}
                  </span>
                </div>

                <Separator />

                {/* Features */}

                <ul className="space-y-3">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex gap-3 text-sm">
                      <Check className="text-green-500 mt-0.5" size={16} />

                      <span className="text-muted-foreground">
                        {feature.feature_text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className={`w-full ${
                    isCurrentPlan
                      ? "bg-green-600 hover:bg-green-600 text-white border-green-600 disabled:opacity-100 shadow-lg"
                      : "bg-black hover:bg-black/90 text-white"
                  }`}
                  variant="default"
                  disabled={isCurrentPlan || isActivating || activateMutation.isPending}
                  onClick={() => handleActivate(plan.id)}
                >
                  {isActivating ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isCurrentPlan ? "Active" : (plan.is_highlighted ? "Get Started" : "Choose Plan")}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* CTA Section */}

      <div className="border rounded-2xl p-10 bg-muted/40 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <h2 className="text-2xl font-semibold">
            {pricingData?.cta_title || "Grow your hostel business faster"}
          </h2>

          <p className="text-muted-foreground">
            Join thousands of hostel owners using StayNest to simplify booking
            management and increase their visibility online.
          </p>
        </div>

        <Button size="lg" className="bg-black hover:bg-black/90 text-white">
          {pricingData?.cta_button_text || "Contact Sales"}
        </Button>
      </div>
    </div>
  );
}