import { type OfficialResourceType, resolveResourceRuntimeIds } from "@civ7/map-policy";
import { INITIAL_MAP_RESOURCE_AUTHORING_AGE } from "@mapgen/domain/resources";
import { deriveStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { PlanResourcesStepContract } from "./config.js";
import {
  assertHabitatFieldsOutput,
  buildResourceDemands,
  buildRiverResourceExclusionMask,
  expectationsForGroup,
  readResourceLegalitySurface,
} from "./planning.js";
import { projectResourcePlanViz } from "./viz.js";

/**
 * Derives habitat lanes, resource-family demand, eligibility, and typed site
 * intent on the prepared engine surface before starts or resource stamping.
 */
export const PlanResourcesStep = createStep(PlanResourcesStepContract, {
  run: (context, config, ops, deps) => {
    const { width, height } = context.dimensions;
    const topography = deps.artifacts.topography.read(context);
    const shelf = deps.artifacts.shelf.read(context);
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
        coastalWater: shelf.coastalWater,
        shelfWater: shelf.shelfMask,
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
    const plannerHabitat = assertHabitatFieldsOutput(habitat, width * height);

    // --- step 1: family demand/eligibility planners (domain/resources ops) ------------------
    const aquaticInput: Parameters<typeof ops.aquatic>[0] = {
      width,
      height,
      expectations: expectationsForGroup("aquatic-coastal-navigable-river"),
      coastalWaterMask: plannerHabitat.coastalWaterMask,
      shelfMask: plannerHabitat.shelfMask,
      warmShallowWaterMask: plannerHabitat.warmShallowWaterMask,
      coldProductiveWaterMask: plannerHabitat.coldProductiveWaterMask,
      reefOrProtectedShallowsMask: plannerHabitat.reefOrProtectedShallowsMask,
      estuaryMask: plannerHabitat.estuaryMask,
      navigableRiverMouthMask: plannerHabitat.navigableRiverMouthMask,
      lakeMask: plannerHabitat.lakeMask,
      iceMask: plannerHabitat.iceMask,
    };
    const aquatic = ops.aquatic(aquaticInput, config.aquatic);

    const cultivatedInput: Parameters<typeof ops.cultivated>[0] = {
      width,
      height,
      expectations: expectationsForGroup("cultivated-plantation-medicinal"),
      warmAlluvialMask: plannerHabitat.warmAlluvialMask,
      floodplainOrRiverMask: plannerHabitat.floodplainOrRiverMask,
      warmGrassPlainsMask: plannerHabitat.warmGrassPlainsMask,
      oasisOrDesertWaterMask: plannerHabitat.oasisOrDesertWaterMask,
      aridDryWoodlandMask: plannerHabitat.aridDryWoodlandMask,
      coastalMarineMask: plannerHabitat.coastalMarineMask,
      humidTropicalForestMask: plannerHabitat.humidTropicalForestMask,
      wetTropicsMask: plannerHabitat.wetTropicsMask,
      highlandOrReliefMask: plannerHabitat.highlandOrReliefMask,
      temperateDryPlainsMask: plannerHabitat.temperateDryPlainsMask,
      savannaForestMask: plannerHabitat.savannaForestMask,
      tropicalFruitMask: plannerHabitat.tropicalFruitMask,
      wetlandPaddyMask: plannerHabitat.wetlandPaddyMask,
      coolTemperatePlainsMask: plannerHabitat.coolTemperatePlainsMask,
      coldMask: plannerHabitat.coldMask,
      aridWithoutWaterMask: plannerHabitat.aridWithoutWaterMask,
      waterloggedMask: plannerHabitat.waterloggedMask,
    };
    const cultivated = ops.cultivated(cultivatedInput, config.cultivated);

    const terrestrialInput: Parameters<typeof ops.terrestrial>[0] = {
      width,
      height,
      expectations: expectationsForGroup("terrestrial-animal-forest-wild"),
      aridRangelandMask: plannerHabitat.aridRangelandMask,
      openGrassPlainsMask: plannerHabitat.openGrassPlainsMask,
      tundraColdEdgeMask: plannerHabitat.tundraColdEdgeMask,
      hillHighlandMask: plannerHabitat.hillHighlandMask,
      savannaWateringHoleMask: plannerHabitat.savannaWateringHoleMask,
      tropicalForestEdgeMask: plannerHabitat.tropicalForestEdgeMask,
      taigaBorealForestMask: plannerHabitat.taigaBorealForestMask,
      moistWoodlandEdgeMask: plannerHabitat.moistWoodlandEdgeMask,
      tropicalForestMask: plannerHabitat.tropicalForestMask,
      diverseWildHabitatMask: plannerHabitat.diverseWildHabitatMask,
      tropicalHighlandMask: plannerHabitat.tropicalHighlandMask,
      coldMask: plannerHabitat.coldMask,
      aridWithoutWaterMask: plannerHabitat.aridWithoutWaterMask,
      denseForestMask: plannerHabitat.denseForestMask,
      cultivatedPressureMask: plannerHabitat.cultivatedPressureMask,
    };
    const terrestrial = ops.terrestrial(terrestrialInput, config.terrestrial);

    const geologicalInput: Parameters<typeof ops.geological>[0] = {
      width,
      height,
      expectations: expectationsForGroup("geological-mineral-gemstone-industrial"),
      orogenyMask: plannerHabitat.orogenyMask,
      alluvialPlacerMask: plannerHabitat.alluvialPlacerMask,
      tundraDesertHillMask: plannerHabitat.tundraDesertHillMask,
      evaporiteBasinMask: plannerHabitat.evaporiteBasinMask,
      sedimentaryBasinMask: plannerHabitat.sedimentaryBasinMask,
      ultramaficMask: plannerHabitat.ultramaficMask,
      weatheringClayFlatMask: plannerHabitat.weatheringClayFlatMask,
      carbonateBeltMask: plannerHabitat.carbonateBeltMask,
      cratonMask: plannerHabitat.cratonMask,
      closedBasinMask: plannerHabitat.closedBasinMask,
      aridSoilMask: plannerHabitat.aridSoilMask,
      forestWetlandBasinMask: plannerHabitat.forestWetlandBasinMask,
      hydrocarbonBasinMask: plannerHabitat.hydrocarbonBasinMask,
      wetAlluvialMask: plannerHabitat.wetAlluvialMask,
      graniteBeltMask: plannerHabitat.graniteBeltMask,
      oilAdjacencyMask: plannerHabitat.oilAdjacencyMask,
      metamorphicBeltMask: plannerHabitat.metamorphicBeltMask,
      collisionBeltMask: plannerHabitat.collisionBeltMask,
      flatNonGeologicMask: plannerHabitat.flatNonGeologicMask,
      wetSuppressionMask: plannerHabitat.wetSuppressionMask,
      humidSuppressionMask: plannerHabitat.humidSuppressionMask,
      offshoreMask: plannerHabitat.offshoreMask,
      igneousTerrainMask: plannerHabitat.igneousTerrainMask,
    };
    const geological = ops.geological(geologicalInput, config.geological);
    const groups = ops.groups(
      {
        aquaticPlan: aquatic,
        cultivatedPlan: cultivated,
        terrestrialPlan: terrestrial,
        geologicalPlan: geological,
      },
      config.groups
    );

    // --- id evidence + policy legality + demand rows --------------------------------------------
    const legalitySurface = readResourceLegalitySurface(context);
    const plannedRows = groups.groups.flatMap((group) => group.plans);
    const requiredForAgeByResourceType = new Map<OfficialResourceType, boolean | null>();
    const runtimeIds = resolveResourceRuntimeIds();
    for (const row of plannedRows) {
      if (row.status !== "planned") continue;
      const resourceType = row.resourceType as OfficialResourceType;
      const resolved = runtimeIds.byType.get(resourceType);
      if (!resolved || resolved.minimumPerHemisphere <= 0) continue;
      if (requiredForAgeByResourceType.has(resourceType)) continue;
      requiredForAgeByResourceType.set(
        resourceType,
        context.adapter.isResourceRequiredForAge(
          resolved.resourceTypeId,
          INITIAL_MAP_RESOURCE_AUTHORING_AGE
        )
      );
    }
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
      habitat: plannerHabitat,
      legalitySurface,
      requiredForAgeByResourceType,
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

    return {
      intents: plan.intents,
      demands: demandResult.demands,
      summaries: demandResult.summaries,
      habitat,
    };
  },
  viz: ({ result, dimensions }) => projectResourcePlanViz({ ...result, dimensions }),
});
