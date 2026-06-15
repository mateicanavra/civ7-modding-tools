import hydrology from "@mapgen/domain/hydrology";
import { type TSchema, Type } from "@swooper/mapgen-core/authoring";

type MutableSchemaNode = TSchema & {
  description?: string;
  properties?: Record<string, unknown>;
  items?: unknown;
  anyOf?: unknown[];
  oneOf?: unknown[];
};

const AUTHOR_DESCRIPTION_RE =
  /(impact|controls|sets|determines|affects|used|author|map|gameplay|density|coverage|shape|terrain|biome|river|lake|coast|plate|climate|feature|placement|derived|projection|coordinate)/i;

function sentenceCase(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return `${trimmed[0]!.toLowerCase()}${trimmed.slice(1)}`;
}

function labelFromKey(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .toLowerCase();
}

function authorDescription(existing: unknown, label: string): string {
  const text = typeof existing === "string" ? existing.trim() : "";
  const cleaned = text
    .replace(/\binternally\b/gi, "during deterministic computation")
    .replace(/\binternal\b/gi, "pipeline")
    .replace(/\s*\((?:basic|cardinal|default|latitude|refine|vector) strategy\)/gi, "")
    .replace(
      /\b(?:basic|cardinal|default|latitude|refine|vector) strategy\b/gi,
      "deterministic control set"
    )
    .replace(/\bstrategy\b/gi, "control mode")
    .replace(/\beach step\b/gi, "each iteration");
  if (!cleaned) return `Controls ${label} for Hydrology map generation.`;
  if (AUTHOR_DESCRIPTION_RE.test(cleaned)) return cleaned;
  if (/^scales\b/i.test(cleaned)) {
    return `Controls ${sentenceCase(cleaned.replace(/^scales\b/i, "scaling"))}`;
  }
  return `Controls ${sentenceCase(cleaned)}`;
}

function withAuthoringDescriptions<T extends TSchema>(schema: T, label: string): T {
  const node = schema as MutableSchemaNode;
  const clone = { ...schema } as MutableSchemaNode;
  clone.description = authorDescription(node.description, label);

  if (node.properties) {
    clone.properties = Object.fromEntries(
      Object.entries(node.properties).map(([key, child]) => [
        key,
        withAuthoringDescriptions(child as TSchema, `${label} ${labelFromKey(key)}`),
      ])
    );
  }
  if (node.items) {
    clone.items = withAuthoringDescriptions(node.items as TSchema, `${label} item`);
  }
  if (node.anyOf) {
    clone.anyOf = node.anyOf.map((variant) => withAuthoringDescriptions(variant as TSchema, label));
  }
  if (node.oneOf) {
    clone.oneOf = node.oneOf.map((variant) => withAuthoringDescriptions(variant as TSchema, label));
  }

  return clone as T;
}

function optionalAuthorSchema<T extends TSchema>(schema: T, label: string) {
  return Type.Optional(withAuthoringDescriptions(schema, label));
}

const baselineOps = hydrology.ops;

export const HydrologySeasonalCycleSchema = Type.Object(
  {
    modeCount: Type.Optional(
      Type.Union([Type.Literal(2), Type.Literal(4)], {
        default: 2,
        description:
          "Controls seasonal climate samples used to compute annual means and amplitude fields.",
      })
    ),
    axialTiltDeg: Type.Optional(
      Type.Number({
        default: 18,
        minimum: 0,
        maximum: 45,
        description:
          "Controls axial tilt in degrees for seasonal climate forcing; 0 disables seasonal amplitudes.",
      })
    ),
  },
  {
    additionalProperties: false,
    description: "Seasonal-cycle controls for annual climate means and amplitude fields.",
  }
);

export const HydrologyClimateBaselinePublicSchema = Type.Object(
  {
    seasonalCycle: Type.Optional(HydrologySeasonalCycleSchema),
    solarForcing: optionalAuthorSchema(
      baselineOps.computeRadiativeForcing.strategies.default,
      "baseline solar forcing"
    ),
    thermalState: optionalAuthorSchema(
      baselineOps.computeThermalState.strategies.default,
      "baseline thermal state"
    ),
    atmosphericCirculation: optionalAuthorSchema(
      baselineOps.computeAtmosphericCirculation.strategies.default,
      "baseline atmospheric circulation"
    ),
    oceanCurrents: optionalAuthorSchema(
      baselineOps.computeOceanSurfaceCurrents.strategies.default,
      "baseline ocean currents"
    ),
    oceanGeometry: optionalAuthorSchema(
      baselineOps.computeOceanGeometry.strategies.default,
      "baseline ocean geometry"
    ),
    oceanThermalState: optionalAuthorSchema(
      baselineOps.computeOceanThermalState.strategies.default,
      "baseline ocean thermal state"
    ),
    evaporation: optionalAuthorSchema(
      baselineOps.computeEvaporationSources.strategies.default,
      "baseline evaporation sources"
    ),
    moistureTransport: optionalAuthorSchema(
      baselineOps.transportMoisture.strategies.default,
      "baseline moisture transport"
    ),
    precipitation: optionalAuthorSchema(
      baselineOps.computePrecipitation.strategies.default,
      "baseline precipitation"
    ),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology baseline climate controls for solar forcing, temperature, wind, ocean coupling, evaporation, moisture transport, and precipitation.",
  }
);

export const HydrologyHydrographyPublicSchema = Type.Object(
  {
    drainageRouting: optionalAuthorSchema(
      baselineOps.computeDrainageRouting.strategies.default,
      "hydrography drainage routing"
    ),
    runoff: optionalAuthorSchema(
      baselineOps.accumulateDischarge.strategies.default,
      "hydrography runoff"
    ),
    riverNetwork: optionalAuthorSchema(
      baselineOps.projectRiverNetwork.strategies.default,
      "hydrography river network"
    ),
    lakes: optionalAuthorSchema(baselineOps.planLakes.strategies.default, "hydrography lakes"),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology hydrography controls for runoff, river classification, and deterministic lake intent.",
  }
);

export const HydrologyClimateRefinePublicSchema = Type.Object(
  {
    precipitationRefinement: optionalAuthorSchema(
      baselineOps.computePrecipitation.strategies.refine,
      "climate refinement precipitation"
    ),
    solarForcing: optionalAuthorSchema(
      baselineOps.computeRadiativeForcing.strategies.default,
      "climate refinement solar forcing"
    ),
    thermalState: optionalAuthorSchema(
      baselineOps.computeThermalState.strategies.default,
      "climate refinement thermal state"
    ),
    albedoFeedback: optionalAuthorSchema(
      baselineOps.applyAlbedoFeedback.strategies.default,
      "climate refinement albedo feedback"
    ),
    cryosphereState: optionalAuthorSchema(
      baselineOps.computeCryosphereState.strategies.default,
      "climate refinement cryosphere state"
    ),
    landWaterBudget: optionalAuthorSchema(
      baselineOps.computeLandWaterBudget.strategies.default,
      "climate refinement land water budget"
    ),
    diagnostics: optionalAuthorSchema(
      baselineOps.computeClimateDiagnostics.strategies.default,
      "climate refinement diagnostics"
    ),
  },
  {
    additionalProperties: false,
    description:
      "Hydrology climate refinement controls for local precipitation, temperature feedback, cryosphere, water budget, and diagnostics.",
  }
);
