import { createOp } from "@swooper/mapgen-core/authoring";
import ApplyAlbedoFeedbackContract from "./contract.js";
import { boundedSnowIceStrategy } from "./strategies/index.js";

const applyAlbedoFeedback = createOp(ApplyAlbedoFeedbackContract, {
  strategies: { "bounded-snow-ice": boundedSnowIceStrategy },
});

export type * from "./contract.js";
export type * from "./types.js";

export default applyAlbedoFeedback;
