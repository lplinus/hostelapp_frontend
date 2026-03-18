import { getFAQs, getFAQCategories } from "@/services/cms.service";
import { FAQsComponent } from "@/components/faqs/faqscomponent";
import { Metadata } from "next";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Frequently Asked Questions | Techsprout Hostels",
    description: "Find answers to all your questions about booking hostels, payments, facilities, and more.",
};

export default async function FAQsPage() {
    try {
        const [faqs, categories] = await Promise.all([
            getFAQs(),
            getFAQCategories()
        ]);

        return (
            <main className="min-h-screen bg-slate-50">
                <FAQsComponent faqs={faqs} categories={categories} />
            </main>
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
