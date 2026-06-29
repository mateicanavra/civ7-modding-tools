// @vitest-environment jsdom
import { act, render, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { useRecipeDagQuery } from "../../src/features/recipeDag/useRecipeDagQuery";
import { useViewportLayout, type ViewportLayout } from "../../src/app/hooks/useViewportLayout";
import type { StageView } from "../../src/stores/viewStore";
import "./_setup";

// Mock the DAG query so the hook mounts without a QueryClientProvider and so the
// VL-6 test can read the exact options the hook passes.
vi.mock("../../src/features/recipeDag/useRecipeDagQuery", () => ({
  useRecipeDagQuery: vi.fn(() => ({ dag: null, status: "idle", error: null })),
}));

/**
 * Controllable ResizeObserver: capture instances so a test can fire the
 * callback and assert disconnect-on-unmount + which element was observed.
 * Overrides the no-op stub from `_setup` for this file only.
 */
class TestResizeObserver {
  static instances: TestResizeObserver[] = [];
  readonly callback: ResizeObserverCallback;
  readonly observed: Element[] = [];
  disconnected = false;
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
    TestResizeObserver.instances.push(this);
  }
  observe(el: Element): void {
    this.observed.push(el);
  }
  unobserve(): void {}
  disconnect(): void {
    this.disconnected = true;
  }
  emit(): void {
    this.callback([], this as unknown as ResizeObserver);
  }
}

const originalResizeObserver = globalThis.ResizeObserver;
let rectSpy: ReturnType<typeof vi.spyOn>;

function setRect(width: number, height: number): void {
  rectSpy.mockReturnValue({
    width,
    height,
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: height,
    toJSON: () => ({}),
  } as DOMRect);
}

beforeEach(() => {
  TestResizeObserver.instances = [];
  globalThis.ResizeObserver = TestResizeObserver as unknown as typeof ResizeObserver;
  rectSpy = vi.spyOn(HTMLElement.prototype, "getBoundingClientRect");
  setRect(1024, 768);
  (useRecipeDagQuery as Mock).mockClear();
});

afterEach(() => {
  globalThis.ResizeObserver = originalResizeObserver;
  rectSpy.mockRestore();
});

describe("useViewportLayout — viewport (VL-1)", () => {
  it("observes the container, tracks resizes, and disconnects on unmount", () => {
    let latest!: ViewportLayout;
    function Probe() {
      latest = useViewportLayout({ recipe: "rec-1", stageView: "map" });
      return <div ref={latest.containerRef} />;
    }

    const { unmount } = render(<Probe />);

    // The observer is wired to THIS hook's container ref (not some other node)
    // and measured it on mount.
    expect(TestResizeObserver.instances).toHaveLength(1);
    expect(TestResizeObserver.instances[0].observed[0]).toBe(latest.containerRef.current);
    expect(latest.viewportSize).toEqual({ width: 1024, height: 768 });

    // A subsequent observed resize re-measures to the new rect.
    setRect(640, 480);
    act(() => {
      TestResizeObserver.instances[0].emit();
    });
    expect(latest.viewportSize).toEqual({ width: 640, height: 480 });

    // Unmount tears the observer down (no leak across canvas remounts).
    unmount();
    expect(TestResizeObserver.instances[0].disconnected).toBe(true);
  });

  it("clamps a zero-sized container to a 1x1 floor", () => {
    setRect(0, 0);
    let latest!: ViewportLayout;
    function Probe() {
      latest = useViewportLayout({ recipe: "rec-1", stageView: "map" });
      return <div ref={latest.containerRef} />;
    }
    render(<Probe />);
    expect(latest.viewportSize).toEqual({ width: 1, height: 1 });
  });
});

describe("useViewportLayout — recipe DAG fetch gate (VL-6)", () => {
  it("enables the DAG query only while the pipeline view is active", () => {
    const { rerender } = renderHook(
      ({ stageView }: { stageView: StageView }) => useViewportLayout({ recipe: "rec-1", stageView }),
      { initialProps: { stageView: "pipeline" as StageView } }
    );

    const mock = useRecipeDagQuery as Mock;
    expect(mock.mock.calls.at(-1)).toEqual(["rec-1", { enabled: true }]);

    rerender({ stageView: "map" });
    expect(mock.mock.calls.at(-1)).toEqual(["rec-1", { enabled: false }]);
  });
});
