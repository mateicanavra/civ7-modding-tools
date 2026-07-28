import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";
import dischargePercentilesDefinition from "./strategies/discharge-percentiles/config.js";

/** Projects admitted discharge and routing into deterministic minor and major river classes. */
const ProjectRiverNetworkContract = defineOp({
  kind: "compute",
  id: "hydrology/project-river-network",
  /**
   * Projects a routed river-network classification from discharge and the
   * Hydrology drainage graph.
   *
   * This op is Hydrology truth shaping: it converts continuous discharge plus
   * routed receivers into stable minor/major river classes. Major rivers are not
   * isolated threshold-crossing tiles; they must remain coherent trunks routed
   * upstream from major endpoints.
   *
   * Practical guidance:
   * - If you want more rivers overall: lower `minorPercentile` and/or `majorPercentile`.
   * - If you want only the strongest channels: raise percentiles and/or set minimum discharge thresholds.
   */
  input: Type.Object(
    {
      /** Tile grid width. */
      width: Type.Integer({ minimum: 1, description: "Tile grid width (columns)." }),
      /** Tile grid height. */
      height: Type.Integer({ minimum: 1, description: "Tile grid height (rows)." }),
      /** Land mask per tile (1=land, 0=water). */
      landMask: TypedArraySchemas.u8({ description: "Land mask per tile (1=land, 0=water)." }),
      /** Discharge proxy per tile. */
      discharge: TypedArraySchemas.f32({ description: "Discharge proxy per tile." }),
      /** Hydrology-conditioned receiver index per tile (or -1 for typed terminals). */
      flowDir: TypedArraySchemas.i32({
        description: "Hydrology-conditioned receiver index per tile (or -1 for typed terminals).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Land discharge and the Hydrology receiver graph used to select coherent minor and major river trunks.",
    }
  ),
  /**
   * River projection outputs.
   */
  output: Type.Object(
    {
      /** River class per tile (0=none, 1=minor, >=2=major/projectable). */
      riverClass: TypedArraySchemas.u8({
        description: "River class per tile (0=none, 1=minor, >=2=major/projectable).",
      }),
      /** Computed discharge threshold for minor rivers (same units as discharge). */
      minorThreshold: Type.Number({
        description: "Computed discharge threshold for minor rivers (same units as discharge).",
      }),
      /** Computed discharge threshold for major rivers (same units as discharge). */
      majorThreshold: Type.Number({
        description: "Computed discharge threshold for major rivers (same units as discharge).",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Nested river classes and resolved discharge thresholds consumed by hydrographic classification and map projection.",
    }
  ),
  strategies: [dischargePercentilesDefinition],
});

export default ProjectRiverNetworkContract;
