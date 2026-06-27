import { OptionSelect } from "mapgen-studio";

// OptionSelect is a thin, token-driven adapter over the Radix Select that keeps
// the studio chrome's simple value/onValueChange/options shape. Rendered CLOSED
// here so each card shows the trigger with its selected label (the open list is
// covered by the Select primitive's own preview). Framed on a dark surface.
const noop = () => {};

const MAP_SIZES = [
  { value: "MAPSIZE_TINY", label: "Tiny" },
  { value: "MAPSIZE_SMALL", label: "Small" },
  { value: "MAPSIZE_STANDARD", label: "Standard" },
  { value: "MAPSIZE_LARGE", label: "Large" },
  { value: "MAPSIZE_HUGE", label: "Huge" },
];

const RESOURCE_MODES = [
  { value: "balanced", label: "Balanced" },
  { value: "strategic", label: "Strategic" },
  { value: "abundant", label: "Abundant" },
];

function Demo({ children }) {
  return (
    <div
      className="bg-background text-foreground"
      style={{ padding: 20, borderRadius: 6, display: "flex", flexDirection: "column", gap: 12 }}
    >
      {children}
    </div>
  );
}

export const MapSize = () => (
  <Demo>
    <OptionSelect
      value="MAPSIZE_STANDARD"
      onValueChange={noop}
      options={MAP_SIZES}
      ariaLabel="Map size"
      className="w-44"
    />
  </Demo>
);

export const ResourceMode = () => (
  <Demo>
    <OptionSelect
      value="strategic"
      onValueChange={noop}
      options={RESOURCE_MODES}
      ariaLabel="Resource distribution"
      className="w-44"
    />
  </Demo>
);

export const Disabled = () => (
  <Demo>
    <OptionSelect
      value="MAPSIZE_STANDARD"
      onValueChange={noop}
      options={MAP_SIZES}
      ariaLabel="Map size"
      className="w-44"
      disabled
    />
  </Demo>
);
