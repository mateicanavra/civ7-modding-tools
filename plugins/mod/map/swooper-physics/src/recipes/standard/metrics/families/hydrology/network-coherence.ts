import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import type { StandardMapCapture } from "../../capture.js";

type NetworkCoherenceInput = Readonly<{
  provenance: Pick<StandardMapCapture["provenance"], "width" | "height">;
  model: Pick<StandardMapCapture["model"], "physicalHydrology" | "landMask" | "plannedLakeMask" | "elevation" | "seaLevel" | "flowDir" | "riverClass" | "mountainMask" | "volcanoMask">;
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
  const { model, projection } = capture;
  const physical = model.physicalHydrology;
  if (physical.model !== "certified-sill-spill") return null;
  const { width, height } = capture.provenance;
  const size = width * height;
  const upstreamMajorCount = new Uint16Array(size);
  const writes = projection.navigableRivers.model === "certified-sill-spill"
    ? new Map(projection.navigableRivers.writes.map((write) => [write.sourceCell, write]))
    : null;
  let originalLand = 0, exposedLand = 0, nonMountainExposedLand = 0;
  let minorSources = 0, majorSources = 0, equalHeightDryReceivers = 0;
  let invalidDryReceivers = 0, ascendingHydraulicReceivers = 0;
  const majorDrops: number[] = [];
  const minorDrops: number[] = [];
  const dryDrops: number[] = [];
  const lowerAdjacentLakeBypasses: { sourceCell: number; receiverCell: number; bodyId: number; adjacentWetCell: number; ground: number; waterSurface: number; riverClass: number }[] = [];
  const hydraulicHeight = (cell: number) => !model.landMask[cell] ? model.seaLevel
    : model.plannedLakeMask[cell] === 1 ? physical.waterSurface[cell]! : model.elevation[cell]!;

  for (let cell = 0; cell < size; cell++) {
    if (!model.landMask[cell]) continue;
    originalLand++;
    if (model.plannedLakeMask[cell]) continue;
    exposedLand++;
    if (!model.mountainMask[cell] && !model.volcanoMask[cell]) nonMountainExposedLand++;
    const riverClass = model.riverClass[cell]!;
    if (riverClass === 1) minorSources++;
    if (riverClass === 2) majorSources++;
    const receiver = model.flowDir[cell]!;
    const neighbors = getHexNeighborIndicesOddQ(cell % width, Math.floor(cell / width), width, height);
    if (!neighbors.includes(receiver)) {
      invalidDryReceivers++;
      continue;
    }
    const drop = hydraulicHeight(cell) - hydraulicHeight(receiver);
    dryDrops.push(drop);
    if (drop < 0) ascendingHydraulicReceivers++;
    if (model.landMask[receiver] && !model.plannedLakeMask[receiver] && drop === 0)
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
  const lakeOutlets = physical.bodies.map((body) => {
    const incoming = [] as number[];
    for (let cell = 0; cell < size; cell++) {
      const receiver = model.flowDir[cell]!;
      if (model.riverClass[cell]! > 0 && receiver >= 0 && physical.bodyId[receiver] === body.nodeId)
        incoming.push(cell);
    }
    const write = writes?.get(body.outletCell);
    return {
      bodyId: body.nodeId,
      wetTileCount: body.wetCells.length,
      floor: body.floorElevation,
      surface: body.spillElevation,
      outletCell: body.outletCell,
      receiverCell: body.receiverCell,
      receiverGround: model.elevation[body.receiverCell]!,
      receiverClass: model.riverClass[body.receiverCell]!,
      outflow: body.outflow,
      classifiedInletCells: incoming,
      wetOutletWritePresent: writes === null ? null : write?.receiverCell === body.receiverCell,
    };
  });
  const classifiedOutlets = lakeOutlets.filter((outlet) => outlet.receiverClass > 0);
  return {
    units: "Tile counts and model elevation units; not km, metres, m3/s or native movement proof.",
    originalLand, exposedLand, nonMountainExposedLand,
    minorSources, majorSources,
    riverSourceFractionOfExposedLand: exposedLand ? (minorSources + majorSources) / exposedLand : 0,
    majorSourceFractionOfExposedLand: exposedLand ? majorSources / exposedLand : 0,
    lakeFractionOfOriginalLand: originalLand ? (originalLand - exposedLand) / originalLand : 0,
    bodyCount: physical.bodies.length,
    singleTileBodyCount: physical.bodies.filter((body) => body.wetCells.length === 1).length,
    bodySizes: distribution(physical.bodies.map((body) => body.wetCells.length)),
    dryHydraulicDrops: distribution(dryDrops),
    minorHydraulicDrops: distribution(minorDrops),
    majorHydraulicDrops: distribution(majorDrops),
    equalHeightDryReceivers, invalidDryReceivers, ascendingHydraulicReceivers,
    majorSegmentStarts, lakeOutlets, lowerAdjacentLakeBypasses,
    classifiedLakeOutletCount: classifiedOutlets.length,
    unauthoredClassifiedWetOutletCount: writes === null ? null
      : classifiedOutlets.filter((outlet) => !outlet.wetOutletWritePresent).length,
  };
}
