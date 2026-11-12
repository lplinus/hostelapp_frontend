export const SUITABLE_OPTIONS = [
    { id: "student", name: "Student" },
    { id: "job_holder", name: "Job Holder" },
    { id: "working_professional", name: "Working Professional" },
    { id: "both", name: "Both" },
    { id: "anyone", name: "Anyone" },
] as const;

export const IMAGE_SLOTS = [
    { name: "image", id: "img-outer", label: "Cover / Main Photo", slotNum: 1 },
    { name: "image2", id: "img-inner-1", label: "Room View", slotNum: 2 },
    { name: "image3", id: "img-inner-2", label: "Interior / Facility", slotNum: 3 },
    { name: "image4", id: "img-inner-3", label: "Room / Balcony View", slotNum: 4 },
    { name: "image5", id: "img-inner-4", label: "Common Area / Lounge", slotNum: 5 },
    { name: "image6", id: "img-inner-5", label: "Study / Dining Space", slotNum: 6 },
    { name: "image7", id: "img-inner-6", label: "Washroom / Facility", slotNum: 7 },
    { name: "image8", id: "img-inner-7", label: "Building Entrance / Facade", slotNum: 8 },
    { name: "image9", id: "img-inner-8", label: "Additional Amenity", slotNum: 9 },
    { name: "image10", id: "img-inner-9", label: "Additional Photo", slotNum: 10 },
] as const;

export type ExtraChargeForm = {
    id?: number;
    charge_type: "electricity" | "water" | "maintenance" | "wifi" | "laundry" | "other";
    amount: string;
    description: string;
};

