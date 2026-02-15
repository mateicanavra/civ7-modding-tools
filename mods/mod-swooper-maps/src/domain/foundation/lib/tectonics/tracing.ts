import type { FoundationMantleForcing } from "../../ops/compute-mantle-forcing/contract.js";
import type { FoundationMesh } from "../../ops/compute-mesh/contract.js";
import type { FoundationTectonicEraFieldsInternal } from "./internal-contract.js";

import { ADVECTION_STEPS_PER_ERA } from "./constants.js";
import { chooseDriftNeighbor, normalizeToInt8 } from "./shared.js";

function advectTracerIndex(params: {
  mesh: FoundationMesh;
  boundaryDriftU: Int8Array;
  boundaryDriftV: Int8Array;
  mantleDriftU: Int8Array;
  mantleDriftV: Int8Array;
  steps: number;
}): Uint32Array {
  const cellCount = params.mesh.cellCount | 0;
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
      cell = chooseDriftNeighbor({
        cellId: cell,
        driftU: -(driftU | 0),
        driftV: -(driftV | 0),
        mesh: params.mesh,
      });
    }
    out[i] = cell;
  }

  return out;
}

export function computeTracerIndexByEra(params: {
  mesh: FoundationMesh;
  mantleForcing: FoundationMantleForcing;
  eras: ReadonlyArray<FoundationTectonicEraFieldsInternal>;
  eraCount: number;
}): Uint32Array[] {
  const cellCount = params.mesh.cellCount | 0;
  const mantleDriftU = new Int8Array(cellCount);
  const mantleDriftV = new Int8Array(cellCount);
  for (let i = 0; i < cellCount; i++) {
    const drift = normalizeToInt8(params.mantleForcing.forcingU[i] ?? 0, params.mantleForcing.forcingV[i] ?? 0);
    mantleDriftU[i] = drift.u;
    mantleDriftV[i] = drift.v;
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
