import { defineOp, Type, TypedArraySchemas } from "@swooper/mapgen-core/authoring/contracts";

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
const ProjectRiverNetworkInputSchema = Type.Object(
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
    description: "Inputs for river network projection from discharge (deterministic, data-only).",
  }
);

/**
 * River projection outputs.
 */
const ProjectRiverNetworkOutputSchema = Type.Object(
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
    description: "River projection outputs (class map + computed discharge thresholds).",
  }
);

/**
 * Default river projection parameters.
 */
const ProjectRiverNetworkDefaultStrategySchema = Type.Object(
  {
    /** Discharge percentile used as the minor river threshold (0..1). */
    minorPercentile: Type.Number({
      default: 0.85,
      minimum: 0,
      maximum: 1,
      description: "Discharge percentile used as the minor river threshold (0..1).",
    }),
    /** Discharge percentile used as the major river threshold (0..1). */
    majorPercentile: Type.Number({
      default: 0.95,
      minimum: 0,
      maximum: 1,
      description: "Discharge percentile used as the major river threshold (0..1).",
    }),
    /** Minimum discharge allowed for minor rivers (same units as discharge). */
    minMinorDischarge: Type.Number({
      default: 0,
      minimum: 0,
      maximum: 1e9,
      description: "Minimum discharge allowed for minor rivers (same units as discharge).",
    }),
    /** Minimum discharge allowed for major rivers (same units as discharge). */
    minMajorDischarge: Type.Number({
      default: 0,
      minimum: 0,
      maximum: 1e9,
      description: "Minimum discharge allowed for major rivers (same units as discharge).",
    }),
  },
  {
    additionalProperties: false,
    description: "River network projection parameters (default strategy).",
  }
);

const ProjectRiverNetworkContract = defineOp({
  kind: "compute",
  id: "hydrology/project-river-network",
  input: ProjectRiverNetworkInputSchema,
  output: ProjectRiverNetworkOutputSchema,
  defaultStrategy: "default",
  strategies: {
    default: ProjectRiverNetworkDefaultStrategySchema,
  },
});

export default ProjectRiverNetworkContract;
