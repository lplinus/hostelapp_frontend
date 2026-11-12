"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Bot, Send, Sparkles, MessageSquare, Zap, HelpCircle } from "lucide-react";

interface Message {
    id: string;
    sender: "ai" | "user";
    text: string;
    timestamp: string;
}

export default function AiAssistantChat() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            sender: "ai",
            text: "Hello! I am your AI Property & Booking Copilot. How can I help you optimize your hostel, hotel, or vacation rental performance today?",
            timestamp: "Just now",
        },
    ]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);

    const quickPrompts = [
        "Suggest pricing strategy for upcoming weekend",
        "How to reduce guest booking cancellations?",
        "Draft a welcoming check-in message template",
        "Summarize this month's revenue performance",
    ];

    const handleSend = (textToSend?: string) => {
        const query = textToSend || input;
        if (!query.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            sender: "user",
            text: query,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setMessages((prev) => [...prev, userMsg]);
        if (!textToSend) setInput("");
        setIsTyping(true);

        // Simulated intelligent AI response
        setTimeout(() => {
            let replyText =
                "Based on your current properties and booking trends, occupancy is trending positive. I recommend enabling seasonal dynamic pricing (+10%) for peak weekend slots and sending automated check-in reminder SMS 24 hours prior to check-in to lower revocations.";

            if (query.toLowerCase().includes("pricing")) {
                replyText =
                    "Dynamic Pricing Recommendation: Given your current confirmed reservations, increase weekend room rates by 8-12% and offer a 5% discount for non-refundable early bird stays of 3+ nights.";
            } else if (query.toLowerCase().includes("cancellation")) {
                replyText =
                    "To minimize cancellations: 1) Require a nominal advance deposit during booking; 2) Send automated WhatsApp check-in confirmations 24 hours prior; 3) Provide flexible free date rescheduling.";
            } else if (query.toLowerCase().includes("message")) {
                replyText =
                    "Hi [Guest Name]! We are delighted to welcome you to [Property Name]. Your check-in is scheduled for [Check-In Time]. Please reply with your estimated arrival time so we can have your room ready. Safe travels!";
            }

            setMessages((prev) => [
                ...prev,
                {
                    id: (Date.now() + 1).toString(),
                    sender: "ai",
                    text: replyText,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
            ]);
            setIsTyping(false);
        }, 800);
    };

    return (
        <div className="space-y-6">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-5 rounded-xl border border-border shadow-xs">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-xs">
                        <Bot size={22} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-foreground">AI Property Copilot</h2>
                        <p className="text-xs text-muted-foreground mt-0.5">
                            Automated assistant for pricing insights, guest communications, and occupancy analytics.
                        </p>
                    </div>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200/80 rounded-lg text-xs font-semibold self-start sm:self-auto">
                    <Sparkles size={13} />
                    <span>Gemini 2.5 Pro Engine</span>
                </div>
            </div>

            {/* Main Chat Interface */}
            <div className="grid gap-6 lg:grid-cols-4">
                <Card className="lg:col-span-3 rounded-xl border border-border shadow-2xs flex flex-col h-[520px]">
                    <CardHeader className="py-3 px-5 border-b border-border/60">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                                <MessageSquare size={14} className="text-blue-600" />
                                Active Session
                            </span>
                            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Ready
                            </span>
                        </div>
                    </CardHeader>

                    {/* Messages scroll area */}
                    <CardContent className="flex-1 p-5 overflow-y-auto space-y-4">
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={`flex gap-3 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
                            >
                                {m.sender === "ai" && (
                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                                        <Bot size={16} />
                                    </div>
                                )}
                                <div
                                    className={`p-3.5 rounded-xl max-w-lg text-xs leading-relaxed shadow-2xs ${
                                        m.sender === "user"
                                            ? "bg-blue-600 text-white rounded-br-xs"
                                            : "bg-slate-50 border border-slate-100 text-slate-800 rounded-bl-xs"
                                    }`}
                                >
                                    <p>{m.text}</p>
                                    <span
                                        className={`text-[9px] block text-right mt-1.5 font-medium ${
                                            m.sender === "user" ? "text-blue-100" : "text-slate-400"
                                        }`}
                                    >
                                        {m.timestamp}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex items-center gap-2 text-slate-400 text-xs italic pl-11">
                                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce" />
                                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.2s]" />
                                <span className="w-2 h-2 rounded-full bg-slate-300 animate-bounce [animation-delay:0.4s]" />
                                Generating recommendation...
                            </div>
                        )}
                    </CardContent>

                    {/* Input Bar */}
                    <div className="p-3 border-t border-border/80 bg-slate-50/50 flex items-center gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSend()}
                            placeholder="Ask Copilot anything about your bookings, pricing, or guest messages..."
                            className="flex-1 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-blue-500 shadow-2xs"
                        />
                        <button
                            type="button"
                            onClick={() => handleSend()}
                            disabled={!input.trim()}
                            className="px-3.5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
                        >
                            <Send size={14} />
                        </button>
                    </div>
                </Card>

                {/* Sidebar Quick Prompts & Knowledge Info */}
                <div className="space-y-4">
                    <Card className="rounded-xl border border-border shadow-2xs">
                        <CardHeader className="py-3 px-4 border-b border-border/60">
                            <CardTitle className="text-xs font-bold flex items-center gap-1.5">
                                <Zap size={14} className="text-amber-500" />
                                Quick Inquiries
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2">
                            {quickPrompts.map((prompt, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSend(prompt)}
                                    className="w-full text-left p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 text-[11px] font-medium text-slate-700 transition-all leading-snug cursor-pointer"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </CardContent>
                    </Card>

                    <Card className="rounded-xl border border-border shadow-2xs bg-gradient-to-br from-purple-50/30 to-blue-50/30">
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-xs font-bold flex items-center gap-1.5 text-purple-700">
                                <HelpCircle size={14} />
                                How It Works
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0 space-y-2 text-[11px] text-slate-600 leading-relaxed">
                            <p>
                                <strong>Context Aware</strong>: The AI reads your property listings, room counts, and active reservations to provide personalized responses.
                            </p>
                            <p>
                                <strong>Continuous Learning</strong>: Automatically recalculates optimum recommendations as new bookings arrive.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

