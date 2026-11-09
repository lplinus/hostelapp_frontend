import type {
    VacationRentalBookingStatus,
} from "@/types/vacationrental.types";

/* ── Status filter options ────────────────────────────────────── */

export const statusOptions: Array<{
    key: VacationRentalBookingStatus | "all";
    label: string;
}> = [
    { key: "all", label: "All Reservations" },
    { key: "confirmed", label: "Confirmed" },
    { key: "pending_approval", label: "Pending Approval" },
    { key: "completed", label: "Completed" },
    { key: "cancelled", label: "Cancelled" },
];

/* ── Status badge variants ────────────────────────────────────── */

export interface StatusVariant {
    badgeVariant: "default" | "secondary" | "destructive" | "outline";
    dotClass: string;
    textClass: string;
    label: string;
}

export const getStatusVariant = (
    status: VacationRentalBookingStatus
): StatusVariant => {
    switch (status) {
        case "confirmed":
            return {
                badgeVariant: "default",
                dotClass: "bg-emerald-500",
                textClass:
                    "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
                label: "Confirmed",
            };
        case "pending_approval":
            return {
                badgeVariant: "secondary",
                dotClass: "bg-amber-500 animate-pulse",
                textClass:
                    "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
                label: "Pending Approval",
            };
        case "checked_in":
            return {
                badgeVariant: "default",
                dotClass: "bg-indigo-500",
                textClass:
                    "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800",
                label: "Checked In",
            };
        case "completed":
            return {
                badgeVariant: "outline",
                dotClass: "bg-blue-500",
                textClass:
                    "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
                label: "Completed",
            };
        case "declined":
            return {
                badgeVariant: "destructive",
                dotClass: "bg-orange-500",
                textClass:
                    "text-orange-700 dark:text-orange-300 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800",
                label: "Declined",
            };
        case "cancelled":
            return {
                badgeVariant: "destructive",
                dotClass: "bg-rose-500",
                textClass:
                    "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
                label: "Cancelled",
            };
        default:
            return {
                badgeVariant: "outline",
                dotClass: "bg-slate-400",
                textClass:
                    "text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800",
                label: "Pending",
            };
    }
};

/* ── Formatting helpers ───────────────────────────────────────── */

export const formatDate = (dateStr: string) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(num);
};
