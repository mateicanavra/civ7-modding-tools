import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/** Depression-aware priority flooding assigns receivers, basins, sinks, outlets, and terminal types together. */
export default defineStrategy({
  id: "priority-flood",
  config: Type.Object(
    {
      allowExternalEdgeOutlets: Type.Boolean({
        default: false,
        description:
          "Allows north/south map-edge land to drain externally when no lower water outlet exists.",
      }),
    },
    {
      additionalProperties: false,
      description: "Drainage routing parameters (priority-flood strategy).",
    }
  ),
});
