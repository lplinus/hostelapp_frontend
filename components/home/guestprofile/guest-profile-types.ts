export interface GuestDocumentItem {
    id: string;
    isPrimaryGuest: boolean;
    memberName: string;
    documentType: "aadhaar" | "passport" | "driving_license" | "voter_id" | "national_id" | "other";
    documentTypeName: string;
    documentNumber?: string;
    fileUrl: string;
    fileName: string;
    fileSize?: number;
    bookingReference?: string;
    verificationStatus: "unverified" | "pending" | "verified" | "rejected";
    createdAt?: string;
    updatedAt?: string;
}

export interface GuestProfile {
    id?: string | number;
    fullName: string;
    email: string;
    phone: string;
    avatarUrl?: string;
    dateOfBirth?: string;
    gender?: "male" | "female" | "other" | "prefer_not_to_say";
    bio?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    maxDocumentUploads?: number;
    idType?: "aadhaar" | "passport" | "driving_license" | "voter_id" | "national_id" | "other";
    aadhaarNumber?: string;
    aadhaarFileUrl?: string;
    aadhaarFileName?: string;
    idVerificationStatus?: "unverified" | "pending" | "verified" | "rejected";
    shareIdWithHost?: boolean;
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    verifiedAt?: string;
    rejectionReason?: string;
    documents?: GuestDocumentItem[];
    stats?: {
        totalTrips: number;
        completedStays: number;
        reviewsCount: number;
        memberSince: string;
    };
}

export interface GuestTripSummary {
    id: string;
    bookingRef: string;
    propertyName: string;
    propertyType: "hostel" | "hotel" | "vacation_rental";
    propertyId?: string | number;
    propertySlug?: string;
    roomTitle?: string;
    location?: string;
    checkIn: string;
    checkOut: string;
    status: "upcoming" | "active" | "confirmed" | "pending" | "completed" | "cancelled";
    totalAmount: number;
    paymentStatus?: string;
    thumbnailUrl?: string;
    hasReviewed?: boolean;
    reviewRating?: number | null;
    reviewComment?: string | null;
}
