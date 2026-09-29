import type { BasinPool, BasinPort, BasinInternalTransfer, BasinTerminal } from "../../../../../src/domain/hydrology/modules/hydrography/model/atoms/basin-network.schema.js";
import type { StandardBasinNetworkMeasurementInput } from "../../../../../src/recipes/standard/metrics/families/hydrology/basin-network.js";

export function basinCapture() {
  const flux = { dryRunoff: 2, incomingOverflow: 0, wetPrecipitation: 10, wetDemand: 1, balance: 11 };
  return {
    provenance: { width: 3, height: 1 },
    model: {
      seaLevel: 0,
      landMask: Uint8Array.of(0, 1, 1), elevation: Int16Array.of(-1, 2, 0),
      plannedLakeMask: Uint8Array.of(0, 0, 1), riverClass: Uint8Array.of(0, 2, 0),
      flowDir: Int32Array.of(-1, 0, -2), terminalType: Uint8Array.of(0, 1, 1),
      mountainMask: new Uint8Array(3), volcanoMask: new Uint8Array(3), baselineRainfall: Uint8Array.of(0, 10, 10),
      physicalHydrology: {
        model: "certified-sill-spill" as const,
        runoff: [0, 2, 3], discharge: [0, 11, 0], potentialDemand: Float32Array.of(0, 1, 1),
        bodyId: Int32Array.of(0, 0, 3), componentId: Int32Array.of(0, 2, 2), basinId: Int32Array.of(-1, 2, 2),
        waterSurface: [-1, 2, 2], mouthBodyId: new Int32Array(3),
        pools: [{ poolId: 1, componentId: 2, leafIds: [1], catchmentCells: [1, 2], wetCells: [2],
          level: 2, state: "open", flux: { ...flux }, outflow: 11, unresolvedResidual: 0, closure: null }] as BasinPool[],
        bodies: [{ bodyId: 3, componentId: 2, poolId: 1, wetCells: [2], level: 2,
          flux: { ...flux, dryRunoff: 0, balance: 9 }, outflow: 9, unresolvedResidual: 0 }],
        components: [{ componentId: 2, poolId: 1, bodyIds: [3], memberCells: [1, 2], junctionCells: [1],
          anchorCell: 1, level: 2, state: "open" as BasinPool["state"], flux: { ...flux }, outflow: 11, unresolvedResidual: 0, terminalId: 2 }],
        transfers: [{ componentId: 2, cellA: 1, cellB: 2, bodyA: 0, bodyB: 3, signedDischarge: -9 }] as BasinInternalTransfer[],
        ports: [{ kind: "adjacent", componentId: 2, fromCell: 1, toCell: 0, destination: "marine", destinationComponentId: 0, discharge: 11 }] as BasinPort[],
        terminals: [{ terminalId: 2, role: "marine", anchorCell: 1, componentId: 2 }] as BasinTerminal[],
        marineExits: [{ fromCell: 1, marineCell: 0, discharge: 11 }],
        boundaryExits: [] as { fromCell: number; side: "north" | "south"; discharge: number }[],
        conservation: { dryRunoff: 2, wetPrecipitation: 10, wetDemand: 1, marineDischarge: 11, boundaryDischarge: 0,
          externalDischarge: 11, unresolvedResidual: 0, normalizedUnresolvedResidual: 0, residual: 0, roundoffBound: 1e-13 },
      },
    },
    projection: {
      lakes: { version: 1 as const, plannedLakeTileCount: 1, stampedLakeTileCount: 1, morphologyProtectedLakeTileCount: 0,
        isolatedFragmentProtectedLakeTileCount: 0, rejectedLakeTileCount: 0, nonLakeTileCount: 0, terrainMismatchTileCount: 0,
        components: { componentCount: 1, largestComponentSize: 1, maximumComponentDiameter: 0, singleTileComponentCount: 1 } },
      navigableRivers: {
        model: "certified-sill-spill" as const, authoredSourceCount: 1, plannedMinorRiverTileCount: 0, plannedMajorRiverTileCount: 1,
        writes: [{ sourceCell: 1, receiverCell: 0, direction: "WEST" as const, riverClass: "NAVIGABLE" as "NAVIGABLE" | "MINOR" }],
        wetTransitionWrites: [{ bodyId: 3, role: "outlet" as const, sourceCell: 2, receiverCell: 1,
          direction: "WEST" as const, riverClass: "NAVIGABLE" as const }],
        wetTransitionDispositions: [{ bodyId: 3, transportKind: "internal" as const, wetCell: 2, adjacentCell: 1,
          outwardDischarge: 9, disposition: "authored" as "authored" | "inward-or-zero" | "receiver-not-dry-nav" | "same-source-secondary" }],
      },
      riverReadback: { terrainNavigableRiverTileCount: 1, riverMismatchCount: 0, selectedRiverRejectedCount: 0,
        extraEngineRiverCount: 0, minorRiverMismatchCount: 0, navigableMetadataMismatchCount: 0 },
    },
    observation: { isLake: Uint8Array.of(0, 0, 1), isWater: Uint8Array.of(1, 0, 1), terrain: Int32Array.of(4, 2, 3), coastTerrain: 3 },
  } satisfies StandardBasinNetworkMeasurementInput & { model: { seaLevel: number } };
}

