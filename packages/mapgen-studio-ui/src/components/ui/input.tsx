import * as React from "react";

import { cn } from "../../lib/utils.js";

/**
 * Input — dense inset field. h-7, 11px data type, 4px radius. Sits on the
 * inset `input-background` substrate with the `input` control border; focus
 * draws the luminance contour ring.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      className={cn(
        "flex h-7 w-full rounded-sm border border-input bg-input-background px-2.5 text-data text-foreground transition-colors",
        "file:border-0 file:bg-transparent file:text-data file:font-medium file:text-foreground",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-border-strong focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
