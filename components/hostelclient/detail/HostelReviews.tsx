"use client";

import { useState, FormEvent } from "react";
import { MessageSquarePlus, Star, ShieldCheck, ChevronRight } from "lucide-react";
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
        <section className="mb-10 pt-8 border-t border-gray-100">
            {/* Section Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-900">What Guests Say</h2>
                <Dialog>
                    <DialogTrigger asChild>
                        <button className="text-sm font-semibold text-[#312E81] hover:text-[#1E1B4B] flex items-center gap-0.5 transition-colors">
                            View all reviews
                            <ChevronRight size={16} />
                        </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-xl rounded-2xl p-5 md:p-6 max-h-[80vh] overflow-y-auto w-[95%] border-0 shadow-2xl">
                        <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-bold text-gray-900">All Reviews</DialogTitle>
                            <DialogDescription className="text-sm text-gray-500">
                                What others are saying about this hostel.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3">
                            {reviewsToShow.map((review) => (
                                <div key={review.id} className="flex flex-col gap-3 bg-gray-50 rounded-xl p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex flex-shrink-0 items-center justify-center text-[#312E81] font-bold text-sm">
                                            {review.user_name?.charAt(0)?.toUpperCase() || "U"}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                                {review.user_name || "Anonymous User"}
                                                {review.rating >= 4 && <ShieldCheck size={13} className="text-[#10B981]" />}
                                            </p>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <StarRating rating={review.rating} size={10} />
                                                <span className="text-[11px] text-gray-400">
                                                    · {new Date(review.created_at).toLocaleDateString("en-IN", {
                                                        month: "short",
                                                        year: "numeric",
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {review.comment}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Review Cards - Horizontal Scroll */}
            <style jsx>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
            <div className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-4 pb-4 -mx-1 px-1">
                {reviewsToShow.map((review) => (
                    <div
                        key={review.id}
                        className="flex flex-col gap-4 bg-white border border-gray-100 rounded-2xl p-6 snap-start min-w-[280px] sm:min-w-[340px] md:min-w-[380px] flex-shrink-0 hover:shadow-md transition-shadow duration-300"
                    >
                        {/* Reviewer */}
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-[#312E81] font-bold text-base flex-shrink-0">
                                {review.user_name?.charAt(0)?.toUpperCase() || "U"}
                            </div>
                            <div>
                                <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5">
                                    {review.user_name || "Anonymous User"}
                                    {review.rating >= 4 && <ShieldCheck size={13} className="text-[#10B981]" />}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <StarRating rating={review.rating} size={11} />
                                    <span className="text-xs text-gray-400">
                                        · {new Date(review.created_at).toLocaleDateString("en-IN", {
                                            month: "short",
                                            year: "numeric",
                                        })}
                                    </span>
                                </div>
                            </div>
                        </div>
                        {/* Comment */}
                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-4">
                            {review.comment}
                        </p>
                    </div>
                ))}
            </div>

            {/* Write Review Button */}
            <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                <DialogTrigger asChild>
                    <button className="mt-4 flex items-center gap-2 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-all active:scale-[0.98]">
                        <MessageSquarePlus size={16} />
                        Write a Review
                    </button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-2xl p-6 border-0 shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">Rate your stay</DialogTitle>
                        <DialogDescription className="text-sm text-gray-500">
                            Share your experience to help others make better choices.
                        </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReviewSubmit} className="space-y-5 pt-4">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm font-semibold text-gray-700">Display Name</Label>
                            <Input
                                id="name"
                                placeholder="e.g. John Doe (Optional)"
                                className="rounded-xl border-gray-200 focus:border-[#312E81] focus:ring-[#312E81]/20 py-3 bg-gray-50"
                                value={reviewForm.name}
                                onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                            {[
                                { field: "food_rating", label: "Food & Dining" },
                                { field: "room_rating", label: "Room Comfort" }
                            ].map((cat) => (
                                <div key={cat.field} className="flex items-center justify-between">
                                    <Label className="text-sm font-semibold text-gray-700">{cat.label}</Label>
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
                        <div className="space-y-2">
                            <Label htmlFor="comment" className="text-sm font-semibold text-gray-700">Your Experience</Label>
                            <Textarea
                                id="comment"
                                placeholder="What did you love? What could be improved?"
                                className="rounded-xl border-gray-200 focus:border-[#312E81] focus:ring-[#312E81]/20 min-h-[120px] bg-gray-50 resize-none p-4"
                                required
                                value={reviewForm.comment}
                                onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                            />
                        </div>
                        <Button
                            type="submit"
                            disabled={isSubmittingReview}
                            className="w-full bg-[#312E81] hover:bg-[#1E1B4B] text-white font-semibold h-12 rounded-xl transition-all active:scale-[0.98]"
                        >
                            {isSubmittingReview ? "Posting your review..." : "Post Review"}
                        </Button>
                    </form>
                </DialogContent>
            </Dialog>
        </section>
    );
}
