import { PresetErrorDialog } from "mapgen-studio";

// PresetErrorDialog surfaces a failed preset import/save on the token-driven
// shadcn Dialog. Rendered open; it portals its own popover surface, so no Demo
// backdrop is needed (cardMode:single keeps the portal inside the card).
const noop = () => {};

export const ImportFailed = () => (
  <PresetErrorDialog
    open
    title="Couldn’t import preset"
    message="The preset file is missing required recipe fields and can’t be loaded."
    details={[
      "config.layers.climate: required",
      "config.recipe: unknown key ‘placement.discoveries’",
    ]}
    onOpenChange={noop}
  />
);
