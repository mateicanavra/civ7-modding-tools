import type { RecipeDagResult } from "@civ7/studio-contract";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PIPELINE_EDGE_INK, PipelineStage } from "../../src/features/recipeDag/PipelineStage";

// Behavioral pins PORTED from the merged feature's RecipeDagView.test.tsx
// (handoff §1/§4: the chrome was re-expressed in the redesign's language, so
// the semantic assertions move here — selection vs expansion, label
// selectability, focus accents, z-order — while palette literals become the
// token-driven equivalents).

describe("PipelineStage", () => {
  it("renders phase bands, stage nodes, artifact edge labels, and expanded sequential steps", () => {
    const html = renderToStaticMarkup(
      <PipelineStage
        recipeId="mod-swooper-maps/standard"
        dag={recipeDag()}
        status="ready"
        error={null}
        isLightMode={false}
        expandedStageIds={new Set(["shape"])}
        selectedStageId="shape"
        onToggleStage={vi.fn()}
        onSelectStage={vi.fn()}
        topInset={96}
        bottomInset={88}
      />
    );

    expect(html).toContain("Swooper Maps / Standard");
    expect(html).toContain("shape");
    expect(html).toContain("climate");
    expect(html).toContain("Sources");
    expect(html).toContain(">hydrography<");
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('aria-expanded="true"');
    expect(html).toContain('aria-controls="recipe-dag-stage-shape-steps"');
    expect(html).toContain('data-stage-expanded="true"');
    expect(html).toContain("z-index:95");
    expect(html).toContain('marker-end="url(#recipe-dag-arrow-active)"');
    expect(html).toContain('stroke="#f59e0b"');
    expect(html).toContain('aria-label="Select dependency hydrography"');
    expect(html).toContain('data-edge-label-selected="false"');
    expect(html).toContain("Step 1: seed");
    expect(html).toContain("Creates");
  });

  it("keeps connector paths and labels neutral before selection", () => {
    const html = renderToStaticMarkup(
      <PipelineStage
        recipeId="mod-swooper-maps/standard"
        dag={recipeDag()}
        status="ready"
        error={null}
        isLightMode={false}
        expandedStageIds={new Set()}
        selectedStageId={null}
        onToggleStage={vi.fn()}
        onSelectStage={vi.fn()}
        topInset={96}
        bottomInset={88}
      />
    );

    // Idle graph: connectors carry the neutral token ink, labels ride the
    // neutral popover pill, no domain accent leaks into inline styles.
    expect(html).toContain(`stroke="${PIPELINE_EDGE_INK}"`);
    expect(html).toContain("border-border bg-popover text-muted-foreground");
    expect(html).toContain(" L ");
    expect(html).toContain('marker-end="url(#recipe-dag-arrow)"');
    expect(html).not.toContain("border-color:#f59e0b");
  });

  it("surfaces projection diagnostics in the warning panel", () => {
    const dag = recipeDag();
    const withDiagnostics: RecipeDagResult = {
      ...dag,
      diagnostics: [
        {
          kind: "artifact-consumer-missing",
          artifact: { id: "artifact:hydrology.hydrography", name: "Hydrology hydrography" },
        } as RecipeDagResult["diagnostics"][number],
      ],
    };
    const html = renderToStaticMarkup(
      <PipelineStage
        recipeId="mod-swooper-maps/standard"
        dag={withDiagnostics}
        status="ready"
        error={null}
        isLightMode={false}
        expandedStageIds={new Set()}
        selectedStageId={null}
        onToggleStage={vi.fn()}
        onSelectStage={vi.fn()}
        topInset={96}
        bottomInset={88}
      />
    );

    expect(html).toContain("Artifact diagnostics");
    expect(html).toContain("artifact-consumer-missing");
  });
});

function recipeDag(): RecipeDagResult {
  return {
    recipeId: "standard",
    recipeKey: "mod-swooper-maps/standard",
    namespace: "mod-swooper-maps",
    title: "Swooper Maps / Standard",
    phases: [
      {
        id: "shape",
        order: 0,
        stageIds: ["shape", "isolated"],
        stepCount: 2,
      },
      {
        id: "climate",
        order: 1,
        stageIds: ["climate"],
        stepCount: 1,
      },
    ],
    stages: [
      {
        id: "shape",
        stageId: "shape",
        order: 0,
        phases: ["shape"],
        steps: [
          {
            id: "mod-swooper-maps.standard.shape.seed",
            stageId: "shape",
            stepId: "seed",
            fullStepId: "mod-swooper-maps.standard.shape.seed",
            order: 0,
            orderInStage: 0,
            phase: "shape",
            artifactRequires: [],
            artifactProvides: [
              { id: "artifact:hydrology.hydrography", name: "Hydrology hydrography" },
            ],
            tagRequires: [],
            tagProvides: [],
          },
        ],
        artifactRequires: [],
        artifactProvides: [{ id: "artifact:hydrology.hydrography", name: "Hydrology hydrography" }],
        inboundArtifactEdgeCount: 0,
        outboundArtifactEdgeCount: 1,
        internalArtifactEdgeCount: 0,
        diagnosticCount: 0,
      },
      {
        id: "climate",
        stageId: "climate",
        order: 1,
        phases: ["climate"],
        steps: [
          {
            id: "mod-swooper-maps.standard.climate.temperature",
            stageId: "climate",
            stepId: "temperature",
            fullStepId: "mod-swooper-maps.standard.climate.temperature",
            order: 1,
            orderInStage: 0,
            phase: "climate",
            artifactRequires: [
              { id: "artifact:hydrology.hydrography", name: "Hydrology hydrography" },
            ],
            artifactProvides: [],
            tagRequires: [],
            tagProvides: [],
          },
        ],
        artifactRequires: [{ id: "artifact:hydrology.hydrography", name: "Hydrology hydrography" }],
        artifactProvides: [],
        inboundArtifactEdgeCount: 1,
        outboundArtifactEdgeCount: 0,
        internalArtifactEdgeCount: 0,
        diagnosticCount: 0,
      },
      {
        id: "isolated",
        stageId: "isolated",
        order: 2,
        phases: ["shape"],
        steps: [
          {
            id: "mod-swooper-maps.standard.isolated.note",
            stageId: "isolated",
            stepId: "note",
            fullStepId: "mod-swooper-maps.standard.isolated.note",
            order: 2,
            orderInStage: 0,
            phase: "shape",
            artifactRequires: [],
            artifactProvides: [],
            tagRequires: [],
            tagProvides: [],
          },
        ],
        artifactRequires: [],
        artifactProvides: [],
        inboundArtifactEdgeCount: 0,
        outboundArtifactEdgeCount: 0,
        internalArtifactEdgeCount: 0,
        diagnosticCount: 0,
      },
    ],
    edges: [
      {
        id: "mod-swooper-maps.standard.shape.seed->mod-swooper-maps.standard.climate.temperature:artifact:hydrology.hydrography",
        artifact: { id: "artifact:hydrology.hydrography", name: "Hydrology hydrography" },
        from: {
          stageId: "shape",
          stepId: "seed",
          fullStepId: "mod-swooper-maps.standard.shape.seed",
        },
        to: {
          stageId: "climate",
          stepId: "temperature",
          fullStepId: "mod-swooper-maps.standard.climate.temperature",
        },
        internal: false,
      },
    ],
    diagnostics: [],
  };
}
