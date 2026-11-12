/**
 * Mask an email address (e.g. alex.sharma@example.com -> a***a@example.com)
 */
export function maskEmail(email?: string): string {
    if (!email) return "—";
    const parts = email.split("@");
    if (parts.length !== 2) return email;
    const [name, domain] = parts;
    if (name.length <= 2) {
        return `${name[0]}*@${domain}`;
    }
    const visibleStart = name.slice(0, 2);
    const visibleEnd = name.slice(-1);
    return `${visibleStart}${"*".repeat(Math.max(3, name.length - 3))}${visibleEnd}@${domain}`;
}

/**
 * Mask a phone number (e.g. +91 98765 43210 -> +91 ••••• ••210)
 */
export function maskPhone(phone?: string): string {
    if (!phone) return "—";
    const trimmed = phone.trim();
    if (trimmed.length <= 4) return "••••";
    const lastDigits = trimmed.slice(-3);
    const prefix = trimmed.startsWith("+") ? trimmed.slice(0, 3) + " " : "";
    return `${prefix}••••• ••${lastDigits}`;
}

