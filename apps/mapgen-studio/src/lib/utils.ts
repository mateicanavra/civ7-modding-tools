import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names with Tailwind-aware conflict resolution.
 * The canonical shadcn helper: `clsx` resolves conditionals, `twMerge` ensures
 * the last conflicting Tailwind utility wins (e.g. `px-2 px-3` → `px-3`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
