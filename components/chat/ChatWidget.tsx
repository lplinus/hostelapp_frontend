"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Headset, X, Send, Phone as WhatsApp, User, Bot, Sparkles } from "lucide-react";

import ChatWindow from "./ChatWindow";

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "chat">("menu");

  const toggleWidget = () => {
    if (isOpen) {
      setIsOpen(false);
      setShowMenu(false);
      setActiveTab("menu");
    } else {
      setIsOpen(true);
      setShowMenu(true);
    }
  };

  const openChat = () => {
    setActiveTab("chat");
    setShowMenu(false);
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/919392356996?text=Hi! I found your hostel website and would like to know more.", "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-4">
      {/* Floating Menu / Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="mb-4 w-[320px] max-w-[90vw] overflow-hidden rounded-2xl border border-white/20 bg-white/80 shadow-2xl backdrop-blur-xl dark:bg-slate-900/80"
          >
            {activeTab === "menu" ? (
              <div className="p-6">
                <div className="mb-6 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Support Hub</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">How can we help you today?</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={openChat}
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-indigo-500 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30">
                      <Bot size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">AI Assistant</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Instant answers to your questions</div>
                    </div>
                  </button>

                  <button
                    onClick={openWhatsApp}
                    className="flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-500 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30">
                      <WhatsApp size={20} />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">WhatsApp</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Chat directly with our team</div>
                    </div>
                  </button>
                </div>
              </div>
            ) : (
              <ChatWindow onClose={() => setActiveTab("menu")} />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleWidget}
        className={`flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition-all ${
          isOpen 
            ? "bg-black" 
            : "bg-gradient-to-br from-slate-900 via-indigo-950 to-black hover:shadow-emerald-500/20"
        }`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div
              key="open"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <Headset size={24} className="text-emerald-400" />

              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
};

export default ChatWidget;
