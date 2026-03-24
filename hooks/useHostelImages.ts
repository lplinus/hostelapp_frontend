import { useMemo } from "react";
import { toLocalMediaPath } from "@/lib/utils";
import type { HostelDetail } from "@/types/hostel.types";

export function useHostelImages(hostel: HostelDetail) {
    return useMemo(() => {
        const hostelImages: { src: string; alt: string }[] = [];
        
        // Process explicit images
        if (hostel.images && hostel.images.length > 0) {
            for (const img of hostel.images) {
                for (let i = 1; i <= 10; i++) {
                    const field = (i === 1 ? "image" : `image${i}`) as keyof typeof img;
                    const src = img[field];
                    if (typeof src === "string" && src) {
                        hostelImages.push({
                            src: toLocalMediaPath(src) || src,
                            alt: i === 1 ? img.alt_text : `${img.alt_text} ${i}`
                        });
                    }
                }
            }
        }

        // Fallback to default images if no specific images found
        if (hostelImages.length === 0 && hostel.default_images) {
            const d = hostel.default_images;
            const altText = d.alt_text || "Default hostel image";
            for (let i = 1; i <= 10; i++) {
                const field = `image${i}` as keyof typeof d;
                const src = d[field];
                if (typeof src === "string" && src) {
                    hostelImages.push({
                        src: toLocalMediaPath(src) || src,
                        alt: i === 1 ? altText : `${altText} ${i}`
                    });
                }
            }
        }
        
        return hostelImages;
    }, [hostel]);
}
