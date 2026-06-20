import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, test } from "vitest";

const packageRoot = new URL("../..", import.meta.url).pathname;
const sourceRoot = join(packageRoot, "src");
const serviceRoot = join(sourceRoot, "service");
const providerRoot = join(sourceRoot, "providers");
const serviceModuleNames = ["check", "graph", "verify"] as const;

describe("Habitat service architecture", () => {
  test("keeps Effect-oRPC runtime construction in the root service seam", () => {
    const impl = source("src/service/impl.ts");

    expect(impl).toContain("implementEffect(");
    expect(impl).toContain("ManagedRuntime.make");
    expect(impl).toContain("HabitatRuntimeLive");

    for (const file of serviceSourceFiles()) {
      const text = source(file);
      if (file === "src/service/impl.ts") continue;
      expect(text).not.toContain("implementEffect(");
      expect(text).not.toContain("ManagedRuntime.make");
    }
  });

  test("keeps the root service router as module composition only", () => {
    const router = source("src/service/router.ts");

    expect(router).toContain("habitatServiceImplementer.router");
    expect(router).toContain("check: checkRouter");
    expect(router).toContain("graph: graphRouter");
    expect(router).toContain("verify: verifyRouter");
    expect(router).not.toContain(".effect(");
    expect(router).not.toContain("createCheckReport");
    expect(router).not.toContain("runGraphService");
    expect(router).not.toContain("runVerifyService");
    expect(router).not.toContain("process.env");
  });

  test("keeps procedure bindings in owned service modules", () => {
    for (const moduleName of serviceModuleNames) {
      const moduleFile = source(`src/service/modules/${moduleName}/module.ts`);
      const routerFile = source(`src/service/modules/${moduleName}/router.ts`);

      expect(moduleFile).toContain("habitatServiceImplementer as impl");
      expect(moduleFile).toContain(`impl.${moduleName}`);
      expect(moduleFile).not.toContain("implementEffect");
      expect(moduleFile).not.toContain("ManagedRuntime");
      expect(moduleFile).not.toContain("Layer.succeed");

      expect(routerFile).toContain(".effect(");
      expect(routerFile).not.toContain(".router(");
      expect(routerFile).not.toContain("ManagedRuntime");
      expect(routerFile).not.toContain("Layer.succeed");
    }
  });

  test("keeps providers below the service boundary", () => {
    for (const file of providerSourceFiles()) {
      const text = source(file);
      expect(text).not.toMatch(/from\s+["'][^"']*service\//);
      expect(text).not.toMatch(/from\s+["'][^"']*domains\//);
      expect(text).not.toContain("effect-orpc");
      expect(text).not.toContain("implementEffect");
    }
  });

  test("routes check CLI orchestration through the service client", () => {
    const checkCommand = source("src/commands/check.ts");

    expect(checkCommand).toContain("createHabitatServiceClient");
    expect(checkCommand).toContain("client.check.run");
    expect(checkCommand).toContain("client.check.expandBaseline");
    expect(checkCommand).not.toContain("createCheckReport");
    expect(checkCommand).not.toContain("expandBaselines");
  });

  test("routes graph CLI orchestration through the service client", () => {
    const graphCommand = source("src/commands/graph.ts");

    expect(graphCommand).toContain("createHabitatServiceClient");
    expect(graphCommand).toContain("client.graph.run");
    expect(graphCommand).not.toContain("runGraph");
    expect(graphCommand).not.toContain("../lib/graph.js");
  });
});

function serviceSourceFiles() {
  return sourceFiles(serviceRoot);
}

function providerSourceFiles() {
  return sourceFiles(providerRoot);
}

function sourceFiles(root: string): string[] {
  return readdirSync(root)
    .flatMap((entry) => {
      const path = join(root, entry);
      const stat = statSync(path);
      if (stat.isDirectory()) return sourceFiles(path);
      return path.endsWith(".ts") ? [path] : [];
    })
    .map((path) => relative(packageRoot, path).replaceAll("\\", "/"))
    .sort();
}

function source(path: string): string {
  return readFileSync(join(packageRoot, path), "utf8");
}
