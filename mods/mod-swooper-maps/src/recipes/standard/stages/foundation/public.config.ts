import foundation from "@mapgen/domain/foundation";
import { type Static, type TSchema, Type } from "typebox";

function publicStrategySchema<T extends TSchema>(schema: T, description: string) {
  return Type.With(schema, { description });
}

const MeshResolutionSchema = publicStrategySchema(
  foundation.ops.computeMesh.strategies["jittered-delaunay"],
  "Mesh resolution controls. These fields set the generated tectonic mesh density and relaxation behavior; cellCount is derived inside mesh execution and is not authored."
);

const MantleSourcesSchema = publicStrategySchema(
  foundation.ops.computeMantlePotential.strategies["poisson-source-field"],
  "Mantle source controls. These fields shape deterministic upwelling/downwelling sources that drive plate forcing and tectonic activity."
);

const MantleForcingSchema = publicStrategySchema(
  foundation.ops.computeMantleForcing.strategies["potential-gradient"],
  "Mantle forcing controls. These fields translate mantle potential into velocity, stress, and upwelling/downwelling signals consumed by plate motion and crust."
);

const LithosphereSchema = publicStrategySchema(
  foundation.ops.computeCrust.strategies["basaltic-lid"],
  "Lithosphere controls. These fields set basaltic lid strength, mantle coupling, and rift weakening for initial crust truth."
);

const PlatePartitionSchema = publicStrategySchema(
  foundation.ops.computePlateGraph.strategies["resistance-weighted-voronoi"],
  "Plate partition controls. These fields determine plate seed count scaling and polar cap/microplate partition behavior."
);

const PlateMotionSchema = publicStrategySchema(
  foundation.ops.computePlateMotion.strategies["rigid-body-fit"],
  "Plate motion controls. These fields tune plate velocity fitting and diagnostics used by both current plate motion and tectonic history."
);

const TectonicSegmentationSchema = publicStrategySchema(
  foundation.ops.computeTectonicSegments.strategies["relative-motion-regimes"],
  "Tectonic segmentation controls. These fields classify plate-boundary intensity into convergent, divergent, transform, and inactive regimes."
);

const TectonicErasSchema = publicStrategySchema(
  foundation.ops.computeEraPlateMembership.strategies["backward-drift"],
  "Tectonic era controls. These arrays define old-to-new era weights and drift steps for pseudo-evolution history."
);

const TectonicFieldsSchema = publicStrategySchema(
  foundation.ops.computeEraTectonicFields.strategies["event-distance-decay"],
  "Tectonic field controls. These fields set the distance and decay used when spreading boundary influence across mesh cells."
);

const TectonicRollupsSchema = publicStrategySchema(
  foundation.ops.computeTectonicHistoryRollups.strategies["cumulative-era-rollup"],
  "Tectonic rollup controls. These fields determine how per-era activity is summarized into current history scalars."
);

const CrustCharacterSchema = publicStrategySchema(
  foundation.ops.computeCrustEvolution.strategies["tectonic-differentiation"],
  "Crust character controls. These semantic fields shape continental abundance, freeboard, fragmentation, shelf depth, and abyssal relief."
);

function operationSelection<const Strategy extends string>(
  operation: Readonly<{ defaultStrategy: Strategy }>,
  config: unknown
) {
  return {
    strategy: operation.defaultStrategy,
    config,
  };
}

function maybeOperationSelection<const Strategy extends string>(
  operation: Readonly<{ defaultStrategy: Strategy }>,
  config: unknown
): unknown {
  return config === undefined ? undefined : operationSelection(operation, config);
}

function assignIfDefined(target: Record<string, unknown>, key: string, value: unknown): void {
  if (value !== undefined) target[key] = value;
}

function stepOp(
  opKey: string,
  operation: Readonly<{ defaultStrategy: string }>,
  config: unknown
): Record<string, unknown> | undefined {
  const op = maybeOperationSelection(operation, config);
  return op === undefined ? undefined : { [opKey]: op };
}

/**
 * Public authoring schema for Foundation mesh resolution, mantle sources, and derived forcing.
 * It exposes only stable strategy controls and keeps execution-derived mesh fields out of
 * saved configuration.
 */
export const FoundationMantlePublicSchema = Type.Object(
  {
    meshResolution: MeshResolutionSchema,
    mantleSources: MantleSourcesSchema,
    mantleForcing: MantleForcingSchema,
  },
  {
    additionalProperties: false,
    description:
      "Foundation mantle authoring controls for tectonic mesh resolution, mantle source fields, and mantle forcing.",
  }
);

/** Author-facing initial-crust and plate-partition controls for the Lithosphere stage. */
export const FoundationLithospherePublicSchema = Type.Object(
  {
    lithosphere: LithosphereSchema,
    platePartition: PlatePartitionSchema,
  },
  {
    additionalProperties: false,
    description:
      "Foundation lithosphere authoring controls for initial crust truth and plate partitioning.",
  }
);