export function quantizedCapture() {
  const capture = basinCapture();
  const flux = { incomingOverflow: 0, dryRunoff: 2, wetPrecipitation: 10, wetDemand: 9, balance: 3 };
  capture.provenance.width = 4;
  Object.assign(capture.model, {
    landMask: Uint8Array.of(0, 1, 1, 1), elevation: Int16Array.of(-1, 4, 0, 2),
    plannedLakeMask: Uint8Array.of(0, 0, 1, 0), riverClass: new Uint8Array(4),
    flowDir: Int32Array.of(-1, 2, -2, 2), terminalType: Uint8Array.of(0, 3, 3, 3),
    mountainMask: new Uint8Array(4), volcanoMask: new Uint8Array(4), baselineRainfall: Uint8Array.of(0, 0, 10, 0),
  });
  Object.assign(capture.model.physicalHydrology, {
    runoff: [0, 1, 1, 1], discharge: [0, 1, 0, 1], potentialDemand: Float32Array.of(0, 0, 9, 5),
    bodyId: Int32Array.of(0, 0, 3, 0), componentId: Int32Array.of(0, 0, 3, 0), basinId: Int32Array.of(-1, 3, 3, 3),
    waterSurface: [-1, 4, 2, 2], mouthBodyId: new Int32Array(4),
  });
  const physical = capture.model.physicalHydrology;
  physical.pools = [{ poolId: 1, componentId: 3, leafIds: [1], catchmentCells: [1, 2, 3], wetCells: [2], level: 2,
    state: "closed", flux: { ...flux }, outflow: 0, unresolvedResidual: 3,
    closure: { resolution: "shoreline-quantization", level: 2, cohortCells: [3], before: { ...flux },
      after: { ...flux, dryRunoff: 1, wetDemand: 14, balance: -3 }, jumpMagnitude: 6, unresolvedResidual: 3 } }];
  physical.bodies = [{ bodyId: 3, componentId: 3, poolId: 1, wetCells: [2], level: 2,
    flux: { ...flux, incomingOverflow: 2, dryRunoff: 0 }, outflow: 0, unresolvedResidual: 3 }];
  physical.components = [{ componentId: 3, poolId: 1, bodyIds: [3], memberCells: [2], junctionCells: [], anchorCell: 2,
    level: 2, state: "closed", flux: { ...physical.bodies[0]!.flux }, outflow: 0, unresolvedResidual: 3, terminalId: 3 }];
  physical.transfers = []; physical.ports = []; physical.marineExits = [];
  physical.terminals = [{ terminalId: 3, role: "closed-wet", anchorCell: 2, componentId: 3 }];
  physical.conservation = { ...physical.conservation, wetDemand: 9, marineDischarge: 0, externalDischarge: 0,
    unresolvedResidual: 3, normalizedUnresolvedResidual: 3 / 12 };
  Object.assign(capture.projection.navigableRivers, { authoredSourceCount: 0, plannedMajorRiverTileCount: 0,
    writes: [], wetTransitionWrites: [], wetTransitionDispositions: [] });
  capture.projection.riverReadback.terrainNavigableRiverTileCount = 0;
  capture.observation.isLake = Uint8Array.of(0, 0, 1, 0);
  capture.observation.isWater = Uint8Array.of(1, 0, 1, 0);
  capture.observation.terrain = Int32Array.of(4, 2, 3, 2);
  return capture;
}
