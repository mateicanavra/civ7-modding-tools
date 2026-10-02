import { createStep } from "@swooper/mapgen-core/authoring";
import { artifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { measureStandardRiverNetwork } from "../../../../../metrics/families/hydrology/river-network.js";
import { projectNetworkViz } from "./viz.js";
import { config } from "./config.js";

/** Complete the physical computation before publishing its mutually consistent products. */
export const NetworkStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const topography = deps.artifacts.topography.read();
    const climate = deps.artifacts.baselineClimateField.read();
    const dimensions = { width, height };
    const ground = Array.from(topography.elevation);
    const physical = (() => {
      const { runoff } = ops.computeLocalRunoff(
        {
          ...dimensions,
          externalWaterMask: topography.externalWaterMask,
          rainfall: climate.rainfall,
          humidity: climate.humidity,
        },
        stepConfig.computeLocalRunoff
      );
      const geometry = ops.computeDrainageBasins(
        {
          ...dimensions,
          elevation: ground,
          externalWaterMask: topography.externalWaterMask,
          externalWaterHead: topography.seaLevel,
        },
        stepConfig.computeDrainageBasins
      );
      const result = ops.computeBasinNetwork(
        {
          ...dimensions,
          elevation: ground,
          externalWaterMask: topography.externalWaterMask,
          externalWaterHead: topography.seaLevel,
          geometry,
          localRunoff: runoff,
          rainfall: climate.rainfall,
          potentialDemand: climate.potentialDemand,
        },
        stepConfig.computeBasinNetwork
      );
      if (result.status !== "supported")
        throw new Error(
          `[Hydrology] No stationary certified-sill-spill network: ${JSON.stringify(result.witness)}`,
          { cause: result.witness }
        );
      const plan = result.plan;
      const projected = ops.projectRiverNetwork(
        {
          ...dimensions,
          landMask: plan.exposedLandMask,
          discharge: plan.dryDischarge,
          flowDir: plan.receiver,
        },
        stepConfig.projectRiverNetwork
      );
      const metadata = ops.classifyBasinRiverNetwork(
        {
          ...dimensions,
          externalWaterMask: topography.externalWaterMask,
          elevation: topography.elevation,
          lakeMask: plan.wetMask,
          waterSurface: plan.waterSurface,
          bodyId: plan.bodyId,
          componentId: plan.componentId,
          terminalId: plan.terminalId,
          terminalType: plan.terminalType,
          bodies: plan.bodies,
          components: plan.components,
          transfers: plan.transfers,
          ports: plan.ports,
          terminals: plan.terminals,
          discharge: plan.dryDischarge,
          riverClass: projected.riverClass,
          flowDir: plan.receiver,
        },
        stepConfig.classifyBasinRiverNetwork
      );
      return {
        hydrography: {
          model: "certified-sill-spill" as const,
          exposedLandMask: plan.exposedLandMask,
          runoff,
          discharge: plan.dryDischarge,
          riverClass: projected.riverClass,
          flowDir: plan.receiver,
          terminalType: plan.terminalType,
          basinId: plan.terminalId,
        },
        lakePlan: {
          model: "certified-sill-spill" as const,
          ...dimensions,
          lakeMask: plan.wetMask,
          plannedLakeTileCount: plan.bodies.reduce((sum, body) => sum + body.wetCells.length, 0),
          bodyId: plan.bodyId,
          componentId: plan.componentId,
          waterSurface: plan.waterSurface,
          bodies: plan.bodies,
          pools: plan.pools,
          components: plan.components,
          transfers: plan.transfers,
          ports: plan.ports,
          terminals: plan.terminals,
          marineExits: plan.marineExits,
          boundaryExits: plan.boundaryExits,
          conservation: plan.conservation,
        },
        riverNetwork: { model: "certified-sill-spill" as const, ...metadata },
      };
    })();
    // Complete semantic admission precedes the first publication; this is not a rollback transaction.
    for (const [artifact, value] of [
      [artifacts.hydrography, physical.hydrography],
      [artifacts.lakePlan, physical.lakePlan],
      [artifacts.riverNetwork, physical.riverNetwork],
    ] as const) {
      const issues = artifact.validate(value, { dimensions });
      if (issues.length)
        throw new Error(`[Hydrology] Invalid ${artifact.name}: ${JSON.stringify(issues)}`);
    }
    const hydrography = deps.artifacts.hydrography.publish(physical.hydrography);
    const lakePlan = deps.artifacts.lakePlan.publish(physical.lakePlan);
    const riverNetwork = deps.artifacts.riverNetwork.publish(physical.riverNetwork);
    const measurement = {
      ...dimensions,
      externalWaterMask: topography.externalWaterMask,
      exposedLandMask: hydrography.exposedLandMask,
      discharge: hydrography.discharge,
      riverClass: hydrography.riverClass,
      flowDir: hydrography.flowDir,
      basinId: hydrography.basinId,
      lakeMask: lakePlan.lakeMask,
      upstreamArea: riverNetwork.upstreamArea,
      streamOrderProxy: riverNetwork.streamOrderProxy,
      mouthType: riverNetwork.mouthType,
      flowPermanenceProxy: riverNetwork.flowPermanenceProxy,
    };
    return {
      hydrography,
      lakePlan,
      riverNetwork,
      riverNetworkMeasurementInput: {
        ...measurement,
        model: "certified-sill-spill" as const,
        componentId: lakePlan.componentId,
        terminalType: hydrography.terminalType,
      },
    };
  },
  metrics: ({ observation }) => ({
    "hydrology.riverNetwork": measureStandardRiverNetwork(observation.riverNetworkMeasurementInput),
  }),
  viz: ({ observation, dimensions }) => projectNetworkViz(observation, dimensions),
});
