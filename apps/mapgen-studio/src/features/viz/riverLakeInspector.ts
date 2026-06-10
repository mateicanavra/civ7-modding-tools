import type {
  VizLayerEntryV1,
  VizLayerKind,
  VizScalarFormat,
  VizLayerVisibility,
  VizManifestV1,
  VizSpaceId,
} from "@swooper/mapgen-viz";

export type RiverLakeInspectorLane =
  | "hydrology"
  | "projection"
  | "terrain-readback"
  | "metadata-readback"
  | "lakes"
  | "floodplains"
  | "rendered"
  | "acceptance";

export type RiverLakeInspectorProofClass =
  | "hydrology-truth"
  | "projection-plan"
  | "terrain-readback"
  | "metadata-readback"
  | "lake-final"
  | "floodplain-active"
  | "studio-visible"
  | "civ-rendered"
  | "product-acceptance";

export type RiverLakeInspectorClaimStatus = "available" | "pass" | "fail" | "unresolved" | "out-of-scope";

export type RiverLakeInspectorDisplayStatus =
  | "hydrology-truth-present"
  | "projection-plan-present"
  | "terrain-readback-present"
  | "metadata-readback-present"
  | "lake-readback-present"
  | "floodplain-apply-present"
  | "rendered-proof-missing"
  | "acceptance-proof-missing"
  | "no-physical-rivers"
  | "minor-only-expected-no-navigable"
  | "major-present-none-selected"
  | "selected-rejected-by-engine"
  | "terrain-match"
  | "terrain-match-metadata-divergent"
  | "terrain-mismatch"
  | "metadata-readback-missing"
  | "native-writer-parity-unproven"
  | "floodplain-intent-missing"
  | "floodplain-apply-rejected"
  | "floodplain-live-missing"
  | "lake-exact-log-missing";

export type RiverLakeInspectorLayerRef = Readonly<{
  dataTypeKey: string;
  layerKey: string;
  stepId: string;
  stepIndex: number;
  spaceId: VizSpaceId;
  kind: VizLayerKind;
  role: string | null;
  variantKey: string | null;
  visibility: VizLayerVisibility;
  label: string;
  renderModeId: string;
  nonZeroCount: number | null;
  sampleCount: number | null;
}>;

export type RiverLakeInspectorRow = Readonly<{
  lane: RiverLakeInspectorLane;
  laneLabel: string;
  label: string;
  proofClass: RiverLakeInspectorProofClass;
  claimStatus: RiverLakeInspectorClaimStatus;
  displayStatus: RiverLakeInspectorDisplayStatus;
  counts: Readonly<Record<string, number>>;
  layerRefs: readonly RiverLakeInspectorLayerRef[];
  evidence: readonly string[];
}>;

export type RiverLakeFloodplainInspectorSummary = Readonly<{
  version: 1;
  rows: readonly RiverLakeInspectorRow[];
}>;

type LaneSpec = Readonly<{
  lane: RiverLakeInspectorLane;
  laneLabel: string;
  label: string;
  proofClass: RiverLakeInspectorProofClass;
  dataTypeKeys: readonly string[];
  requiredDataTypeKeys: readonly string[];
  presentStatus: RiverLakeInspectorDisplayStatus;
  presentClaimStatus?: RiverLakeInspectorClaimStatus;
  missingStatus: RiverLakeInspectorDisplayStatus;
  missingClaimStatus?: RiverLakeInspectorClaimStatus;
  missingEvidence: string;
  presentEvidence: string;
}>;

