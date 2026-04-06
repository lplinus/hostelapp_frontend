"use client";

import { useState, FormEvent } from "react";
import { MessageSquarePlus, Star, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { postReview } from "@/services/hostel.service";
import StarRating from "./StarRating";

interface Review {
    id: number;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

const DEFAULT_REVIEWS: Review[] = [
    {
        id: -1,
        user_name: "Aarav S.",
        rating: 5,
        comment: "Great place to stay! Clean rooms and friendly staff. Highly recommended for students.",
        created_at: new Date().toISOString(),
    },
    {
        id: -2,
        user_name: "Priya M.",
        rating: 4,
        comment: "Lovely hostel. Modern amenities and excellent food service. Will definitely recommend it to my friends.",
        created_at: new Date().toISOString(),
    },
    {
        id: -3,
        user_name: "Rohan K.",
        rating: 5,
        comment: "Excellent hostel! Close to colleges and very well maintained. Safe and secure.",
        created_at: new Date().toISOString(),
    },
];

interface HostelReviewsProps {
    hostelId: number;
    reviews?: readonly Review[];
    ratingAvg: number;
    ratingCount: number;
    onReviewSubmitted: () => void;
}

export default function HostelReviews({
    hostelId,
    reviews,
    ratingAvg,
    ratingCount,
    onReviewSubmitted,
}: HostelReviewsProps) {
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewForm, setReviewForm] = useState({
        name: "",
        hostel_rating: 5,
        food_rating: 5,
        room_rating: 5,
        comment: ""
    });

    const handleReviewSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!reviewForm.comment) {
            toast.error("Please add a comment");
            return;
        }
        setIsSubmittingReview(true);
        try {
            await postReview({
                hostel: hostelId,
                hostel_rating: reviewForm.hostel_rating,
                food_rating: reviewForm.food_rating,
                room_rating: reviewForm.room_rating,
                comment: reviewForm.comment,
                name: reviewForm.name || undefined
            });
            toast.info("Review submitted! It will appear once approved by admin.");
            setIsReviewModalOpen(false);
            setReviewForm({ name: "", hostel_rating: 5, food_rating: 5, room_rating: 5, comment: "" });
            onReviewSubmitted();
        } catch (error) {
            toast.error("Failed to post review. Please try again.");
            console.error(error);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const hasRealReviews = Array.isArray(reviews) && reviews.length > 0;
    const reviewsToShow = hasRealReviews ? reviews : DEFAULT_REVIEWS;
    const displayReviewCount = hasRealReviews ? reviews.length : ratingCount || DEFAULT_REVIEWS.length;
    const displayAvgRating = hasRealReviews ? ratingAvg : 4.5;

    return (
        <div className="mb-12 pt-6 border-t border-gray-100">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <div className="flex items-center gap-3">
                    <Star size={28} className="fill-[#1E1B4B] text-[#1E1B4B]" />
                    <h2 className="text-3xl font-bold text-[#1E1B4B] flex items-baseline gap-2">
                        {displayAvgRating.toFixed(1)}
                    </h2>
                </div>

                <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-[#312E81] hover:bg-[#1E1B4B] text-white font-bold rounded-xl px-6 py-6 flex items-center gap-2 transition-all active:scale-[0.98] shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                            <MessageSquarePlus size={18} />
                            Write a Review
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl p-6 border-0 shadow-2xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold font-sans tracking-tight">Rate your stay</DialogTitle>
                            <DialogDescription className="text-sm font-medium text-gray-500">
                                Share your experience to help others make better choices.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleReviewSubmit} className="space-y-5 pt-4">
                            <div className="space-y-2.5">
                                <Label htmlFor="name" className="text-sm font-bold text-gray-700">Display Name</Label>
                                <Input
                                    id="name"
                                    placeholder="e.g. John Doe (Optional)"
                                    className="rounded-xl border-gray-200 focus:border-[#10B981] focus:ring-[#10B981]/20 py-3 font-medium bg-gray-50"
                                    value={reviewForm.name}
                                    onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-1 gap-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-200/60">
                                {[
                                    { field: "food_rating", label: "Food & Dining" },
                                    { field: "room_rating", label: "Room Comfort" }
                                ].map((cat) => (
                                    <div key={cat.field} className="flex items-center justify-between">
                                        <Label className="text-sm font-bold text-gray-700 tracking-wide">{cat.label}</Label>
                                        <div className="flex items-center gap-1.5">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const ratingValue = reviewForm[cat.field as keyof typeof reviewForm] as number;
                                                return (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setReviewForm({ ...reviewForm, [cat.field]: star })}
                                                        className="transition-transform hover:scale-110 active:scale-90"
                                                    >
                                                        <Star
                                                            size={22}
                                                            className={`${star <= ratingValue
                                                                ? "fill-amber-400 text-amber-400"
                                                                : "text-gray-300 fill-gray-100"
                                                                }`}
                                                        />
                                                    </button>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="space-y-2.5">
                                <Label htmlFor="comment" className="text-sm font-bold text-gray-700">Your Experience</Label>
                                <Textarea
                                    id="comment"
                                    placeholder="What did you love? What could be improved?"
                                    className="rounded-xl border-gray-200 focus:border-[#10B981] focus:ring-[#10B981]/20 min-h-[120px] font-medium bg-gray-50 resize-none p-4"
                                    required
                                    value={reviewForm.comment}
                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={isSubmittingReview}
                                className="w-full bg-[#312E81] hover:bg-[#1E1B4B] text-white font-bold h-14 rounded-xl transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] active:scale-[0.98] text-[15px]"
                            >
                                {isSubmittingReview ? "Posting your review..." : "Post Review"}
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="relative group/reviews">
                <style jsx>{`
                    .scrollbar-hide::-webkit-scrollbar { display: none; }
                    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
                `}</style>
                <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-6 pb-6 -mx-2 px-2">
                    {reviewsToShow.map((review) => (
                        <div
                            key={review.id}
                            className="flex flex-col gap-4 bg-white border border-gray-100 rounded-[2.5rem] p-8 shadow-[0_4px_20px_rgb(0,0,0,0.03)] snap-start min-w-[320px] md:min-w-[450px] flex-shrink-0 hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] transition-all duration-300 border-none group/card"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-50 to-emerald-50 border border-indigo-100/50 flex items-center justify-center text-[#312E81] font-bold text-lg shadow-sm group-hover/card:scale-105 transition-transform duration-300">
                                    {review.user_name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div>
                                    <p className="font-bold text-[#1E1B4B] text-[15px] leading-tight flex items-center gap-1.5">
                                        {review.user_name || "Anonymous User"}
                                        {review.rating >= 4 && <ShieldCheck size={14} className="text-[#10B981]" />}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <StarRating rating={review.rating} size={11} />
                                        <span className="text-[12px] text-gray-500 font-medium">
                                            · {new Date(review.created_at).toLocaleDateString("en-IN", {
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 text-[15px] leading-relaxed line-clamp-4 italic">
                                "{review.comment}"
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            {reviewsToShow.length > 5 && (
                <div className="mt-4">
                    <button className="px-6 py-3 border border-gray-900 rounded-xl text-[15px] font-bold text-gray-900 hover:bg-gray-50 transition-all duration-200 active:scale-[0.98]">
                        Show all {displayReviewCount} reviews
                    </button>
                </div>
            )}
        </div>
    );
}
