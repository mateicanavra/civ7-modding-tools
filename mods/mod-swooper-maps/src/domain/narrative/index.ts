import { defineDomain } from "@swooper/mapgen-core/authoring/contracts";

import ops from "./ops/contracts.js";

const domain = defineDomain({ id: "narrative", ops } as const);

export { storyTagStrategicCorridors } from "./corridors/index.js";
export { storyTagOrogenyBelts } from "./orogeny/index.js";
export {
  finalizeStoryOverlay,
  getStoryOverlay,
  publishStoryOverlay,
  resetStoryOverlays,
  STORY_OVERLAY_KEYS,
} from "./overlays/index.js";
export type { StoryOverlayKey } from "./overlays/index.js";

export default domain;
