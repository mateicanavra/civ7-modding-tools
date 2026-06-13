import { Type, createStage, type TSchema } from "@swooper/mapgen-core/authoring";
import {
  crust,
  crustEvolution,
  mantleForcing,
  mantlePotential,
  mesh,
  plateGraph,
  plateMotion,
  plateTopology,
  projection,
  tectonics,
} from "./steps/index.js";
import {
  FoundationPlateActivityKnobSchema,
  FoundationPlateCountKnobSchema,
} from "@mapgen/domain/foundation/config.js";

function defaultStrategyConfigSchema(
  opConfig: TSchema,
  description: string,
  omitKeys: readonly string[] = []
): TSchema {
  const variants = (opConfig as { anyOf?: unknown[] }).anyOf ?? [];
  const variant = variants.find((candidate) => {
    const strategy = (candidate as { properties?: { strategy?: { const?: unknown } } }).properties
      ?.strategy;
    return strategy?.const === "default";
  }) as { properties?: { config?: TSchema } } | undefined;
  const config = variant?.properties?.config;
  if (!config)
    throw new Error("Foundation public schema expected a default strategy config schema.");
  const publicConfig = omitKeys.length > 0 ? omitObjectProperties(config, omitKeys) : config;
  return Type.Unsafe({
    ...(publicConfig as Record<string, unknown>),
    description,
  });
}

function opConfigSchema(ops: unknown, opKey: string): TSchema {
  const config = (ops as Record<string, { config?: TSchema }> | undefined)?.[opKey]?.config;
  if (!config) throw new Error(`Foundation public schema expected ${opKey} config schema.`);
  return config;
}

function omitObjectProperties(schema: TSchema, keys: readonly string[]): TSchema {
  const raw = schema as Record<string, unknown>;
  const properties = { ...((raw.properties as Record<string, unknown> | undefined) ?? {}) };
  for (const key of keys) delete properties[key];

  const required = Array.isArray(raw.required)
    ? raw.required.filter((key) => typeof key !== "string" || !keys.includes(key))
    : raw.required;

  return Type.Unsafe({
    ...raw,
    properties,
    required,
  });
}

const MeshResolutionSchema = defaultStrategyConfigSchema(
  opConfigSchema(mesh.contract.ops, "computeMesh"),
  "Mesh resolution controls. These fields set generated tectonic mesh density and relaxation behavior for the selected map size; cellCount is derived during compile/runtime normalization and is intentionally not authored.",
  ["cellCount"]
);

const MantleSourcesSchema = defaultStrategyConfigSchema(
  opConfigSchema(mantlePotential.contract.ops, "computeMantlePotential"),
  "Mantle source controls. These fields shape deterministic upwelling/downwelling sources that drive plate forcing and tectonic activity."
);

const MantleForcingSchema = defaultStrategyConfigSchema(
  opConfigSchema(mantleForcing.contract.ops, "computeMantleForcing"),
  "Mantle forcing controls. These fields translate mantle potential into velocity, stress, and upwelling/downwelling signals consumed by plate motion and crust."
);

const LithosphereSchema = defaultStrategyConfigSchema(
  opConfigSchema(crust.contract.ops, "computeCrust"),
  "Lithosphere controls. These fields set basaltic lid strength, mantle coupling, and rift weakening for initial crust truth."
);

const PlatePartitionSchema = defaultStrategyConfigSchema(
  opConfigSchema(plateGraph.contract.ops, "computePlateGraph"),
  "Plate partition controls. These fields determine selected-map-size plate count and polar cap/microplate partition behavior."
);

const PlateMotionSchema = defaultStrategyConfigSchema(
  opConfigSchema(plateMotion.contract.ops, "computePlateMotion"),
  "Plate motion controls. These fields tune plate velocity fitting and diagnostics used by both current plate motion and tectonic history."
);

const TectonicSegmentationSchema = defaultStrategyConfigSchema(
  opConfigSchema(tectonics.contract.ops, "computeTectonicSegments"),
  "Tectonic segmentation controls. These fields classify plate-boundary intensity into convergent, divergent, transform, and inactive regimes."
);

const TectonicErasSchema = defaultStrategyConfigSchema(
  opConfigSchema(tectonics.contract.ops, "computeEraPlateMembership"),
  "Tectonic era controls. These arrays define old-to-new era weights and drift steps for pseudo-evolution history."
);

