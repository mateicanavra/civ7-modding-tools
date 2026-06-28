import { EmptyState } from "mapgen-studio";
import { AlertTriangle, Loader2 } from "lucide-react";

// EmptyState is the centered status card — the shared awaiting/loading/error/empty
// surface: an optional icon-in-circle badge over a title slot and message slot on
// a rounded backdrop-blur card. Title/message typography lives in the slotted
// nodes, so a muted-eyebrow variant and a solid-foreground variant coexist with
// no variant props. EmptyState does NOT own the centering layer — the caller
// wraps it in its own fill layer; `Stage` is a preview-only backdrop standing in
// for the deck.gl canvas / DAG area.
function Stage({ children }) {
  return (
    <div className="relative bg-background" style={{ width: 460, height: 220 }}>
      <div className="absolute inset-0 flex items-center justify-center px-4">{children}</div>
    </div>
  );
}

// Loading — icon badge + solid title + lighter message, width-capped.
export const Loading = () => (
  <Stage>
    <EmptyState
      className="max-w-[420px]"
      icon={<Loader2 className="h-5 w-5 animate-spin" />}
      title={<span className="text-data font-medium text-foreground">Loading recipe pipeline</span>}
      message={
        <span className="text-label text-muted-foreground">
          Reading authored artifact contracts for the selected recipe.
        </span>
      }
    />
  </Stage>
);

// Error — alert badge + message.
export const ErrorState = () => (
  <Stage>
    <EmptyState
      className="max-w-[420px]"
      icon={<AlertTriangle className="h-5 w-5" />}
      title={
        <span className="text-data font-medium text-foreground">Recipe pipeline unavailable</span>
      }
      message={
        <span className="text-label text-muted-foreground">
          Studio could not load the dependency graph for this recipe.
        </span>
      }
    />
  </Stage>
);

// Awaiting — no icon, muted uppercase eyebrow title, heavier message (the
// "Awaiting matter" hint on the empty map canvas).
export const Awaiting = () => (
  <Stage>
    <EmptyState
      title={
        <span className="text-label uppercase tracking-[0.2em] text-muted-foreground/70">
          Awaiting matter
        </span>
      }
      message={
        <span className="text-data font-medium text-muted-foreground">
          Click Run to generate a map
        </span>
      }
    />
  </Stage>
);
