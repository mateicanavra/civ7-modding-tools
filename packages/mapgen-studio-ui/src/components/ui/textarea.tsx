import * as React from "react";

import { cn } from "../../lib/utils.js";

/**
 * Textarea — multi-line sibling of Input. Same inset substrate, control
 * border, 11px data type, and luminance focus ring.
 */
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "flex min-h-16 w-full rounded-sm border border-input bg-input-background px-2.5 py-1.5 text-data text-foreground transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-none focus-visible:border-border-strong focus-visible:ring-1 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
