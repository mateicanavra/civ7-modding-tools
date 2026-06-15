import { Effect } from "effect";
import { describe, expect, test } from "vitest";
import { runHabitatEffect } from "../../src/lib/effect-runtime.js";
import {
  GritToolUnavailable,
  HabitatProcess,
  HabitatProcessLive,
  makeFakeHabitatProcessLayer,
  makeHabitatCommandResult,
} from "../../src/lib/habitat-process.js";
import { repoRoot } from "../../src/lib/paths.js";

describe("HabitatProcess", () => {
  test("executes argument-array commands and captures stdout, stderr, exit, env, and duration", async () => {
    const result = await runHabitatEffect(
      Effect.gen(function* () {
        const process = yield* HabitatProcess;
        return yield* process.run({
          commandId: "habitat-process-live-nonzero",
          kind: "platform-parity",
          executable: "node",
          argv: ["-e", "console.log('out'); console.error('err'); process.exit(7)"],
          cwd: repoRoot,
          env: {
            HABITAT_VISIBLE_ENV: "visible",
            HABITAT_SECRET_TOKEN: "should-not-appear",
          },
          nonClaims: ["does-not-prove-grit-pattern-semantics"],
        });
      }).pipe(Effect.provide(HabitatProcessLive))
    );

    expect(result.exit).toEqual({ code: 7, signal: null, interrupted: false });
    expect(result.failureTag).toBe("GritCommandFailed");
    expect(result.stdout.text).toBe("out\n");
    expect(result.stderr.text).toBe("err\n");
    expect(result.stdout.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(result.timing.durationMs).toBeGreaterThanOrEqual(0);
    expect(result.envDelta.HABITAT_VISIBLE_ENV).toEqual({ value: "visible", redacted: false });
    expect(result.envDelta.HABITAT_SECRET_TOKEN).toEqual({
      value: "<redacted>",
      redacted: true,
    });
    expect(JSON.stringify(result)).not.toContain("should-not-appear");
    expect(result.nonClaims).toEqual(["does-not-prove-grit-pattern-semantics"]);
  });

  test("keeps broad Grit-sized JSON captures available to parser code", async () => {
    const result = await runHabitatEffect(
      Effect.gen(function* () {
        const process = yield* HabitatProcess;
        return yield* process.run({
          commandId: "habitat-process-large-json",
          kind: "platform-parity",
          executable: "node",
          argv: [
            "-e",
            "process.stderr.write(JSON.stringify({ paths: Array(20000).fill('x'), results: [] }))",
          ],
          cwd: repoRoot,
        });
      }).pipe(Effect.provide(HabitatProcessLive))
    );

    expect(result.stderr.bytes).toBeGreaterThan(64 * 1024);
    expect(result.stderr.truncated).toBe(false);
    expect(result.stderr.text.endsWith(',"results":[]}')).toBe(true);
  });

  test("routes workspace-owned tools through Bun workspace commands", async () => {
    const result = await runHabitatEffect(
      Effect.gen(function* () {
        const process = yield* HabitatProcess;
        return yield* process.run({
          commandId: "habitat-process-workspace-grit",
          kind: "grit-check",
          executable: "grit",
          argv: ["--version"],
          cwd: repoRoot,
        });
      }).pipe(Effect.provide(HabitatProcessLive))
    );

    expect(result.exit.code).toBe(0);
    expect(result.requestedExecutable).toBe("grit");
    expect(result.executable).toBe("bun");
    expect(result.executionPlane).toBe("workspace-bun-run");
    expect(result.cwd).toBe(repoRoot);
    expect(result.argv).toEqual(["run", "--cwd", repoRoot, "grit", "--version"]);
    expect(result.stdout.text).toContain("grit");
  });

  test("routes script-colliding workspace binaries through local-only bunx", async () => {
    const result = await runHabitatEffect(
      Effect.gen(function* () {
        const process = yield* HabitatProcess;
        return yield* process.run({
          commandId: "habitat-process-workspace-openspec",
          kind: "platform-parity",
          executable: "openspec",
          argv: ["--version"],
          cwd: "/tmp",
        });
      }).pipe(Effect.provide(HabitatProcessLive))
    );

    expect(result.exit.code).toBe(0);
    expect(result.requestedExecutable).toBe("openspec");
    expect(result.executable).toBe("bun");
    expect(result.executionPlane).toBe("workspace-bunx-binary");
    expect(result.cwd).toBe(repoRoot);
    expect(result.argv).toEqual(["x", "--no-install", "openspec", "--version"]);
    expect(result.stdout.text).toMatch(/\d+\.\d+\.\d+/);
  });

  test("reports missing tools as tagged adapter errors", async () => {
    const error = await runHabitatEffect(
      Effect.gen(function* () {
        const process = yield* HabitatProcess;
        return yield* process.run({
          commandId: "habitat-process-missing-tool",
          kind: "grit-check",
          executable: "definitely-not-a-real-habitat-tool",
          argv: ["--version"],
          cwd: repoRoot,
        });
      }).pipe(
        Effect.catchTag("GritToolUnavailable", (error) => Effect.succeed(error)),
        Effect.provide(HabitatProcessLive)
      )
    );

    expect(error).toMatchObject({
      _tag: "GritToolUnavailable",
      commandId: "habitat-process-missing-tool",
    } satisfies Partial<GritToolUnavailable>);
  });

  test("fake service can model signal and interruption outcomes without spawning", async () => {
    const fakeLayer = makeFakeHabitatProcessLayer((request) =>
      makeHabitatCommandResult(request, {
        exit: { code: 130, signal: "SIGINT", interrupted: true },
        failureTag: "GritCommandFailed",
        stderr: {
          text: "interrupted\n",
          truncated: false,
          sha256: "fake",
          bytes: "interrupted\n".length,
        },
      })
    );

    const result = await runHabitatEffect(
      Effect.gen(function* () {
        const process = yield* HabitatProcess;
        return yield* process.run({
          commandId: "habitat-process-fake-interruption",
          kind: "grit-apply",
          executable: "grit",
          argv: ["apply"],
          cwd: repoRoot,
        });
      }).pipe(Effect.provide(fakeLayer))
    );

    expect(result.exit).toEqual({ code: 130, signal: "SIGINT", interrupted: true });
    expect(result.stderr.text).toBe("interrupted\n");
  });
});
