import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Data, Effect, Ref } from "effect";
import { runHabitatEffect } from "./effect-runtime.js";
import {
  HabitatProcess,
  HabitatProcessLive,
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
} from "./habitat-process.js";
import { repoRoot } from "./paths.js";

export interface EffectParityProbeResult {
  commandExecution: {
    exitCode: number;
    stdout: string;
    stderr: string;
  };
  scopedCleanup: {
    markerExistedInsideScope: boolean;
    cleanupObserved: boolean;
    pathExistsAfterScope: boolean;
  };
  taggedError: {
    tag: string;
    caught: boolean;
  };
  fakeServiceProvision: {
    exitCode: number;
    stdout: string;
  };
}

class HabitatEffectParityTaggedError extends Data.TaggedError("HabitatEffectParityTaggedError")<{
  readonly message: string;
}> {}

export function effectParityProbeProgram() {
  return Effect.gen(function* () {
    const process = yield* HabitatProcess;
    const commandExecution = yield* process.run({
      commandId: "effect-platform-parity-live-command",
      kind: "platform-parity",
      executable: "node",
      argv: ["-e", "console.log('habitat-effect-parity'); console.error('parity-stderr')"],
      cwd: repoRoot,
      env: { HABITAT_PARITY_TOKEN: "must-redact", HABITAT_PARITY_VISIBLE: "visible" },
      nonClaims: ["does-not-prove-grit-row-current-tree"],
    });
    const scopedCleanup = yield* scopedCleanupProbe();
    const taggedError = yield* taggedErrorProbe();
    const fakeServiceProvision = yield* fakeServiceProbe();

    return {
      commandExecution: {
        exitCode: commandExecution.exit.code,
        stdout: commandExecution.stdout.text,
        stderr: commandExecution.stderr.text,
      },
      scopedCleanup,
      taggedError,
      fakeServiceProvision: {
        exitCode: fakeServiceProvision.exit.code,
        stdout: fakeServiceProvision.stdout.text,
      },
    };
  }).pipe(Effect.provide(HabitatProcessLive));
}

export function runEffectParityProbe(): Promise<EffectParityProbeResult> {
  return runHabitatEffect(effectParityProbeProgram());
}

function scopedCleanupProbe() {
  return Effect.gen(function* () {
    const cleaned = yield* Ref.make(false);
    let markerPath = "";
    const markerExistedInsideScope = yield* Effect.scoped(
      Effect.gen(function* () {
        const dir = yield* Effect.acquireRelease(
          Effect.sync(() => mkdtempSync(path.join(tmpdir(), "habitat-effect-parity-"))),
          (created) =>
            Effect.sync(() => {
              rmSync(created, { recursive: true, force: true });
              return Ref.set(cleaned, true);
            }).pipe(Effect.flatten)
        );
        markerPath = path.join(dir, "marker.txt");
        yield* Effect.sync(() => writeFileSync(markerPath, "cleanup proof\n"));
        return existsSync(markerPath);
      })
    );
    const cleanupObserved = yield* Ref.get(cleaned);
    return {
      markerExistedInsideScope,
      cleanupObserved,
      pathExistsAfterScope: markerPath.length > 0 && existsSync(markerPath),
    };
  });
}

function taggedErrorProbe() {
  return Effect.fail(new HabitatEffectParityTaggedError({ message: "parity tagged error" })).pipe(
    Effect.catchTag("HabitatEffectParityTaggedError", (error) =>
      Effect.succeed({ tag: error._tag, caught: true })
    )
  );
}

function fakeServiceProbe() {
  const fakeLayer = makeFakeHabitatProcessLayer((request) =>
    makeHabitatCommandResult(request, {
      stdout: {
        text: "fake-service-ok\n",
        truncated: false,
        sha256: "fake",
        bytes: "fake-service-ok\n".length,
      },
    })
  );
  return Effect.gen(function* () {
    const process = yield* HabitatProcess;
    return yield* process.run({
      commandId: "effect-platform-parity-fake-service",
      kind: "platform-parity",
      executable: "fake",
      argv: ["--no-spawn"],
      cwd: repoRoot,
      nonClaims: ["fake-service-does-not-prove-live-command"],
    });
  }).pipe(Effect.provide(fakeLayer));
}
