import type { RiverDirection } from "@civ7/adapter";
import type { ArtifactReadValueOf } from "@swooper/mapgen-core/authoring";
import type { artifacts as hydrographyArtifacts } from "../../../../../../../domain/hydrology/modules/hydrography/artifacts/index.js";
import { riverDirectionToReceiver } from "../../../../../../../domain/hydrology/modules/hydrography/model/policy/river-direction.js";

type CertifiedLakePlan = Extract<ArtifactReadValueOf<typeof hydrographyArtifacts.lakePlan>, { model: "certified-sill-spill" }>;

/** Principal channels and positive hydraulic exchanges, without inventing a body outlet. */
export function projectAuthoredRiverNetwork(input: Readonly<{
  width: number;
  height: number;
  landMask: ArrayLike<number>;
  lakePlan: Pick<CertifiedLakePlan, "lakeMask" | "bodyId" | "bodies" | "componentId" | "transfers" | "ports">;
  acceptedLakeMask: ArrayLike<number>;
  riverClass: ArrayLike<number>;
  flowDir: ArrayLike<number>;
}>) {
  const { width, height } = input;
  const size = width * height;
  const { lakeMask, bodyId, bodies, componentId, transfers, ports } = input.lakePlan;
  for (const key of ["landMask", "acceptedLakeMask", "riverClass", "flowDir"] as const) {
    if (input[key].length !== size) throw new Error(`Authored river ${key} must cover the map.`);
  }
  if (lakeMask.length !== size || bodyId.length !== size || componentId.length !== size) throw new Error("Authored river lake plan must cover the map.");
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
  for (let cell = 0; cell < size; cell++) {
    if ((lakeMask[cell] !== 0 && lakeMask[cell] !== 1) || input.acceptedLakeMask[cell] !== lakeMask[cell]) {
      throw new Error(`Authored wet outlets require the complete accepted physical lake footprint at ${cell}.`);
    }
    if (lakeMask[cell] === 1 && input.landMask[cell] !== 1) {
      throw new Error(`Authored wet outlet footprint ${cell} must be original land, never marine.`);
    }
  }
  for (const body of bodies) {
    if (!Number.isInteger(body.bodyId) || body.bodyId <= 0 || seenBodies.has(body.bodyId) || body.wetCells.length === 0) {
      throw new Error(`Authored wet outlet body ${body.bodyId} must have a unique certified footprint.`);
    }
    seenBodies.add(body.bodyId);
    for (const cell of body.wetCells) {
      if (!Number.isInteger(cell) || cell < 0 || cell >= size || represented[cell] === 1
        || lakeMask[cell] !== 1 || bodyId[cell] !== body.bodyId || componentId[cell] !== body.componentId) {
        throw new Error(`Authored wet outlet body ${body.bodyId} does not partition its physical footprint.`);
      }
      represented[cell] = 1;
    }
  }
  for (let cell = 0; cell < size; cell++) {
    if (represented[cell] !== lakeMask[cell] || (lakeMask[cell] === 0 && bodyId[cell] !== 0)) {
      throw new Error(`Authored wet outlet bodies must completely partition the physical lake footprint at ${cell}.`);
    }
  }
  type Disposition = {
    bodyId: number;
    transportKind: "internal" | "external";
    wetCell: number;
    adjacentCell: number;
    outwardDischarge: number;
    disposition: "authored" | "inward-or-zero" | "receiver-not-dry-nav" | "same-source-secondary";
  };
  const wetTransitionDispositions: Disposition[] = [];
  const candidates = new Map<number, Disposition[]>();
  const seenEdges = new Set<string>();
  const inspect = (transportKind: "internal" | "external", wetCell: number, adjacentCell: number, outwardDischarge: number) => {
    riverDirectionToReceiver(width, height, wetCell, adjacentCell);
    if (!Number.isFinite(outwardDischarge) || lakeMask[wetCell] !== 1 || !seenBodies.has(bodyId[wetCell]!)) {
      throw new Error("Wet transitions require a finite physical exchange and a represented body.");
    }
    const key = `${transportKind}:${wetCell}:${adjacentCell}`;
    if (seenEdges.has(key)) throw new Error("Duplicate physical wet transition.");
    seenEdges.add(key);
    const row: Disposition = { bodyId: bodyId[wetCell]!, transportKind, wetCell, adjacentCell, outwardDischarge,
      disposition: outwardDischarge <= 0 ? "inward-or-zero" : "receiver-not-dry-nav" };
    wetTransitionDispositions.push(row);
    if (outwardDischarge > 0 && input.landMask[adjacentCell] === 1 && lakeMask[adjacentCell] === 0
      && input.riverClass[adjacentCell] === 2) {
      const sameSource = candidates.get(wetCell) ?? [];
      sameSource.push(row);
      candidates.set(wetCell, sameSource);
    }
  };
  for (const transfer of transfers) {
    const { cellA, cellB, bodyA, bodyB, signedDischarge } = transfer;
    riverDirectionToReceiver(width, height, cellA, cellB);
    if (cellA >= cellB || !Number.isFinite(signedDischarge)
      || bodyId[cellA] !== bodyA || bodyId[cellB] !== bodyB
      || componentId[cellA] !== transfer.componentId || componentId[cellB] !== transfer.componentId) {
      throw new Error("Hydraulic transfer endpoints contradict their canonical component/body memberships.");
    }
    if (bodyA && bodyA !== bodyB) inspect("internal", cellA, cellB, signedDischarge);
    if (bodyB && bodyA !== bodyB) inspect("internal", cellB, cellA, -signedDischarge);
  }
  for (const port of ports) {
    if (componentId[port.fromCell] !== port.componentId || !Number.isFinite(port.discharge) || port.discharge < 0) {
      throw new Error("External hydraulic port contradicts its source component or discharge.");
    }
    if (port.kind === "boundary-export") continue;
    riverDirectionToReceiver(width, height, port.fromCell, port.toCell);
    if (lakeMask[port.fromCell] === 1) inspect("external", port.fromCell, port.toCell, port.discharge);
  }
  for (const [sourceCell, rows] of candidates) {
    rows.sort((a, b) => b.outwardDischarge - a.outwardDischarge || a.adjacentCell - b.adjacentCell
      || a.transportKind.localeCompare(b.transportKind));
    rows.forEach((row, index) => { row.disposition = index === 0 ? "authored" : "same-source-secondary"; });
    const selected = rows[0]!;
    const receiverCell = selected.adjacentCell;
    wetTransitionWrites.push({ bodyId: selected.bodyId, role: "outlet", sourceCell, receiverCell,
      direction: riverDirectionToReceiver(width, height, sourceCell, receiverCell), riverClass: "NAVIGABLE" });
  }
  wetTransitionWrites.sort((left, right) => left.sourceCell - right.sourceCell);
  wetTransitionDispositions.sort((a, b) => a.wetCell - b.wetCell || a.adjacentCell - b.adjacentCell
    || a.transportKind.localeCompare(b.transportKind));
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
    wetTransitionDispositions,
  };
}
