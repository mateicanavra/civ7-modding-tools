import { AppFooter } from "mapgen-studio";

// AppFooter is the World/Map console — a centered floating bar (size · players ·
// seed · status · run). It positions `absolute bottom-4`, so it's framed in a
// relative dark surface (`Dock`, preview-only) sized like its dock over the map.
const world = { mapSize: "MAPSIZE_STANDARD", playerCount: 6, resources: "balanced" };
const recipe = { recipe: "mod-swooper-maps/standard", preset: "continents", seed: "1474829" };
const noop = () => {};

function Dock({ children }) {
  return (
    <div
      className="relative bg-background"
      style={{ width: 760, height: 80, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

export const Ready = () => (
  <Dock>
    <AppFooter
      status="ready"
      lastRunSettings={recipe}
      lastGlobalSettings={world}
      globalSettings={world}
      currentSettings={recipe}
      onGlobalSettingsChange={noop}
      onSettingsChange={noop}
      onRun={noop}
      onReroll={noop}
      isRunning={false}
      isRunInGameRunning={false}
      isDirty={false}
      autoRunEnabled={false}
      onAutoRunEnabledChange={noop}
    />
  </Dock>
);

export const RunningDirty = () => (
  <Dock>
    <AppFooter
      status="running"
      lastRunSettings={recipe}
      lastGlobalSettings={world}
      globalSettings={world}
      currentSettings={{ ...recipe, seed: "1474830" }}
      onGlobalSettingsChange={noop}
      onSettingsChange={noop}
      onRun={noop}
      onReroll={noop}
      isRunning={true}
      isRunInGameRunning={false}
      isDirty={true}
      autoRunEnabled={true}
      onAutoRunEnabledChange={noop}
    />
  </Dock>
);
