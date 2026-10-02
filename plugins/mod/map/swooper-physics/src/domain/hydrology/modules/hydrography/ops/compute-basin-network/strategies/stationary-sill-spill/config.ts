import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";
/** Parameter-free sill-spill strategy; basin responses depend on drainage geometry and attributed water forcing. */
export default defineStrategy({ id: "stationary-sill-spill", config: Type.Object({}, { additionalProperties: false, description: "Resolves stationary basin pools and actual transfers from drainage geometry and attributed water forcing." }) });
