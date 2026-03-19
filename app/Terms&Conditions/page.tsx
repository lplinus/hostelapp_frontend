import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, FileText } from "lucide-react";
import SectionReveal from "@/components/ui/section-reveal";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description: "Read our terms and conditions.",
};

async function getTerms() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
  try {
    const res = await fetch(`${baseUrl}/api/cms/terms-and-conditions/`, {
      next: { revalidate: 3600 },
    });
    
    if (!res.ok) {
      return null;
    }
    
    return res.json();
  } catch (error) {
    console.error("Failed to fetch terms:", error);
    return null;
  }
}

export default async function TermsAndConditionsPage() {
  const data = await getTerms();

  if (!data) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <SectionReveal>
          <div className="bg-white p-12 rounded-3xl shadow-xl shadow-slate-200/60 max-w-xl text-center border border-slate-100">
            <div className="w-20 h-20 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold mb-4 text-slate-900">Terms and Conditions</h1>
            <p className="text-slate-500 mb-8 text-lg">The terms and conditions are currently unavailable. Please try again later.</p>
            <Link 
              href="/"
              className="inline-flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Home
            </Link>
          </div>
        </SectionReveal>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50/50 py-12 md:py-24">
      <div className="container mx-auto px-4 max-w-4xl">
        <SectionReveal>
          <Link 
            href="/"
            className="group inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-12 transition-colors font-medium text-lg"
          >
            <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center border border-slate-100 group-hover:bg-slate-900 group-hover:text-white transition-all group-hover:-translate-x-1">
              <ArrowLeft className="w-5 h-5" />
            </div>
            Back to Home
          </Link>

          <article className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
            <div className="h-4 bg-orange-600 w-full" />
            
            <div className="p-8 md:p-16">
              <header className="mb-12">
                <div className="flex items-center gap-3 text-orange-600 font-bold tracking-wider uppercase text-sm mb-4">
                  <FileText className="w-5 h-5" />
                  Service Agreement
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight">
                  {data.title}
                </h1>
                
                {data.effective_date && (
                  <div className="bg-slate-50 inline-block px-4 py-2 rounded-lg border border-slate-100">
                    <p className="text-sm font-semibold text-slate-500">
                      Effective Date: <span className="text-slate-900">{data.effective_date}</span>
                    </p>
                  </div>
                )}
              </header>

              <div 
                className="prose prose-slate max-w-none text-slate-600 space-y-6 whitespace-pre-line leading-relaxed text-lg font-medium/40"
                dangerouslySetInnerHTML={{ __html: data.content }} 
              />

              {(data.email || data.phone) && (
                <div className="mt-16 p-8 md:p-12 bg-slate-50 rounded-3xl border border-slate-100 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100/50 rounded-full -mr-16 -mt-16 blur-3xl transition-all group-hover:bg-orange-200/50" />
                  
                  <h3 className="text-2xl font-bold mb-6 text-slate-900 relative">Need clarification?</h3>
                  <div className="grid md:grid-cols-2 gap-6 relative">
                    {data.email && (
                      <a 
                        href={`mailto:${data.email}`} 
                        className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-500/5 transition-all group/card"
                      >
                        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover/card:bg-orange-600 group-hover/card:text-white transition-all">
                          <Mail className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">Email us at</p>
                          <p className="text-lg font-semibold text-slate-800 break-all">{data.email}</p>
                        </div>
                      </a>
                    )}
                    {data.phone && (
                      <div className="flex items-start gap-4 p-4 rounded-2xl bg-white border border-slate-200">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                          <Phone className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-400 uppercase tracking-tight">Call us at</p>
                          <p className="text-lg font-semibold text-slate-800">{data.phone}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </article>
          
          <div className="mt-12 text-center">
             <p className="text-slate-400 font-medium">© {new Date().getFullYear()} Hostel In. All rights reserved.</p>
          </div>
        </SectionReveal>
      </div>
    </main>
  );
}

