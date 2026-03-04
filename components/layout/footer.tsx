import Link from "next/link";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  ShieldCheck,
  Lock,
  GraduationCap,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 lg:py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
        {/* Brand */}
        <div className="flex flex-col items-start">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
              S
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              StayNest
            </span>
          </div>

          <p className="text-gray-500 text-sm leading-relaxed mb-6 max-w-xs">
            Your trusted platform for discovering safe, affordable,
            and verified student hostels across India.
          </p>

          <div className="flex gap-4 text-gray-400">
            <Link href="https://facebook.com" target="_blank" className="hover:text-blue-600 transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-full">
              <Facebook className="w-5 h-5" />
            </Link>
            <Link href="https://twitter.com" target="_blank" className="hover:text-blue-400 transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-full">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="https://instagram.com" target="_blank" className="hover:text-pink-600 transition-colors bg-gray-50 hover:bg-pink-50 p-2 rounded-full">
              <Instagram className="w-5 h-5" />
            </Link>
            <Link href="https://linkedin.com" target="_blank" className="hover:text-blue-700 transition-colors bg-gray-50 hover:bg-blue-50 p-2 rounded-full">
              <Linkedin className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-5 text-sm tracking-wide uppercase">Quick Links</h3>
          <ul className="space-y-3 font-medium text-sm text-gray-500">
            <li><Link href="/" className="hover:text-blue-600 transition-colors">Home</Link></li>
            <li><Link href="/hostels" className="hover:text-blue-600 transition-colors">Hostels</Link></li>
            <li><Link href="/pricing" className="hover:text-blue-600 transition-colors">Pricing</Link></li>
            <li><Link href="/about-us" className="hover:text-blue-600 transition-colors">About Us</Link></li>
            <li><Link href="/contact-us" className="hover:text-blue-600 transition-colors">Contact</Link></li>
            <li><Link href="/blog" className="hover:text-blue-600 transition-colors">Blog</Link></li>
          </ul>
        </div>

        {/* Legal */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-5 text-sm tracking-wide uppercase">Legal</h3>
          <ul className="space-y-3 font-medium text-sm text-gray-500">
            <li><Link href="/privacy-policy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-600 transition-colors">Terms & Conditions</Link></li>
            <li><Link href="/faqs" className="hover:text-blue-600 transition-colors">FAQs</Link></li>
            <li><Link href="/refunds" className="hover:text-blue-600 transition-colors">Refund Policy</Link></li>
          </ul>
        </div>

        {/* Trust & Safety */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-5 text-sm tracking-wide uppercase">Trust & Safety</h3>

          <div className="space-y-3">
            <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3 hover:bg-white hover:shadow-sm transition-all">
              <div className="bg-orange-100 p-2 rounded-lg">
                <Lock className="w-4 h-4 text-orange-600" />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                Secure Platform
              </span>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3 hover:bg-white hover:shadow-sm transition-all">
              <div className="bg-green-100 p-2 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-green-600" />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                Verified Listings
              </span>
            </div>

            <div className="flex items-center gap-3 bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-3 hover:bg-white hover:shadow-sm transition-all">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
              </div>
              <span className="text-sm text-gray-700 font-medium">
                Student Trusted
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-200 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm font-medium text-gray-500 text-center sm:text-left">
            © {new Date().getFullYear()} StayNest. All rights reserved.
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
            <Link href="/sitemap" className="hover:text-gray-900 transition-colors">Sitemap</Link>
            <Link href="/accessibility" className="hover:text-gray-900 transition-colors">Accessibility</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}