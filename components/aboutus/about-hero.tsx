"use client";

import { motion } from "framer-motion";

interface AboutHeroProps {
  title?: string;
  subtitle?: string;
}

export default function AboutHero({ title, subtitle }: AboutHeroProps) {
  return (
    <section className="bg-gradient-to-br from-[#312E81] to-[#1E1B4B] text-white py-28 px-6 text-center">
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-4xl md:text-6xl font-bold leading-tight"
      >
        {title || "Building Safe & Trusted Student Living"}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9 }}
        className="mt-6 text-lg md:text-xl max-w-3xl mx-auto text-indigo-100"
      >
        {subtitle ||
          "Hostel In helps students discover verified, affordable, and comfortable hostels near their colleges."}
      </motion.p>
    </section>
  );
}