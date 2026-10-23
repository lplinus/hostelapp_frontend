"use client";

import { motion } from "framer-motion";

interface PricingHeroProps {
  title?: string;
  subtitle?: string;
}

export default function PricingHero({ title, subtitle }: PricingHeroProps) {
  return (
    <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-28 px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl md:text-6xl font-bold"
      >
        {title || "Simple & Transparent Pricing"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="mt-6 text-lg text-blue-100 max-w-2xl mx-auto"
      >
        {subtitle ||
          "Choose a plan that fits your hostel business or student needs."}
      </motion.p>
    </section>
  );
}