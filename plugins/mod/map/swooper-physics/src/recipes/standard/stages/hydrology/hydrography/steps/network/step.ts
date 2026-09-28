import { createStep } from "@swooper/mapgen-core/authoring";
import { artifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { measureStandardRiverNetwork } from "../../../../../metrics/families/hydrology/river-network.js";
import { projectNetworkViz } from "./viz.js";
import { config } from "./config.js";

/** Refuse unsupported physics before publishing any of the three products; no inactive branch executes. */
export const NetworkStep = createStep(config, {
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const topography = deps.artifacts.topography.read();
    const climate = deps.artifacts.baselineClimateField.read();
    const dimensions = { width, height };
    const physical = (() => {
      if (stepConfig.model === "legacy-sink-budget") {
        const routing = ops.drainageRouting(
          { ...dimensions, elevation: topography.elevation, landMask: topography.landMask },
          stepConfig.drainageRouting
        );
        const discharge = ops.accumulateDischarge(
          {
            ...dimensions,
            landMask: topography.landMask,
            flowDir: routing.flowDir,
            rainfall: climate.rainfall,
            humidity: climate.humidity,
          },
          stepConfig.accumulateDischarge
        );
        const projected = ops.projectRiverNetwork(
          {
            ...dimensions,
            landMask: topography.landMask,
            discharge: Array.from(discharge.discharge),
            flowDir: routing.flowDir,
          },
          stepConfig.projectRiverNetwork
        );
        const lake = ops.planLakes(
          {
            ...dimensions,
            landMask: topography.landMask,
            flowDir: routing.flowDir,
            discharge: discharge.discharge,
            sinkMask: routing.sinkMask,
          },
          stepConfig.planLakes
        );
        const metadata = ops.classifyRiverNetwork(
          {
            ...dimensions,
            landMask: topography.landMask,
            elevation: topography.elevation,
            routingElevation: routing.routingElevation,
            depressionDepth: routing.depressionDepth,
            discharge: discharge.discharge,
            riverClass: projected.riverClass,
            flowDir: routing.flowDir,
            terminalType: routing.terminalType,
            lakeMask: lake.lakeMask,
          },
          stepConfig.classifyRiverNetwork
        );
        return {
          hydrography: {
            model: "legacy-sink-budget" as const,
            runoff: discharge.runoff,
            discharge: discharge.discharge,
            flowDir: routing.flowDir,
            basinId: routing.basinId,
            sinkMask: routing.sinkMask,
            outletMask: routing.outletMask,
            terminalType: routing.terminalType,
            routingElevation: routing.routingElevation,
            depressionDepth: routing.depressionDepth,
            riverClass: projected.riverClass,
          },
          lakePlan: { model: "legacy-sink-budget" as const, ...dimensions, ...lake },
          riverNetwork: { model: "legacy-sink-budget" as const, ...metadata },
        };
      }
      const { runoff } = ops.computeLocalRunoff(
        {
          ...dimensions,
          landMask: topography.landMask,
          rainfall: climate.rainfall,
          humidity: climate.humidity,
        },
        stepConfig.computeLocalRunoff
      );
      const geometry = ops.computeDrainageBasins(
        { ...dimensions, elevation: topography.elevation, landMask: topography.landMask },
        stepConfig.computeDrainageBasins
      );
      const result = ops.computeOpenBasinNetwork(
        {
          ...dimensions,
          elevation: topography.elevation,
          landMask: topography.landMask,
          geometry,
          localRunoff: runoff,
          rainfall: climate.rainfall,
          potentialDemand: climate.potentialDemand,
        },
        stepConfig.computeOpenBasinNetwork
      );
      if (result.status === "unsupported")
        throw new Error(
          `[Hydrology] Unsupported certified-sill-spill network: ${JSON.stringify(result.witness)}`,
          { cause: result.witness }
        );
      const plan = result.plan;
      const exposedLand = Uint8Array.from(topography.landMask, (land, cell) =>
        land === 1 && plan.wetMask[cell] === 0 ? 1 : 0
      );
      const projected = ops.projectRiverNetwork(
        {
          ...dimensions,
          landMask: exposedLand,
          discharge: plan.dryDischarge,
          flowDir: plan.receiver,
        },
        stepConfig.projectRiverNetwork
      );
      const { basinId, ...metadata } = ops.classifyBasinRiverNetwork(
        {
          ...dimensions,
          landMask: topography.landMask,
          elevation: topography.elevation,
          lakeMask: plan.wetMask,
          waterSurface: plan.waterSurface,
          bodyId: plan.bodyId,
          bodies: plan.bodies,
          discharge: plan.dryDischarge,
          riverClass: projected.riverClass,
          flowDir: plan.receiver,
        },
        stepConfig.classifyBasinRiverNetwork
      );
      const bodies = plan.bodies.map((body) => {
        const node = geometry.nodes[body.nodeId - 1]!;
        return { ...body, floorCell: node.floorCell, floorElevation: node.floorElevation };
      });
      for (let cell = 0; cell < width * height; cell++) {
        if (
          plan.wetMask[cell] &&
          (projected.riverClass[cell] !== 0 || plan.dryDischarge[cell] !== 0)
        )
          throw new Error("Certified wet cells cannot own dry river classes or discharge.");
        if (!plan.wetMask[cell] && plan.waterSurface[cell] !== topography.elevation[cell])
          throw new Error("Certified routing must preserve dry ground.");
      }
      return {
        hydrography: {
          model: "certified-sill-spill" as const,
          runoff,
          discharge: plan.dryDischarge,
          riverClass: projected.riverClass,
          flowDir: plan.receiver,
          terminalType: plan.terminalType,
          basinId,
        },
        lakePlan: {
          model: "certified-sill-spill" as const,
          ...dimensions,
          lakeMask: plan.wetMask,
          plannedLakeTileCount: bodies.reduce((sum, body) => sum + body.wetCells.length, 0),
          bodyId: plan.bodyId,
          waterSurface: plan.waterSurface,
          bodies,
          certificates: plan.certificates,
          marineExits: plan.marineExits,
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
    return {
      hydrography,
      lakePlan,
      riverNetwork,
      riverNetworkMeasurementInput: {
        model: hydrography.model,
        ...dimensions,
        landMask: topography.landMask,
        discharge: hydrography.discharge,
        riverClass: hydrography.riverClass,
        flowDir: hydrography.flowDir,
        basinId: hydrography.basinId,
        lakeMask: lakePlan.lakeMask,
        upstreamArea: riverNetwork.upstreamArea,
        streamOrderProxy: riverNetwork.streamOrderProxy,
        mouthType: riverNetwork.mouthType,
        flowPermanenceProxy: riverNetwork.flowPermanenceProxy,
      },
    };
  },
  metrics: ({ observation }) => ({
    "hydrology.riverNetwork": measureStandardRiverNetwork(observation.riverNetworkMeasurementInput),
  }),
  viz: ({ observation, dimensions }) => projectNetworkViz(observation, dimensions),
});
