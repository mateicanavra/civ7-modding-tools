import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { WaterProofSection, type WaterProofSectionProps } from "../../src/ui/components/WaterProofSection";
import { TooltipProvider } from "../../src/components/ui/tooltip";
import type {
  RiverLakeFloodplainInspectorSummary,
  RiverLakeInspectorClaimStatus,
  RiverLakeInspectorLayerRef,
  RiverLakeInspectorRow,
} from "../../src/features/viz/riverLakeInspector";

// The water-proof section is the redesigned ExplorePanel's home for the
// River/Lake/Floodplain inspector. These pins guard the anti-masquerade rule:
// the status WORD + dot derive ONLY from `row.claimStatus`, never from layer
// presence, and `available` (evidence present, unverified) must never wear
// success-green.

function makeRef(overrides: Partial<RiverLakeInspectorLayerRef> = {}): RiverLakeInspectorLayerRef {
  return {
    dataTypeKey: "map.rivers.projectedRiverMask",
    layerKey: "step-a::map.rivers.projectedRiverMask::tile.hexOddQ::grid",
    stepId: "step-a",
    stepIndex: 1,
    spaceId: "tile.hexOddQ",
    kind: "grid",
    role: "projection",
    variantKey: null,
    visibility: "default",
    label: "Projected river mask",
    renderModeId: "grid:projection",
    nonZeroCount: 12,
    sampleCount: 100,
    presentation: {
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
    ...overrides,
  };
}

function makeRow(overrides: Partial<RiverLakeInspectorRow> = {}): RiverLakeInspectorRow {
  return {
    rowKey: "projection-plan",
    lane: "projection",
    laneLabel: "Projection",
    label: "Navigable river plan",
    proofClass: "projection-plan",
    claimStatus: "available",
    displayStatus: "projection-plan-present",
    counts: { layers: 1, projected: 12 },
    layerRefs: [makeRef()],
    evidence: ["The projected navigable-river mask is present."],
    ...overrides,
  };
}

function makeSummary(rows: readonly RiverLakeInspectorRow[]): RiverLakeFloodplainInspectorSummary {
  return { version: 1, rows };
}

function renderSection(overrides: Partial<WaterProofSectionProps> = {}) {
  return renderToStaticMarkup(
    <TooltipProvider>
      <WaterProofSection
        summary={makeSummary([makeRow()])}
        onLayerSelect={vi.fn()}
        expanded
        onExpandedChange={vi.fn()}
        {...overrides}
      />
    </TooltipProvider>
  );
}

function singleStatusRow(claimStatus: RiverLakeInspectorClaimStatus) {
  return renderSection({ summary: makeSummary([makeRow({ claimStatus })]) });
}

describe("WaterProofSection", () => {
  it("renders the lane eyebrow and row label for each row", () => {
    const html = renderSection({
      summary: makeSummary([
        makeRow(),
        makeRow({
          rowKey: "hydrology-truth",
          lane: "hydrology",
          laneLabel: "Hydrology",
          label: "Drainage truth",
          proofClass: "hydrology-truth",
        }),
      ]),
    });

    expect(html).toContain("Projection");
    expect(html).toContain("Navigable river plan");
    expect(html).toContain("Hydrology");
    expect(html).toContain("Drainage truth");
  });

  it("renders available as the word inspect and never masquerades as success", () => {
    const html = singleStatusRow("available");
    expect(html).toContain("inspect");
    // Anti-masquerade pin: evidence being PRESENT is not a verified pass.
    expect(html).not.toContain("bg-success");
  });

  it("renders unresolved as open with the warning dot", () => {
    const html = singleStatusRow("unresolved");
    expect(html).toContain("open");
    expect(html).toContain("bg-warning");
  });

  it("renders fail with the destructive dot", () => {
    const html = singleStatusRow("fail");
    expect(html).toContain(">fail<");
    expect(html).toContain("bg-destructive");
  });

  it("renders pass as ready with the success dot", () => {
    const html = singleStatusRow("pass");
    expect(html).toContain("ready");
    expect(html).toContain("bg-success");
  });

  it("renders nothing when the summary is null or empty", () => {
    expect(renderSection({ summary: null })).toBe("");
    expect(renderSection({ summary: makeSummary([]) })).toBe("");
  });

  it("hides the row list when collapsed but keeps the header inline summary", () => {
    const html = renderSection({
      expanded: false,
      summary: makeSummary([
        makeRow(),
        makeRow({ rowKey: "civ-rendered", laneLabel: "Rendered", label: "In-game visible rivers", claimStatus: "unresolved" }),
      ]),
    });

    expect(html).toContain("Water proof");
    expect(html).toContain("1 evidence · 1 open");
    // The header keeps aria-controls pointing at the list id; the list element
    // itself (and its rows) must be gone when collapsed.
    expect(html).not.toContain('id="explore-water-proof-list"');
    expect(html).not.toContain("Navigable river plan");
  });

  it("gives layer chips an accessible name carrying the category label", () => {
    const html = renderSection();
    expect(html).toContain(
      'aria-label="Projected river mask · Projection plan · projection-plan"'
    );
  });
});
