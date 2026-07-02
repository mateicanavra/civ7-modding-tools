import type { RecipeDagResult } from "@civ7/studio-contract";

/**
 * A small but complete, valid `RecipeDagResult` for the `PipelineStage` story —
 * a four-phase map-generation recipe (foundation → morphology → hydrology →
 * ecology), wired by the artifacts each stage provides/consumes. Ported from the
 * synced `.design-sync/previews/PipelineStage.tsx` fixture and typed against the
 * real `@civ7/studio-contract` schema, so `buildRecipeDagLayout` lays it
 * out deterministically with no server.
 *
 * INVARIANT (mirrored by the story): every id in the story's `expandedStageIds`
 * must equal one of the `stages[].stageId` defined here. The story expands
 * "relief", which exists below.
 */
type ArtifactRef = RecipeDagResult["stages"][number]["artifactRequires"][number];
type Step = RecipeDagResult["stages"][number]["steps"][number];
type Edge = RecipeDagResult["edges"][number];

const ref = (id: string): ArtifactRef => ({ id, name: id });

const step = (
  stageId: string,
  stepId: string,
  order: number,
  orderInStage: number,
  phase: string,
  requires: string[],
  provides: string[]
): Step => ({
  id: `${stageId}.${stepId}`,
  stageId,
  stepId,
  fullStepId: `${stageId}.${stepId}`,
  order,
  orderInStage,
  phase,
  artifactRequires: requires.map(ref),
  artifactProvides: provides.map(ref),
  tagRequires: [],
  tagProvides: [],
});

const edge = (
  artifact: string,
  fromStage: string,
  fromStep: string,
  toStage: string,
  toStep: string
): Edge => ({
  id: `${fromStage}.${fromStep}->${toStage}.${toStep}:${artifact}`,
  artifact: ref(artifact),
  from: { stageId: fromStage, stepId: fromStep, fullStepId: `${fromStage}.${fromStep}` },
  to: { stageId: toStage, stepId: toStep, fullStepId: `${toStage}.${toStep}` },
  internal: false,
});

export const recipeDagFixture: RecipeDagResult = {
  recipeId: "mod-swooper-maps/standard",
  recipeKey: "standard",
  namespace: "mod-swooper-maps",
  title: "Standard",
  phases: [
    { id: "foundation", order: 0, stageIds: ["plates"], stepCount: 2 },
    { id: "morphology", order: 1, stageIds: ["relief", "coastlines"], stepCount: 3 },
    { id: "hydrology", order: 2, stageIds: ["rivers"], stepCount: 3 },
    { id: "ecology", order: 3, stageIds: ["biomes"], stepCount: 2 },
  ],
  stages: [
    {
      id: "plates",
      stageId: "plates",
      order: 0,
      phases: ["foundation"],
      steps: [
        step("plates", "seedPlates", 0, 0, "foundation", [], ["crust"]),
        step("plates", "driftPlates", 1, 1, "foundation", ["crust"], ["plates"]),
      ],
      artifactRequires: [],
      artifactProvides: [ref("crust"), ref("plates")],
      inboundArtifactEdgeCount: 0,
      outboundArtifactEdgeCount: 2,
      internalArtifactEdgeCount: 1,
      diagnosticCount: 0,
    },
    {
      id: "relief",
      stageId: "relief",
      order: 1,
      phases: ["morphology"],
      steps: [
        step("relief", "upliftRanges", 2, 0, "morphology", ["crust"], ["elevation"]),
        step("relief", "carveBasins", 3, 1, "morphology", ["elevation"], ["landmask"]),
      ],
      artifactRequires: [ref("crust")],
      artifactProvides: [ref("elevation"), ref("landmask")],
      inboundArtifactEdgeCount: 1,
      outboundArtifactEdgeCount: 3,
      internalArtifactEdgeCount: 1,
      diagnosticCount: 0,
    },
    {
      id: "coastlines",
      stageId: "coastlines",
      order: 2,
      phases: ["morphology"],
      steps: [step("coastlines", "traceCoast", 4, 0, "morphology", ["landmask"], ["coast"])],
      artifactRequires: [ref("landmask")],
      artifactProvides: [ref("coast")],
      inboundArtifactEdgeCount: 1,
      outboundArtifactEdgeCount: 1,
      internalArtifactEdgeCount: 0,
      diagnosticCount: 0,
    },
    {
      id: "rivers",
      stageId: "rivers",
      order: 3,
      phases: ["hydrology"],
      steps: [
        step("rivers", "accumulateFlow", 5, 0, "hydrology", ["elevation"], ["flow"]),
        step("rivers", "routeRivers", 6, 1, "hydrology", ["flow", "coast"], ["rivers"]),
        step("rivers", "carveValleys", 7, 2, "hydrology", ["rivers"], ["valleys"]),
      ],
      artifactRequires: [ref("elevation"), ref("coast")],
      artifactProvides: [ref("rivers"), ref("flow"), ref("valleys")],
      inboundArtifactEdgeCount: 2,
      outboundArtifactEdgeCount: 1,
      internalArtifactEdgeCount: 2,
      diagnosticCount: 1,
    },
    {
      id: "biomes",
      stageId: "biomes",
      order: 4,
      phases: ["ecology"],
      steps: [
        step("biomes", "classifyBiomes", 8, 0, "ecology", ["rivers", "elevation"], ["biomes"]),
        step("biomes", "scatterVegetation", 9, 1, "ecology", ["biomes"], ["vegetation"]),
      ],
      artifactRequires: [ref("rivers"), ref("elevation")],
      artifactProvides: [ref("biomes"), ref("vegetation")],
      inboundArtifactEdgeCount: 2,
      outboundArtifactEdgeCount: 0,
      internalArtifactEdgeCount: 1,
      diagnosticCount: 0,
    },
  ],
  edges: [
    edge("crust", "plates", "seedPlates", "relief", "upliftRanges"),
    edge("landmask", "relief", "carveBasins", "coastlines", "traceCoast"),
    edge("elevation", "relief", "upliftRanges", "rivers", "accumulateFlow"),
    edge("coast", "coastlines", "traceCoast", "rivers", "routeRivers"),
    edge("elevation", "relief", "upliftRanges", "biomes", "classifyBiomes"),
    edge("rivers", "rivers", "routeRivers", "biomes", "classifyBiomes"),
  ],
  diagnostics: [
    {
      kind: "artifact-consumer-missing",
      artifact: ref("valleys"),
      provider: { stageId: "rivers", stepId: "carveValleys", fullStepId: "rivers.carveValleys" },
    },
  ],
};
