"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
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
    { id: "details" as const, label: "Guest Details", number: 1 },
    { id: "payment" as const, label: "Payment", number: 2 },
    { id: "confirmation" as const, label: "Confirmation", number: 3 },
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
        <div className="w-full px-2 sm:px-4">
            <div className="relative flex items-start justify-between max-w-lg mx-auto">
                {steps.map((step, idx) => {
                    const status = getStepStatus(step.id);
                    const isClickable = isConfirmed;
                    const isLast = idx === steps.length - 1;

                    return (
                        <React.Fragment key={step.id}>
                            <button
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
                                        "w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center transition-all duration-500 ease-out text-sm font-bold",
                                        status === "active" &&
                                            "bg-[#1F1E1B] text-[#EDE8DF] ring-4 ring-[#1F1E1B]/15",
                                        status === "completed" &&
                                            "bg-[#1F1E1B] text-[#EDE8DF]",
                                        status === "inactive" &&
                                            "bg-[#EDE8DF] border-2 border-[#D2CABC] text-[#686259]",
                                        isClickable && status === "completed" && "group-hover:scale-105"
                                    )}
                                >
                                    {status === "completed" ? (
                                        <Check size={18} strokeWidth={3} />
                                    ) : (
                                        <span>{step.number}</span>
                                    )}
                                </div>

                                {/* Label */}
                                <span
                                    className={cn(
                                        "text-xs font-semibold tracking-wide transition-colors duration-300 whitespace-nowrap",
                                        status === "active" && "text-[#1A1916]",
                                        status === "completed" && "text-[#1A1916]",
                                        status === "inactive" && "text-[#686259]",
                                        isClickable && status === "completed" && "group-hover:text-[#1F1E1B]"
                                    )}
                                >
                                    {step.label}
                                </span>
                            </button>

                            {/* Connecting line */}
                            {!isLast && (
                                <div className="flex-1 flex items-center mt-[20px] sm:mt-[22px] px-2">
                                    <div className="w-full h-[2px] relative bg-[#D2CABC] rounded-full overflow-hidden">
                                        <div
                                            className={cn(
                                                "absolute inset-y-0 left-0 rounded-full transition-all duration-700 ease-out",
                                                (() => {
                                                    const nextStep = steps[idx + 1];
                                                    const nextStatus = getStepStatus(nextStep.id);
                                                    if (nextStatus === "completed" || nextStatus === "active") return "w-full bg-[#1F1E1B]";
                                                    if (status === "completed" || status === "active") return "w-1/2 bg-[#1F1E1B]";
                                                    return "w-0";
                                                })()
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
