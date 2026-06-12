import { deriveStepSeed } from "@swooper/mapgen-core";
import { createStep, implementArtifacts } from "@swooper/mapgen-core/authoring";
import resourcesDomain from "@mapgen/domain/resources";

import PlanResourcesStepContract from "./contract.js";
import {
  buildResourceDemands,
  expectationsForGroup,
  pickPlannerMasks,
  readResourceLegalitySurface,
} from "./planning.js";
import { placementArtifacts } from "../../artifacts.js";
import {
  validateResourceDemandPlanArtifact,
  validateResourceEligibilityArtifact,
  validateResourcePlanArtifact,
} from "./validate.js";

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
    const demandResult = buildResourceDemands({
      width,
      height,
      plannedRows,
      habitat,
      legalitySurface,
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
  },
});
