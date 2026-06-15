import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

import { buildSwooperMapsStudioDeployPlan } from "../../src/server/mapConfigs/deploy";

const repoRoot = fileURLToPath(new URL("../../../..", import.meta.url));
const servicePath = fileURLToPath(
  new URL("../../src/server/recipeDag/service.ts", import.meta.url)
);
const studioContractsPath = fileURLToPath(
  new URL(
    "../../../../mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts",
    import.meta.url
  )
);

const importSpecifierPattern =
  /\bimport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|\bexport\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)/g;

function resolveLocalImport(fromFile: string, specifier: string): string | null {
  if (specifier === "@swooper/mapgen-core/authoring/recipe-dag") {
    return resolve(repoRoot, "packages/mapgen-core/src/authoring/recipe-dag.ts");
  }
  if (specifier === "@swooper/mapgen-core/authoring/contracts") {
    return resolve(repoRoot, "packages/mapgen-core/src/authoring/contracts.ts");
  }
  if (specifier === "@swooper/mapgen-core/authoring") {
    return resolve(repoRoot, "packages/mapgen-core/src/authoring/index.ts");
  }
  if (specifier === "mod-swooper-maps/recipes/studio-contracts") {
    return resolve(repoRoot, "mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts");
  }
  if (specifier.startsWith("@mapgen/domain/")) {
    const suffix = specifier.slice("@mapgen/domain/".length).replace(/\.(m?js)$/, "");
    return resolve(repoRoot, "mods/mod-swooper-maps/src/domain", `${suffix}.ts`);
  }
  if (!specifier.startsWith(".")) return null;
  const base = resolve(dirname(fromFile), specifier);
  for (const candidate of [
    base,
    base.replace(/\.(m?js)$/, ".ts"),
    `${base}.ts`,
    `${base}.tsx`,
    `${base}/index.ts`,
    `${base}/index.tsx`,
  ]) {
    if (existsSync(candidate)) return candidate;
  }
  return null;
}

async function collectLocalImportGraph(entry: string): Promise<Map<string, string>> {
  const visited = new Map<string, string>();
  const pending = [entry];

  while (pending.length > 0) {
    const file = pending.pop();
    if (!file || visited.has(file)) continue;
    const source = await readFile(file, "utf8");
    visited.set(file, source);

    for (const match of source.matchAll(importSpecifierPattern)) {
      const specifier = match[1] ?? match[2] ?? match[3];
      if (!specifier) continue;
      const resolvedImport = resolveLocalImport(file, specifier);
      if (resolvedImport && !visited.has(resolvedImport)) pending.push(resolvedImport);
    }
  }

  return visited;
}

function rel(file: string): string {
  return relative(repoRoot, file);
}

describe("daemon deploy isolation", () => {
  it("loads recipe DAG metadata through the contract-only Studio recipe surface", async () => {
    const serviceSource = await readFile(servicePath, "utf8");
    const studioContractsSource = await readFile(studioContractsPath, "utf8");
    const graph = await collectLocalImportGraph(servicePath);
    const graphPaths = [...graph.keys()].map(rel).sort();

    expect(serviceSource).toContain('from "mod-swooper-maps/recipes/studio-contracts"');
    expect(serviceSource).not.toMatch(
      /from\s+["']mod-swooper-maps\/recipes\/(?:standard|standard-artifacts|standard-map-configs|browser-test)/
    );
    expect(serviceSource).not.toContain('from "@swooper/mapgen-core/authoring"');
    expect(serviceSource).not.toMatch(/src\/recipes\/standard\/recipe\.js/);
    expect(serviceSource).not.toContain("browser-test");
    expect(serviceSource).toContain("@swooper/mapgen-core/authoring/recipe-dag");
    expect(studioContractsSource).not.toMatch(/recipe\.js|browser-test/);
    expect(studioContractsSource).not.toMatch(
      /createRecipe|createStage|createStep|collectCompileOps|compileOpsById|implementArtifacts/
    );
    expect(studioContractsSource).toContain("../standard/contract-manifest.js");
    expect(graphPaths).toContain("mods/mod-swooper-maps/src/recipes/studio-contracts/index.ts");
    expect(graphPaths).toContain("mods/mod-swooper-maps/src/recipes/standard/contract-manifest.ts");
    expect(graphPaths).toContain("packages/mapgen-core/src/authoring/recipe-dag.ts");
    expect(graphPaths).toContain("packages/mapgen-core/src/authoring/contracts.ts");
    expect(graphPaths).not.toContain("packages/mapgen-core/src/authoring/index.ts");

    for (const graphPath of graphPaths) {
      expect(graphPath).not.toMatch(/^mods\/mod-swooper-maps\/src\/recipes\/browser-test\//);
      expect(graphPath).not.toBe("mods/mod-swooper-maps/src/recipes/standard/recipe.ts");
      expect(graphPath).not.toBe("mods/mod-swooper-maps/src/recipes/standard/runtime.ts");
      expect(graphPath).not.toMatch(
        /^mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/[^/]+\/index\.ts$/
      );
      expect(graphPath).not.toMatch(
        /^mods\/mod-swooper-maps\/src\/recipes\/standard\/stages\/[^/]+\/steps\/(?:index|.*\/index)\.ts$/
      );
      expect(graphPath).not.toMatch(/^mods\/mod-swooper-maps\/(?:dist|mod)\//);
      expect(graphPath).not.toMatch(/^mods\/mod-swooper-maps\/src\/maps\/generated\//);
    }

    for (const [file, source] of graph) {
      const graphPath = rel(file);
      expect({ file: graphPath, source }).not.toMatchObject({
        source: expect.stringMatching(/from\s+["']@swooper\/mapgen-core\/authoring["']/),
      });
      expect({ file: graphPath, source }).not.toMatchObject({
        source: expect.stringMatching(/from\s+["']@swooper\/mapgen-core["']/),
      });
      expect({ file: rel(file), source }).not.toMatchObject({
        source: expect.stringMatching(
          /from\s+["'](?:mod-swooper-maps\/recipes\/(?:standard|standard-artifacts|standard-map-configs|browser-test)|@mapgen\/domain\/[^"']+\/ops["'])/
        ),
      });
      expect({ file: graphPath, source }).not.toMatchObject({
        source: expect.stringMatching(/from\s+["']@mapgen\/domain\/[^/"']+["']/),
      });
      if (!graphPath.startsWith("mods/mod-swooper-maps/src/recipes/")) continue;
      expect({ file: rel(file), source }).not.toMatchObject({
        source: expect.stringMatching(
          /createRecipe|createStage|createStep\s*\(|collectCompileOps|compileOpsById|implementArtifacts/
        ),
      });
    }
  });

  it("does not replay dependency build outputs during Play or Save & Deploy", () => {
    expect(buildSwooperMapsStudioDeployPlan({ env: { PATH: "/bin" } }).buildTask).toBe(
      "mod-swooper-maps:build:studio-deploy"
    );
    expect(buildSwooperMapsStudioDeployPlan({ env: { PATH: "/bin" } }).buildArgs).toEqual([
      "run",
      "nx",
      "run",
      "mod-swooper-maps:build:studio-deploy",
      "--outputStyle=static",
    ]);
    expect(
      buildSwooperMapsStudioDeployPlan({
        requestId: "studio-run-in-game-test",
        env: { PATH: "/bin" },
      }).buildTask
    ).toBe("mod-swooper-maps:build:studio-deploy");
  });
});
