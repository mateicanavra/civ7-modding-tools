import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, test } from "vitest";
import packageJson from "../../package.json";

describe("Habitat package distribution", () => {
  test("uses the pinned JavaScript compiler for reproducible declaration emission", () => {
    const project = JSON.parse(
      readFileSync(path.join(import.meta.dirname, "../../project.json"), "utf8")
    ) as {
      targets: Record<string, { command?: string }>;
    };
    expect(project.targets["build:tsc"]?.command).toBe(
      "node ../../node_modules/typescript/bin/tsc -p tsconfig.json"
    );
  });

  test("declares a compiled-only Bun binary and Nx plugin export", () => {
    expect("private" in packageJson).toBe(false);
    expect(packageJson.license).toBe("MIT");
    expect(packageJson.engines).toEqual({ bun: "1.3.14" });
    expect(packageJson.bin).toEqual({ habitat: "./bin/run.js" });
    expect(packageJson.exports["./nx-plugin"]).toEqual({
      types: "./dist/nx-plugin.d.ts",
      import: "./dist/nx-plugin.js",
      default: "./dist/nx-plugin.js",
    });
    expect(packageJson.exports["./grit"]).toEqual({
      types: "./dist/resources/rule-diagnostics/providers/grit/grit-package.d.ts",
      import: "./dist/resources/rule-diagnostics/providers/grit/grit-package.js",
      default: "./dist/resources/rule-diagnostics/providers/grit/grit-package.js",
    });
    expect(packageJson.files).toEqual(
      expect.arrayContaining([
        "LICENSE",
        "PROVENANCE.md",
        "bin/run.js",
        "dist",
        "generators.json",
        "oclif.manifest.json",
        "schemas",
      ])
    );
    expect(packageJson.files).not.toContain("src");
    expect(JSON.stringify(packageJson.exports)).not.toContain('"bun"');
    expect(JSON.stringify(packageJson.exports)).not.toContain("./src/");

    const runner = readFileSync(path.join(import.meta.dirname, "../../bin/run.js"), "utf8");
    expect(runner.startsWith("#!/usr/bin/env bun\n")).toBe(true);
  });

  test("points packaged generators at compiled factories and included schemas", () => {
    const generators = JSON.parse(
      readFileSync(path.join(import.meta.dirname, "../../generators.json"), "utf8")
    ) as {
      generators: Record<string, { factory: string; schema: string }>;
    };
    expect(generators.generators.project).toEqual(
      expect.objectContaining({
        factory: "./dist/generators/scaffold/project/support/generator.js#projectGenerator",
        schema: "./schemas/scaffold-project.schema.json",
      })
    );
    expect(generators.generators.pattern).toEqual(
      expect.objectContaining({
        factory: "./dist/generators/scaffold/pattern/support/generator.js#patternGenerator",
        schema: "./schemas/scaffold-pattern.schema.json",
      })
    );
  });

  test("closes runtime dependencies without workspace-only protocols", () => {
    expect(packageJson.dependencies["@getgrit/cli"]).toBe("0.1.0-alpha.1743007075");
    expect(packageJson.dependencies["effect-orpc"]).toBe("0.5.0");
    expect(packageJson.dependencies.typebox).toBe("1.3.6");
    expect("patchedDependencies" in packageJson).toBe(false);
    expect(Object.values(packageJson.dependencies)).not.toContainEqual(
      expect.stringMatching(/^(?:catalog|workspace|file):/)
    );
  });
});
