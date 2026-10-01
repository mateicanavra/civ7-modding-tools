import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import type { StandardMapCapture } from "../../capture.js";
import { BASIN_INTERNAL_RECEIVER, BASIN_TERMINAL } from "../../../../../domain/hydrology/modules/hydrography/model/atoms/basin-network.schema.js";
import { measureWetTransitions } from "./wet-transitions.js";

type NetworkCoherenceInput = Readonly<{
  provenance: Pick<StandardMapCapture["provenance"], "width" | "height">;
  model: Pick<StandardMapCapture["model"], "physicalHydrology" | "landMask" | "externalWaterMask" | "exposedLandMask" | "plannedLakeMask" | "elevation" | "seaLevel" | "flowDir" | "terminalType" | "riverClass" | "mountainMask" | "volcanoMask">;
  projection: Pick<StandardMapCapture["projection"], "navigableRivers">;
}>;

function distribution(values: readonly number[]) {
  if (!values.length) return { count: 0, min: null, p50: null, p90: null, max: null };
  const sorted = [...values].sort((a, b) => a - b);
  return {
    count: sorted.length,
    min: sorted[0]!,
    p50: sorted[Math.floor((sorted.length - 1) * 0.5)]!,
    p90: sorted[Math.floor((sorted.length - 1) * 0.9)]!,
    max: sorted[sorted.length - 1]!,
  };
}

