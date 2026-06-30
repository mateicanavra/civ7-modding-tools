// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { type UseDeckAutofitArgs, useDeckAutofit } from "../../src/app/hooks/useDeckAutofit";
import "./_setup";

// Distinct sentinel objects so a dep-array change (identity) re-runs an effect,
// which is what lets the guard-ref tests actually exercise the guards.
const B1 = { tag: "bounds-1" };
const B2 = { tag: "bounds-2" };
const B3 = { tag: "bounds-3" };
const M1 = { tag: "manifest-1" };
const M2 = { tag: "manifest-2" };

function vizOf(opts: {
  spaceId?: string | null;
  bounds?: unknown;
  manifest?: unknown;
}): UseDeckAutofitArgs["viz"] {
  return {
    activeBounds: (opts.bounds ?? null) as UseDeckAutofitArgs["viz"]["activeBounds"],
    manifest: (opts.manifest ?? null) as UseDeckAutofitArgs["viz"]["manifest"],
    effectiveLayer: (opts.spaceId
      ? { spaceId: opts.spaceId }
      : null) as UseDeckAutofitArgs["viz"]["effectiveLayer"],
  };
}

let fit: ReturnType<typeof vi.fn>;

function render(initialViz: UseDeckAutofitArgs["viz"]) {
  fit = vi.fn();
  const deckApiRef = {
    current: { fitToBounds: fit },
  } as unknown as UseDeckAutofitArgs["deckApiRef"];
  let props: UseDeckAutofitArgs = {
    deckApiRef,
    viewportSize: { width: 800, height: 600 },
    deckApiReadyTick: 0,
    viz: initialViz,
  };
  const view = renderHook((p: UseDeckAutofitArgs) => useDeckAutofit(p), {
    initialProps: props,
  });
  const rerender = (patch: Partial<UseDeckAutofitArgs>) => {
    props = { ...props, ...patch };
    act(() => view.rerender(props));
  };
  return { view, rerender, deckApiRef };
}

beforeEach(() => {
  fit = vi.fn();
});

describe("useDeckAutofit — autofit machinery (VL-3/4/5)", () => {
  it("VL-3: per-space refit fires once per distinct spaceId (guarded by lastAutoFitSpaceRef)", () => {
    // manifest=null isolates effect 1 (the first-paint effect is gated off).
    const { rerender } = render(vizOf({ spaceId: "A", bounds: B1 }));
    expect(fit).toHaveBeenCalledTimes(1); // space A, mount

    // same spaceId, NEW bounds object → effect re-runs, but the space guard holds.
    rerender({ viz: vizOf({ spaceId: "A", bounds: B2 }) });
    expect(fit).toHaveBeenCalledTimes(1);

    // new spaceId → fits again.
    rerender({ viz: vizOf({ spaceId: "B", bounds: B3 }) });
    expect(fit).toHaveBeenCalledTimes(2);
  });

  it("VL-4: first-manifest fit fires exactly once per session (guarded by hasEverSeenVizManifestRef)", () => {
    // effectiveLayer=null isolates effect 2 (the per-space effect is gated off).
    const { rerender } = render(vizOf({ bounds: B1, manifest: M1 }));
    expect(fit).toHaveBeenCalledTimes(1); // first manifest, mount

    // a NEW manifest must NOT re-fire (once-per-session guard).
    rerender({ viz: vizOf({ bounds: B1, manifest: M2 }) });
    expect(fit).toHaveBeenCalledTimes(1);
  });

  it("VL-3/4 boundary: effect 1 needs bounds; effect 2 needs a mounted deck API", () => {
    // No bounds → per-space effect early-returns even with a spaceId.
    const { rerender } = render(vizOf({ spaceId: "A", bounds: null }));
    expect(fit).toHaveBeenCalledTimes(0);
    // bounds arrive → fits.
    rerender({ viz: vizOf({ spaceId: "A", bounds: B1 }) });
    expect(fit).toHaveBeenCalledTimes(1);
  });
});

describe("useDeckAutofit — Fit-to-view button handler", () => {
  it("FIT-1: handleFitView fits to the active bounds, and no-ops when bounds are null", () => {
    // No effect fires on mount (no spaceId, no manifest).
    const { view, rerender } = render(vizOf({ bounds: B1 }));
    expect(fit).toHaveBeenCalledTimes(0);

    act(() => view.result.current.handleFitView());
    expect(fit).toHaveBeenCalledTimes(1);
    expect(fit).toHaveBeenCalledWith(B1);

    rerender({ viz: vizOf({ bounds: null }) });
    act(() => view.result.current.handleFitView());
    expect(fit).toHaveBeenCalledTimes(1); // null bounds → no extra call
  });
});
