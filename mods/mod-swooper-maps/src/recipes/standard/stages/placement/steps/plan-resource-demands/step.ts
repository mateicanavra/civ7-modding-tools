import { getCiv7StandardMapSizePresetForDimensions } from "@civ7/adapter";
import {
  resolveMapResourceMinimumAmountModifier,
  resolveResourceRuntimeIds,
} from "@civ7/map-policy";
import {
  INITIAL_MAP_RESOURCE_AUTHORING_AGE,
  INITIAL_MAP_RESOURCE_TYPES,
} from "@mapgen/domain/resources";
import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

/**
 * Derives resource habitat, resolves the canonical resource corpus against current Civ7 legality,
 * and publishes one complete demand ledger without repeating policy in site selection.
 */
export const PlanResourceDemandsStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const topography = deps.artifacts.topography.read(context);
    const shelf = deps.artifacts.shelf.read(context);
    const mountains = deps.artifacts.mountains.read(context);
    const beltDrivers = deps.artifacts.beltDrivers.read(context);
    const hydrography = deps.artifacts.hydrography.read(context);
    const lakePlan = deps.artifacts.lakePlan.read(context);
    const projectedNavigableRivers = deps.artifacts.projectedNavigableRivers.read(context);
    const climateIndices = deps.artifacts.climateIndices.read(context);
    const cryosphere = deps.artifacts.cryosphere.read(context);
    const biomeClassification = deps.artifacts.biomeClassification.read(context);
    const pedology = deps.artifacts.pedology.read(context);
    const currentRiverSurface = deps.engine.readCurrentRiverSurface(context);
    const currentBiomeTypes = deps.engine.readCurrentMapBiomeTypes(context);
    const currentFeatureTypes = deps.engine.readCurrentMapFeatureTypes(context);
    const currentWaterMask = deps.engine.readCurrentMapWaterMask(context);

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

    const requiredForAge: Record<string, boolean | null> = {};
    const runtimeIds = resolveResourceRuntimeIds();
    for (const resourceType of INITIAL_MAP_RESOURCE_TYPES) {
      const resolved = runtimeIds.byType.get(resourceType);
      if (!resolved || resolved.minimumPerHemisphere <= 0) continue;
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
    const demandPlan = ops.demands(
      {
        ...habitat,
        width,
        height,
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

    deps.artifacts.resourceDemandPlan.publish(context, demandPlan);

    const excludedCount =
      demandPlan.candidates.excluded.expectationBlocked.length +
      demandPlan.candidates.excluded.ageDeferred.length +
      demandPlan.candidates.excluded.noLegalSites.length;
    context.trace.event(() => ({
      type: "placement.resources.demands",
      candidateCount: demandPlan.candidates.admitted.length + excludedCount,
      admittedCount: demandPlan.candidates.admitted.length,
      excludedCount,
      minimumAmountModifier: demandPlan.minimumAmountModifier,
    }));
  },
});
