import type {
  VizLayerEntryV1,
  VizLayerKind,
  VizLayerVisibility,
  VizManifestV1,
  VizScalarFormat,
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

export type RiverLakeInspectorClaimStatus =
  | "available"
  | "pass"
  | "fail"
  | "unresolved"
  | "out-of-scope";

export type RiverLakeInspectorMaskCategory =
  | "physical-river-truth"
  | "navigable-projection"
  | "engine-terrain-readback"
  | "engine-metadata-readback"
  | "lake-plan-readback"
  | "floodplain-intent"
  | "floodplain-apply"
  | "mismatch-debug"
  | "proof-only";

export type RiverLakeInspectorPalette = Readonly<{
  paletteId: string;
  label: string;
  activeColor: string;
  inactiveColor: string;
  debugColor: string;
}>;

export type RiverLakeInspectorMaskPresentation = Readonly<{
  category: RiverLakeInspectorMaskCategory;
  categoryLabel: string;
  palette: RiverLakeInspectorPalette;
}>;

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
  presentation: RiverLakeInspectorMaskPresentation;
}>;

export type RiverLakeInspectorRow = Readonly<{
  rowKey: string;
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
  rowKey: string;
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
    rowKey: "hydrology-truth",
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
    rowKey: "projection-plan",
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
    rowKey: "terrain-readback",
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
    rowKey: "metadata-readback",
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
    presentEvidence: "Civ river metadata readback layers are present behind debug inspection.",
  },
  {
    rowKey: "lake-plan-readback",
    lane: "lakes",
    laneLabel: "Lakes",
    label: "Lake plan/readback",
    proofClass: "lake-final",
    dataTypeKeys: [
      "hydrology.lakes.lakePlan",
      "map.hydrology.lakes.plannedLakeMask",
      "map.hydrology.lakes.engineLakeMask",
      "map.hydrology.lakes.rejectedLakeMask",
    ],
    requiredDataTypeKeys: [
      "map.hydrology.lakes.plannedLakeMask",
      "map.hydrology.lakes.engineLakeMask",
    ],
    presentStatus: "lake-readback-present",
    missingStatus: "lake-exact-log-missing",
    missingEvidence:
      "Lake plan/readback layers are incomplete; exact lake acceptance requires planned and engine lake evidence.",
    presentEvidence:
      "Lake plan and engine readback layers are present. Exact drift counts come from lake parity counters.",
  },
  {
    rowKey: "lake-exact-counters",
    lane: "lakes",
    laneLabel: "Lakes",
    label: "Lake exact counters",
    proofClass: "lake-final",
    dataTypeKeys: [],
    requiredDataTypeKeys: [],
    presentStatus: "lake-exact-log-missing",
    missingStatus: "lake-exact-log-missing",
    missingClaimStatus: "unresolved",
    missingEvidence:
      "Exact lake closure requires accepted-lake count plus final water/classification drift counters from same-run parity, not manifest layers.",
    presentEvidence:
      "Exact lake closure requires accepted-lake count plus final water/classification drift counters from same-run parity, not manifest layers.",
  },
  {
    rowKey: "floodplain-intent",
    lane: "floodplains",
    laneLabel: "Floodplains",
    label: "Floodplain intent",
    proofClass: "floodplain-active",
    dataTypeKeys: [
      "map.ecology.features.floodplainIntentMask",
      "ecology.features.floodplainIntentMask",
    ],
    requiredDataTypeKeys: ["map.ecology.features.floodplainIntentMask"],
    presentStatus: "floodplain-apply-present",
    missingStatus: "floodplain-intent-missing",
    missingEvidence:
      "No floodplain intent layer is present; Studio cannot inspect whether the pipeline planned floodplain-family features.",
    presentEvidence:
      "Floodplain intent is present as a planning layer. Product proof still needs apply and live readback evidence.",
  },
  {
    rowKey: "floodplain-apply",
    lane: "floodplains",
    laneLabel: "Floodplains",
    label: "Floodplain apply",
    proofClass: "floodplain-active",
    dataTypeKeys: [
      "map.ecology.features.floodplainAppliedMask",
      "map.ecology.features.floodplainRejectedMask",
      "map.ecology.features.rejectionMask",
    ],
    requiredDataTypeKeys: ["map.ecology.features.floodplainAppliedMask"],
    presentStatus: "floodplain-apply-present",
    missingStatus: "floodplain-live-missing",
    missingEvidence:
      "No floodplain applied mask is present; floodplain application cannot be inspected from this manifest.",
    presentEvidence:
      "Floodplain applied/rejected masks are present. Live floodplain-family readback remains a separate proof row.",
  },
  {
    rowKey: "floodplain-live-readback",
    lane: "floodplains",
    laneLabel: "Floodplains",
    label: "Floodplain live readback",
    proofClass: "floodplain-active",
    dataTypeKeys: [],
    requiredDataTypeKeys: [],
    presentStatus: "floodplain-live-missing",
    missingStatus: "floodplain-live-missing",
    missingClaimStatus: "unresolved",
    missingEvidence:
      "Live floodplain proof requires nonzero floodplain-family feature readback from the same Civ run; Studio manifest layers cannot close it.",
    presentEvidence:
      "Live floodplain proof requires nonzero floodplain-family feature readback from the same Civ run; Studio manifest layers cannot close it.",
  },
  {
    rowKey: "civ-rendered",
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
    rowKey: "product-acceptance",
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
  "map.ecology.features.floodplainIntentMask": "fp intent",
  "ecology.features.floodplainIntentMask": "fp intent",
  "map.ecology.features.floodplainAppliedMask": "fp applied",
  "map.ecology.features.floodplainRejectedMask": "fp rejected",
  "map.ecology.featureType": "features",
  "map.ecology.features.rejectionMask": "feature rejects",
};

