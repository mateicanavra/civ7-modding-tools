import { createStep } from "@swooper/mapgen-core/authoring";
import { measureStandardRiverNetwork } from "../../../../../metrics/families/hydrology/river-network.js";
import { defineStandardVizMeta } from "../../../../../viz.js";
import { applyHydrologyLakeinessPolicy } from "../../model/policy/hydrography-knob-policy.js";
import { config } from "./config.js";

type HydrologyLakeinessKnob = "few" | "normal" | "many";

const GROUP_HYDROGRAPHY = "Hydrology / Hydrography";
const TILE_SPACE_ID = "tile.hexOddQ" as const;

/**
 * Derives deterministic lake intent and river-network structure from canonical hydrography;
 * aggregate benchmark evidence is projected to metrics rather than retained as pipeline state.
 */
export const LakesStep = createStep(config, {
  normalize: (stepConfig, ctx) => {
    const { lakeiness = "normal" as HydrologyLakeinessKnob } = ctx.knobs as {
      lakeiness?: HydrologyLakeinessKnob;
    };
    if (stepConfig.planLakes.strategy !== "sink-discharge-budget") return stepConfig;

    const terminalBasinControls = applyHydrologyLakeinessPolicy(
      stepConfig.planLakes.config,
      lakeiness
    );

    return {
      ...stepConfig,
      planLakes: {
        ...stepConfig.planLakes,
        config: {
          ...stepConfig.planLakes.config,
          ...terminalBasinControls,
        },
      },
    };
  },
  run: (context, stepConfig, ops, deps) => {
    const { width, height } = context.setup.dimensions;
    const topography = deps.artifacts.topography.read();
    const hydrography = deps.artifacts.hydrography.read();
    // Hydrology publishes lake intent before the map stage touches engine terrain.
    // Placement and diagnostics read this truth artifact instead of engine readback.
    const lakePlan = ops.planLakes(
      {
        width,
        height,
        landMask: topography.landMask,
        flowDir: hydrography.flowDir,
        discharge: hydrography.discharge,
        sinkMask: hydrography.sinkMask,
      },
      stepConfig.planLakes
    );

    const publishedLakePlan = deps.artifacts.lakePlan.publish({
      width,
      height,
      lakeMask: lakePlan.lakeMask,
      plannedLakeTileCount: lakePlan.plannedLakeTileCount,
      sinkLakeCount: lakePlan.sinkLakeCount,
    });

    const riverNetwork = ops.classifyRiverNetwork(
      {
        width,
        height,
        landMask: topography.landMask,
        elevation: topography.elevation,
        routingElevation: hydrography.routingElevation,
        depressionDepth: hydrography.depressionDepth,
        discharge: hydrography.discharge,
        riverClass: hydrography.riverClass,
        flowDir: hydrography.flowDir,
        terminalType: hydrography.terminalType,
        lakeMask: publishedLakePlan.lakeMask,
      },
      stepConfig.classifyRiverNetwork
    );

    const publishedRiverNetwork = deps.artifacts.riverNetwork.publish({
      upstreamArea: riverNetwork.upstreamArea,
      streamOrderProxy: riverNetwork.streamOrderProxy,
      mouthType: riverNetwork.mouthType,
      slopeClass: riverNetwork.slopeClass,
      flowPermanenceProxy: riverNetwork.flowPermanenceProxy,
    });
    return {
      lakePlan: publishedLakePlan,
      riverNetwork: publishedRiverNetwork,
      riverNetworkMeasurementInput: {
        width,
        height,
        landMask: topography.landMask,
        discharge: hydrography.discharge,
        riverClass: hydrography.riverClass,
        flowDir: hydrography.flowDir,
        basinId: hydrography.basinId,
        lakeMask: publishedLakePlan.lakeMask,
        upstreamArea: publishedRiverNetwork.upstreamArea,
        streamOrderProxy: publishedRiverNetwork.streamOrderProxy,
        mouthType: publishedRiverNetwork.mouthType,
        flowPermanenceProxy: publishedRiverNetwork.flowPermanenceProxy,
      },
    };
  },
  metrics: ({ observation }) => ({
    "hydrology.riverNetwork": measureStandardRiverNetwork(observation.riverNetworkMeasurementInput),
  }),
  viz: ({ observation: { lakePlan, riverNetwork }, dimensions }) => [
    {
      kind: "grid",
      dataTypeKey: "hydrology.lakes.lakePlan",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: lakePlan.lakeMask },
      meta: defineStandardVizMeta("hydrology.lakes.lakePlan", "category.distinct", {
        label: "Lake Plan",
        group: GROUP_HYDROGRAPHY,
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.upstreamArea",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "i32", values: riverNetwork.upstreamArea },
      meta: defineStandardVizMeta("hydrology.hydrography.upstreamArea", "field.intensity", {
        label: "Upstream Area",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.streamOrderProxy",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverNetwork.streamOrderProxy },
      meta: defineStandardVizMeta("hydrology.hydrography.streamOrderProxy", "category.distinct", {
        label: "Stream Order Proxy",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.mouthType",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverNetwork.mouthType },
      meta: defineStandardVizMeta("hydrology.hydrography.mouthType", "category.distinct", {
        label: "River Mouth Type",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.slopeClass",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverNetwork.slopeClass },
      meta: defineStandardVizMeta("hydrology.hydrography.slopeClass", "category.distinct", {
        label: "River Slope Class",
        group: GROUP_HYDROGRAPHY,
        visibility: "debug",
      }),
    },
    {
      kind: "grid",
      dataTypeKey: "hydrology.hydrography.flowPermanenceProxy",
      spaceId: TILE_SPACE_ID,
      dims: dimensions,
      field: { format: "u8", values: riverNetwork.flowPermanenceProxy },
      meta: defineStandardVizMeta(
        "hydrology.hydrography.flowPermanenceProxy",
        "category.distinct",
        {
          label: "Flow Permanence Proxy",
          group: GROUP_HYDROGRAPHY,
          visibility: "debug",
        }
      ),
    },
  ],
});