/**
 * Author-facing plate-motion, boundary, era-history, field-spread, and rollup controls for the
 * Tectonics stage.
 */
export const FoundationTectonicsPublicSchema = Type.Object(
  {
    plateMotion: PlateMotionSchema,
    tectonicSegmentation: TectonicSegmentationSchema,
    tectonicEras: TectonicErasSchema,
    tectonicFields: TectonicFieldsSchema,
    tectonicRollups: TectonicRollupsSchema,
  },
  {
    additionalProperties: false,
    description:
      "Foundation tectonics authoring controls for plate motion, boundary segmentation, era history, field spread, and rollup summaries.",
  }
);

/** Author-facing final crust-character controls after initial crust and tectonic history merge. */
export const FoundationOrogenyPublicSchema = Type.Object(
  {
    crustCharacter: CrustCharacterSchema,
  },
  {
    additionalProperties: false,
    description:
      "Foundation orogeny authoring controls for final crust character after initial crust and tectonic history are merged.",
  }
);

export type FoundationOrogenyPublicConfig = Static<typeof FoundationOrogenyPublicSchema>;

/** Compiles mantle controls into the fixed mesh, potential, and forcing step envelopes. */
export function compileFoundationMantlePublicConfig(config: Record<string, unknown>) {
  const rawSteps: Record<string, unknown> = {};
  assignIfDefined(
    rawSteps,
    "mesh",
    stepOp("computeMesh", foundation.ops.computeMesh, config.meshResolution)
  );
  assignIfDefined(
    rawSteps,
    "mantle-potential",
    stepOp("computeMantlePotential", foundation.ops.computeMantlePotential, config.mantleSources)
  );
  assignIfDefined(
    rawSteps,
    "mantle-forcing",
    stepOp("computeMantleForcing", foundation.ops.computeMantleForcing, config.mantleForcing)
  );
  return rawSteps;
}

/** Compiles lithosphere controls into initial-crust and plate-graph step envelopes. */
export function compileFoundationLithospherePublicConfig(config: Record<string, unknown>) {
  const rawSteps: Record<string, unknown> = {};
  assignIfDefined(
    rawSteps,
    "crust",
    stepOp("computeCrust", foundation.ops.computeCrust, config.lithosphere)
  );
  assignIfDefined(
    rawSteps,
    "plate-graph",
    stepOp("computePlateGraph", foundation.ops.computePlateGraph, config.platePartition)
  );
  return rawSteps;
}

/**
 * Compiles tectonic controls into the fixed plate-motion and tectonic-history envelopes, omitting
 * controls that the author did not supply.
 */
export function compileFoundationTectonicsPublicConfig(config: Record<string, unknown>) {
  const rawSteps: Record<string, unknown> = {};
  assignIfDefined(
    rawSteps,
    "plate-motion",
    stepOp("computePlateMotion", foundation.ops.computePlateMotion, config.plateMotion)
  );

  const tectonicsConfig: Record<string, unknown> = {};
  assignIfDefined(
    tectonicsConfig,
    "computePlateMotion",
    maybeOperationSelection(foundation.ops.computePlateMotion, config.plateMotion)
  );
  assignIfDefined(
    tectonicsConfig,
    "computeTectonicSegments",
    maybeOperationSelection(foundation.ops.computeTectonicSegments, config.tectonicSegmentation)
  );
  assignIfDefined(
    tectonicsConfig,
    "computeEraPlateMembership",
    maybeOperationSelection(foundation.ops.computeEraPlateMembership, config.tectonicEras)
  );
  assignIfDefined(
    tectonicsConfig,
    "computeEraTectonicFields",
    maybeOperationSelection(foundation.ops.computeEraTectonicFields, config.tectonicFields)
  );
  assignIfDefined(
    tectonicsConfig,
    "computeTectonicHistoryRollups",
    maybeOperationSelection(foundation.ops.computeTectonicHistoryRollups, config.tectonicRollups)
  );
  if (Object.keys(tectonicsConfig).length > 0) rawSteps.tectonics = tectonicsConfig;

  return rawSteps;
}

// Foundation Orogeny is public as semantic crustCharacter config. The raw
// compute-crust-evolution operation envelope is emitted only at this compile
// boundary so Studio and presets never author it directly.
/** Converts semantic crust-character config into the internal crust-evolution operation envelope. */
export function compileFoundationOrogenyPublicConfig(config: FoundationOrogenyPublicConfig) {
  const rawSteps: Record<string, unknown> = {};
  assignIfDefined(
    rawSteps,
    "crust-evolution",
    stepOp("computeCrustEvolution", foundation.ops.computeCrustEvolution, config.crustCharacter)
  );
  return rawSteps;
}
