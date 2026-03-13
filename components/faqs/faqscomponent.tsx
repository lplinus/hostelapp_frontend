"use client";

import React, { useState } from "react";
import { FAQ, FAQCategory } from "@/types/cms.types";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronRight, HelpCircle } from "lucide-react";

interface FAQsComponentProps {
    faqs: FAQ[];
    categories: FAQCategory[];
}

export const FAQsComponent: React.FC<FAQsComponentProps> = ({ faqs, categories }) => {
    const [activeCategoryId, setActiveCategoryId] = useState<number>(categories[0]?.id || 0);
    const [searchQuery, setSearchQuery] = useState("");

    // Filter categories that have FAQs
    const activeCategories = categories.filter(cat => cat.is_active);

    const filteredFaqs = faqs.filter((faq) => {
        const matchesCategory = faq.category === activeCategoryId;
        const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
        
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center mb-16">
                <motion.h1 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl md:text-5xl font-bold text-slate-900 mb-4"
                >
                    Frequently Asked Questions
                </motion.h1>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg text-slate-600 max-w-2xl mx-auto"
                >
                    Have questions? We're here to help. Find answers to common queries about bookings, payments, and our hostels.
                </motion.p>
            </div>

            <div className="relative max-w-2xl mx-auto mb-12">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    placeholder="Search for questions..."
                    className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none text-slate-900"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Categories Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-24 space-y-2">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 px-4">Categories</h3>
                        {activeCategories.map((category) => (
                            <button
                                key={category.id}
                                onClick={() => setActiveCategoryId(category.id)}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all ${
                                    activeCategoryId === category.id
                                        ? "bg-orange-50 text-orange-600 font-medium border-l-4 border-orange-500"
                                        : "text-slate-600 hover:bg-slate-50 border-l-4 border-transparent"
                                }`}
                            >
                                <span>{category.name}</span>
                                <ChevronRight className={`h-4 w-4 transition-transform ${activeCategoryId === category.id ? "rotate-90" : ""}`} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* FAQs Accordion */}
                <div className="lg:col-span-3">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeCategoryId + searchQuery}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                        >
                            <Accordion type="single" collapsible className="space-y-4">
                                {filteredFaqs.length > 0 ? (
                                    filteredFaqs.map((faq, index) => (
                                        <AccordionItem 
                                            key={faq.slug} 
                                            value={faq.slug}
                                            className="border border-slate-200 rounded-2xl bg-white px-6 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                                        >
                                            <AccordionTrigger className="hover:no-underline py-5 text-left text-slate-900 font-semibold group">
                                                <div className="flex items-center gap-4">
                                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">
                                                        {index + 1}
                                                    </span>
                                                    <span>{faq.question}</span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="text-slate-600 leading-relaxed pb-5 pl-12">
                                                {faq.answer}
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))
                                ) : (
                                    <div className="text-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
                                            <HelpCircle className="h-8 w-8" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 mb-2">No FAQs found</h3>
                                        <p className="text-slate-500">Try adjusting your search or category selection.</p>
                                    </div>
                                )}
                            </Accordion>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
