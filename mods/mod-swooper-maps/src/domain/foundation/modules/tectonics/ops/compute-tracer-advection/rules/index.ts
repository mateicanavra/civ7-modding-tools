import { quantizeUnitVec2I8 } from "@swooper/mapgen-core/lib/grid";
import { selectMeshNeighborByVectorProjection } from "@swooper/mapgen-core/lib/mesh";
import { ADVECTION_STEPS_PER_ERA } from "./constants.js";

type TracerMesh = {
  readonly cellCount: number;
  readonly wrapWidth: number;
  readonly siteX: ArrayLike<number>;
  readonly siteY: ArrayLike<number>;
  readonly neighborsOffsets: ArrayLike<number>;
  readonly neighbors: ArrayLike<number>;
};

function advectTracerIndex(params: {
  mesh: TracerMesh;
  boundaryDriftU: ArrayLike<number>;
  boundaryDriftV: ArrayLike<number>;
  mantleDriftU: ArrayLike<number>;
  mantleDriftV: ArrayLike<number>;
  steps: number;
}): Uint32Array {
  const cellCount = params.mesh.cellCount;
  const steps = Math.max(0, params.steps | 0);
  const out = new Uint32Array(cellCount);
  if (steps <= 0) {
    for (let i = 0; i < cellCount; i++) out[i] = i;
    return out;
  }

  for (let i = 0; i < cellCount; i++) {
    let driftU = params.boundaryDriftU[i] ?? 0;
    let driftV = params.boundaryDriftV[i] ?? 0;
    if (!driftU && !driftV) {
      driftU = params.mantleDriftU[i] ?? 0;
      driftV = params.mantleDriftV[i] ?? 0;
    }
    if (!driftU && !driftV) {
      out[i] = i;
      continue;
    }

    let cell = i;
    for (let step = 0; step < steps; step++) {
      cell = selectMeshNeighborByVectorProjection({
        cellId: cell,
        mesh: params.mesh,
        vectorX: -((driftU | 0) / 127),
        vectorY: -((driftV | 0) / 127),
      });
    }
    out[i] = cell;
  }

  return out;
}

/**
 * Reconstructs each era's source-cell index by advecting tracers through mantle and tectonic motion.
 * Arrays remain aligned by current mesh cell so provenance can follow lineage without spatial joins.
 */
export function computeTracerIndexByEra(params: {
  mesh: TracerMesh;
  mantleForcing: {
    readonly forcingU: ArrayLike<number>;
    readonly forcingV: ArrayLike<number>;
  };
  eras: readonly {
    readonly boundaryDriftU: ArrayLike<number>;
    readonly boundaryDriftV: ArrayLike<number>;
  }[];
  eraCount: number;
}): Uint32Array[] {
  const cellCount = params.mesh.cellCount;
  const mantleDriftU = new Int8Array(cellCount);
  const mantleDriftV = new Int8Array(cellCount);
  for (let i = 0; i < cellCount; i++) {
    const drift = quantizeUnitVec2I8(
      params.mantleForcing.forcingU[i] ?? 0,
      params.mantleForcing.forcingV[i] ?? 0
    );
    mantleDriftU[i] = drift.x;
    mantleDriftV[i] = drift.y;
  }

  const tracerIndex: Uint32Array[] = [];
  const tracerIdentity = new Uint32Array(cellCount);
  for (let i = 0; i < cellCount; i++) tracerIdentity[i] = i;
  tracerIndex.push(tracerIdentity);

  for (let era = 1; era < params.eraCount; era++) {
    const prevEra = params.eras[era - 1]!;
    tracerIndex.push(
      advectTracerIndex({
        mesh: params.mesh,
        boundaryDriftU: prevEra.boundaryDriftU,
        boundaryDriftV: prevEra.boundaryDriftV,
        mantleDriftU,
        mantleDriftV,
        steps: ADVECTION_STEPS_PER_ERA,
      })
    );
  }

  return tracerIndex;
}
