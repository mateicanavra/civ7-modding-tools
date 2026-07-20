import foundationOpsPublic from "@mapgen/domain/foundation/ops";

const {
  computeMantleForcing,
  computeMantlePotential,
  computeMesh,
  computePlateGraph,
  computePlateMotion,
} = foundationOpsPublic.ops;

type FoundationMesh = ReturnType<typeof computeMesh.run>["mesh"];
type FoundationPlateGraph = ReturnType<typeof computePlateGraph.run>["plateGraph"];
type FoundationMantleForcing = ReturnType<typeof computeMantleForcing.run>["mantleForcing"];
type FoundationPlateMotion = ReturnType<typeof computePlateMotion.run>["plateMotion"];

/**
 * Derives the deterministic mantle forcing consumed by Foundation lithosphere tests.
 * The helper preserves the production potential-to-forcing operation chain so tests
 * do not construct a parallel approximation of its intermediate evidence.
 */
export function deriveMantleForcing(
  mesh: FoundationMesh,
  rngSeed: number
): FoundationMantleForcing {
  const mantlePotential = computeMantlePotential.run(
    { mesh, rngSeed },
    computeMantlePotential.defaultConfig
  ).mantlePotential;
  return computeMantleForcing.run({ mesh, mantlePotential }, computeMantleForcing.defaultConfig)
    .mantleForcing;
}

/**
 * Derives plate motion through the production mantle operation chain.
 * Callers supply the admitted mesh and plate graph so each test still owns the
 * topology whose downstream behavior it is proving.
 */
export function derivePlateMotion(
  mesh: FoundationMesh,
  plateGraph: FoundationPlateGraph,
  rngSeed: number
): FoundationPlateMotion {
  const mantleForcing = deriveMantleForcing(mesh, rngSeed);
  return computePlateMotion.run(
    { mesh, plateGraph, mantleForcing },
    computePlateMotion.defaultConfig
  ).plateMotion;
}
