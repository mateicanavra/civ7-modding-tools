import { DisclosureHeader } from "mapgen-studio";
import { Compass, Layers, Settings } from "lucide-react";

// DisclosureHeader is the controlled section-header row used across the studio
// panels: a clickable button that toggles a collapsible region, with an optional
// leading icon, a title, a collapsed-only inline summary, optional trailing
// content (count badge / status tag / nested controls), and a rotating chevron.
// Collapse state is owned by the caller (`expanded` + `onToggle`); padding and
// any dense type live at the call site. `Dock` is a preview-only dark panel
// column standing in for the ExplorePanel/RecipePanel dock.
function Dock({ children }) {
  return (
    <div
      className="bg-popover/95 text-foreground border border-border divide-y divide-border-subtle"
      style={{ width: 300, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

// The canonical panel headers: an expanded section (count + chevron pointing up)
// above a collapsed one that shows its current value inline as the summary.
export const PanelHeaders = () => (
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
      summary={<span className="text-data font-mono text-foreground truncate">apply-rainfall</span>}
      trailing={<span className="text-label text-muted-foreground/70">12</span>}
    />
  </Dock>
);

// Chevron-less variant with a trailing status tag (the Recipe/Config headers,
// whose collapse affordance is the whole row + a "Modified" eyebrow).
export const ChevronlessWithTag = () => (
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
);
