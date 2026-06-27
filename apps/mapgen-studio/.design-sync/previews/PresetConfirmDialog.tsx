import { PresetConfirmDialog } from "mapgen-studio";

// PresetConfirmDialog is the destructive-confirm flow (outline Cancel + filled
// confirm action). Rendered open with a real delete prompt; it portals its own
// popover surface.
const noop = () => {};

export const DeletePreset = () => (
  <PresetConfirmDialog
    open
    title="Delete preset?"
    message="‘Tropical Archipelago’ will be permanently removed. This can’t be undone."
    confirmLabel="Delete"
    onCancel={noop}
    onConfirm={noop}
  />
);
