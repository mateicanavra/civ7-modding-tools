import type { Meta, StoryObj } from "@storybook/react-vite";
import { Compass, Layers, Settings } from "lucide-react";
import type { ReactNode } from "react";
import { DisclosureHeader, type DisclosureHeaderProps } from "@/ui/components/DisclosureHeader";

/**
 * DisclosureHeader is the controlled section-header row used across the studio
 * panels. Adapted from `.design-sync/previews/DisclosureHeader.tsx`; title maps
 * to the design-sync export name for the Stage-2 package→storybook flip.
 */
const meta = {
  title: "composites/DisclosureHeader",
  component: DisclosureHeader,
  // CSF3 requires args once when the component has required props; these stories
  // own their full scene in render, so no per-story args are needed.
  args: {} as unknown as DisclosureHeaderProps,
} satisfies Meta<typeof DisclosureHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

// Preview-only dark panel column standing in for the ExplorePanel/RecipePanel
// dock — not a DS export.
function Dock({ children }: { children: ReactNode }) {
  return (
    <div
      className="bg-popover/95 text-foreground border border-border divide-y divide-border-subtle"
      style={{ width: 300, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

export const PanelHeaders: Story = {
  render: () => (
    <Dock>
      <DisclosureHeader
        className="px-3 py-2.5"
        expanded={true}
        controls="disclosure-stage"
        icon={<Compass className="w-4 h-4 shrink-0 text-muted-foreground" />}
        title={<span className="text-[13px] font-semibold text-foreground">Stage</span>}
        trailing={<span className="text-label text-muted-foreground/70">7</span>}
      />
      <DisclosureHeader
        className="px-3 py-2"
        expanded={false}
        controls="disclosure-step"
        icon={<Layers className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
        title={
          <span className="text-data font-semibold text-muted-foreground uppercase tracking-wider">
            Step
          </span>
        }
        summary={
          <span className="text-data font-mono text-foreground truncate">apply-rainfall</span>
        }
        trailing={<span className="text-label text-muted-foreground/70">12</span>}
      />
    </Dock>
  ),
};

export const ChevronlessWithTag: Story = {
  render: () => (
    <Dock>
      <DisclosureHeader
        className="px-3 py-2.5"
        chevron={false}
        expanded={true}
        controls="disclosure-config"
        icon={<Settings className="w-4 h-4 shrink-0 text-muted-foreground" />}
        title={<span className="text-[13px] font-semibold text-foreground">Config</span>}
        trailing={
          <span className="text-[9px] font-medium uppercase tracking-wider text-primary">
            Modified
          </span>
        }
      />
    </Dock>
  ),
};
