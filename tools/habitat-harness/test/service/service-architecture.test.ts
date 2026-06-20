import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, test } from "vitest";

const packageRoot = new URL("../..", import.meta.url).pathname;
const sourceRoot = join(packageRoot, "src");
const serviceRoot = join(sourceRoot, "service");
const providerRoot = join(sourceRoot, "providers");
const serviceModuleNames = [
  "check",
  "classify",
  "fix",
  "graph",
  "hook",
  "transactions",
  "verify",
] as const;

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
    expect(router).toContain("classify: classifyRouter");
    expect(router).toContain("fix: fixRouter");
    expect(router).toContain("graph: graphRouter");
    expect(router).toContain("hook: hookRouter");
    expect(router).toContain("transactions: transactionsRouter");
    expect(router).toContain("verify: verifyRouter");
    expect(router).not.toContain(".effect(");
    expect(router).not.toContain("createCheckReport");
    expect(router).not.toContain("runClassifyService");
    expect(router).not.toContain("runFixService");
    expect(router).not.toContain("runGraphService");
    expect(router).not.toContain("runHookService");
    expect(router).not.toContain("runTransactionApplyService");
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
      expect(routerFile).not.toContain('from "./run.js"');
      expect(routerFile).not.toContain(".router(");
      expect(routerFile).not.toContain("ManagedRuntime");
      expect(routerFile).not.toContain("Layer.succeed");
      expect(existsSync(join(packageRoot, `src/service/modules/${moduleName}/run.ts`))).toBe(false);
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

  test("keeps diagnostic and pattern governance in domain ownership", () => {
    const publicIndex = source("src/index.ts");

    expect(existsSync(join(packageRoot, "src/lib/diagnostic-catalog"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/rules/patterns"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/domains/diagnostic-pattern-catalog"))).toBe(true);
    expect(existsSync(join(packageRoot, "src/domains/pattern-governance"))).toBe(true);
    expect(publicIndex).toContain("./domains/pattern-governance/index.js");

    for (const file of sourceFiles(sourceRoot)) {
      const text = source(file);
      expect(text).not.toMatch(/from\s+["'][^"']*lib\/diagnostic-catalog/);
      expect(text).not.toMatch(/from\s+["'][^"']*rules\/patterns/);
    }
  });

  test("keeps rule registry and selection in domain ownership", () => {
    const publicIndex = source("src/index.ts");

    expect(existsSync(join(packageRoot, "src/rules/registry"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/rules/facts.ts"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/lib/rule-selection.ts"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/domains/rule-registry"))).toBe(true);
    expect(existsSync(join(packageRoot, "src/domains/rule-selection"))).toBe(true);
    expect(publicIndex).toContain("./domains/rule-selection/index.js");

    for (const file of sourceFiles(sourceRoot)) {
      const text = source(file);
      expect(text).not.toMatch(/from\s+["'][^"']*rules\/registry/);
      expect(text).not.toMatch(/from\s+["'][^"']*rules\/facts/);
      expect(text).not.toMatch(/from\s+["'][^"']*lib\/rule-selection/);
    }
  });

  test("routes check CLI orchestration through the service client", () => {
    const checkCommand = source("src/commands/check.ts");
    const checkRouter = source("src/service/modules/check/router.ts");
    const serviceImpl = source("src/service/impl.ts");

    expect(checkCommand).toContain("createHabitatServiceClient");
    expect(checkCommand).toContain("client.check.run");
    expect(checkCommand).toContain("client.check.expandBaseline");
    expect(checkCommand).not.toContain("createCheckReport");
    expect(checkCommand).not.toContain("expandBaselines");
    expect(checkRouter).toContain("checkModule.run.effect");
    expect(checkRouter).toContain("checkModule.expandBaseline.effect");
    expect(checkRouter).toContain("StructuralCheck");
    expect(checkRouter).not.toContain('from "./run.js"');
    expect(checkRouter).not.toContain("lib/check-report");
    expect(source("src/domains/structural-check/report.ts")).toContain("BaselineAuthority");
    expect(source("src/domains/structural-check/execution.ts")).toContain(
      "executeSelectedRulesEffect"
    );
    expect(serviceImpl).toContain("StructuralCheckLive");
    expect(serviceImpl).toContain("BaselineAuthorityLive");
    expect(existsSync(join(packageRoot, "src/service/modules/check/report.ts"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/service/modules/check/baseline.ts"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/service/modules/check/execution.ts"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/service/modules/check/run.ts"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/service/modules/verify/run.ts"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/lib/check"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/lib/baseline-core"))).toBe(false);
  });

  test("routes classify CLI orchestration through the service client", () => {
    const classifyCommand = source("src/commands/classify.ts");

    expect(classifyCommand).toContain("createHabitatServiceClient");
    expect(classifyCommand).toContain("client.classify.run");
    expect(classifyCommand).not.toContain("classifyTargetResult");
    expect(classifyCommand).not.toContain("classifyTarget(");
    expect(classifyCommand).not.toContain("classifyPathResult");
    expect(classifyCommand).not.toContain("classifyPath(");
    expect(classifyCommand).not.toContain("../domains/workspace-graph-integration/index.js");
  });

  test("keeps orientation and workspace graph logic in domain and provider ownership", () => {
    const publicIndex = source("src/index.ts");
    const classifyRouter = source("src/service/modules/classify/router.ts");
    const sourceTexts = sourceFiles(sourceRoot).map(source);

    expect(existsSync(join(packageRoot, "src/lib/classify-core"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/lib/classify.ts"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/lib/workspace-graph"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/lib/workspace-graph.ts"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/lib/workspace-graph-contract.ts"))).toBe(false);
    expect(existsSync(join(packageRoot, "src/domains/workspace-graph-integration"))).toBe(true);
    expect(existsSync(join(packageRoot, "src/providers/nx/graph.ts"))).toBe(true);
    expect(existsSync(join(packageRoot, "src/providers/nx/targets.ts"))).toBe(true);
    expect(publicIndex).toContain("./domains/workspace-graph-integration/index.js");
    expect(classifyRouter).toContain("classifyModule.run.effect");
    expect(classifyRouter).not.toContain("runClassifyService");
    for (const text of sourceTexts) {
      expect(text).not.toMatch(/from\s+["'][^"']*lib\/classify(?:-core)?/);
      expect(text).not.toMatch(/from\s+["'][^"']*lib\/workspace-graph/);
      expect(text).not.toContain("workspace-graph-contract");
    }
  });

  test("routes graph CLI orchestration through the service client", () => {
    const graphCommand = source("src/commands/graph.ts");

    expect(graphCommand).toContain("createHabitatServiceClient");
    expect(graphCommand).toContain("client.graph.run");
    expect(graphCommand).not.toContain("runGraph");
    expect(graphCommand).not.toContain("../lib/graph.js");
  });

  test("routes fix CLI orchestration through the service client", () => {
    const fixCommand = source("src/commands/fix.ts");
    const fixRouter = source("src/service/modules/fix/router.ts");
    const publicIndex = source("src/index.ts");

    expect(fixCommand).toContain("createHabitatServiceClient");
    expect(fixCommand).toContain("client.fix.run");
    expect(fixCommand).not.toContain("runFix");
    expect(fixCommand).not.toContain("../lib/fix.js");
    expect(fixRouter).toContain("fixModule.run.effect");
    expect(fixRouter).not.toMatch(/from\s+["'][^"']*lib\/fix\.js["']/);
    expect(fixRouter).not.toContain("runPatternApply");
    expect(fixRouter).not.toMatch(/from\s+["'][^"']*lib\/pattern-apply\/run/);
    expect(publicIndex).not.toContain("runFix");
    expect(existsSync(join(packageRoot, "src/lib/fix.ts"))).toBe(false);
  });

  test("keeps transaction execution in the transactions service module", () => {
    const transactionRouter = source("src/service/modules/transactions/router.ts");
    const patternApplyIndex = source("src/lib/pattern-apply/index.ts");

    expect(transactionRouter).toContain("transactionsModule.apply.effect");
    expect(transactionRouter).toContain("runTransactionApplyService");
    expect(transactionRouter).toContain("PatternApplyRecordSchema");
    expect(patternApplyIndex).not.toContain("runPatternApply");
    expect(existsSync(join(packageRoot, "src/lib/pattern-apply/run.ts"))).toBe(false);
  });

  test("routes hook CLI orchestration through the service client", () => {
    const hookCommand = source("src/commands/hook.ts");
    const hookRouter = source("src/service/modules/hook/router.ts");
    const publicIndex = source("src/index.ts");

    expect(hookCommand).toContain("createHabitatServiceClient");
    expect(hookCommand).toContain("client.hook.run");
    expect(hookCommand).not.toContain("runHook");
    expect(hookCommand).not.toContain("../lib/hooks.js");
    expect(hookRouter).toContain("hookModule.run.effect");
    expect(hookRouter).not.toMatch(/from\s+["'][^"']*lib\/hooks\.js["']/);
    expect(publicIndex).not.toContain("runHook");
    expect(existsSync(join(packageRoot, "src/lib/hooks.ts"))).toBe(false);
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
