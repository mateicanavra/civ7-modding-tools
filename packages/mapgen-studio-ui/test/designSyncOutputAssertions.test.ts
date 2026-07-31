// @vitest-environment node
import { describe, expect, it } from "vitest";

const assertionsUrl = new URL("../scripts/design-sync-output-assertions.mjs", import.meta.url).href;
const { findDesignSyncReadmeFailures } = await import(assertionsUrl);

describe("design-sync README output assertions", () => {
  it.each([
    ["absent", "# Bundle\n\n## Components\n\nComponent docs.\n"],
    ["renamed", "# Bundle\n\n## Design Tokens\n\n- **color** (1): `--background`\n"],
  ])("fails closed when the exact `## Tokens` section is %s", (_case, readme) => {
    expect(findDesignSyncReadmeFailures(readme)).toEqual([
      "README is missing the required exact `## Tokens` section — token-table purity was not checked",
    ]);
  });

  it("checks only the exact token section and preserves the Tailwind bucket guard", () => {
    const readme = [
      "# Bundle",
      "",
      "## Tokens",
      "",
      "- **color** (2): `--background`, `--tw-leaked`",
      "- **other** (1): `--tw-legitimate`",
      "",
      "## Components",
      "",
      "- **color** (1): `--tw-outside-token-section`",
    ].join("\n");

    expect(findDesignSyncReadmeFailures(readme)).toEqual([
      "README token buckets list Tailwind engine vars outside 'other' (--tw-leaked) — the .ds-sync emit.mjs --tw- classifier patch was lost (re-stage?)",
    ]);
  });
});
