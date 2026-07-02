import * as LabelPrimitive from "@radix-ui/react-label";
import * as React from "react";

import { cn } from "../../lib/utils.js";

/**
 * Label — the field eyebrow. 11px data type by default; pair with
 * `text-label` for the 10px uppercase eyebrow when a control needs it.
 */
function Label({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>) {
  return (
    <LabelPrimitive.Root
      className={cn(
        "text-data font-medium text-foreground leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Label };
