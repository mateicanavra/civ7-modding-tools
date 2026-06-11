import type { ReactNode } from "react";

export type RightDockProps = {
  /** Top offset (px) so the dock clears the floating header. */
  top: number;
  /** Bottom offset (px) so the dock clears the floating footer. */
  bottom: number;
  /** The explore/inspection panel rendered inside the dock. */
  children: ReactNode;
};

/**
 * `RightDock` — the right-anchored floating dock that hosts the explore panel
 * (architecture/10 §4). It owns only the absolute positioning + z-index of the
 * right rail; the panel content is composed in by `StudioShell`. The dock is
 * pinned between the measured header (`top`) and the footer reserve (`bottom`)
 * so the panel inside caps at the working column instead of underlapping the
 * footer on short viewports.
 *
 * `pointer-events-none`: the dock spans header→footer even when its panel is
 * short; the empty remainder must pass map drag/zoom through. The panel restores
 * `pointer-events-auto` on itself.
 */
export function RightDock({ top, bottom, children }: RightDockProps) {
  return (
    <aside
      aria-label="Explore and inspect"
      className="absolute right-4 z-10 flex flex-col items-stretch pointer-events-none"
      style={{ top, bottom }}>
      {children}
    </aside>
  );
}