/** Whole-map diagnostics, not channel eligibility rules or a native navigation oracle. */
export function measureStandardNetworkCoherence(capture: NetworkCoherenceInput) {
  const { model } = capture;
  const physical = model.physicalHydrology;
  if (physical.model !== "certified-sill-spill") throw new Error("Expected completed basin evidence.");
  const { width, height } = capture.provenance;
  const size = width * height;
  const upstreamMajorCount = new Uint16Array(size);
  const transitions = measureWetTransitions(capture);
  const wetTransitions = transitions.writes;
  const wetWrites = new Map(wetTransitions.map((write) => [write.sourceCell, write]));
  let originalLand = 0, finiteGround = 0, exposedLand = 0, nonMountainExposedLand = 0, originalLandLakeTiles = 0;
  let minorSources = 0, majorSources = 0, equalHeightDryReceivers = 0;
  let invalidDryReceivers = 0, ascendingHydraulicReceivers = 0;
  const majorDrops: number[] = [];
  const minorDrops: number[] = [];
  const dryDrops: number[] = [];
  const lowerAdjacentLakeBypasses: { sourceCell: number; receiverCell: number; bodyId: number; adjacentWetCell: number; ground: number; waterSurface: number; riverClass: number }[] = [];
  const hydraulicHeight = (cell: number) => model.externalWaterMask[cell] === 1 ? model.seaLevel
    : model.plannedLakeMask[cell] === 1 ? physical.waterSurface[cell]! : model.elevation[cell]!;

  for (let cell = 0; cell < size; cell++) {
    if (model.landMask[cell] === 1) {
      originalLand++;
      if (model.plannedLakeMask[cell] === 1) originalLandLakeTiles++;
    }
    if (model.externalWaterMask[cell] === 0) finiteGround++;
    if (model.exposedLandMask[cell] !== 1) continue;
    exposedLand++;
    if (!model.mountainMask[cell] && !model.volcanoMask[cell]) nonMountainExposedLand++;
    const riverClass = model.riverClass[cell]!;
    if (riverClass === 1) minorSources++;
    if (riverClass === 2) majorSources++;
    const receiver = model.flowDir[cell]!;
    if ((receiver === BASIN_INTERNAL_RECEIVER && physical.componentId[cell]! > 0 && physical.discharge[cell] === 0) ||
      (receiver === -1 && model.terminalType[cell] === BASIN_TERMINAL["boundary-export"] && physical.boundaryExits.some((exit) => exit.fromCell === cell))) continue;
    const neighbors = getHexNeighborIndicesOddQ(cell % width, Math.floor(cell / width), width, height);
    if (!neighbors.includes(receiver)) {
      invalidDryReceivers++;
      continue;
    }
    const drop = hydraulicHeight(cell) - hydraulicHeight(receiver);
    dryDrops.push(drop);
    if (drop < 0) ascendingHydraulicReceivers++;
    if (model.exposedLandMask[receiver] === 1 && drop === 0)
      equalHeightDryReceivers++;
    if (riverClass === 1) minorDrops.push(drop);
    if (riverClass === 2) {
      majorDrops.push(drop);
      if (model.riverClass[receiver] === 2) upstreamMajorCount[receiver]!++;
    }
    if (riverClass === 0) continue;
    const seenBodies = new Set<number>();
    for (const adjacent of neighbors) {
      if (!model.plannedLakeMask[adjacent]) continue;
      const bodyId = physical.bodyId[adjacent]!;
      if (seenBodies.has(bodyId)) continue;
      seenBodies.add(bodyId);
      if (physical.bodyId[receiver] === bodyId || physical.waterSurface[adjacent]! >= model.elevation[cell]!) continue;
      // A local bypass is not a missing connection: it can drain to the same body farther on.
      lowerAdjacentLakeBypasses.push({ sourceCell: cell, receiverCell: receiver, bodyId,
        adjacentWetCell: adjacent, ground: model.elevation[cell]!,
        waterSurface: physical.waterSurface[adjacent]!, riverClass });
    }
  }

  // Segment starts include lake outlets and class transitions, not just hydrologic headwaters.
  const majorSegmentStarts: number[] = [];
  for (let cell = 0; cell < size; cell++)
    if (model.riverClass[cell] === 2 && upstreamMajorCount[cell] === 0) majorSegmentStarts.push(cell);
  const lakeOutlets = transitions.exchanges.filter((edge) => edge.outwardDischarge > 0).map((edge) => {
    const body = physical.bodies.find((body) => body.bodyId === edge.bodyId)!;
    const incoming = [] as number[];
    for (let cell = 0; cell < size; cell++) {
      const receiver = model.flowDir[cell]!;
      if (model.riverClass[cell]! > 0 && receiver >= 0 && physical.bodyId[receiver] === body.bodyId)
        incoming.push(cell);
    }
    const write = wetWrites.get(edge.wetCell);
    return {
      bodyId: body.bodyId,
      transportKind: edge.transportKind,
      wetTileCount: body.wetCells.length,
      surface: body.level,
      outletCell: edge.wetCell,
      receiverCell: edge.adjacentCell,
      receiverGround: model.elevation[edge.adjacentCell]!,
      receiverClass: model.riverClass[edge.adjacentCell]!,
      outflow: edge.outwardDischarge,
      classifiedInletCells: incoming,
      wetOutletWritePresent: write?.receiverCell === edge.adjacentCell
        && write.bodyId === body.bodyId && write.role === "outlet" && write.riverClass === "NAVIGABLE",
      selectedForNativeWrite: transitions.selected.get(edge.wetCell) === edge,
    };
  });
  const classifiedOutlets = lakeOutlets.filter((outlet) => outlet.receiverClass > 0);
  const navigableOutlets = lakeOutlets.filter((outlet) => outlet.outflow > 0 && outlet.receiverClass === 2
    && model.exposedLandMask[outlet.receiverCell] === 1);
  return {
    units: "Tile counts and model elevation units; not km, metres, m3/s or native movement proof.",
    originalLand, finiteGround, exposedLand, nonMountainExposedLand,
    minorSources, majorSources,
    riverSourceFractionOfExposedLand: exposedLand ? (minorSources + majorSources) / exposedLand : 0,
    majorSourceFractionOfExposedLand: exposedLand ? majorSources / exposedLand : 0,
    lakeFractionOfOriginalLand: originalLand ? originalLandLakeTiles / originalLand : 0,
    bodyCount: physical.bodies.length,
    singleTileBodyCount: physical.bodies.filter((body) => body.wetCells.length === 1).length,
    bodySizes: distribution(physical.bodies.map((body) => body.wetCells.length)),
    dryHydraulicDrops: distribution(dryDrops),
    minorHydraulicDrops: distribution(minorDrops),
    majorHydraulicDrops: distribution(majorDrops),
    equalHeightDryReceivers, invalidDryReceivers, ascendingHydraulicReceivers,
    majorSegmentStarts, lakeOutlets, lowerAdjacentLakeBypasses,
    classifiedLakeOutletCount: classifiedOutlets.length,
    unauthoredClassifiedWetOutletCount: classifiedOutlets.filter((outlet) => !outlet.wetOutletWritePresent).length,
    wetTransitionWriteCount: wetTransitions.length,
    inwardOrZeroWetExchangeCount: transitions.exchanges.filter((edge) => edge.outwardDischarge <= 0).length,
    secondaryWetExchangeCount: navigableOutlets.filter((outlet) => !outlet.selectedForNativeWrite).length,
    wetTransitionsComplete: transitions.wetTransitionsComplete,
    navigableLakeOutletCount: navigableOutlets.length,
    unauthoredNavigableWetOutletCount: navigableOutlets.filter((outlet) => outlet.selectedForNativeWrite && !outlet.wetOutletWritePresent).length,
  };
}
