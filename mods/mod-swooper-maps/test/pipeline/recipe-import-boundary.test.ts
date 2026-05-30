import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const RECIPE_ROOT = fileURLToPath(new URL("../../src/recipes", import.meta.url));

const RECIPE_DEEP_DOMAIN_IMPORT =
  /@mapgen\/domain\/[^"']+\/(?!(?:ops(?:\.js)?|config(?:\.js)?)["'])[^"']+/;

function collectTsFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...collectTsFiles(path));
    } else if (entry.isFile() && path.endsWith(".ts")) {
      out.push(path);
    }
  }
  return out;
}

describe("recipe import boundary", () => {
  it("catches deep domain imports while allowing public recipe surfaces", () => {
    expect(
      RECIPE_DEEP_DOMAIN_IMPORT.test(`import x from "@mapgen/domain/hydrology/shared/knobs.js";`)
    ).toBe(true);
    expect(RECIPE_DEEP_DOMAIN_IMPORT.test(`import x from "@mapgen/domain/hydrology/ops";`)).toBe(
      false
    );
    expect(
      RECIPE_DEEP_DOMAIN_IMPORT.test(`import x from "@mapgen/domain/hydrology/config.js";`)
    ).toBe(false);
    expect(RECIPE_DEEP_DOMAIN_IMPORT.test(`import x from "@mapgen/domain/hydrology";`)).toBe(false);
  });

  it("keeps recipes on named domain public surfaces", () => {
    const violations = collectTsFiles(RECIPE_ROOT).flatMap((file) => {
      const text = readFileSync(file, "utf8");
      return text
        .split("\n")
        .map((line, index) => ({ file, line: index + 1, text: line }))
        .filter((entry) => RECIPE_DEEP_DOMAIN_IMPORT.test(entry.text));
    });

    expect(violations).toEqual([]);
  });
});
