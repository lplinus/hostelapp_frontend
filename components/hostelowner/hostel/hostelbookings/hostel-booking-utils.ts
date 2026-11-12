export const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
};

export const formatCurrency = (val?: string | number) => {
    if (!val) return "₹0";
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "₹0";
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
    }).format(num);
};

export const formatRoomCategory = (category?: string, roomType?: number) => {
    if (!category) return roomType ? `Room #${roomType}` : "Standard Room";
    return category
        .replace(/non_ac/gi, "Non-AC")
        .replace(/\bac\b/gi, "AC")
        .replace(/_/g, " ")
        .replace(/-/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const getDurationNights = (checkInStr?: string, checkOutStr?: string) => {
    if (!checkInStr || !checkOutStr) return null;
    const inDate = new Date(checkInStr);
    const outDate = new Date(checkOutStr);
    const diffTime = outDate.getTime() - inDate.getTime();
    if (isNaN(diffTime) || diffTime <= 0) return null;
    const nights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `${nights} Night${nights > 1 ? "s" : ""}`;
};

export const getStatusMeta = (status: string) => {
    switch (status?.toLowerCase()) {
        case "confirmed":
            return {
                dotClass: "bg-emerald-500",
                badgeClass:
                    "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800",
                label: "Confirmed",
            };
        case "completed":
            return {
                dotClass: "bg-blue-500",
                badgeClass:
                    "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800",
                label: "Completed",
            };
        case "cancelled":
            return {
                dotClass: "bg-rose-500",
                badgeClass:
                    "text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800",
                label: "Cancelled",
            };
        case "pending":
        default:
            return {
                dotClass: "bg-amber-500 animate-pulse",
                badgeClass:
                    "text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800",
                label: "Pending",
            };
    }
};

