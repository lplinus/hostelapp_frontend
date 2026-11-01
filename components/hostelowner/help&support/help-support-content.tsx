"use client";

import { useState } from "react";
import { ChevronDown, Mail, Phone, Clock, MessageSquare, Send, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

const faqs = [
    {
        question: "How do I cancel my booking?",
        answer: "To cancel a booking, go to the 'Bookings' tab in your dashboard, select the active booking, and click the 'Cancel' button. Please note that cancellations subject to our refund policy.",
    },
    {
        question: "How are payments processed?",
        answer: "We accept all major credit cards, UPI, and net banking. Payments are securely processed through our payment gateway. For monthly rentals, automated billing can be set up.",
    },
    {
        question: "Can I change my room type after booking?",
        answer: "Room changes are subject to availability. Please contact support or your hostel manager directly through the dashboard to request a room modification.",
    },
    {
        question: "What is the standard check-in/check-out time?",
        answer: "Standard check-in time is generally 12:00 PM and check-out is strictly by 11:00 AM. If you require early check-in or late check-out, please inform us beforehand.",
    },
    {
        question: "Are guests allowed in my room?",
        answer: "Visitor policies vary by hostel. Generally, visitors are allowed in common areas during visiting hours (usually 10 AM to 8 PM) but are not permitted inside private rooms for security reasons.",
    },
];

export default function HelpSupportContent() {
    const [openFaq, setOpenFaq] = useState<number | null>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const handleSupportSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        // Simulate API call
        setTimeout(() => {
            setIsSubmitting(false);
            toast.success("Support ticket created! We will get back to you shortly.");
            (e.target as HTMLFormElement).reset();
        }, 1500);
    };

    return (
        <div className="space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header Section */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Help & Support</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Find answers to common questions below, or reach out to our support team directly.
                </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left Column: Contact Cards & Form */}
                <div className="lg:col-span-1 space-y-4">
                    {/* Contact Info Cards */}
                    <div className="grid grid-cols-1 gap-3">
                        <div className="bg-primary rounded-xl p-5 text-white shadow-xs relative overflow-hidden">
                            <div className="relative z-10 flex items-start gap-4">
                                <div className="p-2.5 bg-white/15 rounded-xl backdrop-blur-md">
                                    <Phone size={18} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-white/80 text-[11px] font-bold uppercase tracking-wider mb-0.5">Call Support</p>
                                    <p className="font-semibold text-base">+91 98765 43210</p>
                                    <p className="text-white/60 text-xs mt-0.5 flex items-center gap-1">
                                        <Clock size={12} /> Mon-Sat, 9AM-8PM
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl p-5 border border-border/40 shadow-xs flex items-start gap-4">
                            <div className="p-2.5 bg-muted text-muted-foreground rounded-xl">
                                <Mail size={18} />
                            </div>
                            <div>
                                <p className="text-muted-foreground text-[11px] font-bold uppercase tracking-wider mb-0.5">Email Us</p>
                                <p className="font-semibold text-sm text-foreground">support@hostelin.com</p>
                                <p className="text-muted-foreground text-xs mt-0.5">Average response: 2 hours</p>
                            </div>
                        </div>
                    </div>

                    {/* Support Form */}
                    <div className="bg-card rounded-xl p-5 border border-border/40 shadow-xs">
                        <div className="flex items-center gap-2 mb-4 text-foreground font-semibold text-sm">
                            <MessageSquare size={16} className="text-primary" />
                            <h3>Send a Message</h3>
                        </div>
                        <form onSubmit={handleSupportSubmit} className="space-y-3.5">
                            <div>
                                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Subject</label>
                                <select className="w-full bg-slate-50 border border-slate-200 text-foreground text-xs rounded-lg focus:border-primary focus:ring-1 focus:ring-primary block p-2.5 transition-colors outline-none" required>
                                    <option value="">Select a topic</option>
                                    <option value="booking">Booking Issue</option>
                                    <option value="payment">Payment/Refund</option>
                                    <option value="complaint">Lodge a Complaint</option>
                                    <option value="other">Other Inquiry</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">Message</label>
                                <textarea
                                    rows={3}
                                    className="w-full bg-slate-50 border border-slate-200 text-foreground text-xs rounded-lg focus:border-primary focus:ring-1 focus:ring-primary block p-2.5 transition-colors outline-none resize-none"
                                    placeholder="Explain your issue in detail..."
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl py-2.5 px-4 font-semibold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-xs"
                            >
                                {isSubmitting ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <Send size={14} /> Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: FAQs */}
                <div className="lg:col-span-2">
                    <div className="bg-card rounded-xl p-4 sm:p-5 border border-border/40 shadow-xs h-full">
                        <div className="px-2 pt-2 pb-4 flex items-center gap-2 text-foreground">
                            <AlertCircle size={18} className="text-primary" />
                            <h3 className="text-base font-bold">Frequently Asked Questions</h3>
                        </div>
                        <div className="space-y-2">
                            {faqs.map((faq, index) => {
                                const isOpen = openFaq === index;
                                return (
                                    <div
                                        key={index}
                                        className={
                                            `border border-border/40 rounded-lg overflow-hidden transition-all duration-200 ` +
                                            (isOpen ? "bg-primary/5 border-primary/20 shadow-xs" : "bg-card hover:border-border/60")
                                        }
                                    >
                                        <button
                                            type="button"
                                            className="w-full flex items-center justify-between p-3.5 text-left transition-colors"
                                            onClick={() => toggleFaq(index)}
                                        >
                                            <span className={`font-semibold text-xs sm:text-sm pr-3 ${isOpen ? "text-primary" : "text-foreground"}`}>
                                                {faq.question}
                                            </span>
                                            <div className={`p-1 rounded-md transition-colors ${isOpen ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
                                                <ChevronDown
                                                    size={14}
                                                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                                />
                                            </div>
                                        </button>
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
                                        >
                                            <div className="p-3.5 pt-0 text-xs text-muted-foreground leading-relaxed border-t border-transparent">
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
