import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../../lib/utils.js";

/**
 * IconButton — the contour-less icon-only toolbar action (panel headers,
 * toolbars, per-row actions): the dominant interactive idiom of the product's
 * chrome.
 *
 * `active` is a STATE, not a variant: pressed/latched toggles (overrides
 * power, layer visibility, JSON view) light up with the muted fill. Idle
 * chrome is deliberately quieter than Button's ghost variant — muted
 * foreground that lifts to `bg-accent` on hover — so toolbar glyphs never
 * compete with labeled actions. Bordered or filled icon actions are
 * `Button size="icon"`; this component is only the quiet kind. Callers may
 * layer intent color (warning, primary) through `className`.
 */
const iconButtonVariants = cva(
  "h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      active: {
        false: "text-muted-foreground hover:text-foreground hover:bg-accent",
        true: "text-foreground bg-muted",
      },
    },
    defaultVariants: {
      active: false,
    },
  }
);

export interface IconButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof iconButtonVariants> {}

function IconButton({ className, active, type = "button", ...props }: IconButtonProps) {
  return (
    <button type={type} className={cn(iconButtonVariants({ active }), className)} {...props} />
  );
}

export { IconButton, iconButtonVariants };