const LANE_SPECS: readonly LaneSpec[] = [
  {
    lane: "hydrology",
    laneLabel: "Hydrology",
    label: "Drainage truth",
    proofClass: "hydrology-truth",
    dataTypeKeys: [
      "hydrology.hydrography.discharge",
      "hydrology.hydrography.riverClass",
      "hydrology.hydrography.upstreamArea",
      "hydrology.hydrography.streamOrderProxy",
      "hydrology.hydrography.flowPermanenceProxy",
      "hydrology.hydrography.mouthType",
      "hydrology.lakes.lakePlan",
    ],
    requiredDataTypeKeys: ["hydrology.hydrography.riverClass"],
    presentStatus: "hydrology-truth-present",
    missingStatus: "no-physical-rivers",
    missingEvidence:
      "No Hydrology river-class layer is present in this run manifest; Studio cannot prove physical river truth for this run.",
    presentEvidence:
      "Same-run Hydrology layers are present. Non-zero river counts require the Hydrology summary artifact, not manifest inference.",
  },
  {
    lane: "projection",
    laneLabel: "Projection",
    label: "Navigable river plan",
    proofClass: "projection-plan",
    dataTypeKeys: [
      "map.rivers.projectedRiverMask",
      "map.rivers.plannedMinorRiverMask",
      "map.rivers.plannedMajorRiverMask",
      "map.rivers.riverClass",
    ],
    requiredDataTypeKeys: ["map.rivers.projectedRiverMask"],
    presentStatus: "projection-plan-present",
    missingStatus: "major-present-none-selected",
    missingEvidence:
      "No projected navigable-river mask is present; this run has no Studio-visible projection plan layer.",
    presentEvidence:
      "The projected navigable-river mask is present and labeled as projection-plan evidence, not engine terrain truth.",
  },
  {
    lane: "terrain-readback",
    laneLabel: "Terrain",
    label: "Engine terrain readback",
    proofClass: "terrain-readback",
    dataTypeKeys: ["map.rivers.engineRiverMask", "map.rivers.riverMismatchMask"],
    requiredDataTypeKeys: ["map.rivers.engineRiverMask"],
    presentStatus: "terrain-readback-present",
    missingStatus: "selected-rejected-by-engine",
    missingEvidence:
      "No engine terrain readback layer is present; terrain parity cannot be checked from this manifest.",
    presentEvidence:
      "The engine terrain readback layer is present. Exact parity still depends on same-run mismatch counters.",
  },
  {
    lane: "metadata-readback",
    laneLabel: "Metadata",
    label: "Civ river metadata",
    proofClass: "metadata-readback",
    dataTypeKeys: [
      "map.rivers.engineNavigableRiverMetadataMask",
      "map.rivers.engineMinorRiverMask",
      "map.rivers.riverMismatchMask",
    ],
    requiredDataTypeKeys: ["map.rivers.engineNavigableRiverMetadataMask"],
    presentStatus: "metadata-readback-present",
    missingStatus: "metadata-readback-missing",
    missingEvidence:
      "No Civ river metadata readback layer is present; metadata parity is unresolved for this run.",
    presentEvidence:
      "Civ river metadata readback layers are present behind debug inspection.",
  },
  {
    lane: "lakes",
    laneLabel: "Lakes",
    label: "Lake plan and readback",
    proofClass: "lake-final",
    dataTypeKeys: [
      "hydrology.lakes.lakePlan",
      "map.hydrology.lakes.plannedLakeMask",
      "map.hydrology.lakes.engineLakeMask",
      "map.hydrology.lakes.rejectedLakeMask",
    ],
    requiredDataTypeKeys: ["map.hydrology.lakes.plannedLakeMask", "map.hydrology.lakes.engineLakeMask"],
    presentStatus: "lake-readback-present",
    missingStatus: "lake-exact-log-missing",
    missingEvidence:
      "Lake plan/readback layers are incomplete; exact lake acceptance requires planned and engine lake evidence.",
    presentEvidence:
      "Lake plan and engine readback layers are present. Exact drift counts come from lake parity counters.",
  },
  {
    lane: "floodplains",
    laneLabel: "Floodplains",
    label: "Feature application",
    proofClass: "floodplain-active",
    dataTypeKeys: ["map.ecology.featureType", "map.ecology.features.rejectionMask"],
    requiredDataTypeKeys: ["map.ecology.featureType"],
    presentStatus: "floodplain-apply-present",
    missingStatus: "floodplain-live-missing",
    missingEvidence:
      "No final feature-type layer is present; floodplain application/readback cannot be inspected from this manifest.",
    presentEvidence:
      "Final feature application layers are present. Floodplain-specific active counts require feature counters.",
  },
  {
    lane: "rendered",
    laneLabel: "Rendered",
    label: "In-game visible rivers",
    proofClass: "civ-rendered",
    dataTypeKeys: [],
    requiredDataTypeKeys: [],
    presentStatus: "rendered-proof-missing",
    missingStatus: "rendered-proof-missing",
    missingClaimStatus: "unresolved",
    missingEvidence:
      "Studio manifest layers cannot prove rendered Civ visibility; this row closes only with same-run game screenshots.",
    presentEvidence:
      "Studio manifest layers cannot prove rendered Civ visibility; this row closes only with same-run game screenshots.",
  },
  {
    lane: "acceptance",
    laneLabel: "Acceptance",
    label: "Product closure",
    proofClass: "product-acceptance",
    dataTypeKeys: [],
    requiredDataTypeKeys: [],
    presentStatus: "acceptance-proof-missing",
    missingStatus: "acceptance-proof-missing",
    missingClaimStatus: "unresolved",
    missingEvidence:
      "Product acceptance requires Hydrology, projection, readback, Studio parity, and rendered Civ evidence from the same run.",
    presentEvidence:
      "Product acceptance requires Hydrology, projection, readback, Studio parity, and rendered Civ evidence from the same run.",
  },
];

