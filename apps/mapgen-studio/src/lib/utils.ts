import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge, taught about the project's named type scale. `text-data`
 * (11px) and `text-label` (10px) are custom font-size utilities (defined as
 * `--text-*` theme tokens in index.css). Without registering them in the
 * `font-size` group, twMerge treats them as generic `text-*` classes and lets
 * a later color utility (`text-foreground`) clobber the size. Registering them
 * keeps size and color independent.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [{ text: ["data", "label"] }],
    },
  },
});

/**
 * Merge class names with Tailwind-aware conflict resolution.
 * The canonical shadcn helper: `clsx` resolves conditionals, `twMerge` ensures
 * the last conflicting Tailwind utility wins (e.g. `px-2 px-3` → `px-3`).
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
