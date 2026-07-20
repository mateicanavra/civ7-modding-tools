import type { RecipeDagResult } from "@civ7/studio-contract";

/**
 * A small but complete, valid `RecipeDagResult` for the `PipelineStage` story —
 * a four-domain map-generation recipe (foundation → morphology → hydrology →
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
  requires: string[],
  provides: string[]
): Step => ({
  stageId,
  stepId,
  fullStepId: `${stageId}.${stepId}`,
  order,
  orderInStage,
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
  stages: [
    {
      stageId: "plates",
      order: 0,
      steps: [
        step("plates", "seedPlates", 0, 0, [], ["crust"]),
        step("plates", "driftPlates", 1, 1, ["crust"], ["plates"]),
      ],
      artifactRequires: [],
      artifactProvides: [ref("crust"), ref("plates")],
      inboundArtifactEdgeCount: 0,
      outboundArtifactEdgeCount: 2,
      internalArtifactEdgeCount: 1,
      diagnosticCount: 0,
    },
    {
      stageId: "relief",
      order: 1,
      steps: [
        step("relief", "upliftRanges", 2, 0, ["crust"], ["elevation"]),
        step("relief", "carveBasins", 3, 1, ["elevation"], ["landmask"]),
      ],
      artifactRequires: [ref("crust")],
      artifactProvides: [ref("elevation"), ref("landmask")],
      inboundArtifactEdgeCount: 1,
      outboundArtifactEdgeCount: 3,
      internalArtifactEdgeCount: 1,
      diagnosticCount: 0,
    },
    {
      stageId: "coastlines",
      order: 2,
      steps: [step("coastlines", "traceCoast", 4, 0, ["landmask"], ["coast"])],
      artifactRequires: [ref("landmask")],
      artifactProvides: [ref("coast")],
      inboundArtifactEdgeCount: 1,
      outboundArtifactEdgeCount: 1,
      internalArtifactEdgeCount: 0,
      diagnosticCount: 0,
    },
    {
      stageId: "rivers",
      order: 3,
      steps: [
        step("rivers", "accumulateFlow", 5, 0, ["elevation"], ["flow"]),
        step("rivers", "routeRivers", 6, 1, ["flow", "coast"], ["rivers"]),
        step("rivers", "carveValleys", 7, 2, ["rivers"], ["valleys"]),
      ],
      artifactRequires: [ref("elevation"), ref("coast")],
      artifactProvides: [ref("rivers"), ref("flow"), ref("valleys")],
      inboundArtifactEdgeCount: 2,
      outboundArtifactEdgeCount: 1,
      internalArtifactEdgeCount: 2,
      diagnosticCount: 1,
    },
    {
      stageId: "biomes",
      order: 4,
      steps: [
        step("biomes", "classifyBiomes", 8, 0, ["rivers", "elevation"], ["biomes"]),
        step("biomes", "scatterVegetation", 9, 1, ["biomes"], ["vegetation"]),
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
