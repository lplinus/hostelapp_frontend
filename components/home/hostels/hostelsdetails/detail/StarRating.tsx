import { Star } from "lucide-react";

export default function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
    return (
        <span className="inline-flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star
                    key={i}
                    size={size}
                    className={
                        i <= Math.round(rating)
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                    }
                />
            ))}
        </span>
    );
}
