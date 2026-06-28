import { AppHeader, TooltipProvider } from "mapgen-studio";

// AppHeader is the top chrome bar: AppBrand (left), the Game bar (config
// selector + setup gear), and the view controls (theme/grid) on the right.
// It positions `absolute top-4`, so it's framed in a relative dark surface;
// cardMode:column gives it full width.
const noop = () => {};
const savedConfigOptions = [
  { value: "continents-std", label: "Continents — Standard" },
  { value: "archipelago", label: "Archipelago" },
  { value: "pangaea", label: "Pangaea" },
];
const setupConfig = {
  playerOptions: [],
  savedConfig: { id: "continents-std", displayName: "Continents — Standard" },
};
const setupOptions = {
  savedConfigOptions,
  leaderOptions: [],
  civilizationOptions: [],
  difficultyOptions: [],
  gameSpeedOptions: [],
};

function Bar({ children }) {
  return (
    <div
      className="relative bg-background"
      style={{ width: 920, height: 72, borderRadius: 8, overflow: "hidden" }}
    >
      <TooltipProvider>{children}</TooltipProvider>
    </div>
  );
}

export const Default = () => (
  <Bar>
    <AppHeader
      themePreference="dark"
      onThemeCycle={noop}
      showGrid={true}
      onShowGridChange={noop}
      setupConfig={setupConfig}
      setupOptions={setupOptions}
      onSetupConfigChange={noop}
      onSavedConfigChange={noop}
      savedConfigModified={false}
    />
  </Bar>
);

export const ModifiedConfig = () => (
  <Bar>
    <AppHeader
      themePreference="dark"
      onThemeCycle={noop}
      showGrid={false}
      onShowGridChange={noop}
      setupConfig={setupConfig}
      setupOptions={setupOptions}
      onSetupConfigChange={noop}
      onSavedConfigChange={noop}
      savedConfigModified={true}
    />
  </Bar>
);
