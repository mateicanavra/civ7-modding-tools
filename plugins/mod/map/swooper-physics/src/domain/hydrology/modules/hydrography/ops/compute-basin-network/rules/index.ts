import { getHexNeighborIndicesOddQ } from "@swooper/mapgen-core/lib/grid";
import { requireValid, type NetworkInput } from "./types.js";
import { validateExternalWaterBoundary, validateNetworkInput } from "./validate.js";
import { solvePools } from "./solve.js";
import { assembleNetwork } from "./assemble.js";

/** Validates geometry and forcing, resolves pools, and assembles a full ledger only for supported responses. */
export function computeBasinNetwork(input: NetworkInput) {
  const size = input.width * input.height;
  requireValid(Number.isSafeInteger(input.width) && input.width > 0 && Number.isSafeInteger(input.height) && input.height > 0 && Number.isSafeInteger(size) && size > 0 && size <= 0x7fffffff && size === input.elevation.length, "grid cardinality");
  const neighbors = Array.from({ length: size }, (_, cell) => getHexNeighborIndicesOddQ(cell % input.width, Math.floor(cell / input.width), input.width, input.height));
  const witness = validateExternalWaterBoundary(input, neighbors);
  if (witness) return { status: "unsupported-external-inundation" as const, witness };
  validateNetworkInput(input, neighbors);
  const solved = solvePools(input, neighbors);
  for (const pool of solved.pools) if (pool.response.state === "no-stationary-solution") {
    return { status: "no-stationary-solution" as const, witness: { kind: "persistent-surplus" as const, leafIds: pool.leaves, catchmentCells: pool.cells, response: pool.response } };
  }
  return { status: "supported" as const, plan: assembleNetwork(input, neighbors, solved) };
}
