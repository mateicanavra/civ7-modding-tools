import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState, type EmptyStateProps } from "@swooper/mapgen-studio-ui";
import { AlertTriangle, Loader2 } from "lucide-react";
import type { ReactNode } from "react";

/**
 * EmptyState is the centered status card — the shared awaiting/loading/error/
 * empty surface. Adapted from `.design-sync/previews/EmptyState.tsx`; title maps
 * to the design-sync export name for the Stage-2 package→storybook flip.
 */
const meta = {
  title: "composites/EmptyState",
  component: EmptyState,
  // CSF3 requires args once when the component has required props; these stories
  // own their full scene in render, so no per-story args are needed.
  args: {} as unknown as EmptyStateProps,
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only backdrop standing in for the deck.gl canvas / DAG area; EmptyState
// does not own the centering layer, so the caller wraps it in its own fill layer.
function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="relative bg-background" style={{ width: 460, height: 220 }}>
      <div className="absolute inset-0 flex items-center justify-center px-4">{children}</div>
    </div>
  );
}

export const Loading: Story = {
  render: () => (
    <Stage>
      <EmptyState
        className="max-w-[420px]"
        icon={<Loader2 className="h-5 w-5 animate-spin" />}
        title={
          <span className="text-data font-medium text-foreground">Loading recipe pipeline</span>
        }
        message={
          <span className="text-label text-muted-foreground">
            Reading authored artifact contracts for the selected recipe.
          </span>
        }
      />
    </Stage>
  ),
};

export const ErrorState: Story = {
  render: () => (
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
  ),
};

export const Awaiting: Story = {
  render: () => (
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
  ),
};
