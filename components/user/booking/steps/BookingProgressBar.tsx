"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { User, CreditCard, CheckCircle2, Check } from "lucide-react";
import type { Step } from "../booking-container";

interface BookingProgressBarProps {
    currentStep: Step;
    isPhoneVerified: boolean;
    isPaymentVerified: boolean;
    bookingStatus: "pending" | "confirmed";
    bookingType: "stay" | "visit";
    onStepClick?: (step: Step) => void;
}

const STEPS = [
    { id: "details" as const, label: "Guest Details", icon: User },
    { id: "payment" as const, label: "Payment", icon: CreditCard },
    { id: "confirmation" as const, label: "Confirmation", icon: CheckCircle2 },
];

export function BookingProgressBar({
    currentStep,
    isPhoneVerified,
    isPaymentVerified,
    bookingStatus,
    bookingType,
    onStepClick,
}: BookingProgressBarProps) {
    const isConfirmed = bookingStatus === "confirmed";

    const steps = bookingType === "visit"
        ? [STEPS[0], STEPS[2]]
        : STEPS;

    const getStepStatus = (stepId: string): "active" | "completed" | "inactive" => {
        if (isConfirmed) {
            if (stepId === currentStep) return "active";
            return "completed";
        }

        if (stepId === "details") {
            if (currentStep === "details") return "active";
            if (isPhoneVerified) return "completed";
            return "inactive";
        }

        if (stepId === "payment") {
            if (currentStep === "payment") return "active";
            if (isPaymentVerified) return "completed";
            return "inactive";
        }

        if (stepId === "confirmation") {
            if (currentStep === "confirmation") return "active";
            return "inactive";
        }

        return "inactive";
    };

    const handleClick = (stepId: Step) => {
        if (isConfirmed && onStepClick) {
            onStepClick(stepId);
        }
    };

    return (
        <div className="w-full mb-8">
            <div className="relative flex items-center justify-between">
                {/* Connecting line (background) */}
                <div className="absolute top-5 left-0 right-0 h-[2px] bg-gray-200 mx-12" />

                {/* Connecting line (progress fill) */}
                <div
                    className="absolute top-5 left-0 h-[2px] bg-gradient-to-r from-[#312E81] to-[#10B981] mx-12 transition-all duration-700 ease-out"
                    style={{
                        width: (() => {
                            const currentIdx = steps.findIndex(
                                (s) => s.id === currentStep
                            );
                            if (isConfirmed) return `calc(100% - 6rem)`;
                            if (currentIdx <= 0) return "0%";
                            const pct =
                                (currentIdx / (steps.length - 1)) * 100;
                            return `calc(${pct}% - ${(6 * (100 - pct)) / 100}rem)`;
                        })(),
                    }}
                />

                {steps.map((step) => {
                    const status = getStepStatus(step.id);
                    const Icon = step.icon;
                    const isClickable = isConfirmed;

                    return (
                        <button
                            key={step.id}
                            type="button"
                            onClick={() => handleClick(step.id)}
                            disabled={!isClickable}
                            className={cn(
                                "relative z-10 flex flex-col items-center gap-2 bg-transparent border-none outline-none",
                                isClickable ? "cursor-pointer group" : "cursor-default"
                            )}
                        >
                            {/* Step circle */}
                            <div
                                className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-out border-2",
                                    status === "active" &&
                                        "bg-[#312E81] border-[#312E81] text-white shadow-lg shadow-indigo-200 scale-110",
                                    status === "completed" &&
                                        "bg-[#10B981] border-[#10B981] text-white shadow-md shadow-emerald-100",
                                    status === "inactive" &&
                                        "bg-white border-gray-200 text-gray-400",
                                    isClickable && status === "completed" && "group-hover:scale-110 group-hover:shadow-lg"
                                )}
                            >
                                {status === "completed" ? (
                                    <Check size={18} strokeWidth={3} />
                                ) : (
                                    <Icon size={18} />
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    "text-[11px] font-bold tracking-wide transition-colors duration-300 whitespace-nowrap",
                                    status === "active" && "text-[#312E81]",
                                    status === "completed" && "text-[#10B981]",
                                    status === "inactive" && "text-gray-400",
                                    isClickable && status === "completed" && "group-hover:text-[#312E81]"
                                )}
                            >
                                {step.label}
                            </span>

                            {/* Active pulse ring */}
                            {status === "active" && !isConfirmed && (
                                <div className="absolute top-0 w-10 h-10 rounded-full border-2 border-[#312E81]/30 animate-ping" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
