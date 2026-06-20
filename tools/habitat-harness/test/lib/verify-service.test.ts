import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, test } from "vitest";

const packageRoot = new URL("../..", import.meta.url).pathname;

describe("Habitat verify service router", () => {
  test("authors verify orchestration directly in the router procedure", () => {
    const router = readFileSync(join(packageRoot, "src/service/modules/verify/router.ts"), "utf8");

    expect(router).toContain("verifyModule.run.effect(({ input }) =>");
    expect(router).toContain("resolveVerifyBaseEffect(input.base)");
    expect(router).toContain("structuralCheck.createReport");
    expect(router).toContain("runAffectedVerificationEffect(base, targetPlan)");
    expect(router).toContain("observeGitStatusEffect()");
    expect(router).toContain("createVerifyReceipt");
    expect(router).not.toContain("runVerifyService");
    expect(router).not.toContain("lib/verify");
  });
});
