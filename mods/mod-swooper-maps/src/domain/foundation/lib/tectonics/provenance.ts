import { BOUNDARY_TYPE } from "../../constants.js";
import type { FoundationPlateGraph } from "../../ops/compute-plate-graph/contract.js";
import type { FoundationMesh } from "../../ops/compute-mesh/contract.js";
import type { FoundationTectonicProvenance } from "./schemas.js";
import type { FoundationTectonicEraFieldsInternal } from "./internal-contract.js";

import {
  ARC_RESET_THRESHOLD_FRAC_OF_MAX,
  ARC_RESET_THRESHOLD_MIN,
  EVENT_TYPE,
  HOTSPOT_RESET_THRESHOLD_FRAC_OF_MAX,
  HOTSPOT_RESET_THRESHOLD_MIN,
  RIFT_RESET_THRESHOLD_FRAC_OF_MAX,
  RIFT_RESET_THRESHOLD_MIN,
} from "./constants.js";
import { clampByte, deriveResetThreshold } from "./shared.js";

export function computeTectonicProvenance(params: {
  mesh: FoundationMesh;
  plateGraph: FoundationPlateGraph;
  eras: ReadonlyArray<FoundationTectonicEraFieldsInternal>;
  tracerIndex: ReadonlyArray<Uint32Array>;
  eraCount: number;
}): FoundationTectonicProvenance {
  const cellCount = params.mesh.cellCount | 0;

  const riftResetThresholdByEra = new Uint8Array(params.eraCount);
  const arcResetThresholdByEra = new Uint8Array(params.eraCount);
  const hotspotResetThresholdByEra = new Uint8Array(params.eraCount);
  for (let era = 0; era < params.eraCount; era++) {
    const fields = params.eras[era]!;
    let maxRiftPotential = 0;
    let maxArcVolcanism = 0;
    let maxHotspotVolcanism = 0;
    for (let i = 0; i < cellCount; i++) {
      const boundary = fields.boundaryType[i] ?? BOUNDARY_TYPE.none;
      if (boundary === BOUNDARY_TYPE.divergent) {
        maxRiftPotential = Math.max(maxRiftPotential, fields.riftPotential[i] ?? 0);
      }
      const volc = fields.volcanism[i] ?? 0;
      const volcType = fields.volcanismEventType[i] ?? 0;
      if (boundary === BOUNDARY_TYPE.convergent && volcType === EVENT_TYPE.convergenceSubduction) {
        maxArcVolcanism = Math.max(maxArcVolcanism, volc);
      }
      if (boundary === BOUNDARY_TYPE.none && volcType === EVENT_TYPE.intraplateHotspot) {
        maxHotspotVolcanism = Math.max(maxHotspotVolcanism, volc);
      }
    }
    riftResetThresholdByEra[era] = deriveResetThreshold(
      maxRiftPotential,
      RIFT_RESET_THRESHOLD_FRAC_OF_MAX,
      RIFT_RESET_THRESHOLD_MIN
    );
    arcResetThresholdByEra[era] = deriveResetThreshold(
      maxArcVolcanism,
      ARC_RESET_THRESHOLD_FRAC_OF_MAX,
      ARC_RESET_THRESHOLD_MIN
    );
    hotspotResetThresholdByEra[era] = deriveResetThreshold(
      maxHotspotVolcanism,
      HOTSPOT_RESET_THRESHOLD_FRAC_OF_MAX,
      HOTSPOT_RESET_THRESHOLD_MIN
    );
  }

  let originEra = new Uint8Array(cellCount);
  let originPlateId = new Int16Array(cellCount);
  let lastBoundaryEra = new Uint8Array(cellCount);
  let lastBoundaryType = new Uint8Array(cellCount);
  let lastBoundaryPolarity = new Int8Array(cellCount);
  let lastBoundaryIntensity = new Uint8Array(cellCount);
  const crustAge = new Uint8Array(cellCount);

  lastBoundaryEra.fill(255);
  lastBoundaryType.fill(255);
  for (let i = 0; i < cellCount; i++) {
    originEra[i] = 0;
    originPlateId[i] = params.plateGraph.cellToPlate[i] ?? -1;
  }

  for (let era = 0; era < params.eraCount; era++) {
    if (era > 0) {
      const trace = params.tracerIndex[era]!;
      const nextOriginEra = new Uint8Array(cellCount);
      const nextOriginPlateId = new Int16Array(cellCount);
      const nextLastBoundaryEra = new Uint8Array(cellCount);
      const nextLastBoundaryType = new Uint8Array(cellCount);
      const nextLastBoundaryPolarity = new Int8Array(cellCount);
      const nextLastBoundaryIntensity = new Uint8Array(cellCount);

      for (let i = 0; i < cellCount; i++) {
        const src = trace[i] ?? i;
        if (src < 0 || src >= cellCount) {
          nextOriginEra[i] = originEra[i] ?? 0;
          nextOriginPlateId[i] = originPlateId[i] ?? -1;
          nextLastBoundaryEra[i] = lastBoundaryEra[i] ?? 255;
          nextLastBoundaryType[i] = lastBoundaryType[i] ?? 255;
          nextLastBoundaryPolarity[i] = lastBoundaryPolarity[i] ?? 0;
          nextLastBoundaryIntensity[i] = lastBoundaryIntensity[i] ?? 0;
          continue;
        }
        nextOriginEra[i] = originEra[src] ?? 0;
        nextOriginPlateId[i] = originPlateId[src] ?? -1;
        nextLastBoundaryEra[i] = lastBoundaryEra[src] ?? 255;
        nextLastBoundaryType[i] = lastBoundaryType[src] ?? 255;
        nextLastBoundaryPolarity[i] = lastBoundaryPolarity[src] ?? 0;
        nextLastBoundaryIntensity[i] = lastBoundaryIntensity[src] ?? 0;
      }

      originEra = nextOriginEra;
      originPlateId = nextOriginPlateId;
      lastBoundaryEra = nextLastBoundaryEra;
      lastBoundaryType = nextLastBoundaryType;
      lastBoundaryPolarity = nextLastBoundaryPolarity;
      lastBoundaryIntensity = nextLastBoundaryIntensity;
    }

    const fields = params.eras[era]!;
    const riftResetThreshold = riftResetThresholdByEra[era] ?? RIFT_RESET_THRESHOLD_MIN;
    const arcResetThreshold = arcResetThresholdByEra[era] ?? ARC_RESET_THRESHOLD_MIN;
    const hotspotResetThreshold = hotspotResetThresholdByEra[era] ?? HOTSPOT_RESET_THRESHOLD_MIN;

    for (let i = 0; i < cellCount; i++) {
      const boundary = fields.boundaryType[i] ?? BOUNDARY_TYPE.none;
      const intensity = fields.boundaryIntensity[i] ?? 0;
      if (boundary !== BOUNDARY_TYPE.none && intensity > 0) {
        lastBoundaryEra[i] = era;
        lastBoundaryType[i] = boundary;
        lastBoundaryPolarity[i] = boundary === BOUNDARY_TYPE.convergent ? fields.boundaryPolarity[i] ?? 0 : 0;
        lastBoundaryIntensity[i] = intensity;
      }

      if (boundary === BOUNDARY_TYPE.divergent && (fields.riftPotential[i] ?? 0) >= riftResetThreshold) {
        originEra[i] = era;
        originPlateId[i] = fields.riftOriginPlate[i] ?? params.plateGraph.cellToPlate[i] ?? -1;
      }

      if (
        boundary === BOUNDARY_TYPE.none &&
        (fields.volcanism[i] ?? 0) >= hotspotResetThreshold &&
        (fields.volcanismEventType[i] ?? 0) === EVENT_TYPE.intraplateHotspot
      ) {
        originEra[i] = era;
        originPlateId[i] = fields.volcanismOriginPlate[i] ?? params.plateGraph.cellToPlate[i] ?? -1;
      }

      if (
        boundary === BOUNDARY_TYPE.convergent &&
        (fields.volcanism[i] ?? 0) >= arcResetThreshold &&
        (fields.volcanismEventType[i] ?? 0) === EVENT_TYPE.convergenceSubduction
      ) {
        originEra[i] = era;
        originPlateId[i] = fields.volcanismOriginPlate[i] ?? params.plateGraph.cellToPlate[i] ?? -1;
      }
    }
  }

  const newestEraIndex = Math.max(0, params.eraCount - 1);
  const ageDenom = Math.max(1, params.eraCount - 1);
  for (let i = 0; i < cellCount; i++) {
    const age = newestEraIndex - (originEra[i] ?? 0);
    crustAge[i] = clampByte((age / ageDenom) * 255);
  }

  return {
    version: 1,
    eraCount: params.eraCount,
    cellCount,
    tracerIndex: params.tracerIndex as Uint32Array[],
    provenance: {
      originEra,
      originPlateId,
      lastBoundaryEra,
      lastBoundaryType,
      lastBoundaryPolarity,
      lastBoundaryIntensity,
      crustAge,
    },
  };
}
