import { PipelineStage } from "mapgen-studio";

// PipelineStage is the recipe dependency graph as a first-class stage view: a
// headless-laid-out SVG canvas — dependency rank (Sources → D1 → D2…) crossed
// with phase lanes, bundled artifact edges, and selectable stage nodes that
// expand to their steps. It renders from a static `RecipeDagResult` (the
// studio-server contract), so a hand-authored fixture drives it deterministically
// here. Framed in a relative dark Stage surface (the component is `absolute
// inset-0`); cardMode:single + a wide viewport reveals the lanes/nodes/edges.
const noop = () => {};

const ref = (id) => ({ id, name: id });
const step = (stageId, stepId, order, orderInStage, phase, requires, provides) => ({
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
const edge = (artifact, fromStage, fromStep, toStage, toStep) => ({
  id: `${fromStage}.${fromStep}->${toStage}.${toStep}:${artifact}`,
  artifact: ref(artifact),
  from: { stageId: fromStage, stepId: fromStep, fullStepId: `${fromStage}.${fromStep}` },
  to: { stageId: toStage, stepId: toStep, fullStepId: `${toStage}.${toStep}` },
  internal: false,
});

// A small but real map-generation recipe DAG: foundation → morphology →
// hydrology → ecology, wired by the artifacts each stage provides/consumes.
const dag = {
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

function Stage({ children }) {
  return (
    <div
      className="relative bg-background"
      style={{ width: 1080, height: 600, borderRadius: 8, overflow: "hidden" }}
    >
      {children}
    </div>
  );
}

// The ready graph: phase lanes (Foundation/Morphology/Hydrology…) crossed with
// dependency ranks, the `relief` stage expanded to its steps, the console strip
// (Phases/Stages/Edges/Issues) top-right.
export const PipelineGraph = () => (
  <Stage>
    <PipelineStage
      recipeId="mod-swooper-maps/standard"
      dag={dag}
      status="ready"
      error={null}
      isLightMode={false}
      expandedStageIds={new Set(["relief"])}
      selectedStageId={null}
      onToggleStage={noop}
      onSelectStage={noop}
      topInset={16}
      bottomInset={16}
    />
  </Stage>
);
