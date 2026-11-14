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
    idType?: "aadhaar" | "passport" | "driving_license" | "voter_id" | "national_id";
    aadhaarNumber?: string;
    aadhaarFileUrl?: string;
    aadhaarFileName?: string;
    idVerificationStatus?: "unverified" | "pending" | "verified" | "rejected";
    isEmailVerified?: boolean;
    isPhoneVerified?: boolean;
    verifiedAt?: string;
    rejectionReason?: string;
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
