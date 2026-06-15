import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, test, vi } from "vitest";

const tempDirs: string[] = [];

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("../../src/lib/paths.js");
  vi.doUnmock("../../src/lib/spawn.js");
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop();
    if (dir) rmSync(dir, { recursive: true, force: true });
  }
});

describe("Habitat ratchet baselines", () => {
  test("treats explicit empty baseline files as locked and integrity-clean", async () => {
    const ctx = await loadBaselineModule({
      rulePackAtBase: ["existing-grit-rule"],
      baselinesAtBase: new Map([["existing-grit-rule", []]]),
    });
    writeBaselineFile(ctx.baselinesDir, "existing-grit-rule", []);

    expect([...ctx.loadBaseline("existing-grit-rule")]).toEqual([]);
    expect(ctx.checkBaselineIntegrity("main")).toEqual([]);
  });

  test("rejects added entries for existing rules relative to the merge-base", async () => {
    const ctx = await loadBaselineModule({
      rulePackAtBase: ["existing-grit-rule"],
      baselinesAtBase: new Map([["existing-grit-rule", []]]),
    });
    writeBaselineFile(ctx.baselinesDir, "existing-grit-rule", ["src/example.ts::diagnostic"]);

    expect(ctx.checkBaselineIntegrity("main")).toEqual([
      expect.objectContaining({
        file: "tools/habitat-harness/baselines/existing-grit-rule.json",
        ruleId: "existing-grit-rule",
        addedKeys: ["src/example.ts::diagnostic"],
        reason: expect.stringContaining("baselines are shrink-only outside rule-introduction changes"),
      }),
    ]);
  });

  test("allows entries only when the rule is introduced after the merge-base", async () => {
    const ctx = await loadBaselineModule({
      rulePackAtBase: ["existing-grit-rule"],
      baselinesAtBase: new Map(),
    });
    writeBaselineFile(ctx.baselinesDir, "new-grit-rule", ["src/example.ts::diagnostic"]);

    expect(ctx.checkBaselineIntegrity("main")).toEqual([]);
  });
});

async function loadBaselineModule(options: {
  rulePackAtBase: string[];
  baselinesAtBase: Map<string, string[]>;
}) {
  const repoRoot = mkdtempSync(path.join(tmpdir(), "habitat-baseline-test-"));
  tempDirs.push(repoRoot);
  const harnessRoot = path.join(repoRoot, "tools", "habitat-harness");
  const baselinesDir = path.join(harnessRoot, "baselines");
  mkdirSync(baselinesDir, { recursive: true });

  vi.resetModules();
  vi.doMock("../../src/lib/paths.js", () => ({
    repoRoot,
    harnessRoot,
    baselinesDir,
    toRepoRelative: (p: string) =>
      path.relative(repoRoot, path.resolve(repoRoot, p)).split(path.sep).join("/"),
  }));
  vi.doMock("../../src/lib/spawn.js", () => ({
    run: vi.fn((argv: string[]) => {
      if (argv[0] === "git" && argv[1] === "merge-base") {
        return { exitCode: 0, stdout: "merge-base-sha\n", stderr: "" };
      }
      if (argv[0] === "git" && argv[1] === "show") {
        return showMock(argv[2] ?? "", options);
      }
      return { exitCode: 1, stdout: "", stderr: `unexpected command: ${argv.join(" ")}\n` };
    }),
  }));

  const baseline = await import("../../src/lib/baseline.js");
  return {
    baselinesDir,
    checkBaselineIntegrity: baseline.checkBaselineIntegrity,
    loadBaseline: baseline.loadBaseline,
  };
}

function showMock(
  spec: string,
  options: { rulePackAtBase: string[]; baselinesAtBase: Map<string, string[]> }
) {
  if (spec === "merge-base-sha:tools/habitat-harness/src/rules/rules.json") {
    return {
      exitCode: 0,
      stdout: JSON.stringify(
        {
          rules: options.rulePackAtBase.map((id) => ({ id })),
        },
        null,
        2
      ),
      stderr: "",
    };
  }
  const prefix = "merge-base-sha:tools/habitat-harness/baselines/";
  if (spec.startsWith(prefix) && spec.endsWith(".json")) {
    const ruleId = spec.slice(prefix.length, -".json".length);
    const baseline = options.baselinesAtBase.get(ruleId);
    if (baseline) {
      return { exitCode: 0, stdout: JSON.stringify(baseline), stderr: "" };
    }
  }
  return { exitCode: 1, stdout: "", stderr: "not found\n" };
}

function writeBaselineFile(baselinesDir: string, ruleId: string, entries: string[]) {
  mkdirSync(baselinesDir, { recursive: true });
  writeFileSync(path.join(baselinesDir, `${ruleId}.json`), `${JSON.stringify(entries, null, 2)}\n`);
}
