// @vitest-environment jsdom
import { renderHook } from "@testing-library/react";
import { useEffect, useState } from "react";
import { describe, expect, it } from "vitest";
import "./_setup";

/**
 * Step-0 acceptance: the controller-test harness (jsdom DOM env + React Testing
 * Library `renderHook` + the ResizeObserver polyfill) is wired and functional.
 * Controller-hook gating tests in this directory rely on all three.
 */
describe("controller-test harness (jsdom + RTL)", () => {
  it("provides a DOM environment", () => {
    expect(typeof document).toBe("object");
    expect(typeof window).toBe("object");
    expect(typeof globalThis.ResizeObserver).toBe("function");
  });

  it("renderHook mounts a hook, runs effects, and reports rerenders", () => {
    const { result, rerender } = renderHook(
      ({ n }: { n: number }) => {
        const [committed, setCommitted] = useState(0);
        useEffect(() => {
          setCommitted(n);
        }, [n]);
        return committed;
      },
      { initialProps: { n: 1 } }
    );
    // effect committed the initial prop
    expect(result.current).toBe(1);
    rerender({ n: 2 });
    expect(result.current).toBe(2);
  });
});
