"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import clsx from "clsx";
import type { PricingPlan } from "@/types/public.types";

interface PricingCardsProps {
  plans?: PricingPlan[];
}

interface DisplayPlan {
  name: string;
  description: string;
  price: string;
  period?: string;
  features: string[];
  highlighted?: boolean;
}

const defaultPlans: DisplayPlan[] = [
  {
    name: "Free",
    description: "Get started with basic listing",
    price: "₹0",
    period: "forever",
    features: [
      "1 Hostel Listing",
      "Basic Profile",
      "Student Inquiries",
      "Standard Support",
      "Basic Analytics",
    ],
  },
  {
    name: "Pro",
    description: "Everything you need to grow",
    price: "₹999",
    period: "/month",
    highlighted: true,
    features: [
      "5 Hostel Listings",
      "Verified Badge",
      "Priority in Search",
      "Advanced Analytics",
      "Featured Placement",
      "Phone Support",
      "Custom Profile",
    ],
  },
  {
    name: "Premium",
    description: "For serious hostel owners",
    price: "₹2,499",
    period: "/month",
    features: [
      "Unlimited Listings",
      "Verified Badge",
      "Top Search Priority",
      "Full Analytics Suite",
      "Permanent Featured",
      "24/7 Support",
      "Custom Branding",
      "API Access",
    ],
  },
];

export default function PricingCards({ plans }: PricingCardsProps) {
  const displayPlans: DisplayPlan[] =
    plans && plans.length > 0
      ? plans.map((plan) => ({
        name: plan.name,
        description: plan.description,
        price: `${plan.currency_symbol}${plan.price}`,
        period: plan.period || undefined,
        highlighted: plan.is_highlighted,
        features: plan.features.map((f) => f.feature_text),
      }))
      : defaultPlans;

  const count = displayPlans.length;

  // Scale padding/text when 4+ cards to keep them compact in one row
  const isCompact = count > 3;

  return (
    <section className="py-24 px-6 bg-white">
      {/* Inject dynamic grid columns for desktop based on plan count */}
      <style>{`
        @media (min-width: 768px) {
          .pricing-dynamic-grid {
            grid-template-columns: repeat(${count}, minmax(0, 1fr)) !important;
          }
        }
      `}</style>

      <div
        className="pricing-dynamic-grid container mx-auto gap-6 max-w-7xl"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(1, minmax(0, 1fr))",
        }}
      >
        {displayPlans.map((plan) => (
          <Card
            key={plan.name}
            className={clsx(
              "relative rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-lg",
              plan.highlighted
                ? "border-blue-600 scale-[1.02]"
                : "border-gray-200"
            )}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-sm px-4 py-1 rounded-full shadow">
                Most Popular
              </div>
            )}

            <CardContent
              className={clsx(
                "flex flex-col h-full",
                isCompact ? "p-5" : "p-8"
              )}
            >
              {/* Header */}
              <div className="space-y-2">
                <h3
                  className={clsx(
                    "font-semibold",
                    isCompact ? "text-xl" : "text-2xl"
                  )}
                >
                  {plan.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  {plan.description}
                </p>
              </div>

              {/* Price */}
              <div className="mt-6">
                <span
                  className={clsx(
                    "font-bold",
                    isCompact ? "text-3xl" : "text-4xl"
                  )}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span className="text-gray-500 ml-1 text-sm">
                    {plan.period}
                  </span>
                )}
              </div>

              {/* Features */}
              <ul
                className={clsx(
                  "mt-6 flex-1",
                  isCompact ? "space-y-3" : "space-y-4"
                )}
              >
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className={clsx(
                      "flex items-center gap-2 text-gray-700",
                      isCompact ? "text-sm" : "text-base"
                    )}
                  >
                    <Check
                      className={clsx(
                        "text-blue-600 shrink-0",
                        isCompact ? "w-3.5 h-3.5" : "w-4 h-4"
                      )}
                    />
                    {feature}
                  </li>
                ))}
              </ul>

              {/* Button */}
              <Button
                className={clsx(
                  "mt-8 rounded-xl font-medium",
                  isCompact ? "h-10 text-sm" : "h-12 text-base",
                  plan.highlighted
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-900"
                )}
              >
                Get Started →
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}