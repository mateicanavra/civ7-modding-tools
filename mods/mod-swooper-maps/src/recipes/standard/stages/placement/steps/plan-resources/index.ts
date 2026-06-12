import { defineVizMeta, deriveStepSeed, type ExtendedMapContext } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import resourcesDomain from "@mapgen/domain/resources";

import PlanResourcesStepContract from "./contract.js";
import {
  buildResourceDemands,
  buildRiverResourceExclusionMask,
  expectationsForGroup,
  pickPlannerMasks,
  readResourceLegalitySurface,
  type ResourceDemandBuildResult,
} from "./planning.js";
import { placementArtifacts } from "../../artifacts.js";
import {
  validateResourceDemandPlanArtifact,
  validateResourceEligibilityArtifact,
  validateResourcePlanArtifact,
} from "./validate.js";
import {
  PLACEMENT_TILE_SPACE_ID,
  PLACEMENT_VIZ_GROUP,
  UNIT_SCORE_VALUE_SPEC,
  buildPlacementPointBuffers,
  placementCategoryColor,
  resourceTypeLabel,
} from "../../viz.js";

export default createStep(PlanResourcesStepContract, {
  artifacts: implementArtifacts(
    [
      placementArtifacts.resourceDemandPlan,
      placementArtifacts.resourcePlan,
      placementArtifacts.resourceEligibility,
    ],
    {
      resourceDemandPlan: {
        validate: (value) => validateResourceDemandPlanArtifact(value),
      },
      resourcePlan: {
        validate: (value) => validateResourcePlanArtifact(value),
      },
      resourceEligibility: {
        validate: (value) => validateResourceEligibilityArtifact(value),
      },
    }
  ),
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const topography = deps.artifacts.topography.read(context);
    const coastlineMetrics = deps.artifacts.coastlineMetrics.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const beltDrivers = deps.artifacts.beltDrivers.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const projectedNavigableRivers = deps.artifacts.projectedNavigableRivers.read(context);
    const engineProjectionRivers = deps.artifacts.engineProjectionRivers.read(context);
    const climateIndices = deps.artifacts.climateIndices.read(context);
    const cryosphere = deps.artifacts.cryosphere.read(context);
    const biomeClassification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);
    const regionSlots = deps.artifacts.landmassRegionSlotByTile.read(context);

    // --- step 2: habitat lane derivation (domain/resources op) ------------------------------
    const habitat = ops.habitat(
      {
        width,
        height,
        landMask: topography.landMask,
        lakeMask: lakePlan.lakeMask,
        coastalWater: coastlineMetrics.coastalWater,
        shelfWater: coastlineMetrics.shelfMask,
        riverClass: hydrography.riverClass,
        surfaceTemperature: biomeClassification.surfaceTemperature,
        aridityIndex: biomeClassification.aridityIndex,
        effectiveMoisture: biomeClassification.effectiveMoisture,
        vegetationDensity: biomeClassification.vegetationDensity,
        fertility: pedology.fertility,
        elevation: topography.elevation,
        hillMask: mountains.hillMask,
        mountainMask: mountains.mountainMask,
        foothillMask: mountains.foothillMask,
        orogenyPotential: mountains.orogenyPotential,
        upliftPotential: beltDrivers.upliftPotential,
        riftPotential: beltDrivers.riftPotential,
        tectonicStress: beltDrivers.tectonicStress,
        collisionPotential: beltDrivers.collisionPotential,
        seaIceCover: cryosphere.seaIceCover,
        freezeIndex: climateIndices.freezeIndex,
      },
      config.habitat
    );

    // --- step 1: family demand/eligibility planners (domain/resources ops) ------------------
    const aquatic = ops.aquatic(
      {
        width,
        height,
        expectations: expectationsForGroup("aquatic-coastal-navigable-river"),
        ...pickPlannerMasks(resourcesDomain.ops.planAquaticResources.input, habitat),
      } as unknown as Parameters<typeof ops.aquatic>[0],
      config.aquatic
    );
    const cultivated = ops.cultivated(
      {
        width,
        height,
        expectations: expectationsForGroup("cultivated-plantation-medicinal"),
        ...pickPlannerMasks(resourcesDomain.ops.planCultivatedResources.input, habitat),
      } as unknown as Parameters<typeof ops.cultivated>[0],
      config.cultivated
    );
    const terrestrial = ops.terrestrial(
      {
        width,
        height,
        expectations: expectationsForGroup("terrestrial-animal-forest-wild"),
        ...pickPlannerMasks(resourcesDomain.ops.planTerrestrialResources.input, habitat),
      } as unknown as Parameters<typeof ops.terrestrial>[0],
      config.terrestrial
    );
    const geological = ops.geological(
      {
        width,
        height,
        expectations: expectationsForGroup("geological-mineral-gemstone-industrial"),
        ...pickPlannerMasks(resourcesDomain.ops.planGeologicalResources.input, habitat),
      } as unknown as Parameters<typeof ops.geological>[0],
      config.geological
    );
    const groups = ops.groups(
      {
        aquaticPlan: aquatic,
        cultivatedPlan: cultivated,
        terrestrialPlan: terrestrial,
        geologicalPlan: geological,
      },
      config.groups
    );

    // --- id proof + policy legality + demand rows --------------------------------------------
    const legalitySurface = readResourceLegalitySurface(context);
    const plannedRows = groups.groups.flatMap((group) => group.plans);
    // Rivers product requirement: no resources on river tiles (planned or
    // engine-projected, navigable water included). Excluded at the legality
    // seam so it flows through site selection, support, and stamping.
    const riverResourceExclusionMask = buildRiverResourceExclusionMask({
      width,
      height,
      projectedNavigableRivers,
      engineProjectionRivers,
    });
    const demandResult = buildResourceDemands({
      width,
      height,
      plannedRows,
      habitat,
      legalitySurface,
      riverResourceExclusionMask,
    });

    // --- step 3: site selection (domain/resources op) ----------------------------------------
    const landmassTileCounts = landmasses.landmasses.map((row) => row.tileCount);
    const plan = ops.selectSites(
      {
        width,
        height,
        seed: deriveStepSeed(context.env.seed, "resources:selectResourceSites"),
        landMask: topography.landMask,
        lakeMask: lakePlan.lakeMask,
        landmassIdByTile: landmasses.landmassIdByTile,
        landmassTileCounts,
        regionSlotByTile: regionSlots.slotByTile,
        minimumAmountModifier: demandResult.minimumAmountModifier,
        demands: demandResult.demands,
      },
      config.selectSites
    );

    const demandPlan = {
      age: demandResult.age,
      runtimeIdResolution: {
        status: "verified" as const,
        checkedCount: demandResult.summaries.length,
      },
      minimumAmountModifier: demandResult.minimumAmountModifier,
      groups,
      demands: demandResult.summaries,
      excluded: demandResult.excluded,
    };

    deps.artifacts.resourceDemandPlan.publish(context, demandPlan);
    deps.artifacts.resourcePlan.publish(context, plan);
    // S5: the post-starts support pass adjusts this plan inside the same
    // policy constraints, so the eligibility fields the plan was selected
    // under are published once here rather than re-derived later.
    deps.artifacts.resourceEligibility.publish(context, {
      width,
      height,
      rows: demandResult.demands.map((row) => ({
        resourceType: row.resourceType,
        resourceTypeId: row.resourceTypeId,
        habitatMask: row.habitatMask,
        legalMask: row.legalMask,
        intensity: row.intensity,
      })),
    });

    context.trace?.event(() => ({
      type: "placement.resources.plan",
      plannedCount: plan.plannedCount,
      rotationCount: plan.rotationCount,
      rangeFloorCount: plan.rangeFloorCount,
      regionMinimumCount: plan.regionMinimumCount,
      demandCount: demandResult.demands.length,
      excludedCount: demandResult.excluded.length,
      minimumAmountModifier: demandResult.minimumAmountModifier,
    }));

    // S7 (E4.2/E4.3): the selected plan, the habitat fields it was thinned
    // by, and the policy eligibility surface it was constrained by.
    emitResourcePlanViz(context, { width, height }, plan.intents, demandResult);
    emitHabitatIntensityViz(context, { width, height }, habitat as unknown as Record<string, unknown>);
  },
});

