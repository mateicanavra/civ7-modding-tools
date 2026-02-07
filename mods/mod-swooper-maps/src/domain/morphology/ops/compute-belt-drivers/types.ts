export type BeltComponentSummary = {
  id: number;
  boundaryType: number;
  size: number;
  meanUpliftBlend: number;
  meanWidthScale: number;
  meanSigma: number;
  meanOriginEra: number;
  meanOriginPlateId: number;
};

export type BeltDriverOutputs = {
  boundaryCloseness: Uint8Array;
  boundaryType: Uint8Array;
  upliftPotential: Uint8Array;
  collisionPotential: Uint8Array;
  subductionPotential: Uint8Array;
  riftPotential: Uint8Array;
  tectonicStress: Uint8Array;
  /**
   * Normalized belt age proxy (0..255).
   *
   * 0 = youngest/most recently active, 255 = oldest/least recently active.
   */
  beltAge: Uint8Array;
  /**
   * Dominant tectonic era index for this tile (0..eraCount-1).
   *
   * Computed from the era whose (weight * max(uplift, rift, shear)) is largest.
   */
  dominantEra: Uint8Array;
  beltMask: Uint8Array;
  beltDistance: Uint8Array;
  beltNearestSeed: Int32Array;
  beltComponents: BeltComponentSummary[];
};
