"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ShieldCheck,
  Lock,
  GraduationCap,
  Zap,
  ArrowUp,
  ArrowRight,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Footer() {
  const { isAuthenticated } = useAuth();
  const homeHref = isAuthenticated ? "/dashboard" : "/";
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail.trim()) {
      setSubscribed(true);
      setNewsletterEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-white text-slate-800 font-inter border-t border-slate-200/90 relative overflow-hidden">
      {/* Main Footer Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 flex flex-col items-start pr-0 lg:pr-6">
            <Link href={homeHref} className="flex items-center gap-3 mb-4 group">
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm bg-slate-100 p-0.5 border border-slate-200 group-hover:border-[#1E1B4B] transition-all">
                <Image
                  src="/images/icon.webp"
                  alt="Hostel In"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <span className="text-2xl font-bold text-[#0F172A] tracking-tight group-hover:text-[#1E1B4B] transition-colors">
                Hostel In
              </span>
            </Link>

            <p className="text-slate-700 text-sm font-medium leading-relaxed mb-6 max-w-sm">
              India's trusted platform for discovering safe, verified, and budget-friendly student hostels and PGs across major university hubs.
            </p>

            {/* Platform Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200/80 mb-6 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-800">
                All Systems Operational
              </span>
            </div>

            {/* Social Links with Dark Blue Hover */}
            <div className="flex items-center gap-2.5">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-white hover:bg-[#1E1B4B] hover:border-[#1E1B4B] transition-all shadow-sm"
              >
                <Facebook size={16} />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-white hover:bg-[#1E1B4B] hover:border-[#1E1B4B] transition-all shadow-sm"
              >
                <Twitter size={16} />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-white hover:bg-[#1E1B4B] hover:border-[#1E1B4B] transition-all shadow-sm"
              >
                <Instagram size={16} />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 hover:text-white hover:bg-[#1E1B4B] hover:border-[#1E1B4B] transition-all shadow-sm"
              >
                <Linkedin size={16} />
              </Link>
            </div>
          </div>

          {/* Column 2: Popular Cities (Without Dots, Brighter Text) */}
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] tracking-wider uppercase mb-4">
              Prime Hubs
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/city/hyderabad" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold transition-all inline-block font-medium">
                  Hyderabad
                </Link>
              </li>
              <li>
                <Link href="/city/bengaluru" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold transition-all inline-block font-medium">
                  Bengaluru
                </Link>
              </li>
              <li>
                <Link href="/city/pune" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold transition-all inline-block font-medium">
                  Pune
                </Link>
              </li>
              <li>
                <Link href="/city/mumbai" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold transition-all inline-block font-medium">
                  Mumbai
                </Link>
              </li>
              <li>
                <Link href="/city/chennai" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold transition-all inline-block font-medium">
                  Chennai
                </Link>
              </li>
              <li>
                <Link href="/city/delhi" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold transition-all inline-block font-medium">
                  Delhi NCR
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation with Brighter Text */}
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] tracking-wider uppercase mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/home" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Home</Link></li>
              <li><Link href="/blog" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Blog</Link></li>
              <li><Link href="/contact-us" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Contact</Link></li>
              <li><Link href="/about-us" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">About Us</Link></li>
              {/* <li><Link href="/hotels" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Hotels</Link></li> */}
              <li><Link href="/faqs" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Help &amp; FAQs</Link></li>
              <li><Link href="/refunds" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Refund Policy</Link></li>
              <li><Link href="/PrivacyPolicy" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Privacy Policy</Link></li>
              <li><Link href="/Terms&Conditions" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Campus Alerts */}
          <div>
            <h3 className="text-xs font-bold text-[#0F172A] tracking-wider uppercase mb-4">
              Stay Updated
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed font-medium mb-4">
              Get notified when verified hostels or student discounts drop in your city.
            </p>

            <form onSubmit={handleSubscribe} className="space-y-2.5">
              <div className="relative">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter college email"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#1E1B4B] focus:bg-white transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-2.5 bg-[#1E1B4B] hover:bg-[#312E81] text-white rounded-lg flex items-center justify-center transition-all active:scale-95 shadow-sm"
                >
                  <ArrowRight size={13} />
                </button>
              </div>

              {subscribed && (
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 animate-in fade-in">
                  <CheckCircle2 size={13} />
                  <span>You're subscribed!</span>
                </div>
              )}
            </form>

            <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] text-slate-700 leading-relaxed font-medium">
                🔒 We protect your data. Zero spam, unsubscribe anytime.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-slate-200/80 bg-slate-50/70 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-xs text-slate-700 font-medium flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>© {new Date().getFullYear()} Billion World Pvt. Limited</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
              Built with <Heart size={12} className="text-rose-500 fill-rose-500" /> for students across India
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs font-semibold text-slate-700">
            <Link href="/sitemap" className="hover:text-[#1E1B4B] transition-colors">Sitemap</Link>
            <Link href="/accessibility" className="hover:text-[#1E1B4B] transition-colors">Accessibility</Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[#1E1B4B] hover:text-[#312E81] transition-all font-bold hover:-translate-y-0.5"
            >
              <span>Back to top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}