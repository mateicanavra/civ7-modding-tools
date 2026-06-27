import { LeftDock } from "mapgen-studio";

// LeftDock is the left-anchored floating rail that hosts the recipe authoring
// panel. It is `position: absolute` + `pointer-events-none`, so the preview
// frames it in a `relative` map-substrate stage with top/bottom offsets; a
// sample panel (pointer-events-auto) stands in for the composed-in content.
function Stage({ children }) {
  return (
    <div
      className="bg-background"
      style={{ position: "relative", width: 360, height: 300, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

function SamplePanel() {
  return (
    <div
      className="bg-card border border-border pointer-events-auto"
      style={{ width: 200, borderRadius: 8, padding: 12 }}
    >
      <div className="text-label uppercase text-muted-foreground" style={{ marginBottom: 6 }}>
        Recipe
      </div>
      <div className="text-data text-foreground font-mono">mod-swooper-maps/standard</div>
    </div>
  );
}

export const WithPanel = () => (
  <Stage>
    <LeftDock top={12} bottom={12}>
      <SamplePanel />
    </LeftDock>
  </Stage>
);
