import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";

const ruleModuleUrl = pathToFileURL(
  resolve(
    import.meta.dirname,
    "../../../../.habitat/docs/rules/ensure_docs_checkout_paths_are_portable/check.mjs"
  )
).href;
const { findCheckoutDocsPaths, scanPortableDocsMarkdown } = await import(ruleModuleUrl);

describe("portable docs checkout paths", () => {
  test("finds exact host checkout paths and projects repo-relative replacements", () => {
    const markdown = [
      "See `/Users/alice/dev/civ7/docs/PROCESS.md`.",
      "Read (/home/ci/worktree/docs/system/ARCHITECTURE.md).",
      "Review `/Volumes/Work/dev/docs/projects/mapgen/frame.md`.",
    ].join("\n");

    expect(findCheckoutDocsPaths(markdown)).toEqual([
      {
        absolutePath: "/Users/alice/dev/civ7/docs/PROCESS.md",
        replacement: "docs/PROCESS.md",
        index: 5,
        line: 1,
      },
      {
        absolutePath: "/home/ci/worktree/docs/system/ARCHITECTURE.md",
        replacement: "docs/system/ARCHITECTURE.md",
        index: 51,
        line: 2,
      },
      {
        absolutePath: "/Volumes/Work/dev/docs/projects/mapgen/frame.md",
        replacement: "docs/projects/mapgen/frame.md",
        index: 107,
        line: 3,
      },
    ]);
  });

  test("reports the deterministic first finding and total occurrences for one file", () => {
    const result = scanPortableDocsMarkdown(
      "docs/demo.md",
      ["header", "/Users/a/repo/docs/zeta.md", "/home/b/repo/docs/alpha.md"].join("\n")
    );

    expect(result).toEqual({
      file: "docs/demo.md",
      occurrenceCount: 2,
      firstFinding: {
        absolutePath: "/Users/a/repo/docs/zeta.md",
        replacement: "docs/zeta.md",
        index: 7,
        line: 2,
      },
    });
  });

  test.each([
    ["empty", ""],
    ["repo-relative", "See `docs/PROCESS.md` and $REPO_ROOT/docs/SYSTEM.md."],
    ["distributed tokens", "The host prefix /Users/alice/repo and docs/PROCESS.md are separate."],
  ])("keeps %s Markdown clean", (_name, markdown) => {
    expect(findCheckoutDocsPaths(markdown)).toEqual([]);
    expect(scanPortableDocsMarkdown("docs/demo.md", markdown)).toBeUndefined();
  });
});