type ResourcePlanIntentRow = Readonly<{
  plotIndex: number;
  resourceType: string;
  phase: "rotation" | "range-floor" | "region-minimum";
}>;

/**
 * Per-type resource intent points (category = resource type, labels from the
 * policy-table RESOURCE_* identity) plus the aggregate eligibility/legality
 * grids the selection ran under.
 */
function emitResourcePlanViz(
  context: ExtendedMapContext,
  dims: { width: number; height: number },
  intents: ReadonlyArray<ResourcePlanIntentRow>,
  demandResult: ResourceDemandBuildResult
): void {
  if (!context.viz) return;
  const { width, height } = dims;
  const size = Math.max(0, width * height);

  const typeOrder = demandResult.summaries.map((row) => row.resourceType);
  const valueByType = new Map<string, number>();
  for (let i = 0; i < typeOrder.length; i++) valueByType.set(typeOrder[i]!, i + 1);
  const categories = typeOrder.map((resourceType, index) => ({
    value: index + 1,
    label: resourceTypeLabel(resourceType),
    color: placementCategoryColor(index),
  }));

  const rows = intents.map((intent) => ({
    plotIndex: intent.plotIndex,
    value: valueByType.get(intent.resourceType) ?? 0,
  }));
  const { positions, values } = buildPlacementPointBuffers(rows, width);
  context.viz.dumpPoints(context.trace, {
    dataTypeKey: "placement.resources.intents",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    positions,
    values,
    valueFormat: "u16",
    meta: defineVizMeta("placement.resources.intents", {
      label: "Planned Resource Sites",
      group: PLACEMENT_VIZ_GROUP,
      description:
        "Typed per-plot resource intents from site selection, colored by resource type (policy-table identity). Phase provenance (rotation / range-floor / region-minimum) lives in the resourcePlan artifact.",
      palette: "categorical",
      categories,
    }),
  });

  // Aggregate eligibility surfaces: how many planned types could legally use
  // each tile (policy legality), and how many remain after the habitat gate.
  const legalTypeCount = new Uint16Array(size);
  const eligibleTypeCount = new Uint16Array(size);
  for (const demand of demandResult.demands) {
    const legalMask = demand.legalMask;
    const habitatMask = demand.habitatMask;
    for (let i = 0; i < size; i++) {
      if (legalMask[i] !== 0) {
        legalTypeCount[i] += 1;
        if (habitatMask[i] !== 0) eligibleTypeCount[i] += 1;
      }
    }
  }
  context.viz.dumpGrid(context.trace, {
    dataTypeKey: "placement.resources.eligibleTypeCount",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    dims: { width, height },
    format: "u16",
    values: eligibleTypeCount,
    valueSpec: {
      scale: "linear",
      domain: { kind: "explicit", min: 0, max: Math.max(1, demandResult.demands.length) },
      units: "resource types",
    },
    meta: defineVizMeta("placement.resources.eligibleTypeCount", {
      label: "Resource Eligibility (Types per Tile)",
      group: PLACEMENT_VIZ_GROUP,
      description:
        "How many planned resource types pass BOTH the policy legality tables and their habitat lane on each tile — the surface site selection actually chose from.",
      palette: "continuous",
    }),
  });
  context.viz.dumpGrid(context.trace, {
    dataTypeKey: "placement.resources.legalTypeCount",
    spaceId: PLACEMENT_TILE_SPACE_ID,
    dims: { width, height },
    format: "u16",
    values: legalTypeCount,
    valueSpec: {
      scale: "linear",
      domain: { kind: "explicit", min: 0, max: Math.max(1, demandResult.demands.length) },
      units: "resource types",
    },
    meta: defineVizMeta("placement.resources.legalTypeCount", {
      label: "Resource Policy Legality (Types per Tile)",
      group: PLACEMENT_VIZ_GROUP,
      description:
        "How many planned resource types the official Resource_ValidPlacements policy tables allow on each tile, before the habitat gate.",
      palette: "continuous",
      visibility: "debug",
    }),
  });
}

