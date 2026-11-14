"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { MessageSquarePlus, Star, ShieldCheck, ChevronRight, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { postReview } from "@/services/hostelservices/hostel.service";
import StarRating from "./StarRating";

interface Review {
    id: number;
    user_name: string;
    rating: number;
    comment: string;
    created_at: string;
}

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
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScrollButtons = () => {
        if (!scrollContainerRef.current) return;
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
        setCanScrollLeft(scrollLeft > 10);
        setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    };

    useEffect(() => {
        checkScrollButtons();
    }, [reviews]);

    const scroll = (direction: "left" | "right") => {
        if (scrollContainerRef.current) {
            const scrollAmount = Math.min(360, scrollContainerRef.current.clientWidth * 0.85);
            scrollContainerRef.current.scrollBy({
                left: direction === "left" ? -scrollAmount : scrollAmount,
                behavior: "smooth",
            });
            setTimeout(checkScrollButtons, 350);
        }
    };
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

    const realReviews = Array.isArray(reviews) ? reviews : [];
    const reviewsToShow = realReviews;
    const displayReviewCount = realReviews.length || (Number(ratingCount) || 0);
    const displayAvgRating = Number(ratingAvg) || 0;

    return (
        <section className="mb-10 pt-6 border-t border-gray-100">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-6">
                <h2 className="text-xl font-bold text-gray-900">What Guests Say</h2>
                <div className="flex items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
                    <Dialog>
                        <DialogTrigger asChild>
                            <button className="text-sm font-semibold text-[#312E81] hover:text-[#1E1B4B] flex items-center gap-0.5 transition-colors cursor-pointer">
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
                                                <p className="font-bold text-black text-sm flex items-center gap-1.5">
                                                    {review.user_name || "Anonymous User"}
                                                    {review.rating >= 4 && <ShieldCheck size={13} className="text-[#10B981]" />}
                                                </p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <StarRating rating={review.rating} size={10} />
                                                    <span className="text-[11px] text-gray-700 font-medium">
                                                        · {new Date(review.created_at).toLocaleDateString("en-IN", {
                                                            month: "short",
                                                            year: "numeric",
                                                        })}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-gray-950 text-sm font-medium leading-relaxed">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {/* Very little size arrow side scrolling buttons */}
                    <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
                        <button
                            type="button"
                            onClick={() => scroll("left")}
                            disabled={!canScrollLeft}
                            aria-label="Scroll reviews left"
                            className="w-6 h-6 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs"
                        >
                            <ChevronLeft size={13} />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll("right")}
                            disabled={!canScrollRight}
                            aria-label="Scroll reviews right"
                            className="w-6 h-6 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 disabled:opacity-35 disabled:cursor-not-allowed flex items-center justify-center transition-all active:scale-90 cursor-pointer shadow-2xs"
                        >
                            <ChevronRight size={13} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Review Cards - Horizontal Scroll or Empty State */}
            <style jsx>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none !important;
                    width: 0 !important;
                    height: 0 !important;
                }
                .no-scrollbar {
                    -ms-overflow-style: none !important;
                    scrollbar-width: none !important;
                }
            `}</style>

            {reviewsToShow.length === 0 ? (
                <div className="py-7 px-4 text-center rounded-xl bg-slate-50/70 border border-dashed border-slate-200">
                    <p className="text-xs sm:text-sm font-semibold text-slate-800">No verified reviews yet</p>
                    <p className="text-[11px] sm:text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Be the first verified guest to share a review after your stay at this hostel.
                    </p>
                </div>
            ) : (
                <div
                    ref={scrollContainerRef}
                    onScroll={checkScrollButtons}
                    className="flex overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory gap-4 pb-2 -mx-1 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                >
                    {reviewsToShow.map((review) => (
                        <div
                            key={review.id}
                            className="flex flex-col gap-4 bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 snap-start w-[80vw] xs:w-[280px] sm:min-w-[340px] md:min-w-[380px] flex-shrink-0 hover:shadow-md transition-shadow duration-300"
                        >
                            {/* Reviewer */}
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-indigo-50 flex items-center justify-center text-[#312E81] font-bold text-base flex-shrink-0">
                                    {review.user_name?.charAt(0)?.toUpperCase() || "U"}
                                </div>
                                <div>
                                    <p className="font-bold text-black text-sm flex items-center gap-1.5">
                                        {review.user_name || "Anonymous User"}
                                        {review.rating >= 4 && <ShieldCheck size={13} className="text-[#10B981]" />}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <StarRating rating={review.rating} size={11} />
                                        <span className="text-xs text-gray-700 font-medium">
                                            · {new Date(review.created_at).toLocaleDateString("en-IN", {
                                                month: "short",
                                                year: "numeric",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* Comment */}
                            <p className="text-gray-950 text-sm font-medium leading-relaxed line-clamp-4">
                                {review.comment}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            {/* Write Review Button */}
            <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                <DialogTrigger asChild>
                    <button className="mt-4 flex items-center gap-2 text-sm font-bold text-black border border-gray-300 rounded-xl px-5 py-2.5 hover:bg-gray-50 transition-all active:scale-[0.98]">
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
