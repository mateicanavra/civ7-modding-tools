import type { ReactNode } from "react";

export type RightDockProps = {
  /** Top offset (px) so the dock clears the floating header. */
  top: number;
  /** The explore/inspection panel rendered inside the dock. */
  children: ReactNode;
};

/**
 * `RightDock` — the right-anchored floating dock that hosts the explore panel
 * (architecture/10 §4). It owns only the absolute positioning + z-index of the
 * right rail; the panel content is composed in by `StudioShell`. Extracting the
 * positioning frame keeps the shell layout declarative without changing the
 * rendered DOM (same `absolute right-4 z-10` placement).
 */
export function RightDock({ top, children }: RightDockProps) {
  return (
    <aside aria-label="Explore and inspect" className="absolute right-4 z-10" style={{ top }}>
      {children}
    </aside>
  );
}
