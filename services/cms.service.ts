import { API_URL } from "@/lib/constants";

export interface StorageSettings {
  max_image_size_mb: number;
}

export const getStorageSettings = async (): Promise<StorageSettings> => {
  try {
    const response = await fetch(`${API_URL}/cms/settings/storage/`);
    if (!response.ok) {
      throw new Error("Failed to fetch storage settings");
    }
    return response.json();
  } catch (error) {
    console.error("Error fetching storage settings:", error);
    // Default fallback
    return { max_image_size_mb: 10 };
  }
};
