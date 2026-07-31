import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "../../lib/utils.js";

/**
 * Badge — the dense status chip of this instrument panel (drift warnings,
 * autoplay/busy markers, count read-outs). Promoted from a class literal that
 * had been copy-pasted across five surfaces so the vocabulary item has one
 * home and one story.
 *
 * `warning` is the amber-contour alert chip; `neutral` is the quiet filled
 * count chip. Interactive chips (a clickable warning) render a real button
 * via `asChild` and add their own hover treatment — interactivity is the
 * caller's semantics, not a chip variant.
 */
const badgeVariants = cva("rounded px-1.5 py-0.5 text-label", {
  variants: {
    variant: {
      warning: "border border-warning/40 text-warning",
      neutral: "bg-muted/50 text-muted-foreground",
    },
  },
  defaultVariants: {
    variant: "neutral",
  },
});

export interface BadgeProps
  extends React.ComponentProps<"span">,
    VariantProps<typeof badgeVariants> {
  /** Render as the child element (Radix `asChild` slot pattern). */
  asChild?: boolean;
}

function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : "span";
  return <Comp className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
