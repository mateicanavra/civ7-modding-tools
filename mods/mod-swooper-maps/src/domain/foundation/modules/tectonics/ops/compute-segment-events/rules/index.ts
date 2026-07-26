import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";
import { EVENT_TYPE, type TectonicEvent } from "../../../model/atoms/tectonic-event.schema.js";

type BoundarySegments = Readonly<{
  segmentCount: number;
  aCell: Int32Array;
  bCell: Int32Array;
  plateA: Int16Array;
  plateB: Int16Array;
  regime: Uint8Array;
  polarity: Int8Array;
  compression: Uint8Array;
  extension: Uint8Array;
  shear: Uint8Array;
  volcanism: Uint8Array;
  fracture: Uint8Array;
  driftU: Int8Array;
  driftV: Int8Array;
}>;

/**
 * Projects canonical boundary segments into polarity-aware tectonic event records.
 * Keeping this mapping in rules lets strategies compose it without duplicating boundary policy.
 */
export function buildBoundaryEventsFromSegments(params: {
  mesh: Readonly<{ cellCount: number }>;
  crust: Readonly<{ type: Uint8Array }>;
  segments: BoundarySegments;
}): TectonicEvent[] {
  const { mesh, crust, segments } = params;
  const events: TectonicEvent[] = [];
  const segmentCount = segments.segmentCount | 0;
  for (let s = 0; s < segmentCount; s++) {
    const regime = segments.regime[s] ?? BOUNDARY_TYPE.none;
    if (regime === BOUNDARY_TYPE.none) continue;

    const plateA = segments.plateA[s] ?? -1;
    const plateB = segments.plateB[s] ?? -1;
    let polarity = regime === BOUNDARY_TYPE.convergent ? (segments.polarity[s] ?? 0) : 0;

    let eventType: TectonicEvent["eventType"] | 0 = 0;
    let intensityUplift = 0;
    let intensityRift = 0;
    let intensityShear = 0;
    let intensityVolcanism = 0;
    let intensityFracture = 0;

    if (regime === BOUNDARY_TYPE.convergent) {
      const aCell = segments.aCell[s] ?? -1;
      const bCell = segments.bCell[s] ?? -1;
      const aType = aCell >= 0 && aCell < mesh.cellCount ? (crust.type[aCell] ?? 0) : 0;
      const bType = bCell >= 0 && bCell < mesh.cellCount ? (crust.type[bCell] ?? 0) : 0;
      const isCollision = aType > 0 && bType > 0;

      eventType = isCollision ? EVENT_TYPE.convergenceCollision : EVENT_TYPE.convergenceSubduction;
      if (isCollision) polarity = 0;
      intensityUplift = segments.compression[s] ?? 0;
      intensityVolcanism = segments.volcanism[s] ?? 0;
      intensityFracture = segments.fracture[s] ?? 0;
    } else if (regime === BOUNDARY_TYPE.divergent) {
      eventType = EVENT_TYPE.divergenceRift;
      intensityRift = segments.extension[s] ?? 0;
      intensityVolcanism = segments.volcanism[s] ?? 0;
      intensityFracture = segments.fracture[s] ?? 0;
    } else if (regime === BOUNDARY_TYPE.transform) {
      eventType = EVENT_TYPE.transformShear;
      intensityShear = segments.shear[s] ?? 0;
      intensityFracture = segments.fracture[s] ?? 0;
    }

    if (!eventType) continue;

    const aCell = segments.aCell[s] ?? -1;
    const bCell = segments.bCell[s] ?? -1;
    const seeds = aCell === bCell ? [aCell] : [aCell, bCell];

    let originPlateId = -1;
    if (eventType === EVENT_TYPE.convergenceSubduction) {
      originPlateId = polarity < 0 ? plateB : polarity > 0 ? plateA : -1;
    } else if (
      eventType === EVENT_TYPE.divergenceRift ||
      eventType === EVENT_TYPE.convergenceCollision
    ) {
      originPlateId = Math.min(plateA, plateB);
    }

    events.push({
      eventType,
      plateA,
      plateB,
      polarity,
      intensityUplift,
      intensityRift,
      intensityShear,
      intensityVolcanism,
      intensityFracture,
      driftU: segments.driftU[s] ?? 0,
      driftV: segments.driftV[s] ?? 0,
      seedCells: seeds.filter((cell) => cell >= 0),
      originPlateId,
    });
  }
  return events;
}
