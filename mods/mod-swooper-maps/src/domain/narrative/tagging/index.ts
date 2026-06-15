/**
 * Story Tagging — Minimal narrative parity for M2 stable slice.
 *
 * Ports a conservative subset of legacy JS story/tagging.js:
 * - Continental margins (active/passive shelves) with overlay publication
 * - Hotspot trail polylines
 * - Rift valleys (lines + shoulders)
 */

export { storyTagHotspotTrails } from "@mapgen/domain/narrative/tagging/hotspots.js";
export { storyTagContinentalMargins } from "@mapgen/domain/narrative/tagging/margins.js";
export { storyTagRiftValleys } from "@mapgen/domain/narrative/tagging/rifts.js";
export type {
  ContinentalMarginsOptions,
  HotspotTrailsSummary,
  RiftValleysSummary,
} from "@mapgen/domain/narrative/tagging/types.js";

import { storyTagHotspotTrails } from "@mapgen/domain/narrative/tagging/hotspots.js";
import { storyTagContinentalMargins } from "@mapgen/domain/narrative/tagging/margins.js";
import { storyTagRiftValleys } from "@mapgen/domain/narrative/tagging/rifts.js";

export default {
  storyTagContinentalMargins,
  storyTagHotspotTrails,
  storyTagRiftValleys,
};
