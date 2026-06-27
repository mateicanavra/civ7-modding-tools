import { StageViewTabs } from "mapgen-studio";

// StageViewTabs is the stage's own Map/Pipeline view switcher — a segmented pill
// that floats `absolute`, centered, at the stage's top edge. Framed in a
// relative dark Stage surface sized to reveal it, with top: 12 to clear the edge.
const noop = () => {};

function Stage({ children }) {
  return (
    <div
      className="relative bg-background"
      style={{ width: 360, height: 64, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

export const MapActive = () => (
  <Stage>
    <StageViewTabs value="map" onValueChange={noop} top={12} />
  </Stage>
);

export const PipelineActive = () => (
  <Stage>
    <StageViewTabs value="pipeline" onValueChange={noop} top={12} />
  </Stage>
);
