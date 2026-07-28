export type OrogenyPotentialPolicy = Readonly<{
  orogenyCollisionStressWeight: number;
  orogenyCollisionUpliftWeight: number;
  orogenyTransformStressWeight: number;
  orogenyDivergentRiftWeight: number;
  orogenyDivergentStressWeight: number;
}>;

export type MountainScorePolicy = OrogenyPotentialPolicy &
  Readonly<{
    tectonicIntensity: number;
    boundaryWeight: number;
    convergenceBonus: number;
    upliftWeight: number;
    fractalWeight: number;
    riftPenalty: number;
    transformPenalty: number;
    interiorPenaltyWeight: number;
    mountainFractalScale: number;
    mountainInteriorUpliftScale: number;
    mountainCollisionStressWeight: number;
    mountainCollisionUpliftWeight: number;
    mountainSubductionUpliftWeight: number;
    mountainConvergenceFractalBase: number;
    mountainConvergenceFractalSpan: number;
    riftDepth: number;
  }>;

export type HillScorePolicy = OrogenyPotentialPolicy &
  Readonly<{
    tectonicIntensity: number;
    fractalWeight: number;
    hillBoundaryWeight: number;
    hillConvergentFoothill: number;
    hillUpliftWeight: number;
    hillFractalScale: number;
    hillFoothillBase: number;
    hillFoothillFractalGain: number;
    hillRiftBonus: number;
    hillRiftBonusScale: number;
    hillUpliftScale: number;
    hillRiftDepthScale: number;
    hillInteriorFalloff: number;
    riftDepth: number;
  }>;

export type FracturePotentialPolicy = Readonly<{
  fractureBoundaryWeight: number;
  fractureStressWeight: number;
  fractureRiftWeight: number;
}>;
