import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Summarizes soil and fertility fields over authored grid cells without changing tile-level evidence.
 * It changes only authored controls; the shared operation remains the sole input and output authority.
 */
export default defineStrategy({
  id: "grid-cell-summary",
  config: Type.Object({
    cellSize: Type.Integer({ minimum: 1, default: 8 }),
  }),
});
