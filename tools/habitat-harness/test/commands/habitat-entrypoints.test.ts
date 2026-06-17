import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, renameSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const commandEnv = { ...process.env, FORCE_COLOR: "0" };
const baselinesDir = path.join(repoRoot, "tools", "habitat-harness", "baselines");

describe("Habitat real command entrypoints", () => {
  test("root package script renders root and check help", () => {
    const rootHelp = runCommand(["bun", "run", "habitat", "--", "--help"]);
    expect(rootHelp.status).toBe(0);
    expect(rootHelp.stdout).toContain("COMMANDS");
    expect(rootHelp.stdout).toContain("check");
    expect(rootHelp.stdout).toContain("classify");

    const checkHelp = runCommand(["bun", "run", "habitat", "--", "check", "--help"]);
    expect(checkHelp.status).toBe(0);
    expect(checkHelp.stdout).toContain("Run Habitat structural checks");
    expect(checkHelp.stdout).toContain("--json");
    expect(checkHelp.stdout).toContain("--expand-baseline");
  });

  test("direct development runner renders root and check help", () => {
    const rootHelp = runCommand(["bun", "tools/habitat-harness/bin/dev.ts", "--help"]);
    expect(rootHelp.status).toBe(0);
    expect(rootHelp.stdout).toContain("COMMANDS");
    expect(rootHelp.stdout).toContain("verify");

    const checkHelp = runCommand(["bun", "tools/habitat-harness/bin/dev.ts", "check", "--help"]);
    expect(checkHelp.status).toBe(0);
    expect(checkHelp.stdout).toContain("--owner");
    expect(checkHelp.stdout).toContain("--rule");
    expect(checkHelp.stdout).toContain("--tool");
  });

  test("root and development runners reject unknown commands through oclif", () => {
    for (const argv of [
      ["bun", "run", "habitat", "--", "definitely-not-a-command"],
      ["bun", "tools/habitat-harness/bin/dev.ts", "definitely-not-a-command"],
    ]) {
      const result = runCommand(argv);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("definitely-not-a-command");
      expect(result.stdout).not.toContain('"schemaVersion"');
    }
  });

  test("invalid JSON selectors fail with schemaVersion 1 CheckReports", () => {
    for (const argv of [
      ["bun", "run", "habitat:check", "--", "--json", "--owner", "definitely-not-a-project"],
      ["bun", "run", "habitat:check", "--", "--json", "--rule", "definitely-not-a-rule"],
      ["bun", "run", "habitat:check", "--", "--json", "--tool", "definitely-not-a-tool"],
      ["bun", "run", "habitat:check", "--", "--json", "--rule", "grit-check"],
      [
        "bun",
        "run",
        "habitat:check",
        "--",
        "--json",
        "--owner",
        "@civ7/control-orpc",
        "--tool",
        "biome",
      ],
    ]) {
      const result = runCommand(argv);
      expect(result.status).toBe(1);
      const report = JSON.parse(result.stdout) as { ok: boolean; rules: Array<{ ruleId: string }> };
      expect(report.ok).toBe(false);
      expect(report.rules.map((rule) => rule.ruleId)).toEqual(["rule-selection-integrity"]);
    }
  });

  test("stale wrapped-eslint selector cannot pass as baseline-only proof", () => {
    const result = runCommand([
      "bun",
      "run",
      "habitat:check",
      "--",
      "--json",
      "--tool",
      "wrapped-eslint",
    ]);

    expect(result.status).toBe(1);
    const report = JSON.parse(result.stdout) as {
      ok: boolean;
      rules: Array<{
        ruleId: string;
        diagnostics: Array<{ message: string }>;
      }>;
    };
    expect(report.ok).toBe(false);
    expect(report.rules.map((rule) => rule.ruleId)).toEqual(["rule-selection-integrity"]);
    expect(report.rules[0]?.diagnostics[0]?.message).toBe('Unknown Habitat tool id: "wrapped-eslint".');
    expect(result.stdout).not.toContain("baseline-integrity");
  });

  test("invalid human-mode selectors fail without CheckReports", () => {
    for (const argv of [
      ["bun", "run", "habitat:check", "--", "--owner", "definitely-not-a-project"],
      ["bun", "run", "habitat:check", "--", "--rule", "definitely-not-a-rule"],
      ["bun", "run", "habitat:check", "--", "--tool", "definitely-not-a-tool"],
      ["bun", "run", "habitat:check", "--", "--owner", "@civ7/control-orpc", "--tool", "biome"],
    ]) {
      const result = runCommand(argv);
      expect(result.status).toBe(1);
      expect(result.stdout).toContain("rule-selection-integrity");
      expect(result.stdout).toContain("habitat check: FAIL");
      expect(result.stdout).not.toContain('"schemaVersion"');
    }
  });

  test("invalid selector JSON honors output path", () => {
    const outputPath = "/tmp/habitat-invalid-selector-vitest.json";
    rmSync(outputPath, { force: true });

    const result = runCommand([
      "bun",
      "run",
      "habitat:check",
      "--",
      "--json",
      "--output",
      outputPath,
      "--rule",
      "definitely-not-a-rule",
    ]);

    expect(result.status).toBe(1);
    expect(existsSync(outputPath)).toBe(true);
    const report = JSON.parse(readFileSync(outputPath, "utf8")) as { ok: boolean };
    expect(report.ok).toBe(false);
    rmSync(outputPath, { force: true });
  });

  test("baseline contract JSON reports missing, malformed, and orphan states", () => {
    const workspaceBaseline = path.join(baselinesDir, "workspace-entrypoints.json");
    const workspaceBackup = `${workspaceBaseline}.vitest-bak`;
    const orphanBaseline = path.join(baselinesDir, "vitest-orphan-rule.json");
    const originalWorkspaceBaseline = readFileSync(workspaceBaseline, "utf8");

    try {
      renameSync(workspaceBaseline, workspaceBackup);
      const missing = runCommand([
        "bun",
        "run",
        "habitat:check",
        "--",
        "--json",
        "--rule",
        "workspace-entrypoints",
      ]);
      expect(missing.status).toBe(1);
      expect(JSON.parse(missing.stdout)).toMatchObject({
        ok: false,
        rules: expect.arrayContaining([
          expect.objectContaining({
            ruleId: "workspace-entrypoints",
            status: "fail",
            diagnostics: expect.arrayContaining([
              expect.objectContaining({
                message: expect.stringContaining("missing-baseline"),
              }),
            ]),
          }),
        ]),
      });
      renameSync(workspaceBackup, workspaceBaseline);

      writeFileSync(workspaceBaseline, "{\n");
      const malformed = runCommand([
        "bun",
        "run",
        "habitat:check",
        "--",
        "--json",
        "--rule",
        "workspace-entrypoints",
      ]);
      expect(malformed.status).toBe(1);
      expect(malformed.stdout).toContain("malformed-baseline");
      writeFileSync(workspaceBaseline, originalWorkspaceBaseline);

      writeFileSync(orphanBaseline, "[]\n");
      const orphan = runCommand([
        "bun",
        "run",
        "habitat:check",
        "--",
        "--json",
        "--rule",
        "workspace-entrypoints",
      ]);
      expect(orphan.status).toBe(1);
      expect(orphan.stdout).toContain("orphan-baseline");
    } finally {
      if (existsSync(workspaceBackup)) renameSync(workspaceBackup, workspaceBaseline);
      else writeFileSync(workspaceBaseline, originalWorkspaceBaseline);
      rmSync(orphanBaseline, { force: true });
    }
  });

  test("invalid baseline expansion selectors fail before authoring", () => {
    for (const argv of [
      ["bun", "run", "habitat:check", "--", "--expand-baseline", "--rule", "definitely-not-a-rule"],
      [
        "bun",
        "run",
        "habitat:check",
        "--",
        "--expand-baseline",
        "--owner",
        "definitely-not-a-project",
      ],
      ["bun", "run", "habitat:check", "--", "--expand-baseline", "--tool", "definitely-not-a-tool"],
      [
        "bun",
        "run",
        "habitat:check",
        "--",
        "--expand-baseline",
        "--owner",
        "@civ7/control-orpc",
        "--tool",
        "biome",
      ],
    ]) {
      const beforeBaselines = snapshotBaselines();
      const result = runCommand(argv);
      expect(result.status).toBe(1);
      expect(result.stderr).toMatch(/Unknown Habitat|No Habitat rules match/);
      expect(result.stdout).not.toContain("baseline written");
      expect(snapshotBaselines()).toEqual(beforeBaselines);
    }
  });
});

function snapshotBaselines(): Record<string, string> {
  return Object.fromEntries(
    readdirSync(baselinesDir)
      .filter((file) => file.endsWith(".json"))
      .sort()
      .map((file) => [file, readFileSync(path.join(baselinesDir, file), "utf8")])
  );
}

function runCommand(argv: string[]) {
  const [command, ...args] = argv;
  return spawnSync(command, args, {
    cwd: repoRoot,
    env: commandEnv,
    encoding: "utf8",
  });
}
