export type TectonicHistorySourceTiles = Readonly<{
  eraCount: number;
  perEra: ReadonlyArray<
    Readonly<{
      boundaryType: Uint8Array;
      upliftPotential: Uint8Array;
      collisionPotential: Uint8Array;
      subductionPotential: Uint8Array;
      riftPotential: Uint8Array;
      shearStress: Uint8Array;
    }>
  >;
  rollups: Readonly<{
    upliftTotal: Uint8Array;
    collisionTotal: Uint8Array;
    subductionTotal: Uint8Array;
    upliftRecentFraction: Uint8Array;
    collisionRecentFraction: Uint8Array;
    subductionRecentFraction: Uint8Array;
    lastActiveEra: Uint8Array;
  }>;
}>;

export type TectonicProvenanceSourceTiles = Readonly<{
  originEra: Uint8Array;
  originPlateId: Int16Array;
  lastBoundaryType: Uint8Array;
}>;
