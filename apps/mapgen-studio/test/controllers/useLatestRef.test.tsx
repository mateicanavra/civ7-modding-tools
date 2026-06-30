// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLatestRef } from "../../src/app/hooks/useLatestRef";
import "./_setup";

/**
 * IMPROVE-2 gating (behavioral) — `useLatestRef` must mirror the latest rendered
 * value via a RENDER-PHASE write, so the ref is current *before* effects run.
 *
 * The load-bearing falsifier is the "during render" probe below: if the hook
 * synced through `useEffect`/`useLayoutEffect` (or forgot to write at all), the
 * ref would still hold the previous commit's value while the value-changing
 * render is executing — and `seenDuringRender` would lag. A render-phase write
 * is the only implementation that keeps it in lockstep. The companion
 * `useLatestRef.source.test.ts` pins that invariant structurally as a second,
 * independent line of defense.
 */
describe("useLatestRef (IMPROVE-2)", () => {
  it("exposes the latest value during the render that changes it (not one commit late)", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => {
        const ref = useLatestRef(value);
        // Read the ref DURING render — before any effect could have run. With an
        // effect-based sync this would still be the prior commit's value.
        const seenDuringRender = ref.current;
        return { ref, seenDuringRender };
      },
      { initialProps: { value: 1 } }
    );

    expect(result.current.seenDuringRender).toBe(1);
    expect(result.current.ref.current).toBe(1);

    rerender({ value: 2 });
    expect(result.current.seenDuringRender).toBe(2);
    expect(result.current.ref.current).toBe(2);

    rerender({ value: 3 });
    expect(result.current.seenDuringRender).toBe(3);
    expect(result.current.ref.current).toBe(3);
  });

  it("returns a stable ref object across rerenders (only `.current` changes)", () => {
    const { result, rerender } = renderHook(({ value }: { value: number }) => useLatestRef(value), {
      initialProps: { value: "a" as string },
    });
    const first = result.current;
    rerender({ value: "b" });
    expect(result.current).toBe(first);
    expect(result.current.current).toBe("b");
  });

  it("preserves referential identity of non-primitive values without copying", () => {
    const objA = { id: "a" };
    const objB = { id: "b" };
    const { result, rerender } = renderHook(
      ({ value }: { value: { id: string } }) => useLatestRef(value),
      { initialProps: { value: objA } }
    );
    expect(result.current.current).toBe(objA);
    rerender({ value: objB });
    expect(result.current.current).toBe(objB);
  });
});
