'use client';

/**
 * Global Error Boundary
 * Catches unhandled errors in server/client components and shows
 * a user-friendly fallback instead of crashing the entire page.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] font-inter px-6">
      <div className="text-center max-w-md">
        <div className="mb-8 w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-10 h-10 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-[#0F172A] mb-4 tracking-tight">
          Something went wrong
        </h2>
        <p className="text-[#64748B] font-medium mb-8 leading-relaxed">
          We encountered an unexpected error. Please try again.
        </p>

        <button
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 bg-[#8B5CF6] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#8B5CF6]/20 hover:bg-[#7C3AED] hover:shadow-xl hover:shadow-[#8B5CF6]/30 transition-all hover:-translate-y-0.5 active:scale-95"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
