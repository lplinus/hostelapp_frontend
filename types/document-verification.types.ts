export type VerificationRole = "owner" | "vendor" | "service";

export type VerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export interface DocumentTypeOption {
    value: string;
    label: string;
    description: string;
}

export interface VerificationDocumentItem {
    id: number;
    document_type: string;
    document_type_display: string;
    title: string;
    file: string;
    file_url?: string;
    file_size: number;
    status: "pending" | "verified" | "rejected";
    status_display: string;
    rejection_reason?: string | null;
    can_delete?: boolean;
    delete_cooldown_seconds_remaining?: number;
    created_at: string;
    updated_at: string;
}

export interface DocumentVerificationData {
    id: number;
    role: VerificationRole;
    role_display: string;
    detected_role?: string;
    allowed_document_types?: DocumentTypeOption[];
    status: VerificationStatus;
    status_display: string;
    admin_notes?: string | null;
    verified_at?: string | null;
    documents: VerificationDocumentItem[];
    uploaded_count: number;
    remaining_slots: number;
    created_at: string;
    updated_at: string;
}
