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
    <footer className="bg-[#E5E0D6] text-[#1A1916] font-inter border-t border-[#DCD6CB] relative overflow-hidden">
      {/* Main Footer Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">

          {/* Column 1: Brand & Mission */}
          <div className="lg:col-span-2 flex flex-col items-start pr-0 lg:pr-6">
            <Link href={homeHref} className="flex items-center gap-3 mb-4 group">
              <div className="relative w-10 h-10 rounded-sm overflow-hidden shadow-xs bg-white p-0.5 border border-[#DCD6CB] group-hover:border-[#1F1E1B] transition-all">
                <Image
                  src="/images/icon.webp"
                  alt="Hostel In"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <span className="text-2xl font-bold text-[#1A1916] tracking-tight group-hover:text-[#1F1E1B] transition-colors">
                Hostel In
              </span>
            </Link>

            <p className="text-[#5A554E] text-sm font-medium leading-relaxed mb-6 max-w-sm">
              India's trusted platform for discovering safe, verified, and budget-friendly student hostels and PGs across major university hubs.
            </p>

            {/* Platform Status Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-sm bg-white/70 border border-[#DCD6CB] mb-6 shadow-xs">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-[#1A1916]">
                All Systems Operational
              </span>
            </div>

            {/* Social Links with Warm Espresso Hover */}
            <div className="flex items-center gap-2.5">
              <Link
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-9 h-9 rounded-sm bg-white/70 border border-[#DCD6CB] flex items-center justify-center text-[#5A554E] hover:text-white hover:bg-[#1F1E1B] hover:border-[#1F1E1B] transition-all shadow-xs"
              >
                <Facebook size={16} />
              </Link>
              <Link
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
                className="w-9 h-9 rounded-sm bg-white/70 border border-[#DCD6CB] flex items-center justify-center text-[#5A554E] hover:text-white hover:bg-[#1F1E1B] hover:border-[#1F1E1B] transition-all shadow-xs"
              >
                <Twitter size={16} />
              </Link>
              <Link
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-9 h-9 rounded-sm bg-white/70 border border-[#DCD6CB] flex items-center justify-center text-[#5A554E] hover:text-white hover:bg-[#1F1E1B] hover:border-[#1F1E1B] transition-all shadow-xs"
              >
                <Instagram size={16} />
              </Link>
              <Link
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-9 h-9 rounded-sm bg-white/70 border border-[#DCD6CB] flex items-center justify-center text-[#5A554E] hover:text-white hover:bg-[#1F1E1B] hover:border-[#1F1E1B] transition-all shadow-xs"
              >
                <Linkedin size={16} />
              </Link>
            </div>
          </div>

          {/* Column 2: Popular Cities */}
          <div>
            <h3 className="text-xs font-bold text-[#1A1916] tracking-wider uppercase mb-4">
              Prime Hubs
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/city/hyderabad" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold transition-all inline-block font-medium">
                  Hyderabad
                </Link>
              </li>
              <li>
                <Link href="/city/bengaluru" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold transition-all inline-block font-medium">
                  Bengaluru
                </Link>
              </li>
              <li>
                <Link href="/city/pune" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold transition-all inline-block font-medium">
                  Pune
                </Link>
              </li>
              <li>
                <Link href="/city/mumbai" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold transition-all inline-block font-medium">
                  Mumbai
                </Link>
              </li>
              <li>
                <Link href="/city/chennai" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold transition-all inline-block font-medium">
                  Chennai
                </Link>
              </li>
              <li>
                <Link href="/city/delhi" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold transition-all inline-block font-medium">
                  Delhi NCR
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h3 className="text-xs font-bold text-[#1A1916] tracking-wider uppercase mb-4">
              Explore
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/home" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Home</Link></li>
              <li><Link href="/blog" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Blog</Link></li>
              <li><Link href="/contact-us" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Contact</Link></li>
              <li><Link href="/about-us" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">About Us</Link></li>
              <li><Link href="/faqs" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Help &amp; FAQs</Link></li>
              <li><Link href="/refunds" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Refund Policy</Link></li>
              <li><Link href="/PrivacyPolicy" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Privacy Policy</Link></li>
              <li><Link href="/Terms&Conditions" className="text-[#5A554E] hover:text-[#1F1E1B] hover:font-semibold hover:translate-x-1 transition-all inline-block font-medium">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Campus Alerts */}
          <div>
            <h3 className="text-xs font-bold text-[#1A1916] tracking-wider uppercase mb-4">
              Stay Updated
            </h3>
            <p className="text-xs text-[#5A554E] leading-relaxed font-medium mb-4">
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
                  className="w-full bg-white border border-[#DCD6CB] rounded-sm px-3.5 py-2.5 text-xs text-[#1A1916] placeholder-[#8C857B] focus:outline-none focus:border-[#1F1E1B] transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Subscribe"
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#1F1E1B] hover:bg-[#34322D] text-white rounded-sm flex items-center justify-center transition-all active:scale-95 shadow-xs"
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

            <div className="mt-5 p-3 rounded-sm bg-white/60 border border-[#DCD6CB]">
              <p className="text-[11px] text-[#5A554E] leading-relaxed font-medium">
                🔒 We protect your data. Zero spam, unsubscribe anytime.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* 3. Bottom Bar */}
      <div className="border-t border-[#DCD6CB] bg-[#DDD7CC]/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="text-xs text-[#5A554E] font-medium flex items-center gap-1.5 flex-wrap justify-center sm:justify-start">
            <span>© {new Date().getFullYear()} Billion World Pvt. Limited</span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-[#5A554E] font-medium">
              Built with <Heart size={12} className="text-rose-500 fill-rose-500" /> for students across India
            </span>
          </div>

          <div className="flex items-center gap-5 text-xs font-semibold text-[#5A554E]">
            <Link href="/sitemap" className="hover:text-[#1F1E1B] transition-colors">Sitemap</Link>
            <Link href="/accessibility" className="hover:text-[#1F1E1B] transition-colors">Accessibility</Link>
            <button
              type="button"
              onClick={scrollToTop}
              className="inline-flex items-center gap-1 text-[#1F1E1B] hover:text-[#34322D] transition-all font-bold hover:-translate-y-0.5"
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