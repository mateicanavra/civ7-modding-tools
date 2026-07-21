import { ChevronDown } from "lucide-react";
import React from "react";
import { cn } from "../../lib/utils.js";
// ============================================================================
// DISCLOSURE HEADER
// ============================================================================
// A fully-controlled, token-driven section-header row: a native `<button>`
// trigger that toggles an adjacent collapsible region. Renders a left cluster
// (optional icon · title · collapsed-only summary) and a right cluster
// (optional trailing content · rotating chevron). Collapse state is owned by
// the caller — the primitive only reflects `expanded` and reports toggles via
// `onToggle`.
//
// The interactivity boundary is structural, not conventional: `trailing` is
// PRESENTATION (counts, tags — it renders inside the trigger button, where
// interactive content would be invalid HTML and unreachable to keyboard/AT);
// `actions` is INTERACTION (icon buttons, menus — it renders as a SIBLING of
// the trigger, so action clicks never bubble through the toggle and each
// control keeps its own tab stop). Per-instance variation (typography,
// padding, badges) is expressed through ReactNode slots and `className`.
// ============================================================================

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
  /**
   * Trailing PRESENTATION slot (count badge, status tag) — renders inside the
   * trigger button, so it must never carry interactive content; interactive
   * controls go in `actions`.
   */
  trailing?: React.ReactNode;
  /**
   * Interactive sibling cluster (icon buttons, menus) — renders OUTSIDE the
   * trigger button in the same row, so clicks stay on the control (no
   * `stopPropagation` needed) and every control is independently
   * keyboard-reachable. When present, the trigger spans the rest of the row.
   */
  actions?: React.ReactNode;
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
}

// Padding intentionally omitted — it varies per consumer (py-2.5 / py-2 /
// pt-2 pb-1 / pl-3 pr-2). Baking a shorthand here would linger under
// tailwind-merge's directional px↔pl/pr · py↔pt/pb conflict model.
const ROOT_CHROME = "w-full flex items-center justify-between transition-colors hover:bg-accent";
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
  actions,
  chevron = true,
  chevronClassName,
  controls,
  id,
  ariaLabel,
  htmlTitle,
  className,
  leftClassName,
  trailingClassName,
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
              expanded && "rotate-180"
            )}
          />
        ) : null}
      </div>
    </>
  );

  const trigger = (props: { className: string }) => (
    <button
      type="button"
      id={id}
      onClick={toggle}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={ariaLabel}
      title={htmlTitle}
      className={props.className}
    >
      {inner}
    </button>
  );

  if (actions) {
    // Row chrome (incl. hover + caller padding) lives on the wrapper so the
    // whole row still reads as one header; the trigger spans everything up to
    // the actions cluster, which sits beside it as real siblings.
    return (
      <div className={cn(ROOT_CHROME, className)}>
        {trigger({
        className:
          "flex flex-1 min-w-0 items-center justify-between text-left cursor-pointer",
        })}
        <div className={TRAILING_CHROME}>{actions}</div>
      </div>
    );
  }

  return trigger({ className: cn(ROOT_CHROME, className) });
}