const TectonicFieldsSchema = defaultStrategyConfigSchema(
  opConfigSchema(tectonics.contract.ops, "computeEraTectonicFields"),
  "Tectonic field controls. These fields set the distance and decay used when spreading boundary influence across mesh cells."
);

const TectonicRollupsSchema = defaultStrategyConfigSchema(
  opConfigSchema(tectonics.contract.ops, "computeTectonicHistoryRollups"),
  "Tectonic rollup controls. These fields determine how per-era activity is summarized into current history scalars."
);

function defaultOp(config: unknown) {
  return {
    strategy: "default" as const,
    config,
  };
}

function maybeDefaultOp(config: unknown): unknown {
  return config === undefined ? undefined : defaultOp(config);
}

function assignIfDefined(target: Record<string, unknown>, key: string, value: unknown): void {
  if (value !== undefined) target[key] = value;
}

function stepOp(opKey: string, config: unknown): Record<string, unknown> | undefined {
  const op = maybeDefaultOp(config);
  return op === undefined ? undefined : { [opKey]: op };
}

export default createStage({
  id: "foundation",
  knobsSchema: Type.Object(
    {
      plateCount: Type.Optional(FoundationPlateCountKnobSchema),
      plateActivity: Type.Optional(FoundationPlateActivityKnobSchema),
    },
    {
      description:
        "Foundation knobs (plateCount/plateActivity). Knobs apply after defaulted step config as deterministic transforms.",
    }
  ),
  public: Type.Object(
    {
      meshResolution: Type.Optional(MeshResolutionSchema),
      mantleSources: Type.Optional(MantleSourcesSchema),
      mantleForcing: Type.Optional(MantleForcingSchema),
      lithosphere: Type.Optional(LithosphereSchema),
      platePartition: Type.Optional(PlatePartitionSchema),
      plateMotion: Type.Optional(PlateMotionSchema),
      tectonicSegmentation: Type.Optional(TectonicSegmentationSchema),
      tectonicEras: Type.Optional(TectonicErasSchema),
      tectonicFields: Type.Optional(TectonicFieldsSchema),
      tectonicRollups: Type.Optional(TectonicRollupsSchema),
    },
    {
      description:
        "Foundation authoring controls for the visible tectonic setup. Public fields are semantic groups that compile into internal step/op configs; projection, topology, and empty maintenance ops remain internal.",
    }
  ),
  steps: [
    mesh,
    mantlePotential,
    mantleForcing,
    crust,
    plateGraph,
    plateMotion,
    tectonics,
    crustEvolution,
    projection,
    plateTopology,
  ],
  compile: ({ config }: { config: Record<string, unknown> }) => {
    const rawSteps: Record<string, unknown> = {
      projection: {},
    };
    assignIfDefined(rawSteps, "mesh", stepOp("computeMesh", config.meshResolution));
    assignIfDefined(
      rawSteps,
      "mantle-potential",
      stepOp("computeMantlePotential", config.mantleSources)
    );
    assignIfDefined(
      rawSteps,
      "mantle-forcing",
      stepOp("computeMantleForcing", config.mantleForcing)
    );
    assignIfDefined(rawSteps, "crust", stepOp("computeCrust", config.lithosphere));
    assignIfDefined(rawSteps, "plate-graph", stepOp("computePlateGraph", config.platePartition));
    assignIfDefined(rawSteps, "plate-motion", stepOp("computePlateMotion", config.plateMotion));

    const tectonicsConfig: Record<string, unknown> = {};
    assignIfDefined(tectonicsConfig, "computePlateMotion", maybeDefaultOp(config.plateMotion));
    assignIfDefined(
      tectonicsConfig,
      "computeTectonicSegments",
      maybeDefaultOp(config.tectonicSegmentation)
    );
    assignIfDefined(
      tectonicsConfig,
      "computeEraPlateMembership",
      maybeDefaultOp(config.tectonicEras)
    );
    assignIfDefined(
      tectonicsConfig,
      "computeEraTectonicFields",
      maybeDefaultOp(config.tectonicFields)
    );
    assignIfDefined(
      tectonicsConfig,
      "computeTectonicHistoryRollups",
      maybeDefaultOp(config.tectonicRollups)
    );
    if (Object.keys(tectonicsConfig).length > 0) rawSteps.tectonics = tectonicsConfig;

    return rawSteps;
  },
} as const);
