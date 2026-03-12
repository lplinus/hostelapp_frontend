import React from "react";
import type { Metadata } from "next";

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
      <main className="container mx-auto px-4 py-20 max-w-4xl text-center">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">Terms and Conditions</h1>
        <p className="text-gray-500">The terms and conditions are currently unavailable. Please try again later.</p>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-16 max-w-4xl">
      <h1 className="text-4xl font-bold mb-4 text-gray-900">{data.title}</h1>
      
      {data.effective_date && (
        <p className="mb-8 text-sm font-medium text-gray-500">
          Effective Date: {data.effective_date}
        </p>
      )}
      
      <div 
        className="prose max-w-none text-gray-700 space-y-4 whitespace-pre-line"
        dangerouslySetInnerHTML={{ __html: data.content }} 
      />

      {(data.email || data.phone) && (
        <div className="mt-12 p-8 bg-gray-50 rounded-xl border border-gray-100">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">Contact Us</h3>
          <div className="space-y-2 text-gray-700">
            {data.email && (
              <p>Email: <a href={`mailto:${data.email}`} className="text-blue-600 hover:underline">{data.email}</a></p>
            )}
            {data.phone && (
              <p>Phone: {data.phone}</p>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
