import type { StandardMapCapture } from "../../capture.js";

type Input = Readonly<{
  model: Pick<StandardMapCapture["model"], "physicalHydrology" | "riverClass" | "landMask" | "plannedLakeMask">;
  projection: Pick<StandardMapCapture["projection"], "navigableRivers">;
}>;

/** Observes reservoir-boundary exchange, never inventing one outlet per wet body. */
export function measureWetTransitions({ model, projection }: Input) {
  const physical = model.physicalHydrology;
  if (physical.model !== "certified-sill-spill") throw new Error("Expected completed basin evidence.");
  type Exchange = { bodyId: number; transportKind: "internal" | "external"; wetCell: number; adjacentCell: number; outwardDischarge: number };
  const exchanges: Exchange[] = [];
  for (const transfer of physical.transfers) {
    if (transfer.bodyA > 0 && transfer.bodyA !== transfer.bodyB) exchanges.push({ bodyId: transfer.bodyA, transportKind: "internal",
      wetCell: transfer.cellA, adjacentCell: transfer.cellB, outwardDischarge: transfer.signedDischarge });
    if (transfer.bodyB > 0 && transfer.bodyA !== transfer.bodyB) exchanges.push({ bodyId: transfer.bodyB, transportKind: "internal",
      wetCell: transfer.cellB, adjacentCell: transfer.cellA, outwardDischarge: -transfer.signedDischarge });
  }
  for (const port of physical.ports) if (port.kind === "adjacent" && physical.bodyId[port.fromCell]! > 0)
    exchanges.push({ bodyId: physical.bodyId[port.fromCell]!, transportKind: "external",
      wetCell: port.fromCell, adjacentCell: port.toCell, outwardDischarge: port.discharge });
  const eligible = (edge: Exchange) => edge.outwardDischarge > 0 && model.landMask[edge.adjacentCell] === 1 &&
    model.plannedLakeMask[edge.adjacentCell] === 0 && model.riverClass[edge.adjacentCell] === 2;
  const selected = new Map<number, Exchange>();
  for (const edge of exchanges.filter(eligible)) {
    const prior = selected.get(edge.wetCell);
    if (!prior || edge.outwardDischarge > prior.outwardDischarge ||
      (edge.outwardDischarge === prior.outwardDischarge && edge.adjacentCell < prior.adjacentCell)) selected.set(edge.wetCell, edge);
  }
  const projected = projection.navigableRivers;
  const writes = projected.model === "certified-sill-spill" ? projected.wetTransitionWrites : null;
  const dispositions = projected.model === "certified-sill-spill" ? projected.wetTransitionDispositions : null;
  let invalidWetTransitionWriteCount = 0, invalidWetTransitionDispositionCount = 0;
  const seenWrites = new Set<number>();
  for (const write of writes ?? []) {
    const edge = selected.get(write.sourceCell);
    if (!edge || seenWrites.has(write.sourceCell) || edge.bodyId !== write.bodyId || edge.adjacentCell !== write.receiverCell ||
      write.role !== "outlet" || write.riverClass !== "NAVIGABLE") invalidWetTransitionWriteCount++;
    seenWrites.add(write.sourceCell);
  }
  const missingWetTransitionWriteCount = [...selected.keys()].filter((cell) => !seenWrites.has(cell)).length;
  const key = (edge: Exchange) => `${edge.transportKind}:${edge.wetCell}:${edge.adjacentCell}`;
  const expected = new Map(exchanges.map((edge) => [key(edge), edge]));
  const seenDispositions = new Set<string>();
  for (const row of dispositions ?? []) {
    const edge = expected.get(key(row));
    const disposition = !edge || edge.outwardDischarge <= 0 ? "inward-or-zero" : !eligible(edge) ? "receiver-not-dry-nav"
      : selected.get(edge.wetCell) === edge ? "authored" : "same-source-secondary";
    if (!edge || seenDispositions.has(key(row)) || row.bodyId !== edge.bodyId || row.outwardDischarge !== edge.outwardDischarge ||
      row.disposition !== disposition) invalidWetTransitionDispositionCount++;
    seenDispositions.add(key(row));
  }
  const missingWetTransitionDispositionCount = [...expected.keys()].filter((edge) => !seenDispositions.has(edge)).length;
  return {
    exchanges, selected, writes,
    invalidWetTransitionWriteCount, missingWetTransitionWriteCount,
    invalidWetTransitionDispositionCount, missingWetTransitionDispositionCount,
    wetTransitionsComplete: writes !== null && dispositions !== null && invalidWetTransitionWriteCount === 0 &&
      missingWetTransitionWriteCount === 0 && invalidWetTransitionDispositionCount === 0 && missingWetTransitionDispositionCount === 0,
  };
}
