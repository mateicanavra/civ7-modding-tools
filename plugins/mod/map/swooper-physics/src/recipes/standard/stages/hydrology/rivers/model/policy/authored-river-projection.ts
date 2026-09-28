import type { RiverDirection } from "@civ7/adapter";
import type { ArtifactReadValueOf } from "@swooper/mapgen-core/authoring";
import type { artifact as lakePlanArtifact } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/lake-plan.artifact.js";

type CertifiedLakePlan = Extract<ArtifactReadValueOf<typeof lakePlanArtifact>, { model: "certified-sill-spill" }>;

/** Converts one physical adjacent receiver into the adapter's geographic symbols. */
export function riverDirectionToReceiver(width: number, height: number, sourceCell: number, receiverCell: number): RiverDirection {
  const size = width * height;
  if (!Number.isInteger(sourceCell) || !Number.isInteger(receiverCell) || sourceCell < 0 || receiverCell < 0 || sourceCell >= size || receiverCell >= size || sourceCell === receiverCell) {
    throw new Error(`Invalid authored river edge ${sourceCell}->${receiverCell}.`);
  }
  const x = sourceCell % width;
  const y = Math.floor(sourceCell / width);
  const parity = y % 2;
  // Civ7's north is increasing Y. Grid helper iteration positions are not native directions.
  const neighbors: readonly (readonly [RiverDirection, number, number])[] = [
    ["EAST", 1, 0], ["NORTHEAST", parity, 1], ["NORTHWEST", parity - 1, 1],
    ["WEST", -1, 0], ["SOUTHWEST", parity - 1, -1], ["SOUTHEAST", parity, -1],
  ];
  for (const [direction, dx, dy] of neighbors) {
    const nextY = y + dy;
    if (nextY < 0 || nextY >= height) continue;
    const nextX = (x + dx + width) % width;
    if (nextY * width + nextX === receiverCell) return direction;
  }
  throw new Error(`Nonadjacent authored river edge ${sourceCell}->${receiverCell}.`);
}

