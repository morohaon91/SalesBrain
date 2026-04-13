import { cn } from "@/lib/utils";

/**
 * Lucide arrow/chevron mirroring for Hebrew. Uses the `flip-rtl` utility so it
 * works even when html[dir] / global CSS selectors do not match (e.g. he-IL).
 */
export function rtlMirrorIcon(isHebrew: boolean, className?: string) {
  return cn(className, isHebrew && "flip-rtl");
}
