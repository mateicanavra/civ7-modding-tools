import { TooltipProvider, ViewControls } from "mapgen-studio";

// ViewControls is the floating map toolbar: a theme-cycle button (auto/light/
// dark icon) + a grid-visibility toggle, separated by a hairline divider, on the
// popover tier over the map. Framed on a dark surface; stories vary the theme
// icon and the grid toggle's active (lifted) vs resting state.
//
// The buttons carry shadcn Tooltips, which require a TooltipProvider ancestor
// (the real shell mounts one once at the app root). Without it Radix throws and
// the component renders nothing, so the Demo wrapper supplies the provider.
const noop = () => {};

function Demo({ children }) {
  return (
    <TooltipProvider>
      <div
        className="bg-background text-foreground"
        style={{ padding: 20, borderRadius: 6, display: "flex", flexDirection: "column", gap: 12 }}
      >
        {children}
      </div>
    </TooltipProvider>
  );
}

export const GridOn = () => (
  <Demo>
    <ViewControls
      themePreference="dark"
      onThemeCycle={noop}
      showGrid={true}
      onShowGridChange={noop}
    />
  </Demo>
);

export const GridOff = () => (
  <Demo>
    <ViewControls
      themePreference="system"
      onThemeCycle={noop}
      showGrid={false}
      onShowGridChange={noop}
    />
  </Demo>
);
