import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Effect, Layer } from "effect";
import { describe, expect, test } from "vitest";

import {
  Civ7WorkflowControl,
  Civ7WorkflowControlLive,
  type RunInGameDeployment,
  type RunInGamePreparedRequest,
} from "../src/ports";
import { Civ7TunerSession, type Civ7TunerSessionApi } from "../src/services/Civ7TunerSession";

describe("Studio workflow session graph", () => {
  test("workflow control depends on the runtime-owned Civ7TunerSession layer", () => {
    const root = dirname(dirname(fileURLToPath(import.meta.url)));
    const workflowControl = readFileSync(join(root, "src/ports/Civ7WorkflowControl.ts"), "utf8");
    const operationRuntime = readFileSync(
      join(root, "src/operationRuntime/StudioOperationRuntime.ts"),
      "utf8"
    );
    const runtime = readFileSync(join(root, "src/runtime.ts"), "utf8");

    expect(workflowControl).toContain("yield* Civ7TunerSession");
    expect(workflowControl).not.toContain("Civ7TunerSessionLive");
    expect(workflowControl).not.toContain("makeCiv7TunerSessionLayer");
    expect(workflowControl).not.toMatch(/\bnew\s+Civ7DirectControlSession\s*\(/);
    expect(workflowControl).not.toMatch(/Civ7WorkflowControlLive[\s\S]*Layer\.provide/);

    expect(operationRuntime).toContain("Civ7WorkflowControlLive");
    expect(operationRuntime).toContain("Civ7TunerSession");
    expect(runtime).toContain("const civ7TunerSessionLayer = Civ7TunerSessionLive");
    expect(runtime).not.toContain(".pipe(Layer.provide(civ7TunerSessionLayer))");
  });

  test("workflow control consumes an externally supplied tuner session service", async () => {
    let useCalls = 0;
    const fakeSession: Civ7TunerSessionApi = {
      session: {} as Civ7TunerSessionApi["session"],
      use: () =>
        Effect.sync(() => {
          useCalls += 1;
          return { ok: true };
        }),
      health: Effect.succeed({
        consecutiveResponseTimeouts: 0,
        gateOpenUntil: null,
        wedgeSuspected: false,
      }),
    };
    const layer = Civ7WorkflowControlLive.pipe(
      Layer.provide(Layer.succeed(Civ7TunerSession, fakeSession))
    );
    const prepared: RunInGamePreparedRequest = {
      fingerprint: "fingerprint-1",
      request: {
        recipeId: "mod-swooper-maps/standard",
        fingerprint: "fingerprint-1",
      },
    };
    const deployment: RunInGameDeployment = {};

    await Effect.runPromise(
      Effect.gen(function* () {
        const workflowControl = yield* Civ7WorkflowControl;
        yield* workflowControl.checkPlayable({
          requestId: "run-1",
          prepared,
          deployment,
        });
      }).pipe(Effect.provide(layer))
    );

    expect(useCalls).toBe(1);
  });
});
