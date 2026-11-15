import { CustomStarIcon } from "@/components/ui/custom-icons";

export default function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <span className="inline-flex gap-0.5 items-center">
            {[1, 2, 3, 4, 5].map((i) => (
                <CustomStarIcon
                    key={i}
                    className="shrink-0"
                    style={{ width: `${size}px`, height: `${size}px` }}
                    fill={i <= Math.round(rating) ? "#070707" : "#D1D5DB"}
                />
            ))}
        </span>
    );
}
