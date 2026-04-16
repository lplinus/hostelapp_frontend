"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, ChevronLeft, User, Bot, Loader2 } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: "user" | "bot";
  timestamp: Date;
}

const INITIAL_MESSAGE: Message = {
  id: "1",
  text: "Hello! I'm your Hostel In Assistant. How can I help you find your perfect home today?",
  sender: "bot",
  timestamp: new Date(),
};

const QUICK_REPLIES = [
  "View Available Hostels",
  "Pricing Details",
  "How to Book?",
  "Customer Support",
];

/** Renders bot text with line breaks and bullet points */
const FormattedText = ({ text }: { text: string }) => {
  // Split by newlines and render each line
  const lines = text.split("\n").filter((line) => line.trim() !== "");

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        // Bullet point lines (starts with - or • or *)
        if (/^[-•*]\s/.test(trimmed)) {
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-indigo-400" />
              <span>{trimmed.replace(/^[-•*]\s/, "")}</span>
            </div>
          );
        }

        // Numbered list (1. 2. etc.)
        if (/^\d+[.)]\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)[.)]\s/)?.[1];
          const content = trimmed.replace(/^\d+[.)]\s/, "");
          return (
            <div key={i} className="flex items-start gap-2 pl-1">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500/10 text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                {num}
              </span>
              <span>{content}</span>
            </div>
          );
        }

        // Regular text line
        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
};

const ChatWindow = ({ onClose }: { onClose: () => void }) => {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/ai/chat/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();

      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: data.reply || "I'm having trouble connecting right now. Please try again!",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Oops! Something went wrong. Can you try again?",
        sender: "bot",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-[450px] flex-col overflow-hidden bg-white dark:bg-slate-900">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
        <button
          onClick={onClose}
          className="rounded-full p-1 hover:bg-slate-200 dark:hover:bg-slate-700"
        >
          <ChevronLeft size={20} className="text-slate-500" />
        </button>
        <div className="relative">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-900/40">
            <Bot size={22} />
          </div>
          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900"></span>
        </div>
        <div>
          <h4 className="font-bold text-slate-900 dark:text-white">Hostel In AI</h4>
          <p className="text-[10px] font-medium uppercase tracking-wider text-emerald-500">Online</p>
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={scrollRef}
        className="flex-1 space-y-4 overflow-y-auto p-4 no-scrollbar"
      >
        {messages.map((msg) => (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            key={msg.id}
            className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-br-none"
                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-bl-none"
              }`}
            >
              {msg.sender === "bot" ? (
                <FormattedText text={msg.text} />
              ) : (
                msg.text
              )}
            </div>
          </motion.div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
              <Loader2 size={16} className="animate-spin text-indigo-500" />
              <span className="text-xs text-slate-500">Assistant is typing...</span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Replies */}
      {messages.length < 3 && !isTyping && (
        <div className="flex gap-2 overflow-x-auto p-4 pt-0 no-scrollbar">
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => handleSend(reply)}
              className="whitespace-nowrap rounded-full border border-indigo-100 bg-indigo-50/50 px-4 py-2 text-xs font-medium text-indigo-600 transition-colors hover:bg-indigo-100 dark:border-indigo-900/30 dark:bg-indigo-900/20 dark:text-indigo-400"
            >
              {reply}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(inputValue);
          }}
          className="relative"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type your message..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-12 text-sm outline-none transition-all focus:border-indigo-500 focus:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:border-indigo-500"
          />
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="absolute right-2 top-1.5 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition-all hover:bg-indigo-700 disabled:bg-slate-300 dark:disabled:bg-slate-700"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