const MASK_PRESENTATIONS: Readonly<
  Record<RiverLakeInspectorMaskCategory, RiverLakeInspectorMaskPresentation>
> = {
  "physical-river-truth": {
    category: "physical-river-truth",
    categoryLabel: "Hydrology truth",
    palette: {
      paletteId: "river-truth-blue",
      label: "Hydrology truth",
      activeColor: "#2563eb",
      inactiveColor: "#dbeafe",
      debugColor: "#1e40af",
    },
  },
  "navigable-projection": {
    category: "navigable-projection",
    categoryLabel: "Projection plan",
    palette: {
      paletteId: "river-projection-teal",
      label: "Projection plan",
      activeColor: "#0f766e",
      inactiveColor: "#ccfbf1",
      debugColor: "#134e4a",
    },
  },
  "engine-terrain-readback": {
    category: "engine-terrain-readback",
    categoryLabel: "Terrain readback",
    palette: {
      paletteId: "terrain-readback-cyan",
      label: "Terrain readback",
      activeColor: "#0891b2",
      inactiveColor: "#cffafe",
      debugColor: "#155e75",
    },
  },
  "engine-metadata-readback": {
    category: "engine-metadata-readback",
    categoryLabel: "Metadata readback",
    palette: {
      paletteId: "metadata-readback-violet",
      label: "Metadata readback",
      activeColor: "#7c3aed",
      inactiveColor: "#ede9fe",
      debugColor: "#5b21b6",
    },
  },
  "lake-plan-readback": {
    category: "lake-plan-readback",
    categoryLabel: "Lake plan/readback",
    palette: {
      paletteId: "lake-plan-indigo",
      label: "Lake plan/readback",
      activeColor: "#4f46e5",
      inactiveColor: "#e0e7ff",
      debugColor: "#3730a3",
    },
  },
  "floodplain-intent": {
    category: "floodplain-intent",
    categoryLabel: "Floodplain intent",
    palette: {
      paletteId: "floodplain-intent-lime",
      label: "Floodplain intent",
      activeColor: "#65a30d",
      inactiveColor: "#ecfccb",
      debugColor: "#3f6212",
    },
  },
  "floodplain-apply": {
    category: "floodplain-apply",
    categoryLabel: "Floodplain apply",
    palette: {
      paletteId: "floodplain-apply-green",
      label: "Floodplain apply",
      activeColor: "#16a34a",
      inactiveColor: "#dcfce7",
      debugColor: "#166534",
    },
  },
  "mismatch-debug": {
    category: "mismatch-debug",
    categoryLabel: "Mismatch/debug",
    palette: {
      paletteId: "mismatch-debug-red",
      label: "Mismatch/debug",
      activeColor: "#dc2626",
      inactiveColor: "#fee2e2",
      debugColor: "#991b1b",
    },
  },
  "proof-only": {
    category: "proof-only",
    categoryLabel: "Proof-only",
    palette: {
      paletteId: "proof-only-slate",
      label: "Proof-only",
      activeColor: "#64748b",
      inactiveColor: "#e2e8f0",
      debugColor: "#334155",
    },
  },
};

function maskCategoryForLayer(layer: VizLayerEntryV1): RiverLakeInspectorMaskCategory {
  const key = layer.dataTypeKey;
  if (
    key.includes("MismatchMask") ||
    key.includes("RejectedMask") ||
    key.includes("rejectionMask")
  ) {
    return "mismatch-debug";
  }
  if (
    key === "map.rivers.engineNavigableRiverMetadataMask" ||
    key === "map.rivers.engineMinorRiverMask"
  ) {
    return "engine-metadata-readback";
  }
  if (key === "map.rivers.engineRiverMask") return "engine-terrain-readback";
  if (key.startsWith("map.rivers.")) return "navigable-projection";
  if (key.startsWith("hydrology.hydrography.")) return "physical-river-truth";
  if (key.includes(".lakes.") || key === "hydrology.lakes.lakePlan") return "lake-plan-readback";
  if (key.includes("floodplainIntentMask")) return "floodplain-intent";
  if (key.includes("floodplainAppliedMask") || key === "map.ecology.featureType")
    return "floodplain-apply";
  return "proof-only";
}

function maskPresentationForLayer(layer: VizLayerEntryV1): RiverLakeInspectorMaskPresentation {
  return MASK_PRESENTATIONS[maskCategoryForLayer(layer)];
}

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

function countNonZeroSamples(
  layer: VizLayerEntryV1
): { nonZeroCount: number; sampleCount: number } | null {
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
    presentation: maskPresentationForLayer(layer),
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
  return requiredDataTypeKeys.every(
    (dataTypeKey) => (layersByDataTypeKey.get(dataTypeKey)?.length ?? 0) > 0
  );
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
        ? (spec.presentClaimStatus ?? "available")
        : (spec.missingClaimStatus ?? "unresolved");
      return {
        rowKey: spec.rowKey,
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
