import { collapsedSourceScanRoots } from "@internal/habitat-harness/service/model/source-check/index";
import { describe, expect, test } from "vitest";

describe("source-check scan root planning", () => {
  test("collapses nested scan roots before filesystem traversal", () => {
    expect(
      collapsedSourceScanRoots([
        "packages/mapgen-core/src",
        "packages/mapgen-core",
        "./packages/mapgen-core/src/core",
        ".habitat/tooling/components/legacy-source-check",
        "tools/habitat-harness/src",
      ])
    ).toEqual([
      ".habitat/tooling/components/legacy-source-check",
      "packages/mapgen-core",
      "tools/habitat-harness/src",
    ]);
  });

  test("preserves sibling roots and exact files not covered by a selected parent", () => {
    expect(
      collapsedSourceScanRoots([
        "docs/PROCESS.md",
        "docs/system/ARCHITECTURE.md",
        "packages/mapgen-core",
        "packages/mapgen-core-tools",
      ])
    ).toEqual([
      "docs/PROCESS.md",
      "docs/system/ARCHITECTURE.md",
      "packages/mapgen-core",
      "packages/mapgen-core-tools",
    ]);
  });

  test("uses repo-relative normalization while keeping parent coverage explicit", () => {
    expect(collapsedSourceScanRoots(["./docs/system", "docs", "docs/system/TESTING.md"])).toEqual([
      "docs",
    ]);
  });

  test("treats the repo root as covering every nested root", () => {
    expect(collapsedSourceScanRoots([".", "docs", "packages/mapgen-core"])).toEqual([""]);
  });
});
