import { cn } from "./utils.js";

/**
 * Shared icon-only button chrome for header toolbars and panel action rows.
 * One definition — RecipePanel, ExplorePanel, ViewControls, and the config
 * form templates all compose this pair, so the idle/active treatment cannot
 * drift apart per surface.
 */
export const iconButton = cn(
  "h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0",
  "text-muted-foreground hover:text-foreground hover:bg-accent"
);

export const iconButtonActive = cn(
  "h-7 w-7 flex items-center justify-center rounded transition-colors shrink-0",
  "text-foreground bg-muted"
);
