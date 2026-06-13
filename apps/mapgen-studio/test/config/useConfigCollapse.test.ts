import { describe, expect, it } from "vitest";

import {
  computeActiveChain,
  pointerPrefixes,
} from "../../src/features/configOverrides/useConfigCollapse";

// The sticky engine's pure core (Pass-4 config-collapse design): the
// candidate is the LAST header at/above the focus line; the active chain is
// the candidate plus its ancestor pointers (string prefixes). The DOM/scroll
// glue around it is verified live.

describe("pointerPrefixes", () => {
  it("yields the pointer and every ancestor", () => {
    expect(pointerPrefixes("/a/b/c")).toEqual(["/a", "/a/b", "/a/b/c"]);
  });

  it("handles a top-level pointer", () => {
    expect(pointerPrefixes("/foundation")).toEqual(["/foundation"]);
  });
});

describe("computeActiveChain", () => {
  const headers = [
    { pointer: "/foundation", top: 0 },
    { pointer: "/foundation/knobs", top: 40 },
    { pointer: "/morphology", top: 400 },
    { pointer: "/morphology/coasts", top: 440 },
  ];

  it("is empty with no headers", () => {
    expect(computeActiveChain([], 100).size).toBe(0);
  });

  it("activates the first header before any crosses the focus line", () => {
    const chain = computeActiveChain(
      headers.map((h) => ({ ...h, top: h.top + 200 })),
      100
    );
    expect([...chain]).toEqual(["/foundation"]);
  });

  it("activates the last header at or above the focus line, with ancestors", () => {
    const chain = computeActiveChain(headers, 100);
    expect(chain.has("/foundation")).toBe(true);
    expect(chain.has("/foundation/knobs")).toBe(true);
    expect(chain.has("/morphology")).toBe(false);
  });

  it("moves the chain to the next section once its header crosses the line", () => {
    const chain = computeActiveChain(headers, 410);
    expect([...chain]).toEqual(["/morphology"]);
  });

  it("cascades into nested headers as they cross the line", () => {
    const chain = computeActiveChain(headers, 450);
    expect(chain.has("/morphology")).toBe(true);
    expect(chain.has("/morphology/coasts")).toBe(true);
    expect(chain.has("/foundation")).toBe(false);
  });
});
