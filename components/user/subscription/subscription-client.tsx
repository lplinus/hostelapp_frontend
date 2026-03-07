// "use client";

// import { useQuery } from "@tanstack/react-query";
// import { Check, Zap, Sparkles, Rocket } from "lucide-react";
// import { getPricingPage } from "@/services/public.service";
// import { Button } from "@/components/ui/button";
// import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
// import { Badge } from "@/components/ui/badge";
// import { Skeleton } from "@/components/ui/skeleton";

// export default function SubscriptionClient() {
//     const { data, isLoading, error } = useQuery({
//         queryKey: ["pricing-plans"],
//         queryFn: getPricingPage,
//     });

//     if (isLoading) {
//         return (
//             <div className="space-y-8 animate-in fade-in duration-500">
//                 <div className="flex flex-col gap-2">
//                     <Skeleton className="h-10 w-64" />
//                     <Skeleton className="h-5 w-96" />
//                 </div>
//                 <div className="grid md:grid-cols-3 gap-6">
//                     {[1, 2, 3].map((i) => (
//                         <Card key={i} className="flex flex-col h-full border-muted shadow-sm">
//                             <CardHeader>
//                                 <Skeleton className="h-6 w-32 mb-2" />
//                                 <Skeleton className="h-4 w-full" />
//                             </CardHeader>
//                             <CardContent className="flex-1">
//                                 <Skeleton className="h-10 w-24 mb-6" />
//                                 <div className="space-y-2">
//                                     {[1, 2, 3, 4].map((j) => (
//                                         <div key={j} className="flex items-center gap-2">
//                                             <Skeleton className="h-4 w-4 rounded-full" />
//                                             <Skeleton className="h-4 w-full" />
//                                         </div>
//                                     ))}
//                                 </div>
//                             </CardContent>
//                             <CardFooter>
//                                 <Skeleton className="h-10 w-full" />
//                             </CardFooter>
//                         </Card>
//                     ))}
//                 </div>
//             </div>
//         );
//     }

//     if (error) {
//         return (
//             <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100 mt-8">
//                 <p className="text-red-600 font-medium">Failed to load subscription plans. Please try again later.</p>
//                 <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>Retry</Button>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-10 font-poppins pb-10">
//             {/* Header section with modern glassmorphism touch */}
//             <div className="flex flex-col gap-2 relative">
//                 <div className="absolute -top-6 -left-6 w-32 h-32 bg-blue-500/5 blur-3xl rounded-full" />
//                 <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
//                     Upgrade Your Experience
//                 </h1>
//                 <p className="text-gray-500 max-w-2xl leading-relaxed">
//                     Choose the perfect plan to boost your hostel visibility and manage bookings more efficiently.
//                     Unlock premium features designed for growth.
//                 </p>
//             </div>

//             {/* Pricing Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//                 {data?.plans.map((plan, idx) => {
//                     const PlanIcon = idx === 0 ? Rocket : idx === 1 ? Zap : Sparkles;

//                     return (
//                         <Card
//                             key={plan.name}
//                             className={`flex flex-col h-full transition-all duration-300 relative overflow-hidden group border-muted shadow-sm hover:shadow-xl hover:-translate-y-1 ${plan.is_highlighted ? 'border-blue-500 ring-4 ring-blue-500/10' : ''
//                                 }`}
//                         >
//                             {plan.is_highlighted && (
//                                 <div className="absolute top-0 right-0">
//                                     <div className="bg-blue-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl shadow-sm uppercase tracking-wider">
//                                         Most Popular
//                                     </div>
//                                 </div>
//                             )}

//                             <CardHeader className="pb-8">
//                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-colors ${plan.is_highlighted ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-blue-50 text-blue-600'
//                                     }`}>
//                                     <PlanIcon size={24} />
//                                 </div>
//                                 <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
//                                     {plan.name}
//                                 </CardTitle>
//                                 <CardDescription className="text-gray-500 mt-2 line-clamp-2 leading-relaxed">
//                                     {plan.description}
//                                 </CardDescription>
//                             </CardHeader>