/** Lossless dry lowering plus qualified wet outlet declarations; never reroutes or promotes a class. */
export function projectAuthoredRiverNetwork(input: Readonly<{
  width: number;
  height: number;
  landMask: ArrayLike<number>;
  lakePlan: Pick<CertifiedLakePlan, "lakeMask" | "bodyId" | "bodies" | "certificates">;
  acceptedLakeMask: ArrayLike<number>;
  riverClass: ArrayLike<number>;
  flowDir: ArrayLike<number>;
}>) {
  const { width, height } = input;
  const size = width * height;
  const { lakeMask, bodyId, bodies, certificates } = input.lakePlan;
  for (const key of ["landMask", "acceptedLakeMask", "riverClass", "flowDir"] as const) {
    if (input[key].length !== size) throw new Error(`Authored river ${key} must cover the map.`);
  }
  if (lakeMask.length !== size || bodyId.length !== size) throw new Error("Authored river lake plan must cover the map.");
  const plannedMinorRiverMask = new Uint8Array(size);
  const plannedMajorRiverMask = new Uint8Array(size);
  const writes: { sourceCell: number; receiverCell: number; direction: RiverDirection; riverClass: "MINOR" | "NAVIGABLE" }[] = [];
  let plannedMinorRiverTileCount = 0;
  let plannedMajorRiverTileCount = 0;
  for (let sourceCell = 0; sourceCell < size; sourceCell++) {
    const riverClass = input.riverClass[sourceCell];
    if (riverClass === 0) continue;
    if (riverClass !== 1 && riverClass !== 2) throw new Error(`Invalid physical river class at ${sourceCell}.`);
    if (input.landMask[sourceCell] !== 1 || lakeMask[sourceCell] !== 0) {
      throw new Error(`Authored river source ${sourceCell} must be exposed land; wet connectivity is not a classified dry source.`);
    }
    const receiverCell = input.flowDir[sourceCell]!;
    const direction = riverDirectionToReceiver(width, height, sourceCell, receiverCell);
    if (riverClass === 1) {
      plannedMinorRiverMask[sourceCell] = 1;
      plannedMinorRiverTileCount++;
    } else {
      plannedMajorRiverMask[sourceCell] = 1;
      plannedMajorRiverTileCount++;
    }
    writes.push({ sourceCell, receiverCell, direction, riverClass: riverClass === 1 ? "MINOR" : "NAVIGABLE" });
  }
  const wetTransitionWrites: { bodyId: number; role: "outlet"; sourceCell: number; receiverCell: number;
    direction: RiverDirection; riverClass: "NAVIGABLE" }[] = [];
  const represented = new Uint8Array(size);
  const seenBodies = new Set<number>();
  const certifiedBodies = new Set<number>();
  for (const certificate of certificates) {
    if (!Number.isInteger(certificate.nodeId) || certificate.nodeId <= 0 || certifiedBodies.has(certificate.nodeId)
      || !Number.isFinite(certificate.spillBalance) || certificate.spillBalance <= 0) {
      throw new Error("Authored wet outlets require unique positive body certificates.");
    }
    certifiedBodies.add(certificate.nodeId);
  }
  for (let cell = 0; cell < size; cell++) {
    if ((lakeMask[cell] !== 0 && lakeMask[cell] !== 1) || input.acceptedLakeMask[cell] !== lakeMask[cell]) {
      throw new Error(`Authored wet outlets require the complete accepted physical lake footprint at ${cell}.`);
    }
    if (lakeMask[cell] === 1 && input.landMask[cell] !== 1) {
      throw new Error(`Authored wet outlet footprint ${cell} must be original land, never marine.`);
    }
  }
  for (const body of bodies) {
    if (!certifiedBodies.has(body.nodeId) || seenBodies.has(body.nodeId) || body.wetCells.length === 0) {
      throw new Error(`Authored wet outlet body ${body.nodeId} must have a unique certified footprint.`);
    }
    seenBodies.add(body.nodeId);
    for (const cell of body.wetCells) {
      if (!Number.isInteger(cell) || cell < 0 || cell >= size || represented[cell] === 1
        || lakeMask[cell] !== 1 || bodyId[cell] !== body.nodeId) {
        throw new Error(`Authored wet outlet body ${body.nodeId} does not partition its physical footprint.`);
      }
      represented[cell] = 1;
    }
    if (!body.wetCells.includes(body.outletCell) || body.wetCells.includes(body.receiverCell)
      || input.flowDir[body.outletCell] !== body.receiverCell) {
      throw new Error(`Authored wet outlet body ${body.nodeId} contradicts its recorded receiver edge.`);
    }
    const direction = riverDirectionToReceiver(width, height, body.outletCell, body.receiverCell);
    if (!Number.isFinite(body.outflow) || body.outflow < 0) throw new Error(`Invalid body ${body.nodeId} outflow.`);
    // MINOR, unclassified, marine and direct wet receivers are not qualified NAV outlet regimes.
    if (body.outflow === 0 || input.landMask[body.receiverCell] !== 1 || lakeMask[body.receiverCell] !== 0
      || input.riverClass[body.receiverCell] !== 2) continue;
    wetTransitionWrites.push({ bodyId: body.nodeId, role: "outlet", sourceCell: body.outletCell,
      receiverCell: body.receiverCell, direction, riverClass: "NAVIGABLE" });
  }
  for (let cell = 0; cell < size; cell++) {
    if (represented[cell] !== lakeMask[cell] || (lakeMask[cell] === 0 && bodyId[cell] !== 0)) {
      throw new Error(`Authored wet outlet bodies must completely partition the physical lake footprint at ${cell}.`);
    }
  }
  wetTransitionWrites.sort((left, right) => left.sourceCell - right.sourceCell);
  return {
    model: "certified-sill-spill" as const,
    width, height,
    riverMask: Uint8Array.from(plannedMajorRiverMask),
    nativeMinorRiverMask: Uint8Array.from(plannedMinorRiverMask),
    plannedMinorRiverMask, plannedMajorRiverMask,
    plannedMinorRiverTileCount, plannedMajorRiverTileCount,
    authoredSourceCount: writes.length,
    writes,
    wetTransitionWrites,
  };
}
