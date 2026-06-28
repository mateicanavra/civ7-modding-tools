import React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../utils";
// ============================================================================
// DISCLOSURE HEADER
// ============================================================================
// A fully-controlled, token-driven section-header row: a clickable button that
// toggles an adjacent collapsible region. Renders a left cluster (optional icon
// · title · collapsed-only summary) and a right cluster (optional trailing
// content · rotating chevron). Collapse state is owned by the caller — the
// primitive only reflects `expanded` and reports toggles via `onToggle`.
//
// Every per-instance variation (typography, padding, width, badges, nested
// controls) is expressed through ReactNode slots and `className` escape hatches
// so each consumer reproduces its prior markup verbatim. The `render` hatch
// covers non-`<button>` roots (e.g. a `role="button"` div that hosts
// interactive controls in its trailing zone) while keeping the chevron + ARIA
// wiring identical.
// ============================================================================

/**
 * Props passed to a custom `render` root so it can reproduce the primitive's
 * exact interaction + ARIA contract on a non-`<button>` element. Spread the
 * whole object onto the root element and place `children` inside it.
 */
export interface DisclosureRootRenderProps {
  role?: "button";
  tabIndex?: number;
  "aria-expanded": boolean;
  "aria-controls"?: string;
  "aria-label"?: string;
  title?: string;
  onClick: (event: React.MouseEvent) => void;
  /** Enter/Space → preventDefault + toggle (native `<button>` does this for free). */
  onKeyDown: (event: React.KeyboardEvent) => void;
  className: string;
  children: React.ReactNode;
}

export interface DisclosureHeaderProps {
  /** Drives `aria-expanded` and chevron rotation. Invert at the call site for `*Collapsed*` state. */
  expanded: boolean;
  /** Called with the next expanded value on click / Enter / Space. Omit for static headers. */
  onToggle?: (next: boolean) => void;
  /** Title slot — its own typography lives in the node, not the primitive. */
  title: React.ReactNode;
  /** Leading icon slot; omit for the no-icon (group / sub-header) variant. */
  icon?: React.ReactNode;
  /** Collapsed-only inline summary (rendered when `!expanded`); carries its own color/mono/warning class. */
  summary?: React.ReactNode;
  /** Trailing slot — count badge, status tag, or nested controls (caller owns any `stopPropagation`). */
  trailing?: React.ReactNode;
  /** Show the rotating chevron (default `true`); `false` for chevron-less headers. */
  chevron?: boolean;
  /** Chevron sizing/color; default `"w-3.5 h-3.5 text-muted-foreground/70"`. */
  chevronClassName?: string;
  /** `aria-controls` target id. */
  controls?: string;
  /** Root element id. */
  id?: string;
  /** `aria-label` override. */
  ariaLabel?: string;
  /** Native `title` attribute (hover tooltip string). */
  htmlTitle?: string;
  /**
   * Merged LAST onto the root chrome
   * (`w-full flex items-center justify-between transition-colors hover:bg-accent`).
   * Padding is NOT baked into the default — pass the exact padding per consumer
   * (e.g. `px-3 py-2.5`, `pl-3 pr-2 py-2`, `px-3 pt-2 pb-1`) so there is no
   * tailwind-merge shorthand/longhand collision. Keep dense type utilities
   * (`text-label`/`text-data`) on the slot nodes, never on this row class — the
   * feature-tier `cn` does not register them and would clobber size vs color.
   */
  className?: string;
  /** Override the left cluster classes (default `flex items-center gap-2 min-w-0 overflow-hidden`). */
  leftClassName?: string;
  /** Override the trailing cluster classes (default `flex items-center gap-2 shrink-0`). */
  trailingClassName?: string;
  /** Render a non-`<button>` root; receives {@link DisclosureRootRenderProps}. */
  render?: (props: DisclosureRootRenderProps) => React.ReactElement;
}

// Padding intentionally omitted — it varies per consumer (py-2.5 / py-2 /
// pt-2 pb-1 / pl-3 pr-2). Baking a shorthand here would linger under
// tailwind-merge's directional px↔pl/pr · py↔pt/pb conflict model.
const ROOT_CHROME =
  "w-full flex items-center justify-between transition-colors hover:bg-accent";
const LEFT_CHROME = "flex items-center gap-2 min-w-0 overflow-hidden";
const TRAILING_CHROME = "flex items-center gap-2 shrink-0";
const CHEVRON_DEFAULT = "w-3.5 h-3.5 text-muted-foreground/70";

export function DisclosureHeader({
  expanded,
  onToggle,
  title,
  icon,
  summary,
  trailing,
  chevron = true,
  chevronClassName,
  controls,
  id,
  ariaLabel,
  htmlTitle,
  className,
  leftClassName,
  trailingClassName,
  render,
}: DisclosureHeaderProps) {
  const toggle = () => onToggle?.(!expanded);

  const inner = (
    <>
      <div className={cn(LEFT_CHROME, leftClassName)}>
        {icon}
        {title}
        {!expanded ? summary : null}
      </div>
      <div className={cn(TRAILING_CHROME, trailingClassName)}>
        {trailing}
        {chevron ? (
          <ChevronDown
            aria-hidden
            className={cn(
              chevronClassName ?? CHEVRON_DEFAULT,
              "transition-transform",
              expanded && "rotate-180",
            )}
          />
        ) : null}
      </div>
    </>
  );

  const rootClassName = cn(ROOT_CHROME, className);

  if (render) {
    return render({
      role: "button",
      tabIndex: 0,
      "aria-expanded": expanded,
      "aria-controls": controls,
      "aria-label": ariaLabel,
      title: htmlTitle,
      onClick: toggle,
      onKeyDown: (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          toggle();
        }
      },
      className: rootClassName,
      children: inner,
    });
  }

  return (
    <button
      type="button"
      id={id}
      onClick={toggle}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={ariaLabel}
      title={htmlTitle}
      className={rootClassName}
    >
      {inner}
    </button>
  );
}
