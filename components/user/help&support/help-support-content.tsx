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
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header Section */}
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-20 -mt-20 opacity-50 group-hover:opacity-70 transition-opacity"></div>
                <div className="relative z-10 font-sans">
                    <h2 className="text-3xl font-black text-gray-900 tracking-tight">How can we help you?</h2>
                    <p className="text-gray-500 mt-2 max-w-xl text-sm leading-relaxed">
                        Find answers to common questions below, or reach out to our support team directly. We are here to ensure you have a comfortable stay.
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Left Column: Contact Cards & Form */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Contact Info Cards */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                            <div className="relative z-10 flex items-start gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-md">
                                    <Phone size={20} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Call Support</p>
                                    <p className="font-semibold text-lg">+91 98765 43210</p>
                                    <p className="text-blue-100/70 text-xs mt-1 flex items-center gap-1">
                                        <Clock size={12} /> Mon-Sat, 9AM-8PM
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-4 hover:border-blue-100 transition-colors">
                            <div className="p-3 bg-gray-50 text-gray-600 rounded-xl">
                                <Mail size={20} />
                            </div>
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Email Us</p>
                                <p className="font-semibold text-gray-900">support@hostelin.com</p>
                                <p className="text-gray-500 text-xs mt-1">Average response: 2 hours</p>
                            </div>
                        </div>
                    </div>

                    {/* Support Form */}
                    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-gray-900 font-bold">
                            <MessageSquare size={18} className="text-blue-600" />
                            <h3>Send a Message</h3>
                        </div>
                        <form onSubmit={handleSupportSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Subject</label>
                                <select className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 transition-colors outline-none" required>
                                    <option value="">Select a topic</option>
                                    <option value="booking">Booking Issue</option>
                                    <option value="payment">Payment/Refund</option>
                                    <option value="complaint">Lodge a Complaint</option>
                                    <option value="other">Other Inquiry</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">Message</label>
                                <textarea
                                    rows={4}
                                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 block p-3 transition-colors outline-none resize-none"
                                    placeholder="Explain your issue in detail..."
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-blue-600 text-white rounded-xl py-3 px-4 font-semibold text-sm hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                ) : (
                                    <>
                                        <Send size={16} /> Send Message
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: FAQs */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl p-2 sm:p-4 border border-gray-100 shadow-sm h-full">
                        <div className="px-4 pt-4 pb-6 flex items-center gap-2 text-gray-900">
                            <AlertCircle size={20} className="text-blue-600" />
                            <h3 className="text-xl font-bold">Frequently Asked Questions</h3>
                        </div>
                        <div className="space-y-2">
                            {faqs.map((faq, index) => {
                                const isOpen = openFaq === index;
                                return (
                                    <div
                                        key={index}
                                        className={
                                            `border border-gray-100 rounded-xl overflow-hidden transition-all duration-200 ` +
                                            (isOpen ? "bg-blue-50/30 border-blue-100 shadow-sm" : "bg-white hover:border-gray-200")
                                        }
                                    >
                                        <button
                                            type="button"
                                            className="w-full flex items-center justify-between p-5 text-left transition-colors"
                                            onClick={() => toggleFaq(index)}
                                        >
                                            <span className={`font-semibold text-sm sm:text-base pr-4 ${isOpen ? "text-blue-700" : "text-gray-800"}`}>
                                                {faq.question}
                                            </span>
                                            <div className={`p-1 rounded-full transition-colors ${isOpen ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-400"}`}>
                                                <ChevronDown
                                                    size={16}
                                                    className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                                                />
                                            </div>
                                        </button>
                                        <div
                                            className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"}`}
                                        >
                                            <div className="p-5 pt-0 text-sm text-gray-600 leading-relaxed border-t border-transparent">
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
