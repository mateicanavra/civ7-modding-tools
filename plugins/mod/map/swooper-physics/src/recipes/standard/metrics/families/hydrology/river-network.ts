import {
  isAnyRiverClass,
  isMajorRiverClass,
  isMinorRiverClass,
} from "../../../../../domain/hydrology/modules/hydrography/model/policy/river-class.js";
import {
  HYDROLOGY_FLOW_DRY,
  HYDROLOGY_FLOW_EPHEMERAL,
  HYDROLOGY_FLOW_INTERMITTENT,
  HYDROLOGY_FLOW_PERENNIAL,
  HYDROLOGY_MOUTH_ACCEPTED_LAKE,
  HYDROLOGY_MOUTH_BOUNDARY_EXPORT,
  HYDROLOGY_MOUTH_SUBTILE,
  HYDROLOGY_MOUTH_DRY,
  HYDROLOGY_MOUTH_CLOSED_BASIN,
  HYDROLOGY_MOUTH_OCEAN,
  HYDROLOGY_MOUTH_SPILL_PATH,
  HYDROLOGY_MOUTH_UNRESOLVED,
} from "../../../../../domain/hydrology/modules/hydrography/model/policy/river-network-classification.js";
import { BASIN_INTERNAL_RECEIVER, BASIN_TERMINAL } from "../../../../../domain/hydrology/modules/hydrography/model/atoms/basin-network.schema.js";
import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { type Static, Type } from "typebox";

/** Closed payload emitted by the Standard recipe's river-network metrics facet. */
export const StandardRiverNetworkMeasurementsSchema = Type.Object(
  {
    model: Type.Union([Type.Literal("legacy-sink-budget"), Type.Literal("certified-sill-spill")]),
    version: Type.Literal(1, {
      description: "Schema version for the Standard river-network measurement record.",
    }),
    landTileCount: Type.Integer({
      minimum: 0,
      description: "Number of tiles classified as land by Hydrology.",
    }),
    waterTileCount: Type.Integer({
      minimum: 0,
      description: "Number of grid tiles not classified as land by Hydrology.",
    }),
    lakeTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles admitted into accepted lake surfaces.",
    }),
    lakeLandShare: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Accepted lake-tile count divided by total land-tile count.",
    }),
    riverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles classified as either minor or major river.",
    }),
    minorRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles classified as minor river.",
    }),
    majorRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles classified as major river.",
    }),
    riverLandShare: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "River-tile count divided by total land-tile count.",
    }),
    minorRiverShareOfRiverTiles: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Minor-river tile count divided by total river-tile count.",
    }),
    majorRiverShareOfRiverTiles: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Major-river tile count divided by total river-tile count.",
    }),
    streamOrder1RiverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles classified as first-order headwaters.",
    }),
    lowOrderRiverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles with stream-order proxy 1 or 2.",
    }),
    lowOrderRiverShareOfRiverTiles: Type.Number({
      minimum: 0,
      maximum: 1,
      description: "Order-1-or-2 river-tile count divided by total river-tile count.",
    }),
    dryFlowTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose discharge signal is classified as dry.",
    }),
    ephemeralFlowTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose discharge signal is classified as ephemeral.",
    }),
    intermittentFlowTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose discharge signal is classified as intermittent.",
    }),
    perennialFlowTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose discharge signal is classified as perennial.",
    }),
    nonDryFlowLandShare: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Ephemeral, intermittent, and perennial flow-tile count divided by total land-tile count.",
    }),
    riverDryTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles whose discharge signal is classified as dry.",
    }),
    riverEphemeralTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles whose discharge signal is classified as ephemeral.",
    }),
    riverIntermittentTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles whose discharge signal is classified as intermittent.",
    }),
    riverPerennialTileCount: Type.Integer({
      minimum: 0,
      description: "Number of river tiles whose discharge signal is classified as perennial.",
    }),
    nonPerennialRiverShareOfRiverTiles: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Dry, ephemeral, and intermittent river-tile count divided by total river-tile count.",
    }),
    mouthSourceTileCount: Type.Integer({
      minimum: 0,
      description:
        "Tiles requiring a drainage mouth: all legacy land, or exposed dry land outside certified wet bodies.",
    }),
    oceanMouthTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose drainage path resolves to an ocean mouth.",
    }),
    acceptedLakeMouthTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose drainage path resolves to an accepted lake.",
    }),
    closedBasinMouthTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose drainage path terminates in a closed basin.",
    }),
    boundaryExportMouthTileCount: Type.Integer({ minimum: 0, description: "Dry sources resolving to admitted north/south boundary export, not marine water." }),
    subtileMouthTileCount: Type.Integer({ minimum: 0, description: "Dry sources resolving to a stationary subtile basin without strict wet cells." }),
    dryBasinMouthTileCount: Type.Integer({ minimum: 0, description: "Dry sources resolving to a basin with no supported surface water." }),
    spillPathMouthTileCount: Type.Integer({
      minimum: 0,
      description:
        "Number of land tiles whose drainage reaches ocean or lake through a conditioned spill path.",
    }),
    unresolvedMouthTileCount: Type.Integer({
      minimum: 0,
      description: "Number of mouth-source tiles whose drainage terminal remains unclassified.",
    }),
    resolvedMouthTileCount: Type.Integer({
      minimum: 0,
      description: "Number of mouth-source tiles whose drainage terminal has a recognized mouth class.",
    }),
    assignedBasinLandTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles assigned a nonnegative drainage-basin identifier.",
    }),
    unassignedBasinLandTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles without an assigned drainage-basin identifier.",
    }),
    invalidReceiverTileCount: Type.Integer({
      minimum: 0,
      description: "Number of land tiles whose encoded receiver lies outside the grid contract.",
    }),
    downstreamDischargeDropEdgeCount: Type.Integer({
      minimum: 0,
      description:
        "Number of ordinary dry land-to-land edges where accumulated discharge decreases; component principal attachments are not complete transport.",
    }),
    closedOrLakeTerminalLandShare: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Land tiles draining to accepted lakes or closed basins divided by total land-tile count.",
    }),
    lakeConnectedTerminalDischargeShare: Type.Number({
      minimum: 0,
      maximum: 1,
      description:
        "Terminal discharge connected to accepted lakes divided by all measured terminal discharge.",
    }),
    maxUpstreamArea: Type.Integer({
      minimum: 0,
      description: "Largest contributing land-tile count observed at any land tile.",
    }),
    maxStreamOrderProxy: Type.Integer({
      minimum: 0,
      description: "Highest Strahler-like stream-order proxy observed on the river network.",
    }),
  },
  {
    additionalProperties: false,
    description:
      "Standard recipe measurements of generated drainage, river hierarchy, terminal resolution, and lakes.",
  }
);

