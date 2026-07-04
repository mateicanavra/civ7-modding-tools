import { clampFinite } from "@swooper/mapgen-core/lib/math";
import type { Artifact as TectonicEvents } from "../../../artifacts/tectonic-events.artifact.js";
import { clampByte, normalizeToInt8 } from "../../../lib/tectonics/shared.js";
import { EVENT_TYPE } from "../../../model/policy/tectonic-event-types.js";
import type { FoundationMantleForcing } from "../../compute-mantle-forcing/contract.js";
import type { FoundationMesh } from "../../compute-mesh/contract.js";

type TectonicEventRecord = TectonicEvents[number];

export function buildHotspotEvents(params: {
  mesh: FoundationMesh;
  mantleForcing: FoundationMantleForcing;
  eraPlateId: Int16Array;
}): TectonicEventRecord[] {
  const { mesh, mantleForcing, eraPlateId } = params;
  const events: TectonicEventRecord[] = [];
  for (let i = 0; i < mesh.cellCount; i++) {
    if ((mantleForcing.upwellingClass[i] ?? 0) <= 0) continue;
    const forcingMag = clampFinite(mantleForcing.forcingMag[i] ?? 0, 0, 1, 0);
    const stress = clampFinite(mantleForcing.stress[i] ?? 0, 0, 1, 0);
    if (forcingMag <= 0) continue;
    const intensity = clampByte(forcingMag * (0.6 + 0.4 * stress) * 255);
    if (intensity <= 0) continue;

    const drift = normalizeToInt8(mantleForcing.forcingU[i] ?? 0, mantleForcing.forcingV[i] ?? 0);
    events.push({
      eventType: EVENT_TYPE.intraplateHotspot,
      plateA: -1,
      plateB: -1,
      polarity: 0,
      intensityUplift: clampByte(intensity * 0.45),
      intensityRift: 0,
      intensityShear: 0,
      intensityVolcanism: intensity,
      intensityFracture: clampByte(intensity * 0.35),
      driftU: drift.u,
      driftV: drift.v,
      seedCells: [i],
      originPlateId: eraPlateId[i] ?? -1,
    });
  }
  return events;
}
