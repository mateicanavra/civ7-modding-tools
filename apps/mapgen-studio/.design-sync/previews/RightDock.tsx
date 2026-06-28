import { RightDock } from "mapgen-studio";

// RightDock is the right-anchored floating rail that hosts the explore panel.
// Like LeftDock it is `position: absolute` + `pointer-events-none`, so the
// preview frames it in a `relative` map-substrate stage with top/bottom offsets.
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
        Explore
      </div>
      <div className="text-data text-foreground">Stage · Step · Layers</div>
    </div>
  );
}

export const WithPanel = () => (
  <Stage>
    <RightDock top={12} bottom={12}>
      <SamplePanel />
    </RightDock>
  </Stage>
);
