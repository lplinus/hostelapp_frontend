import { getFAQs, getFAQCategories } from "@/services/cms.service";
import { FAQsComponent } from "@/components/faqs/faqscomponent";
import { Metadata } from "next";
import { getSEO } from "@/lib/seo";
export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const seo = await getSEO("faqs");

    return {
        title: seo?.meta_title || "Frequently Asked Questions | Hostel In",
        description: seo?.meta_description || "Find answers to all your questions about booking hostels, payments, facilities, and more.",
        keywords: seo?.meta_keywords,
        alternates: {
            canonical: seo?.canonical_url || "https://hostelin.online/faqs",
        },
        robots: {
            index: seo?.is_indexed ?? true,
            follow: true,
        },
        openGraph: {
            title: seo?.og_title || seo?.meta_title || "Frequently Asked Questions | Hostel In",
            description: seo?.og_description || seo?.meta_description,
            images: seo?.og_image ? [seo.og_image] : ["https://hostelin.online/images/og-home.jpg"],
            url: "https://hostelin.online/faqs",
            siteName: "Hostel In",
            type: "website",
        },
        twitter: {
            card: "summary_large_image",
            title: seo?.og_title || seo?.meta_title,
            description: seo?.og_description || seo?.meta_description,
            images: seo?.og_image ? [seo.og_image] : ["https://hostelin.online/images/og-home.jpg"],
        }
    };
}

export default async function FAQsPage() {
    const seo = await getSEO("faqs");
    try {
        const [faqs, categories] = await Promise.all([
            getFAQs(),
            getFAQCategories()
        ]);

        return (
            <>
                {seo?.structured_data && (
                    <script
                        type="application/ld+json"
                        dangerouslySetInnerHTML={{
                            __html: typeof seo.structured_data === 'string'
                                ? seo.structured_data
                                : JSON.stringify(seo.structured_data),
                        }}
                    />
                )}
                <main className="min-h-screen bg-slate-50">
                    <FAQsComponent faqs={faqs} categories={categories} />
                </main>
            </>
        );
    } catch (error) {
        console.error("Error loading FAQs:", error);
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">Oops! Something went wrong</h1>
                    <p className="text-slate-600">We couldn't load the FAQs. Please try again later.</p>
                </div>
            </div>
        );
    }
}
