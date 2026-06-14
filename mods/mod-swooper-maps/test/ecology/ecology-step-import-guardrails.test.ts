import { describe, expect, it } from "bun:test";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

describe("ecology retired-stage topology guardrails", () => {
  it("keeps retired wrapper and generic ecology step directories out of the active recipe topology", () => {
    const modRoot = fileURLToPath(new URL("../..", import.meta.url));
    const retiredStageDirs = [
      "src/recipes/standard/stages/ecology/steps",
      "src/recipes/standard/stages/ecology-features-score",
      "src/recipes/standard/stages/ecology-ice",
      "src/recipes/standard/stages/ecology-reefs",
      "src/recipes/standard/stages/ecology-wetlands",
      "src/recipes/standard/stages/ecology-vegetation",
    ];

    const present = retiredStageDirs.filter((dir) => existsSync(path.join(modRoot, dir)));
    expect(present, `Retired ecology topology dirs still exist: ${present.join(", ")}`).toEqual([]);
  });
});
