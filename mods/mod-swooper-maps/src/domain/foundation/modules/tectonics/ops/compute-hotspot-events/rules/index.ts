import { quantizeUnitVec2I8 } from "@swooper/mapgen-core/lib/grid";
import { clampFinite, quantizeU8 } from "@swooper/mapgen-core/lib/math";
import { EVENT_TYPE, type TectonicEvent } from "../../../model/atoms/tectonic-event.schema.js";
/**
 * Selects mantle upwelling cells and records them as plate-associated hotspot events.
 * Event records remain discrete so later strategies can control their spatial influence.
 */
export function buildHotspotEvents(params: {
  mesh: Readonly<{ cellCount: number }>;
  mantleForcing: Readonly<{
    upwellingClass: Int8Array;
    forcingMag: Float32Array;
    stress: Float32Array;
    forcingU: Float32Array;
    forcingV: Float32Array;
  }>;
  eraPlateId: Int16Array;
}): TectonicEvent[] {
  const { mesh, mantleForcing, eraPlateId } = params;
  const events: TectonicEvent[] = [];
  for (let i = 0; i < mesh.cellCount; i++) {
    if ((mantleForcing.upwellingClass[i] ?? 0) <= 0) continue;
    const forcingMag = clampFinite(mantleForcing.forcingMag[i] ?? 0, 0, 1, 0);
    const stress = clampFinite(mantleForcing.stress[i] ?? 0, 0, 1, 0);
    if (forcingMag <= 0) continue;
    const intensity = quantizeU8(forcingMag * (0.6 + 0.4 * stress) * 255);
    if (intensity <= 0) continue;

    const drift = quantizeUnitVec2I8(
      mantleForcing.forcingU[i] ?? 0,
      mantleForcing.forcingV[i] ?? 0
    );
    events.push({
      eventType: EVENT_TYPE.intraplateHotspot,
      plateA: -1,
      plateB: -1,
      polarity: 0,
      intensityUplift: quantizeU8(intensity * 0.45),
      intensityRift: 0,
      intensityShear: 0,
      intensityVolcanism: intensity,
      intensityFracture: quantizeU8(intensity * 0.35),
      driftU: drift.x,
      driftV: drift.y,
      seedCells: [i],
      originPlateId: eraPlateId[i] ?? -1,
    });
  }
  return events;
}