/** Aggregate measurements projected from one completed Standard river-network calculation. */
export type StandardRiverNetworkMeasurements = Static<
  typeof StandardRiverNetworkMeasurementsSchema
>;

/** Causal Hydrology evidence required to project the Standard river-network measurements. */
export type StandardRiverNetworkMeasurementInput = Readonly<{
  width: number;
  height: number;
  landMask: ArrayLike<number>;
  discharge: ArrayLike<number>;
  riverClass: ArrayLike<number>;
  flowDir: ArrayLike<number>;
  basinId: ArrayLike<number>;
  lakeMask: ArrayLike<number>;
  upstreamArea: ArrayLike<number>;
  streamOrderProxy: ArrayLike<number>;
  mouthType: ArrayLike<number>;
  flowPermanenceProxy: ArrayLike<number>;
} & ({ model: "legacy-sink-budget" } | {
  model: "certified-sill-spill";
  componentId: ArrayLike<number>;
  terminalType: ArrayLike<number>;
})>;

function safeShare(numerator: number, denominator: number): number {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1, numerator / denominator));
}

/**
 * Projects neutral Standard product measurements from admitted Hydrology evidence.
 * The projection does not alter the causal river-network result or encode benchmark targets.
 */
export function measureStandardRiverNetwork(
  input: StandardRiverNetworkMeasurementInput
): StandardRiverNetworkMeasurements {
  const size = input.width * input.height;
  let landTileCount = 0;
  let lakeTileCount = 0;
  let riverTileCount = 0;
  let minorRiverTileCount = 0;
  let majorRiverTileCount = 0;
  let streamOrder1RiverTileCount = 0;
  let lowOrderRiverTileCount = 0;
  let dryFlowTileCount = 0;
  let ephemeralFlowTileCount = 0;
  let intermittentFlowTileCount = 0;
  let perennialFlowTileCount = 0;
  let riverDryTileCount = 0;
  let riverEphemeralTileCount = 0;
  let riverIntermittentTileCount = 0;
  let riverPerennialTileCount = 0;
  let oceanMouthTileCount = 0;
  let mouthSourceTileCount = 0;
  let acceptedLakeMouthTileCount = 0;
  let closedBasinMouthTileCount = 0;
  let boundaryExportMouthTileCount = 0, subtileMouthTileCount = 0, dryBasinMouthTileCount = 0;
  let spillPathMouthTileCount = 0;
  let unresolvedMouthTileCount = 0;
  let resolvedMouthTileCount = 0;
  let assignedBasinLandTileCount = 0;
  let unassignedBasinLandTileCount = 0;
  let invalidReceiverTileCount = 0;
  let downstreamDischargeDropEdgeCount = 0;
  let maxUpstreamArea = 0;
  let maxStreamOrderProxy = 0;
  let terminalDischarge = 0;
  let lakeConnectedTerminalDischarge = 0;

  for (let index = 0; index < size; index += 1) {
    if (input.landMask[index] !== 1) continue;
    landTileCount += 1;

    const discharge = Math.max(0, input.discharge[index] ?? 0);
    if ((input.lakeMask[index] ?? 0) === 1) lakeTileCount += 1;

    if ((input.basinId[index] ?? -1) >= (input.model === "certified-sill-spill" ? 1 : 0)) assignedBasinLandTileCount += 1;
    else unassignedBasinLandTileCount += 1;

    const rawReceiver = input.flowDir[index] ?? -1;
    const certifiedComponent = input.model === "certified-sill-spill" && input.componentId[index]! > 0;
    const hasInvalidReceiver = input.model === "legacy-sink-budget" ? rawReceiver < -1 || rawReceiver >= size
      : rawReceiver >= 0 ? !getHexNeighborIndicesOddQ(index % input.width, Math.floor(index / input.width), input.width, input.height).includes(rawReceiver)
        : rawReceiver === BASIN_INTERNAL_RECEIVER ? !certifiedComponent || discharge !== 0
          : rawReceiver !== -1 || input.terminalType[index] !== BASIN_TERMINAL["boundary-export"] ||
            (index >= input.width && index < size - input.width);
    if (hasInvalidReceiver) invalidReceiverTileCount += 1;
    const landReceiver =
      rawReceiver >= 0 && rawReceiver < size && input.landMask[rawReceiver] === 1
        ? rawReceiver
        : -1;
    const certifiedWetSource = input.model === "certified-sill-spill" && input.lakeMask[index] === 1;
    const certifiedWetReceiver = input.model === "certified-sill-spill" && landReceiver >= 0 && input.lakeMask[landReceiver] === 1;
    const certifiedComponentReceiver = input.model === "certified-sill-spill" && landReceiver >= 0 && input.componentId[landReceiver]! > 0;
    // Equal-head junctions can split flow. Their principal channel is only one
    // attachment; complete conservation is independently checked on the ledger.
    if (
      landReceiver >= 0 && !certifiedWetSource && !certifiedWetReceiver && !certifiedComponent && !certifiedComponentReceiver &&
      Math.max(0, input.discharge[landReceiver] ?? 0) + Number.EPSILON < discharge
    ) {
      downstreamDischargeDropEdgeCount += 1;
    }
    if ((landReceiver < 0 || certifiedWetReceiver) && !hasInvalidReceiver && !certifiedWetSource) {
      terminalDischarge += discharge;
      const mouth = input.mouthType[index] ?? HYDROLOGY_MOUTH_UNRESOLVED;
      if (mouth === HYDROLOGY_MOUTH_ACCEPTED_LAKE || (input.lakeMask[index] ?? 0) === 1) {
        lakeConnectedTerminalDischarge += discharge;
      }
    }

    const riverClass = input.riverClass[index] ?? 0;
    const riverTile = isAnyRiverClass(riverClass);
    if (isMinorRiverClass(riverClass)) {
      minorRiverTileCount += 1;
      riverTileCount += 1;
    } else if (isMajorRiverClass(riverClass)) {
      majorRiverTileCount += 1;
      riverTileCount += 1;
    }

    const permanence = input.flowPermanenceProxy[index] ?? HYDROLOGY_FLOW_DRY;
    if (permanence === HYDROLOGY_FLOW_EPHEMERAL) ephemeralFlowTileCount += 1;
    else if (permanence === HYDROLOGY_FLOW_INTERMITTENT) intermittentFlowTileCount += 1;
    else if (permanence === HYDROLOGY_FLOW_PERENNIAL) perennialFlowTileCount += 1;
    else dryFlowTileCount += 1;
    if (riverTile) {
      if (permanence === HYDROLOGY_FLOW_EPHEMERAL) riverEphemeralTileCount += 1;
      else if (permanence === HYDROLOGY_FLOW_INTERMITTENT) riverIntermittentTileCount += 1;
      else if (permanence === HYDROLOGY_FLOW_PERENNIAL) riverPerennialTileCount += 1;
      else riverDryTileCount += 1;

      const streamOrder = input.streamOrderProxy[index] ?? 0;
      if (streamOrder === 1) streamOrder1RiverTileCount += 1;
      if (streamOrder > 0 && streamOrder <= 2) lowOrderRiverTileCount += 1;
    }

    // A certified lake is a single body, not dry river sources with
    // independent mouths. Its internal connectivity retains no mouth class.
    if (!certifiedWetSource) {
      mouthSourceTileCount += 1;
      const mouth = input.mouthType[index] ?? HYDROLOGY_MOUTH_UNRESOLVED;
      if (mouth === HYDROLOGY_MOUTH_OCEAN) {
        oceanMouthTileCount += 1;
        resolvedMouthTileCount += 1;
      } else if (mouth === HYDROLOGY_MOUTH_ACCEPTED_LAKE) {
        acceptedLakeMouthTileCount += 1;
        resolvedMouthTileCount += 1;
      } else if (mouth === HYDROLOGY_MOUTH_CLOSED_BASIN) {
        closedBasinMouthTileCount += 1;
        resolvedMouthTileCount += 1;
      } else if (input.model === "certified-sill-spill" && mouth === HYDROLOGY_MOUTH_BOUNDARY_EXPORT) {
        boundaryExportMouthTileCount += 1;
        resolvedMouthTileCount += 1;
      } else if (input.model === "certified-sill-spill" && mouth === HYDROLOGY_MOUTH_SUBTILE) {
        subtileMouthTileCount += 1;
        resolvedMouthTileCount += 1;
      } else if (input.model === "certified-sill-spill" && mouth === HYDROLOGY_MOUTH_DRY) {
        dryBasinMouthTileCount += 1;
        resolvedMouthTileCount += 1;
      } else if (mouth === HYDROLOGY_MOUTH_SPILL_PATH) {
        spillPathMouthTileCount += 1;
        resolvedMouthTileCount += 1;
      } else {
        unresolvedMouthTileCount += 1;
      }
    }

    maxUpstreamArea = Math.max(maxUpstreamArea, input.upstreamArea[index] ?? 0);
    maxStreamOrderProxy = Math.max(maxStreamOrderProxy, input.streamOrderProxy[index] ?? 0);
  }

  const nonDryFlowTileCount =
    ephemeralFlowTileCount + intermittentFlowTileCount + perennialFlowTileCount;
  const closedOrLakeTerminalTileCount = acceptedLakeMouthTileCount + closedBasinMouthTileCount + subtileMouthTileCount + dryBasinMouthTileCount;

  return Object.freeze({
    model: input.model,
    version: 1,
    landTileCount,
    waterTileCount: Math.max(0, size - landTileCount),
    lakeTileCount,
    lakeLandShare: safeShare(lakeTileCount, landTileCount),
    riverTileCount,
    minorRiverTileCount,
    majorRiverTileCount,
    riverLandShare: safeShare(riverTileCount, landTileCount),
    minorRiverShareOfRiverTiles: safeShare(minorRiverTileCount, riverTileCount),
    majorRiverShareOfRiverTiles: safeShare(majorRiverTileCount, riverTileCount),
    streamOrder1RiverTileCount,
    lowOrderRiverTileCount,
    lowOrderRiverShareOfRiverTiles: safeShare(lowOrderRiverTileCount, riverTileCount),
    dryFlowTileCount,
    ephemeralFlowTileCount,
    intermittentFlowTileCount,
    perennialFlowTileCount,
    nonDryFlowLandShare: safeShare(nonDryFlowTileCount, landTileCount),
    riverDryTileCount,
    riverEphemeralTileCount,
    riverIntermittentTileCount,
    riverPerennialTileCount,
    nonPerennialRiverShareOfRiverTiles: safeShare(
      riverDryTileCount + riverEphemeralTileCount + riverIntermittentTileCount,
      riverTileCount
    ),
    mouthSourceTileCount,
    oceanMouthTileCount,
    acceptedLakeMouthTileCount,
    closedBasinMouthTileCount,
    boundaryExportMouthTileCount, subtileMouthTileCount, dryBasinMouthTileCount,
    spillPathMouthTileCount,
    unresolvedMouthTileCount,
    resolvedMouthTileCount,
    assignedBasinLandTileCount,
    unassignedBasinLandTileCount,
    invalidReceiverTileCount,
    downstreamDischargeDropEdgeCount,
    closedOrLakeTerminalLandShare: safeShare(closedOrLakeTerminalTileCount, landTileCount),
    lakeConnectedTerminalDischargeShare: safeShare(
      lakeConnectedTerminalDischarge,
      terminalDischarge
    ),
    maxUpstreamArea,
    maxStreamOrderProxy,
  });
}
