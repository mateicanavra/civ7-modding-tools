import {
  collectMaskComponentsOddQ,
  getHexRadiusIndicesOddQ,
} from "@swooper/mapgen-core/lib/grid";

/**
 * Labels optimistic first-age transit and individually useful land envelopes.
 * An envelope's budget belongs to one landmass, never a sum of tiny islands.
 * SDK adjacency is Civ7 odd-R with X wrap despite its legacy OddQ name.
 */
export function buildExpansionConnectivity(args: {
  width: number;
  height: number;
  usableLandMask: ArrayLike<number>;
  landmassIdByTile: ArrayLike<number>;
  firstAgeTransitMask: ArrayLike<number>;
  expansionRadiusTiles: number;
  minExpansionLandTiles: number;
}) {
  const size = args.width * args.height;
  const componentByTile = new Int32Array(size).fill(-1);
  const components = collectMaskComponentsOddQ({
    width: args.width,
    height: args.height,
    mask: args.firstAgeTransitMask,
  });
  for (const component of components) {
    for (const cell of component.indices) componentByTile[cell] = component.id;
  }

  const expansionLandTilesByTile = new Uint16Array(size);
  const usefulComponents = new Set<number>();
  for (let cell = 0; cell < size; cell++) {
    if (args.usableLandMask[cell] !== 1) continue;
    const landmassId = args.landmassIdByTile[cell] ?? -1;
    if (landmassId < 0) continue;
    let count = 0;
    for (const neighbor of getHexRadiusIndicesOddQ(
      cell,
      args.width,
      args.height,
      args.expansionRadiusTiles
    )) {
      if (
        args.usableLandMask[neighbor] === 1 &&
        args.landmassIdByTile[neighbor] === landmassId &&
        componentByTile[neighbor] === componentByTile[cell]
      ) {
        count++;
      }
    }
    expansionLandTilesByTile[cell] = count;
    const component = componentByTile[cell]!;
    if (component >= 0 && count >= args.minExpansionLandTiles) usefulComponents.add(component);
  }
  return { componentByTile, expansionLandTilesByTile, usefulComponents };
}

/** Counts nearby land only when it shares the candidate's projected transit component. */
export function countReachableClusterLand(args: {
  center: number;
  width: number;
  height: number;
  radius: number;
  landMask: ArrayLike<number>;
  componentByTile: ArrayLike<number>;
}): number {
  const component = args.componentByTile[args.center] ?? -1;
  if (component < 0) return 0;
  let count = 0;
  for (const cell of getHexRadiusIndicesOddQ(args.center, args.width, args.height, args.radius)) {
    if (args.landMask[cell] === 1 && args.componentByTile[cell] === component) count++;
  }
  return count;
}
