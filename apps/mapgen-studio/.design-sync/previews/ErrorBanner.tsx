import { ErrorBanner } from "mapgen-studio";

// ErrorBanner is the centered destructive alert (role=alert) that appears only
// when a message is present — it returns null otherwise, so the single story
// passes a real message. It is absolutely positioned, so the preview frames it
// in a `relative` map-substrate stage.
function Stage({ children }) {
  return (
    <div
      className="bg-background"
      style={{ position: "relative", width: 480, height: 120, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

export const GenerationFailed = () => (
  <Stage>
    <ErrorBanner
      top={16}
      message="Map generation failed: recipe ‘mod-swooper-maps/standard’ produced no land tiles at seed 1474829."
    />
  </Stage>
);
