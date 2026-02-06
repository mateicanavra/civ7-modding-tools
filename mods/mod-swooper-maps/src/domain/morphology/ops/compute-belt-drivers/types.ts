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
  riftPotential: Uint8Array;
  tectonicStress: Uint8Array;
  beltMask: Uint8Array;
  beltDistance: Uint8Array;
  beltNearestSeed: Int32Array;
  beltComponents: BeltComponentSummary[];
};

