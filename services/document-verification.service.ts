import { authApiClient } from "@/lib/api/auth-client";
import type { DocumentVerificationData, VerificationDocumentItem } from "@/types/document-verification.types";

export const getMyDocuments = async (): Promise<DocumentVerificationData> => {
    return authApiClient.get<DocumentVerificationData>("/api/accounts/my-documents/");
};

export const uploadVerificationDocument = async (
    formData: FormData
): Promise<{ message: string; document: VerificationDocumentItem; verification: DocumentVerificationData }> => {
    return authApiClient.post("/api/accounts/my-documents/upload/", formData);
};

export const deleteVerificationDocument = async (
    documentId: number
): Promise<{ message: string; verification: DocumentVerificationData }> => {
    return authApiClient.delete(`/api/accounts/my-documents/${documentId}/`);
};
