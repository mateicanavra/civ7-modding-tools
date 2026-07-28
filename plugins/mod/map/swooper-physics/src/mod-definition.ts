/** Authored identity and Civ7 module metadata for the durable Swooper Maps product. */
export const SWOOPER_MAPS_MOD_DEFINITION = {
  id: "swooper-maps",
  version: 1,
  name: "Swooper's Physics-Based Maps",
  description:
    "Advanced map generation using plate tectonics, climate simulation, and narrative storytelling systems. Features convergent mountain chains, rift valleys, atmospheric pressure systems, and physics-driven coastlines. Replaces random terrain generation with realistic geological processes.",
  authors: ["Matei Canavra"],
  packageKind: "Mod",
  dependencies: [{ id: "base-standard", title: "LOC_MODULE_BASE_STANDARD_NAME" }],
} as const;
