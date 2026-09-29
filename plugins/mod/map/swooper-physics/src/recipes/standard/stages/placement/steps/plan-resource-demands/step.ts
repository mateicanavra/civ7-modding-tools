import { createStep } from "@swooper/mapgen-core/authoring";
import { config } from "./config.js";

/**
 * Derives resource habitat, resolves the canonical resource corpus against current Civ7 legality,
 * and publishes one complete demand ledger without repeating policy in site selection.
 */
export const PlanResourceDemandsStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const topography = deps.artifacts.topography.read();
    const shelf = deps.artifacts.shelf.read();
    const mountains = deps.artifacts.mountains.read();
    const beltDrivers = deps.artifacts.beltDrivers.read();
    const hydrography = deps.artifacts.hydrography.read();
    const lakePlan = deps.artifacts.lakePlan.read();
    const projectedRivers = deps.artifacts.projectedRivers.read();
    const climateIndices = deps.artifacts.climateIndices.read();
    const surfaceTemperature = deps.artifacts.surfaceTemperature.read();
    const cryosphere = deps.artifacts.cryosphere.read();
    const biomeClassification = deps.artifacts.biomeClassification.read();
    const pedology = deps.artifacts.pedology.read();
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
        surfaceTemperature: surfaceTemperature,
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

    const riverMasks = [
      projectedRivers.riverMask,
      projectedRivers.plannedMajorRiverMask,
      projectedRivers.plannedMinorRiverMask,
      currentRiverSurface.riverMask,
      currentRiverSurface.navigableRiverMask,
      currentRiverSurface.minorRiverMask,
    ].filter((mask): mask is Uint8Array => mask !== undefined);
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
        riverMasks,
      },
      stepConfig.demands
    );

    deps.artifacts.resourceDemandPlan.publish(demandPlan);

    const excludedCount =
      demandPlan.candidates.excluded.expectationBlocked.length +
      demandPlan.candidates.excluded.ageDeferred.length +
      demandPlan.candidates.excluded.noLegalSites.length;
    context.trace.event(() => ({
      type: "placement.resources.demands",
      candidateCount: demandPlan.candidates.admitted.length + excludedCount,
      admittedCount: demandPlan.candidates.admitted.length,
      excludedCount,
    }));
  },
});
