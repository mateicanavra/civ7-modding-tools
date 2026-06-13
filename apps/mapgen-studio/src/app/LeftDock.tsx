import type { ReactNode } from "react";

export type LeftDockProps = {
  /** Top offset (px) so the dock clears the floating header. */
  top: number;
  /** Bottom offset (px) so the dock clears the floating footer. */
  bottom: number;
  /** The recipe/config authoring panel rendered inside the dock. */
  children: ReactNode;
};

/**
 * `LeftDock` — the left-anchored floating dock that hosts the recipe authoring
 * panel (architecture/10 §4). It owns only the absolute positioning + z-index of
 * the left rail; the panel content is composed in by `StudioShell`. The dock is
 * pinned between the measured header (`top`) and the footer reserve (`bottom`)
 * so the panel inside can claim the full working column (`max-h-full`) while
 * still shrinking to fit short content.
 *
 * `pointer-events-none`: the dock spans header→footer even when its panel is
 * short; the empty remainder must pass map drag/zoom through. The panel restores
 * `pointer-events-auto` on itself.
 */
export function LeftDock({ top, bottom, children }: LeftDockProps) {
  return (
    <aside
      aria-label="Recipe and configuration"
      className="absolute left-4 z-10 flex flex-col items-stretch pointer-events-none"
      style={{ top, bottom }}
    >
      {children}
    </aside>
  );
}
