"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Phone as WhatsApp, User, Bot, Sparkles, BrainCircuit, Sparkle } from "lucide-react";

import ChatWindow from "./ChatWindow";

const ChatWidget = () => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeTab, setActiveTab] = useState<"menu" | "chat">("menu");
  const [bookingBarHeight, setBookingBarHeight] = useState(0);
  const [showWelcomePopup, setShowWelcomePopup] = useState(false);

  useEffect(() => {
    // Sync with CSS variable for resilience
    const currentHeight = document.documentElement.style.getPropertyValue('--booking-bar-height');
    if (currentHeight) setBookingBarHeight(parseInt(currentHeight));

    const handleResize = (e: any) => {
      setBookingBarHeight(e.detail.height);
    };

    window.addEventListener('booking-bar-resize', handleResize);

    // Show welcome popup only on home page ('/home') after 3 seconds
    let timeout: NodeJS.Timeout;
    if (pathname === "/home" && !isOpen) {
      timeout = setTimeout(() => {
        setShowWelcomePopup(true);
      }, 3000);
    }

    return () => {
      window.removeEventListener('booking-bar-resize', handleResize);
      if (timeout) clearTimeout(timeout);
    };
  }, [pathname, isOpen]);

  // Hide on all internal/dashboard routes — only show on public pages
  const isInternalRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/profile" ||
    pathname.startsWith("/profile/") ||
    pathname === "/hostel" ||
    pathname.startsWith("/hostel/") ||
    pathname === "/rooms" ||
    pathname.startsWith("/rooms/") ||
    pathname === "/bookings" ||
    pathname.startsWith("/bookings/") ||
    pathname === "/subscription" ||
    pathname.startsWith("/subscription/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/") ||
    pathname === "/help&support" ||
    pathname.startsWith("/help&support/") ||
    pathname.startsWith("/vendordashboard") ||
    pathname.startsWith("/usermarketplace") ||
    pathname === "/login" ||
    pathname === "/register";

  if (isInternalRoute) {
    return null;
  }

  const toggleWidget = () => {
    if (isOpen) {
      setIsOpen(false);
      setShowMenu(false);
      setActiveTab("menu");
    } else {
      setIsOpen(true);
      setShowMenu(true);
      setShowWelcomePopup(false);
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
    <motion.div
      initial={false}
      animate={{
        bottom: `calc(1.5rem + ${bookingBarHeight}px)`
      }}
      transition={{
        type: "spring",
        damping: 30,
        stiffness: 300,
        mass: 1
      }}
      className="fixed right-4 md:right-6 z-[9999] flex flex-col items-end gap-4"
    >
      {/* Welcome Pop-up Bubble */}
      <AnimatePresence>
        {showWelcomePopup && !isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20, x: 20 }}
            onClick={toggleWidget}
            className="mb-2 mr-2 flex max-w-[280px] cursor-pointer items-center gap-3 rounded-2xl rounded-br-none border border-sky-100 bg-white p-3 pr-4 shadow-xl shadow-sky-500/10 dark:border-slate-700 dark:bg-slate-800 md:max-w-xs"
          >
            <div className="relative h-8 w-8 overflow-hidden rounded-lg bg-sky-500">
              <Image 
                src="/images/ai.webp" 
                alt="AI" 
                fill
                className="object-cover brightness-110"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">Hostel In AI</span>
              <span className="text-xs font-medium text-slate-700 dark:text-slate-200">Need help finding a hostel?</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowWelcomePopup(false);
              }}
              className="ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
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
                  <div className="relative h-10 w-10 overflow-hidden rounded-xl bg-sky-500 shadow-md">
                    <Image
                      src="/images/ai.webp"
                      alt="Hostel In AI"
                      fill
                      className="object-cover brightness-110"
                    />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Hostel In AI</h3>
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
        className={`flex h-12 w-12 items-center justify-center rounded-full text-white transition-all ${isOpen
          ? "bg-slate-900 shadow-xl"
          : "bg-sky-500 shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40"
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
              <div className="relative h-12 w-12 overflow-hidden rounded-full bg-sky-500 shadow-md transition-transform hover:scale-105 active:scale-95">
                <Image
                  src="/images/ai.webp"
                  alt="AI Assistant"
                  fill
                  className="object-cover brightness-110"
                />
              </div>

              <span className="absolute -right-1 -top-1 flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-400"></span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </motion.div>
  );
};

export default ChatWidget;
