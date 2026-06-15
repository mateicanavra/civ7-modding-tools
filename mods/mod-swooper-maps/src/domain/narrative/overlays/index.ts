export {
  STORY_OVERLAY_KEYS,
  type StoryOverlayKey,
} from "@mapgen/domain/narrative/overlays/keys.js";
export {
  finalizeStoryOverlay,
  getStoryOverlay,
  publishStoryOverlay,
  resetStoryOverlays,
} from "@mapgen/domain/narrative/overlays/registry.js";

import { STORY_OVERLAY_KEYS } from "@mapgen/domain/narrative/overlays/keys.js";
import {
  finalizeStoryOverlay,
  getStoryOverlay,
  publishStoryOverlay,
  resetStoryOverlays,
} from "@mapgen/domain/narrative/overlays/registry.js";

export default {
  STORY_OVERLAY_KEYS,
  resetStoryOverlays,
  publishStoryOverlay,
  finalizeStoryOverlay,
  getStoryOverlay,
};
