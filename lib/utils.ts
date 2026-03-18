import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function isExternalImage(url: string | null | undefined): boolean {
  if (!url) return false;
  const s = String(url);
  return s.includes("ik.imagekit.io") || (s.startsWith("http") && !s.includes("localhost") && !s.includes("127.0.0.1"));
}

export function toLocalMediaPath(url: string | null | undefined): string | null {
  if (!url) return null;
  const s = String(url);
  // If it's an ImageKit URL, return it as is
  if (s.includes("ik.imagekit.io")) return s;

  try {
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "";
    
    // If it's a full URL
    if (s.startsWith('http')) {
      const parsed = new URL(s);
      
      // If it belongs to our backend, return the path to use the Next.js rewrite
      if (apiBaseUrl && s.startsWith(apiBaseUrl)) {
        return parsed.pathname;
      }

      // Fallback for localhost/development
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return parsed.pathname;
      }
      
      return s;
    }
    
    // If it's already a path (e.g. starting with /media), return as is
    return s;
  } catch {
    return s;
  }
}
