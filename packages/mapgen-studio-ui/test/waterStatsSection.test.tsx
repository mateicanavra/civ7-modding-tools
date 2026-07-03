import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  type WaterStatsLayerRef,
  type WaterStatsRow,
  WaterStatsSection,
  type WaterStatsSectionProps,
  type WaterStatsSummary,
} from "../src/components/composites/WaterStatsSection.js";
import { TooltipProvider } from "../src/components/ui/tooltip.js";

// Water stats pins: the ExplorePanel surface is a STATS section — semantic
// counts (plan vs engine, divergence emphasis) plus layer-jump chips. Proof
// vocabulary (claim words, lane eyebrows, acceptance rows) must NOT render:
// claim bookkeeping lives in the semantic module and project docs, not in
// product chrome. Fixtures are typed against the package-owned NARROW
// structural types (the app's wide viz types conform structurally); the wide
// proof-vocabulary fields (lane, claimStatus, evidence, …) are no longer part
// of the contract — the render-absence pins below still hold.

function makeRef(overrides: Partial<WaterStatsLayerRef> = {}): WaterStatsLayerRef {
  return {
    dataTypeKey: "map.rivers.projectedRiverMask",
    layerKey: "step-a::map.rivers.projectedRiverMask::tile.hexOddQ::grid",
    label: "Projected river mask",
    presentation: {
      categoryLabel: "Projection plan",
      palette: {
        activeColor: "#0f766e",
      },
    },
    ...overrides,
  };
}

function makeRow(overrides: Partial<WaterStatsRow> = {}): WaterStatsRow {
  return {
    rowKey: "projection-plan",
    label: "Navigable river plan",
    counts: { layers: 1, projected: 12 },
    layerRefs: [makeRef()],
    ...overrides,
  };
}

function makeSummary(rows: readonly WaterStatsRow[]): WaterStatsSummary {
  return { rows };
}

function renderSection(overrides: Partial<WaterStatsSectionProps> = {}) {
  return renderToStaticMarkup(
    <TooltipProvider>
      <WaterStatsSection
        summary={makeSummary([makeRow()])}
        onLayerSelect={vi.fn()}
        expanded
        onExpandedChange={vi.fn()}
        {...overrides}
      />
    </TooltipProvider>
  );
}

describe("WaterStatsSection (water stats)", () => {
  it("renders one stats line per data family with its semantic counts", () => {
    const html = renderSection({
      summary: makeSummary([
        makeRow(),
        makeRow({
          rowKey: "hydrology-truth",
          label: "Drainage truth",
          counts: { layers: 3, rivers: 562 },
          layerRefs: [],
        }),
      ]),
    });

    expect(html).toContain("Navigable river plan");
    expect(html).toContain("projected 12");
    expect(html).toContain("Drainage truth");
    expect(html).toContain("rivers 562");
  });

  it("drops manifest-inventory counts (layers/shown/debug) from the chips", () => {
    const html = renderSection();
    expect(html).not.toContain("layers 1");
  });

  it("renders no proof vocabulary — claim words, lane eyebrows, status dots are gone", () => {
    const html = renderSection({
      summary: makeSummary([makeRow(), makeRow({ rowKey: "x", counts: { terrain: 9 } })]),
    });

    expect(html).not.toContain("inspect");
    expect(html).not.toContain(">open<");
    expect(html).not.toContain(">ready<");
    expect(html).not.toContain("bg-success");
    expect(html).not.toContain("bg-destructive");
  });

  it("hides bookkeeping rows that carry no counts and no layers", () => {
    const html = renderSection({
      summary: makeSummary([
        makeRow(),
        makeRow({ rowKey: "acceptance", label: "Product closure", counts: {}, layerRefs: [] }),
      ]),
    });

    expect(html).not.toContain("Product closure");
  });

  it("emphasizes nonzero divergence counts and reports them in the collapsed summary", () => {
    const diverged = renderSection({
      expanded: false,
      summary: makeSummary([makeRow({ counts: { mismatch: 3, terrain: 9 } })]),
    });
    expect(diverged).toContain("3 mismatched");
    expect(diverged).toContain("text-warning");

    const clean = renderSection({
      expanded: false,
      summary: makeSummary([makeRow({ counts: { mismatch: 0, terrain: 9 } })]),
    });
    expect(clean).toContain("matches baseline");
  });

  it("renders nothing when the summary is null or has no informative rows", () => {
    expect(renderSection({ summary: null })).toBe("");
    expect(renderSection({ summary: makeSummary([]) })).toBe("");
    expect(renderSection({ summary: makeSummary([makeRow({ counts: {}, layerRefs: [] })]) })).toBe(
      ""
    );
  });

  it("hides the stats list when collapsed", () => {
    const html = renderSection({ expanded: false });

    expect(html).toContain("Water stats");
    expect(html).not.toContain('id="explore-water-stats-list"');
    expect(html).not.toContain("Navigable river plan");
  });

  it("gives layer chips an accessible name carrying the category label", () => {
    const html = renderSection();
    expect(html).toContain('aria-label="Projected river mask · Projection plan"');
  });
});
