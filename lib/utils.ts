import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toLocalMediaPath(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    // If it's the backend URL, strip it to use the Next.js rewrite
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      return parsed.pathname;
    }
    return url;
  } catch {
    // If it's already a path or invalid URL, return as is
    return url;
  }
}
