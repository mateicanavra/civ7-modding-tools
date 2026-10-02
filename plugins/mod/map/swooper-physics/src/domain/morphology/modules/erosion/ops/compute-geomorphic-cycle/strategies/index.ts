import strategy from "./stream-power-diffusion/index.js";
import hillslope from "./hillslope-diffusion/index.js";

/** Executable strategies admitted by `morphology/compute-geomorphic-cycle`. */
export default [strategy, hillslope] as const;