const HABITAT_FAMILY_FIELDS = [
  ["aquatic", "aquaticIntensity"],
  ["cultivated", "cultivatedIntensity"],
  ["terrestrial", "terrestrialIntensity"],
  ["geological", "geologicalIntensity"],
] as const;

/** Habitat intensity per resource family (0..1), the in-lane thinning field. */
function emitHabitatIntensityViz(
  context: ExtendedMapContext,
  dims: { width: number; height: number },
  habitat: Record<string, unknown>
): void {
  if (!context.viz) return;
  const { width, height } = dims;
  const size = Math.max(0, width * height);
  for (const [family, fieldKey] of HABITAT_FAMILY_FIELDS) {
    const values = habitat[fieldKey];
    if (!(values instanceof Float32Array) || values.length !== size) continue;
    const dataTypeKey = `placement.resources.habitat.${family}`;
    context.viz.dumpGrid(context.trace, {
      dataTypeKey,
      spaceId: PLACEMENT_TILE_SPACE_ID,
      dims: { width, height },
      format: "f32",
      values,
      valueSpec: UNIT_SCORE_VALUE_SPEC,
      meta: defineVizMeta(dataTypeKey, {
        label: `Habitat Intensity: ${family[0]!.toUpperCase()}${family.slice(1)}`,
        group: PLACEMENT_VIZ_GROUP,
        description: `Habitat lane intensity (0..1) for the ${family} resource family; site selection thins acceptance by this field inside the lane.`,
        palette: "continuous",
      }),
    });
  }
}
