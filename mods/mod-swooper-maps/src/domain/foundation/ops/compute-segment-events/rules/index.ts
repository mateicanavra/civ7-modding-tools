import { BOUNDARY_TYPE } from "@swooper/mapgen-core/lib/plates";
import type { Artifact as FoundationCrust } from "../../../artifacts/crust.artifact.js";
import type { Artifact as FoundationMesh } from "../../../artifacts/mesh.artifact.js";
import type { Artifact as TectonicEvents } from "../../../artifacts/tectonic-events.artifact.js";
import type { Artifact as FoundationTectonicSegments } from "../../../artifacts/tectonic-segments.artifact.js";
import { EVENT_TYPE } from "../../../model/policy/tectonic-event-types.js";

type TectonicEventRecord = TectonicEvents[number];

export function buildBoundaryEventsFromSegments(params: {
  mesh: FoundationMesh;
  crust: FoundationCrust;
  segments: FoundationTectonicSegments;
}): TectonicEventRecord[] {
  const { mesh, crust, segments } = params;
  const events: TectonicEventRecord[] = [];
  const segmentCount = segments.segmentCount | 0;
  for (let s = 0; s < segmentCount; s++) {
    const regime = segments.regime[s] ?? BOUNDARY_TYPE.none;
    if (regime === BOUNDARY_TYPE.none) continue;

    const plateA = segments.plateA[s] ?? -1;
    const plateB = segments.plateB[s] ?? -1;
    let polarity = regime === BOUNDARY_TYPE.convergent ? (segments.polarity[s] ?? 0) : 0;

    let eventType = 0;
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
