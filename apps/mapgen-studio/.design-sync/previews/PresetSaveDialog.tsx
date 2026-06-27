import { PresetSaveDialog } from "mapgen-studio";

// PresetSaveDialog captures the current config as a named preset (label +
// optional description, Save disabled until a label is entered). Rendered open
// with realistic initial values; it portals its own popover surface.
const noop = () => {};

export const SaveConfig = () => (
  <PresetSaveDialog
    open
    initialLabel="Tropical Archipelago"
    initialDescription="High sea level, hotspot island chains"
    onCancel={noop}
    onConfirm={noop}
  />
);
