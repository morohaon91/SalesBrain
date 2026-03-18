import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Handles className conflicts and merges properly
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
