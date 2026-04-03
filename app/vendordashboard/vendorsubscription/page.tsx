import VendorSubscriptionView from "@/components/vendordashboard/vendorsubscription/vendor-subscription-view";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Vendor Subscription | Hostel In",
    description: "Manage your vendor subscription plan",
};

export default function VendorSubscriptionPage() {
    return <VendorSubscriptionView />;
}
