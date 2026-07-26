import { getCiv7StandardMapSizePresetForDimensions } from "@civ7/adapter";
import {
  type OfficialResourceType,
  resolveMapResourceMinimumAmountModifier,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import {
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  resourceExpectationsForGroup,
} from "@mapgen/domain/resources";
import { deriveStepSeed } from "@swooper/mapgen-core";
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";
import { projectResourcePlanViz } from "./viz.js";

/**
 * Derives habitat lanes, resource-family demand, eligibility, and typed site
 * intent on the prepared engine surface before starts or resource stamping.
 */
export const PlanResourcesStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const topography = deps.artifacts.topography.read(context);
    const shelf = deps.artifacts.shelf.read(context);
    const landmasses = deps.artifacts.landmasses.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const beltDrivers = deps.artifacts.beltDrivers.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const projectedNavigableRivers = deps.artifacts.projectedNavigableRivers.read(context);
    const climateIndices = deps.artifacts.climateIndices.read(context);
    const cryosphere = deps.artifacts.cryosphere.read(context);
    const biomeClassification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);
    const regionSlots = deps.artifacts.landmassRegionSlotByTile.read(context);
    const currentRiverSurface = deps.engine.readCurrentRiverSurface(context);
    const currentBiomeTypes = deps.engine.readCurrentMapBiomeTypes(context);
    const currentFeatureTypes = deps.engine.readCurrentMapFeatureTypes(context);
    const currentWaterMask = deps.engine.readCurrentMapWaterMask(context);

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
        surfaceTemperature: climateIndices.surfaceTemperatureC,
        aridityIndex: climateIndices.aridityIndex,
        effectiveMoisture: climateIndices.effectiveMoisture,
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
      stepConfig.habitat
    );
    // --- step 1: family demand/eligibility planners (domain/resources ops) ------------------
    const aquaticInput: Parameters<typeof ops.aquatic>[0] = {
      width,
      height,
      expectations: resourceExpectationsForGroup("aquatic-coastal-navigable-river"),
      coastalWaterMask: habitat.coastalWaterMask,
      shelfMask: habitat.shelfMask,
      warmShallowWaterMask: habitat.warmShallowWaterMask,
      coldProductiveWaterMask: habitat.coldProductiveWaterMask,
      reefOrProtectedShallowsMask: habitat.reefOrProtectedShallowsMask,
      estuaryMask: habitat.estuaryMask,
      navigableRiverMouthMask: habitat.navigableRiverMouthMask,
      lakeMask: habitat.lakeMask,
      iceMask: habitat.iceMask,
    };
    const aquatic = ops.aquatic(aquaticInput, stepConfig.aquatic);

    const cultivatedInput: Parameters<typeof ops.cultivated>[0] = {
      width,
      height,
      expectations: resourceExpectationsForGroup("cultivated-plantation-medicinal"),
      warmAlluvialMask: habitat.warmAlluvialMask,
      floodplainOrRiverMask: habitat.floodplainOrRiverMask,
      warmGrassPlainsMask: habitat.warmGrassPlainsMask,
      oasisOrDesertWaterMask: habitat.oasisOrDesertWaterMask,
      aridDryWoodlandMask: habitat.aridDryWoodlandMask,
      coastalMarineMask: habitat.coastalMarineMask,
      humidTropicalForestMask: habitat.humidTropicalForestMask,
      wetTropicsMask: habitat.wetTropicsMask,
      highlandOrReliefMask: habitat.highlandOrReliefMask,
      temperateDryPlainsMask: habitat.temperateDryPlainsMask,
      savannaForestMask: habitat.savannaForestMask,
      tropicalFruitMask: habitat.tropicalFruitMask,
      wetlandPaddyMask: habitat.wetlandPaddyMask,
      coolTemperatePlainsMask: habitat.coolTemperatePlainsMask,
      coldMask: habitat.coldMask,
      aridWithoutWaterMask: habitat.aridWithoutWaterMask,
      waterloggedMask: habitat.waterloggedMask,
    };
    const cultivated = ops.cultivated(cultivatedInput, stepConfig.cultivated);

    const terrestrialInput: Parameters<typeof ops.terrestrial>[0] = {
      width,
      height,
      expectations: resourceExpectationsForGroup("terrestrial-animal-forest-wild"),
      aridRangelandMask: habitat.aridRangelandMask,
      openGrassPlainsMask: habitat.openGrassPlainsMask,
      tundraColdEdgeMask: habitat.tundraColdEdgeMask,
      hillHighlandMask: habitat.hillHighlandMask,
      savannaWateringHoleMask: habitat.savannaWateringHoleMask,
      tropicalForestEdgeMask: habitat.tropicalForestEdgeMask,
      taigaBorealForestMask: habitat.taigaBorealForestMask,
      moistWoodlandEdgeMask: habitat.moistWoodlandEdgeMask,
      tropicalForestMask: habitat.tropicalForestMask,
      diverseWildHabitatMask: habitat.diverseWildHabitatMask,
      tropicalHighlandMask: habitat.tropicalHighlandMask,
      coldMask: habitat.coldMask,
      aridWithoutWaterMask: habitat.aridWithoutWaterMask,
      denseForestMask: habitat.denseForestMask,
      cultivatedPressureMask: habitat.cultivatedPressureMask,
    };
    const terrestrial = ops.terrestrial(terrestrialInput, stepConfig.terrestrial);

    const geologicalInput: Parameters<typeof ops.geological>[0] = {
      width,
      height,
      expectations: resourceExpectationsForGroup("geological-mineral-gemstone-industrial"),
      orogenyMask: habitat.orogenyMask,
      alluvialPlacerMask: habitat.alluvialPlacerMask,
      tundraDesertHillMask: habitat.tundraDesertHillMask,
      evaporiteBasinMask: habitat.evaporiteBasinMask,
      sedimentaryBasinMask: habitat.sedimentaryBasinMask,
      ultramaficMask: habitat.ultramaficMask,
      weatheringClayFlatMask: habitat.weatheringClayFlatMask,
      carbonateBeltMask: habitat.carbonateBeltMask,
      cratonMask: habitat.cratonMask,
      closedBasinMask: habitat.closedBasinMask,
      aridSoilMask: habitat.aridSoilMask,
      forestWetlandBasinMask: habitat.forestWetlandBasinMask,
      hydrocarbonBasinMask: habitat.hydrocarbonBasinMask,
      wetAlluvialMask: habitat.wetAlluvialMask,
      graniteBeltMask: habitat.graniteBeltMask,
      oilAdjacencyMask: habitat.oilAdjacencyMask,
      metamorphicBeltMask: habitat.metamorphicBeltMask,
      collisionBeltMask: habitat.collisionBeltMask,
      flatNonGeologicMask: habitat.flatNonGeologicMask,
      wetSuppressionMask: habitat.wetSuppressionMask,
      humidSuppressionMask: habitat.humidSuppressionMask,
      offshoreMask: habitat.offshoreMask,
      igneousTerrainMask: habitat.igneousTerrainMask,
    };
    const geological = ops.geological(geologicalInput, stepConfig.geological);
    const groups = ops.groups(
      {
        aquaticPlan: aquatic,
        cultivatedPlan: cultivated,
        terrestrialPlan: terrestrial,
        geologicalPlan: geological,
      },
      stepConfig.groups
    );

    // --- id evidence + policy legality + demand rows --------------------------------------------
    const plannedRows = groups.groups.flatMap((group) => group.plans);
    const requiredForAge: Record<string, boolean | null> = {};
    const observedResourceTypes = new Set<OfficialResourceType>();
    const runtimeIds = resolveResourceRuntimeIds();
    for (const row of plannedRows) {
      if (row.status !== "planned") continue;
      const resourceType = row.resourceType as OfficialResourceType;
      const resolved = runtimeIds.byType.get(resourceType);
      if (!resolved || resolved.minimumPerHemisphere <= 0) continue;
      if (observedResourceTypes.has(resourceType)) continue;
      observedResourceTypes.add(resourceType);
      requiredForAge[resourceType] = deps.engine.isResourceRequiredForAge(
        context,
        resolved.resourceTypeId,
        INITIAL_MAP_RESOURCE_AUTHORING_AGE
      );
    }
    const riverMasks = [
      projectedNavigableRivers.riverMask,
      projectedNavigableRivers.plannedMajorRiverMask,
      projectedNavigableRivers.plannedMinorRiverMask,
      currentRiverSurface.riverMask,
      currentRiverSurface.navigableRiverMask,
      currentRiverSurface.minorRiverMask,
    ].filter((mask): mask is Uint8Array => mask !== undefined);
    const mapSize = getCiv7StandardMapSizePresetForDimensions(width, height);
    const demandResult = ops.demands(
      {
        ...habitat,
        width,
        height,
        plannedRows,
        legalitySurface: {
          biomeType: currentBiomeTypes,
          terrainType: currentRiverSurface.terrainType,
          featureType: currentFeatureTypes,
          engineWaterMask: currentWaterMask,
        },
        requiredForAge,
        riverMasks,
        minimumAmountModifier: mapSize
          ? resolveMapResourceMinimumAmountModifier("DEFAULT", mapSize.id)
          : 0,
      },
      stepConfig.demands
    );

    // --- step 3: site selection (domain/resources op) ----------------------------------------
    const landmassTileCounts = landmasses.landmasses.map((row) => row.tileCount);
    const plan = ops.selectSites(
      {
        width,
        height,
        seed: deriveStepSeed(context.setup.mapSeed, "resources:selectResourceSites"),
        landMask: topography.landMask,
        lakeMask: lakePlan.lakeMask,
        landmassIdByTile: landmasses.landmassIdByTile,
        landmassTileCounts,
        regionSlotByTile: regionSlots.slotByTile,
        minimumAmountModifier: demandResult.minimumAmountModifier,
        demands: demandResult.demands,
      },
      stepConfig.selectSites
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

    context.trace.event(() => ({
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
