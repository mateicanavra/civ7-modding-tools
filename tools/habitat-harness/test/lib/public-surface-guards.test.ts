import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

const repoRoot = path.resolve(fileURLToPath(new URL("../../../..", import.meta.url)));
const guardScript = path.join(repoRoot, "scripts/lint/lint-habitat-public-surface-guards.mjs");

describe("Habitat public surface guards", () => {
  test("rejects executable managing code inside authored artifacts", () => {
    const result = runGuardWithInjectedFiles({
      ".habitat/rules/probe/guard.ts": "export const managingCode = true;\n",
      ".habitat/patterns/providers/grit/rule.json": '{ "id": "source-topology-under-artifacts" }\n',
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Authored Habitat artifacts must stay declarative.");
    expect(result.stderr).toContain(
      "Authored Habitat artifacts must not grow source/vendor topology."
    );
  });

  test("rejects public/internal leaks and product vocabulary in generic surfaces", () => {
    const result = runGuardWithInjectedFiles({
      "tools/habitat-harness/src/domains/probe/service.ts":
        'import { runGit } from "../../providers/git/runner.js";\nexport const value = runGit;\n',
      "tools/habitat-harness/src/domains/probe/live.ts":
        'import { liveGit } from "../../providers/git/live/index.js";\nexport const live = liveGit;\n',
      "tools/habitat-harness/src/providers/probe/leak.ts": 'export const product = "Civ7";\n',
      "tools/habitat-harness/src/public/leak.ts":
        'import { makeThing } from "../providers/private/index.js";\nexport const value = makeThing;\n',
      "tools/habitat-harness/src/public/domain-leak.ts":
        'import { makeThing } from "../domains/private/index.js";\nexport const leakedDomain = makeThing;\n',
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Domain modules must import provider public modules");
    expect(result.stderr).toContain(
      "Generic Habitat surfaces must not hard-code product vocabulary"
    );
    expect(result.stderr).toContain("Public facade imports from an internal implementation owner");
    expect(result.stderr).toContain("Public facade imports an unapproved domain surface");
  });

  test("rejects removed sync baseline integrity adapter return", () => {
    const result = runGuardWithInjectedFiles({
      "tools/habitat-harness/src/domains/baseline-authority/integrity.ts":
        "export function checkBaselineIntegrity() {}\n",
    });

    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Removed public compatibility adapter returned.");
    expect(result.stderr).toContain(
      "tools/habitat-harness/src/domains/baseline-authority/integrity.ts"
    );
  });
});

function runGuardWithInjectedFiles(files: Record<string, string>) {
  const fixtureRoot = mkdtempSync(path.join(tmpdir(), "habitat-guard-"));
  for (const [repoPath, text] of Object.entries(files)) {
    const absolutePath = path.join(fixtureRoot, repoPath);
    mkdirSync(path.dirname(absolutePath), { recursive: true });
    writeFileSync(absolutePath, text, "utf8");
  }

  try {
    execFileSync("node", [guardScript], {
      cwd: repoRoot,
      env: {
        ...process.env,
        HABITAT_PUBLIC_SURFACE_GUARD_INJECTED_ROOT: fixtureRoot,
      },
      encoding: "utf8",
      stdio: "pipe",
    });
    return { exitCode: 0, stderr: "" };
  } catch (error) {
    const failure = error as { status?: number; stderr?: string };
    return { exitCode: failure.status ?? 1, stderr: failure.stderr ?? "" };
  } finally {
    rmSync(fixtureRoot, { force: true, recursive: true });
  }
}