const COUNT_LABEL_BY_DATA_TYPE_KEY: Readonly<Record<string, string>> = {
  "hydrology.hydrography.riverClass": "rivers",
  "hydrology.lakes.lakePlan": "lake intent",
  "map.rivers.projectedRiverMask": "projected",
  "map.rivers.plannedMinorRiverMask": "minor",
  "map.rivers.plannedMajorRiverMask": "major",
  "map.rivers.engineRiverMask": "terrain",
  "map.rivers.engineNavigableRiverMetadataMask": "metadata",
  "map.rivers.engineMinorRiverMask": "minor meta",
  "map.rivers.riverMismatchMask": "mismatch",
  "map.hydrology.lakes.plannedLakeMask": "planned lakes",
  "map.hydrology.lakes.engineLakeMask": "engine lakes",
  "map.hydrology.lakes.rejectedLakeMask": "rejected lakes",
  "map.ecology.featureType": "features",
  "map.ecology.features.rejectionMask": "feature rejects",
};

function resolveLayerVisibility(layer: VizLayerEntryV1): VizLayerVisibility {
  const visibility = layer.meta?.visibility;
  if (visibility === "debug") return "debug";
  if (visibility === "hidden") return "hidden";
  return "default";
}

function renderModeIdFor(layer: VizLayerEntryV1): string {
  const role = layer.meta?.role;
  return role ? `${layer.kind}:${role}` : layer.kind;
}

function asNumberArray(buffer: ArrayBuffer, format: VizScalarFormat): ArrayLike<number> | null {
  if (format === "u8") return new Uint8Array(buffer);
  if (format === "i8") return new Int8Array(buffer);
  if (format === "u16") return new Uint16Array(buffer);
  if (format === "i16") return new Int16Array(buffer);
  if (format === "i32") return new Int32Array(buffer);
  if (format === "f32") return new Float32Array(buffer);
  return null;
}

function countNonZeroSamples(layer: VizLayerEntryV1): { nonZeroCount: number; sampleCount: number } | null {
  if (layer.kind !== "grid") return null;
  if (layer.field.data.kind !== "inline") return null;
  const values = asNumberArray(layer.field.data.buffer, layer.field.format);
  if (!values) return null;

  let nonZeroCount = 0;
  let sampleCount = 0;
  for (let i = 0; i < values.length; i++) {
    const value = values[i] as number;
    if (!Number.isFinite(value)) continue;
    sampleCount += 1;
    if (value !== 0) nonZeroCount += 1;
  }

  return { nonZeroCount, sampleCount };
}

function toLayerRef(layer: VizLayerEntryV1): RiverLakeInspectorLayerRef {
  const samples = countNonZeroSamples(layer);
  return {
    dataTypeKey: layer.dataTypeKey,
    layerKey: layer.layerKey,
    stepId: layer.stepId,
    stepIndex: layer.stepIndex,
    spaceId: layer.spaceId,
    kind: layer.kind,
    role: layer.meta?.role ?? null,
    variantKey: layer.variantKey ?? null,
    visibility: resolveLayerVisibility(layer),
    label: layer.meta?.label ?? layer.dataTypeKey,
    renderModeId: renderModeIdFor(layer),
    nonZeroCount: samples?.nonZeroCount ?? null,
    sampleCount: samples?.sampleCount ?? null,
  };
}

