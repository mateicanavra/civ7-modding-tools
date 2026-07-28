type CurrentTectonics = {
  boundaryType: Uint8Array;
  upliftPotential: Uint8Array;
  riftPotential: Uint8Array;
  shearStress: Uint8Array;
  volcanism: Uint8Array;
  fracture: Uint8Array;
  cumulativeUplift: Uint8Array;
};

type CurrentEraInput = {
  readonly boundaryType: ArrayLike<number>;
  readonly upliftPotential: ArrayLike<number>;
  readonly riftPotential: ArrayLike<number>;
  readonly shearStress: ArrayLike<number>;
  readonly volcanism: ArrayLike<number>;
  readonly fracture: ArrayLike<number>;
};
/**
 * Combines the newest reconstructed era with cumulative uplift into present-day tectonic evidence.
 * Fresh arrays give the mutable operation result independent ownership before its eventual
 * write-once artifact publication, without mutating or exposing the observed history inputs.
 */
export function buildTectonicsCurrent(params: {
  newestEra: CurrentEraInput;
  upliftTotal: ArrayLike<number>;
}): CurrentTectonics {
  return {
    boundaryType: Uint8Array.from(params.newestEra.boundaryType),
    upliftPotential: Uint8Array.from(params.newestEra.upliftPotential),
    riftPotential: Uint8Array.from(params.newestEra.riftPotential),
    shearStress: Uint8Array.from(params.newestEra.shearStress),
    volcanism: Uint8Array.from(params.newestEra.volcanism),
    fracture: Uint8Array.from(params.newestEra.fracture),
    cumulativeUplift: Uint8Array.from(params.upliftTotal),
  };
}
