/**
 * Creates empty Foundation history and provenance evidence for belt-driver behavior tests.
 * Sentinels match the published Foundation artifacts so each test can author only the
 * boundary history relevant to its Morphology oracle.
 */
export function createBeltDriverEvidence(width: number, height: number, eraCount: number) {
  const size = width * height;
  const perEra = Array.from({ length: eraCount }, () => ({
    boundaryType: new Uint8Array(size),
    upliftPotential: new Uint8Array(size),
    collisionPotential: new Uint8Array(size),
    subductionPotential: new Uint8Array(size),
    riftPotential: new Uint8Array(size),
    shearStress: new Uint8Array(size),
  }));
  const rollups = {
    upliftTotal: new Uint8Array(size),
    collisionTotal: new Uint8Array(size),
    subductionTotal: new Uint8Array(size),
    upliftRecentFraction: new Uint8Array(size),
    collisionRecentFraction: new Uint8Array(size),
    subductionRecentFraction: new Uint8Array(size),
    lastActiveEra: new Uint8Array(size),
  };
  rollups.lastActiveEra.fill(255);

  const provenanceTiles = {
    originEra: new Uint8Array(size),
    originPlateId: new Int16Array(size),
    lastBoundaryType: new Uint8Array(size),
  };
  provenanceTiles.lastBoundaryType.fill(255);
  provenanceTiles.originPlateId.fill(-1);

  return {
    historyTiles: { eraCount, perEra, rollups },
    provenanceTiles,
  };
}
