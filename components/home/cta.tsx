interface CTAProps {
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export default function CTA({ title, subtitle, buttonText }: CTAProps) {
  return (
    <section className="relative py-28 lg:py-40 overflow-hidden bg-[#0F172A] text-white text-center font-inter">
      {/* Background Ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-[#8B5CF6]/10 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6">
        <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8">
          {title || "Ready for Your"}{" "}
          <span className="italic font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#C084FC]">
            Next Chapter?
          </span>
        </h2>

        <p className="text-xl text-gray-400 font-medium max-w-xl mx-auto leading-relaxed mb-12">
          {subtitle || "Join 10,000+ students living their best life in verified spaces. Secure your spot in minutes."}
        </p>

        <button className="group relative inline-flex items-center justify-center gap-3 bg-[#8B5CF6] text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:shadow-[0_20px_50px_rgba(139,92,246,0.5)] hover:bg-[#7C3AED] transition-all hover:-translate-y-1 active:scale-95">
          {buttonText || "Start Exploring"}
          <div className="w-1.5 h-1.5 rounded-full bg-white group-hover:scale-150 transition-transform" />
        </button>
      </div>
    </section>
  );
}