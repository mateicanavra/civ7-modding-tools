import { defineStrategy, Type } from "@swooper/mapgen-core/authoring/contracts";

/**
 * Controls whether north and south map edges may act as external drainage outlets. The default
 * keeps those edges closed, so admitted water or an internal sink terminates every land path.
 */
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
      description:
        "Selects whether north and south map edges may terminate drainage; closed edges force land paths toward admitted water or internal sinks.",
    }
  ),
});
