import type { ComponentProps, ReactNode } from "react";
import { cn } from "../../lib/utils.js";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip.js";

export type SegmentedControlItem<Value extends string = string> = Readonly<{
  value: Value;
  label: string;
  children: ReactNode;
  disabled?: boolean;
  title?: string;
  tooltip?: string;
}>;

export type SegmentedControlProps<Value extends string = string> = Omit<
  ComponentProps<"div">,
  "children" | "onChange"
> & {
  "aria-label": string;
  value: Value;
  items: readonly SegmentedControlItem<Value>[];
  onValueChange: (value: Value) => void;
  size?: "icon" | "label";
};

const ITEM_SIZE = {
  icon: "h-6 w-6 justify-center rounded-sm",
  label: "h-7 gap-1.5 rounded-md px-2.5",
} as const;

/**
 * Presents one mutually exclusive option set using the Studio's shared inset-segment treatment.
 *
 * The host owns the selected value. Each option remains a native button with `aria-pressed`;
 * `size` changes only its authored density, not its selection behavior.
 */
export function SegmentedControl<const Value extends string>({
  value,
  items,
  onValueChange,
  size = "label",
  className,
  ...props
}: SegmentedControlProps<Value>) {
  return (
    <div
      role="group"
      className={cn(
        "inline-flex items-center rounded border border-border-subtle bg-input-background p-0.5",
        className
      )}
      {...props}
    >
      {items.map((item) => {
        const button = (
          <button
            key={item.value}
            type="button"
            disabled={item.disabled}
            aria-label={item.label}
            aria-pressed={value === item.value}
            title={item.tooltip ? undefined : (item.title ?? item.label)}
            onClick={() => onValueChange(item.value)}
            className={cn(
              "inline-flex shrink-0 items-center text-data font-medium text-muted-foreground transition-colors hover:text-foreground disabled:pointer-events-none disabled:opacity-50",
              ITEM_SIZE[size],
              value === item.value && "bg-muted text-foreground"
            )}
          >
            {item.children}
          </button>
        );

        return item.tooltip ? (
          <Tooltip key={item.value}>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent>{item.tooltip}</TooltipContent>
          </Tooltip>
        ) : (
          button
        );
      })}
    </div>
  );
}
