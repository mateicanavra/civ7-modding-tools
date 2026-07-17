import type { StandardMapCapture } from "../capture.js";

/** Player-seat assignment measurements paired with the selected map's player demand. */
export type StandardPlacementMetrics = Readonly<{
  expectedPlayers: number;
  status: StandardMapCapture["placement"]["status"];
  assigned: number;
  unseatedCount: number;
  rungCounts: StandardMapCapture["placement"]["rungCounts"];
  primaryAssigned: number;
  islandClusterAssigned: number;
  marginalAssigned: number;
  noneAssigned: number;
  candidateCount: number;
}>;

/** Projects validated start-assignment evidence without inventing deprecated assignment kinds. */
export function measureStandardPlacement(capture: StandardMapCapture): StandardPlacementMetrics {
  return Object.freeze({
    expectedPlayers: capture.provenance.playerCount,
    ...capture.placement,
  });
}
