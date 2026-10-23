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
      {/* 1. Value Proposition & Trust Ribbon (Commented out as requested - not in footer):
      <div className="border-b border-slate-100 bg-slate-50/70 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#1E1B4B] hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:bg-[#1E1B4B] group-hover:text-white group-hover:border-[#1E1B4B] transition-colors duration-200 shrink-0 shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#1E1B4B] transition-colors">Physically Verified</h4>
                <p className="text-xs text-slate-500">100% on-ground inspected</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#1E1B4B] hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:bg-[#1E1B4B] group-hover:text-white group-hover:border-[#1E1B4B] transition-colors duration-200 shrink-0 shadow-sm">
                <Lock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#1E1B4B] transition-colors">Zero Brokerage</h4>
                <p className="text-xs text-slate-500">Direct transparent pricing</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#1E1B4B] hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:bg-[#1E1B4B] group-hover:text-white group-hover:border-[#1E1B4B] transition-colors duration-200 shrink-0 shadow-sm">
                <GraduationCap size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#1E1B4B] transition-colors">Student-First</h4>
                <p className="text-xs text-slate-500">Near colleges & hubs</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-slate-200/80 hover:border-[#1E1B4B] hover:shadow-md transition-all duration-200 cursor-pointer group">
              <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-700 group-hover:bg-[#1E1B4B] group-hover:text-white group-hover:border-[#1E1B4B] transition-colors duration-200 shrink-0 shadow-sm">
                <Zap size={20} />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900 group-hover:text-[#1E1B4B] transition-colors">Instant Confirmation</h4>
                <p className="text-xs text-slate-500">Reserve spot in minutes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      */}

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
              <li><Link href="/" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Home</Link></li>
              <li><Link href="/about-us" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">About Us</Link></li>
              <li><Link href="/contact-us" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Contact Support</Link></li>
              <li><Link href="/blog" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Student Blog</Link></li>
              <li><Link href="/PrivacyPolicy" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Privacy Policy</Link></li>
              <li><Link href="/Terms&Conditions" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Terms of Service</Link></li>
              <li><Link href="/faqs" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Help & FAQs</Link></li>
              <li><Link href="/refunds" className="text-slate-700 hover:text-[#1E1B4B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Refund Policy</Link></li>
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

      {/* PREVIOUS FOOTER CODE (Preserved as commented-out for future re-inclusion):
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12 text-center sm:text-left">
        <div className="flex flex-col items-center sm:items-start">
          <Link href={homeHref} className="flex items-center gap-3 mb-5 group">
            <div className="relative w-10 h-10 rounded-xl overflow-hidden shadow-sm">
              <Image
                src="/images/icon.webp"
                alt="Logo"
                fill
                className="object-contain p-0.5"
              />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight group-hover:text-[#312E81] transition-colors">
              Hostel In
            </span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs text-center sm:text-left">
            Your trusted platform for discovering safe, affordable,
            and verified student hostels across India.
          </p>
          <div className="flex justify-center sm:justify-start gap-4 text-gray-400">
            <Link href="https://facebook.com" target="_blank" className="hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-full">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-blue-400 transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-full">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="hover:text-pink-600 transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-full">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="hover:text-blue-700 transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-full">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-5 text-sm tracking-wide uppercase">Quick Links</h3>
          <ul className="space-y-3 font-medium text-sm text-gray-500">
            <li><Link href="/" className="hover:text-[#312E81] transition-colors">Home</Link></li>
            <li><Link href="/about-us" className="hover:text-[#312E81] transition-colors">About Us</Link></li>
            <li><Link href="/contact-us" className="hover:text-[#312E81] transition-colors">Contact</Link></li>
            <li><Link href="/blog" className="hover:text-[#312E81] transition-colors">Blog</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-5 text-sm tracking-wide uppercase">Legal</h3>
          <ul className="space-y-3 font-medium text-sm text-gray-500">
            <li><Link href="/PrivacyPolicy" className="hover:text-[#312E81] transition-colors">Privacy Policy</Link></li>
            <li><Link href="/Terms&Conditions" className="hover:text-[#312E81] transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/faqs" className="hover:text-[#312E81] transition-colors">FAQs</Link></li>
            <li><Link href="/refunds" className="hover:text-[#312E81] transition-colors">Refund Policy</Link></li>
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 mb-5 text-sm tracking-wide uppercase">Trust & Safety</h3>
          <div className="space-y-3 max-w-xs mx-auto sm:max-w-none">
            <div className="flex items-center justify-center sm:justify-start gap-3 bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3 hover:bg-white hover:shadow-sm transition-all">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <Lock className="w-4 h-4 text-[#312E81]" />
              </div>
              <span className="text-sm text-gray-700 font-medium">Secure Platform</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3 hover:bg-white hover:shadow-sm transition-all">
              <div className="bg-emerald-50 p-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              </div>
              <span className="text-sm text-gray-700 font-medium">Verified Listings</span>
            </div>
            <div className="flex items-center justify-center sm:justify-start gap-3 bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3 hover:bg-white hover:shadow-sm transition-all">
              <div className="bg-indigo-50 p-2 rounded-lg">
                <GraduationCap className="w-4 h-4 text-[#312E81]" />
              </div>
              <span className="text-sm text-gray-700 font-medium">Student Trusted</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-200 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-sm font-medium text-gray-500">
            © {new Date().getFullYear()} Hostel In. All rights reserved.
          </div>
          <div className="flex items-center justify-center sm:justify-start gap-6 text-sm font-medium text-gray-500">
            <Link href="/sitemap" className="hover:text-gray-900 transition-colors">Sitemap</Link>
            <Link href="/accessibility" className="hover:text-gray-900 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
      */}
    </footer>
  );
}