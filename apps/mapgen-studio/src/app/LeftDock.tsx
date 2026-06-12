import type { ReactNode } from "react";

export type LeftDockProps = {
  /** Top offset (px) so the dock clears the floating header. */
  top: number;
  /** The recipe/config authoring panel rendered inside the dock. */
  children: ReactNode;
};

/**
 * `LeftDock` — the left-anchored floating dock that hosts the recipe authoring
 * panel (architecture/10 §4). It owns only the absolute positioning + z-index of
 * the left rail; the panel content is composed in by `StudioShell`. Extracting the
 * positioning frame from the authoring closure keeps the shell layout declarative
 * without changing the rendered DOM (same `absolute left-4 z-10` placement).
 */
export function LeftDock({ top, children }: LeftDockProps) {
  return (
    <div className="absolute left-4 z-10" style={{ top }}>
      {children}
    </div>
  );
}
