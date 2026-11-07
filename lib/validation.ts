/**
 * Strict mobile number validation for Indian 10-digit mobile phone numbers.
 * Valid numbers must:
 * - Contain exactly 10 digits (after stripping +91 or 0 prefix).
 * - Start with 6, 7, 8, or 9.
 */
export const validateIndianMobile = (
    mobile: string
): { isValid: boolean; error?: string; cleanNumber?: string } => {
    if (!mobile || !mobile.trim()) {
        return { isValid: false, error: "Mobile number is required." };
    }

    // Strip out spaces, dashes, parentheses and country prefix
    let cleaned = mobile.trim().replace(/\D/g, "");

    // If starts with 91 (country code) and has 12 digits
    if (cleaned.length === 12 && cleaned.startsWith("91")) {
        cleaned = cleaned.slice(2);
    }
    // If starts with 0 and has 11 digits
    else if (cleaned.length === 11 && cleaned.startsWith("0")) {
        cleaned = cleaned.slice(1);
    }

    if (cleaned.length < 10) {
        return { isValid: false, error: `Mobile number has only ${cleaned.length} digits. Exactly 10 digits required.` };
    }

    if (cleaned.length > 10) {
        return { isValid: false, error: `Mobile number has ${cleaned.length} digits. Exactly 10 digits required.` };
    }

    if (!/^[6-9]/.test(cleaned)) {
        return { isValid: false, error: "Mobile number must start with 6, 7, 8, or 9." };
    }

    return { isValid: true, cleanNumber: cleaned };
};