function collectRefs(
  layersByDataTypeKey: ReadonlyMap<string, readonly VizLayerEntryV1[]>,
  dataTypeKeys: readonly string[]
): RiverLakeInspectorLayerRef[] {
  const refs: RiverLakeInspectorLayerRef[] = [];
  for (const dataTypeKey of dataTypeKeys) {
    const layers = layersByDataTypeKey.get(dataTypeKey) ?? [];
    for (const layer of layers) refs.push(toLayerRef(layer));
  }
  return refs.sort((a, b) => {
    if (a.stepIndex !== b.stepIndex) return a.stepIndex - b.stepIndex;
    return a.layerKey.localeCompare(b.layerKey);
  });
}

function hasRequiredRefs(
  layersByDataTypeKey: ReadonlyMap<string, readonly VizLayerEntryV1[]>,
  requiredDataTypeKeys: readonly string[]
): boolean {
  if (requiredDataTypeKeys.length === 0) return false;
  return requiredDataTypeKeys.every((dataTypeKey) => (layersByDataTypeKey.get(dataTypeKey)?.length ?? 0) > 0);
}

function countByVisibility(refs: readonly RiverLakeInspectorLayerRef[]): Record<string, number> {
  const counts: Record<string, number> = {};
  if (refs.length > 0) counts.layers = refs.length;
  const defaultCount = refs.filter((ref) => ref.visibility === "default").length;
  const debugCount = refs.filter((ref) => ref.visibility === "debug").length;
  if (defaultCount > 0) counts.default = defaultCount;
  if (debugCount > 0) counts.debug = debugCount;
  for (const ref of refs) {
    const label = COUNT_LABEL_BY_DATA_TYPE_KEY[ref.dataTypeKey];
    if (!label || ref.nonZeroCount == null) continue;
    counts[label] = (counts[label] ?? 0) + ref.nonZeroCount;
  }
  return counts;
}

export function buildRiverLakeFloodplainInspectorSummary(
  manifest: Pick<VizManifestV1, "layers"> | null
): RiverLakeFloodplainInspectorSummary | null {
  if (!manifest) return null;

  const mutableByDataTypeKey = new Map<string, VizLayerEntryV1[]>();
  for (const layer of manifest.layers) {
    const current = mutableByDataTypeKey.get(layer.dataTypeKey);
    if (current) current.push(layer);
    else mutableByDataTypeKey.set(layer.dataTypeKey, [layer]);
  }

  const layersByDataTypeKey = new Map<string, readonly VizLayerEntryV1[]>();
  for (const [dataTypeKey, layers] of mutableByDataTypeKey) {
    layersByDataTypeKey.set(
      dataTypeKey,
      [...layers].sort((a, b) => {
        if (a.stepIndex !== b.stepIndex) return a.stepIndex - b.stepIndex;
        return a.layerKey.localeCompare(b.layerKey);
      })
    );
  }

  return {
    version: 1,
    rows: LANE_SPECS.map((spec) => {
      const layerRefs = collectRefs(layersByDataTypeKey, spec.dataTypeKeys);
      const hasEvidence = hasRequiredRefs(layersByDataTypeKey, spec.requiredDataTypeKeys);
      const claimStatus: RiverLakeInspectorClaimStatus = hasEvidence
        ? spec.presentClaimStatus ?? "available"
        : spec.missingClaimStatus ?? "unresolved";
      return {
        lane: spec.lane,
        laneLabel: spec.laneLabel,
        label: spec.label,
        proofClass: spec.proofClass,
        claimStatus,
        displayStatus: hasEvidence ? spec.presentStatus : spec.missingStatus,
        counts: countByVisibility(layerRefs),
        layerRefs,
        evidence: [hasEvidence ? spec.presentEvidence : spec.missingEvidence],
      };
    }),
  };
}
