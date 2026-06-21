import { describe, expect, test } from "vitest";
import {
  renderPublicSurfaceGuardFailures,
  runPublicSurfaceGuard,
} from "../../src/domains/public-surface-guards/guard.js";

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
  const result = runPublicSurfaceGuard({ injectedFiles: new Map(Object.entries(files)) });
  return {
    exitCode: result.ok ? 0 : 1,
    stderr: result.ok ? "" : renderPublicSurfaceGuardFailures(result),
  };
}
