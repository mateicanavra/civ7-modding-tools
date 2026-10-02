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
   * routed receivers into stable minor/major river classes. Minor discharge
   * selects channel membership; major discharge selects downstream endpoints.
   * Each selected endpoint grows a coherent major reach along its strongest
   * connected upstream minor path. Reach members need not meet the endpoint's
   * major threshold, and other tributaries remain minor without losing their
   * routing or discharge. Wet-body transitions retain their separately owned
   * hydraulic and projection evidence. These model-relative classes do not
   * establish physical channel width or vessel navigability.
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
      discharge: Type.Array(Type.Number({ minimum: 0 }), {
        description: "Map-grid Number-precision discharge on actual adjacent principal edges.",
      }),
      /** Adjacent principal receiver or a typed terminal/component sentinel. */
      flowDir: TypedArraySchemas.i32({
        description:
          "Adjacent principal receiver index, -1 for terminal/marine, or -2 for hydraulic-component internal membership.",
      }),
    },
    {
      additionalProperties: false,
      description:
        "Land discharge and adjacent principal receivers used to select minor channels and coherent major reaches from qualifying endpoints.",
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
      /** Computed discharge threshold for major endpoints, not every reach member. */
      majorThreshold: Type.Number({
        description:
          "Computed discharge threshold for major endpoints (same units as discharge); upstream major reach members may be below it.",
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
