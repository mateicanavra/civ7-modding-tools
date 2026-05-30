import { describe, expect, it } from "bun:test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const SRC_ROOT = fileURLToPath(new URL("../../src", import.meta.url));
const MORPHOLOGY_ROOT = join(SRC_ROOT, "domain/morphology");
const DOMAIN_ROOT = join(SRC_ROOT, "domain");
const STANDARD_RECIPE_ROOT = join(SRC_ROOT, "recipes/standard");
const RECIPE_TAGS_FILE = join(SRC_ROOT, "recipes/standard/tags.ts");

function collectTsFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      files.push(...collectTsFiles(fullPath));
    } else if (fullPath.endsWith(".ts")) {
      files.push(fullPath);
    }
  }
  return files;
}

describe("morphology catalog ownership", () => {
  it("keeps the domain config facade limited to recipe-facing knobs", () => {
    const configText = readFileSync(join(MORPHOLOGY_ROOT, "config.ts"), "utf8").trim();

    expect(configText).toBe(
      ['export * from "./shared/knobs.js";', 'export * from "./shared/knob-multipliers.js";'].join(
        "\n"
      )
    );
  });

  it("keeps op strategy schemas out of domain config facades", () => {
    const domainOpRoots = readdirSync(DOMAIN_ROOT)
      .map((entry) => join(DOMAIN_ROOT, entry, "ops"))
      .filter((candidate) => {
        try {
          return statSync(candidate).isDirectory();
        } catch {
          return false;
        }
      });
    const violations = domainOpRoots.flatMap((opsRoot) =>
      collectTsFiles(opsRoot).flatMap((file) => {
        const text = readFileSync(file, "utf8");
        return text
          .split("\n")
          .map((line, index) => ({
            file: relative(SRC_ROOT, file),
            line: index + 1,
            text: line,
          }))
          .filter((entry) => /from ["'](?:\.\.\/){2,3}config\.js["']/.test(entry.text));
      })
    );

    expect(violations).toEqual([]);
  });

  it("uses owner names for recipe tag catalogs instead of milestone names", () => {
    const violations = collectTsFiles(STANDARD_RECIPE_ROOT).flatMap((file) => {
      const text = readFileSync(file, "utf8");
      return text
        .split("\n")
        .map((line, index) => ({
          file: relative(SRC_ROOT, file),
          line: index + 1,
          text: line,
        }))
        .filter((entry) =>
          /\bM\d+_[A-Z0-9_]*TAGS\b|\bM\d+_CANONICAL_[A-Z0-9_]*\b/.test(entry.text)
        );
    });

    expect(violations).toEqual([]);

    const text = readFileSync(RECIPE_TAGS_FILE, "utf8");
    expect(text).toContain("FIELD_DEPENDENCY_TAGS");
    expect(text).toContain("STANDARD_ENGINE_EFFECT_TAGS");
    expect(text).toContain("MAP_PROJECTION_EFFECT_TAGS");
  });
});
