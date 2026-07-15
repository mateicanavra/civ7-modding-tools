import { readFile } from "node:fs/promises";
import { describe, expect, test } from "vitest";

describe("Studio workflow lifecycle graph", () => {
  test("uses the runtime-owned tuner session and host lifecycle facade without a local session", async () => {
    const source = await readFile(
      new URL("../src/ports/Civ7WorkflowControl.ts", import.meta.url),
      "utf8"
    );

    expect(source).toContain("const tuner = yield* Civ7TunerSession");
    expect(source).toContain("const config = yield* StudioConfig");
    expect(source).toContain("directLifecycle: config.civ7Control.directLifecycle");
    expect(source).toContain("session: tuner.session");
    expect(source).not.toContain("tuner.use((options) => client.lifecycle");
  });

  test("delegates setup and start exactly once to the canonical lifecycle procedure", async () => {
    const control = await readFile(
      new URL("../src/ports/Civ7WorkflowControl.ts", import.meta.url),
      "utf8"
    );
    const workflow = await readFile(
      new URL("../src/workflows/RunInGameWorkflow.ts", import.meta.url),
      "utf8"
    );

    expect(control.match(/lifecycle\.singlePlayer\.start\(/g)).toHaveLength(1);
    expect(workflow.match(/startSinglePlayer\(/g)).toHaveLength(1);
    expect(workflow).not.toMatch(/checkPlayable|prepareSetup|startGame/);
  });
});
