import { createDomain } from "@swooper/mapgen-core/authoring";

import domain from "./index.js";
import implementations from "./ops/index.js";

export default createDomain(domain, implementations);

export { ReliefConfigSchema } from "./ops/compute-base-topography/config.js";
export { CoastConfigSchema } from "./ops/compute-coastline-metrics/config.js";
export { GeomorphicCycleConfigSchema } from "./ops/compute-geomorphic-cycle/config.js";
export { LandmaskConfigSchema } from "./ops/compute-landmask/contract.js";
export { ShelfMaskConfigSchema } from "./ops/compute-shelf-mask/contract.js";
export { HypsometryConfigSchema } from "./ops/compute-sea-level/config.js";
export { SubstrateConfigSchema } from "./ops/compute-substrate/contract.js";
export { MountainsConfigSchema, assertSameMountainFamilySelection } from "./ops/mountains-shared/config.js";
export type { MountainsConfig } from "./ops/mountains-shared/config.js";
export { IslandsConfigSchema } from "./ops/plan-island-chains/config.js";
export { VolcanoesConfigSchema } from "./ops/plan-volcanoes/config.js";
