import React from "react";
import { cn } from "../../lib/utils.js";
// ============================================================================
// EMPTY STATE
// ============================================================================
// A centered status card — the shared "awaiting / loading / error / empty"
// surface. Renders the canonical rounded card shell with an optional
// icon-in-circle badge, a title slot, and a message slot. Title/message
// typography lives in the slotted nodes, so a muted-eyebrow variant and a
// solid-foreground variant coexist without variant props.
//
// EmptyState does NOT own the centering layer: the absolute fill wrapper (and
// any decorative siblings, e.g. a graticule grid, or horizontal padding) differ
// per consumer and stay at the call site. Wrap this in your own
// `absolute inset-0 flex items-center justify-center` layer.
// ============================================================================

export interface EmptyStateProps {
  /** Title slot — eyebrow vs solid typography lives in the node. */
  title: React.ReactNode;
  /** Message slot — its weight/color lives in the node. */
  message?: React.ReactNode;
  /** Icon slot; when present it is wrapped in the `h-9 w-9` rounded badge. Omit for the icon-less variant. */
  icon?: React.ReactNode;
  /** Merged onto the card shell (e.g. `max-w-[420px]` to cap width). */
  className?: string;
}

const CARD_SHELL =
  "flex flex-col items-center gap-3 rounded-xl border border-border/60 bg-popover/40 px-8 py-6 text-center backdrop-blur-sm";
const ICON_BADGE =
  "flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground";

export function EmptyState({ title, message, icon, className }: EmptyStateProps) {
  return (
    <div className={cn(CARD_SHELL, className)}>
      {icon ? <div className={ICON_BADGE}>{icon}</div> : null}
      {title}
      {message}
    </div>
  );
}