//                             <CardContent className="flex-1 space-y-8">
//                                 <div className="flex items-baseline gap-1">
//                                     <span className="text-4xl font-black text-gray-900">{plan.currency_symbol}{plan.price}</span>
//                                     <span className="text-gray-400 font-medium text-sm">{plan.period}</span>
//                                 </div>

//                                 <div className="space-y-4">
//                                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Everything in {plan.name}:</h4>
//                                     <ul className="space-y-3.5">
//                                         {plan.features.map((feature, fIdx) => (
//                                             <li key={fIdx} className="flex items-start gap-3 group/item">
//                                                 <div className="mt-1 flex-shrink-0 w-4 h-4 rounded-full bg-green-50 flex items-center justify-center group-hover/item:bg-green-100 transition-colors">
//                                                     <Check size={12} className="text-green-600 font-bold" />
//                                                 </div>
//                                                 <span className="text-sm text-gray-600 font-medium leading-tight">
//                                                     {feature.feature_text}
//                                                 </span>
//                                             </li>
//                                         ))}
//                                     </ul>
//                                 </div>
//                             </CardContent>

//                             <CardFooter className="pt-8">
//                                 <Button
//                                     className={`w-full py-6 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] ${plan.is_highlighted
//                                             ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200 hover:shadow-blue-300'
//                                             : 'bg-white border-2 border-gray-100 text-gray-900 hover:bg-gray-50 hover:border-gray-200'
//                                         }`}
//                                 >
//                                     {plan.is_highlighted ? 'Get Started Now' : 'Join Plan'}
//                                 </Button>
//                             </CardFooter>
//                         </Card>
//                     );
//                 })}
//             </div>

//             {/* Bottom FAQ/Comparison link section */}
//             <div className="mt-16 bg-gradient-to-br from-gray-900 to-blue-900 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl shadow-blue-900/40">
//                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2" />
//                 <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 blur-3xl rounded-full -translate-x-1/2 translate-y-1/2" />

//                 <div className="relative z-10 max-w-2xl">
//                     <h2 className="text-3xl font-black mb-4 tracking-tight leading-tight">
//                         {data?.cta_title || "Grow Your Business with StayNest Premium"}
//                     </h2>
//                     <p className="text-blue-100 text-lg opacity-80 leading-relaxed font-light mb-8">
//                         Join over 5,000+ hostel owners who trust StayNest to scale their properties and streamline their daily operations.
//                     </p>
//                     <Button
//                         size="lg"
//                         className="bg-white text-blue-900 hover:bg-blue-50 font-extrabold px-10 py-7 rounded-2xl shadow-xl shadow-black/20"
//                     >
//                         {data?.cta_button_text || "Contact Sales Team"}
//                     </Button>
//                 </div>
//             </div>
//         </div>
//     );
// }


"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Zap, Sparkles, Rocket } from "lucide-react";
import { getPricingPage } from "@/services/public.service";

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
  const { data, isLoading, error } = useQuery({
    queryKey: ["pricing-plans"],
    queryFn: getPricingPage,
  });

  /* ---------------- Loading State ---------------- */

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

  if (error) {
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

      {/* Pricing Grid */}

      <div className="grid md:grid-cols-3 gap-8">
        {data?.plans.map((plan, idx) => {
          const PlanIcon = idx === 0 ? Rocket : idx === 1 ? Zap : Sparkles;

          return (
            <Card
              key={plan.name}
              className={`relative flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${
                plan.is_highlighted
                  ? "border-primary shadow-lg scale-[1.03]"
                  : "border-muted"
              }`}
            >
              {plan.is_highlighted && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  Most Popular
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
                  className="w-full"
                  variant={plan.is_highlighted ? "default" : "outline"}
                >
                  {plan.is_highlighted ? "Get Started" : "Choose Plan"}
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
            {data?.cta_title || "Grow your hostel business faster"}
          </h2>

          <p className="text-muted-foreground">
            Join thousands of hostel owners using StayNest to simplify booking
            management and increase their visibility online.
          </p>
        </div>

        <Button size="lg">
          {data?.cta_button_text || "Contact Sales"}
        </Button>
      </div>
    </div>
  );
}