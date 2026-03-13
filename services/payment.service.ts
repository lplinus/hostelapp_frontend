import { authApiClient } from "@/lib/api/auth-client";
import { API_ENDPOINTS } from "@/lib/api/endpoints";

export interface Subscription {
    id: number;
    user: number;
    plan: number;
    plan_name: string;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
    transaction_id: string;
    amount_paid: string;
    created_at: string;
    updated_at: string;
}

export interface CreateSubscriptionPayload {
    plan: number;
}

export async function createSubscription(payload: CreateSubscriptionPayload): Promise<Subscription> {
    return authApiClient.post<Subscription>(API_ENDPOINTS.PAYMENTS.SUBSCRIPTIONS, payload);
}

export async function getCurrentSubscription(): Promise<Subscription> {
    return authApiClient.get<Subscription>(API_ENDPOINTS.PAYMENTS.CURRENT_SUBSCRIPTION);
}

export async function getPaymentList(): Promise<any> {
    return authApiClient.get<any>(API_ENDPOINTS.PAYMENTS.LIST);
}
