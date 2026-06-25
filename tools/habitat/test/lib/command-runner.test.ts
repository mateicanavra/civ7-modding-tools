import { makeFakeGitStateProviderLayer } from "@habitat/cli/providers/git/index";
import {
  CommandRunner,
  captureCommandGitStateAround,
  captureOutput,
  commandUnavailableFromCause,
  type HabitatCommandResult,
  interruptCommandOnTimeout,
  makeFakeCommandRunnerLayer,
  makeHabitatCommandResult,
  materializeHabitatCommandWithConfig,
  redactEnvDelta,
  renderCommandObservation,
} from "@habitat/cli/resources/command/index";
import { makeHabitatConfig } from "@habitat/cli/resources/config/index";
import {
  CommandInterrupted,
  CommandUnavailable,
} from "@habitat/cli/resources/errors/index";
import { repoRoot } from "@habitat/cli/resources/paths";
import { Duration, Effect, Fiber, TestClock, TestContext } from "effect";
import { describe, expect, test } from "vitest";

describe("CommandRunner", () => {
  test("materializes workspace tools from HabitatConfig policy", () => {
    const config = makeHabitatConfig({ repoRoot: "/tmp/habitat-repo" });

    expect(materializeHabitatCommandWithConfig(config, "grit", ["--version"])).toEqual({
      requestedExecutable: "grit",
      executable: "bun",
      cwd: "/tmp/habitat-repo",
      argv: ["run", "--cwd", "/tmp/habitat-repo", "grit", "--version"],
      executionPlane: "workspace-bun-run",
    });
  });

  test("fake layer models command observations without spawning", async () => {
    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const runner = yield* CommandRunner;
        return yield* runner.run({
          commandId: "fake-command",
          kind: "workspace-tool",
          executable: "node",
          argv: ["--version"],
          cwd: repoRoot,
        });
      }).pipe(
        Effect.provide(
          makeFakeCommandRunnerLayer((request) =>
            makeHabitatCommandResult(request, {
              stdout: {
                text: "fake\n",
                truncated: false,
                sha256: "fake",
                bytes: 5,
              },
            })
          )
        )
      )
    );

    expect(result.commandId).toBe("fake-command");
    expect(result.stdout.text).toBe("fake\n");
    expect(result.observation).toMatchObject({ kind: "completed", exitCode: 0 });
    expect("parseStatus" in result).toBe(false);
    expect("failureTag" in result).toBe(false);
  });

  test("derives discriminated command observations from exit state", () => {
    const failed = makeHabitatCommandResult(
      {
        commandId: "failed-command",
        kind: "workspace-tool",
        executable: "node",
        argv: ["--bad-flag"],
        cwd: repoRoot,
      },
      {
        exit: { code: 2, signal: null, interrupted: false },
      }
    );
    const interrupted = makeHabitatCommandResult(
      {
        commandId: "interrupted-command",
        kind: "workspace-tool",
        executable: "node",
        argv: ["--bad-flag"],
        cwd: repoRoot,
      },
      {
        exit: { code: 130, signal: "SIGTERM", interrupted: true },
      }
    );

    expect(failed.observation).toMatchObject({ kind: "failed", exitCode: 2 });
    expect(interrupted.observation).toMatchObject({
      kind: "interrupted",
      exitCode: 130,
      signal: "SIGTERM",
    });
    expect(renderCommandObservation(interrupted.observation)).toBe("interrupted by SIGTERM");
  });

  test("redacts sensitive env values and preserves output digests under truncation", () => {
    const env = redactEnvDelta({
      HABITAT_TOKEN: "secret-token",
      HABITAT_MODE: "local",
    });
    const output = captureOutput("x".repeat(4 * 1024 * 1024 + 8));

    expect(env.HABITAT_TOKEN).toEqual({ value: "<redacted>", redacted: true });
    expect(env.HABITAT_MODE).toEqual({ value: "local", redacted: false });
    expect(output.truncated).toBe(true);
    expect(output.text.length).toBe(4 * 1024 * 1024);
    expect(output.bytes).toBe(4 * 1024 * 1024 + 8);
    expect(output.sha256).toHaveLength(64);
  });

  test("captures command git state through the Git state provider", async () => {
    const reads: string[] = [];
    const states = [
      {
        branch: "before-branch",
        head: "before-head",
        dirty: false,
        statusShort: "",
        statusDigest: "before-digest",
      },
      {
        branch: "after-branch",
        head: "after-head",
        dirty: true,
        statusShort: " M tools/habitat/src/resources/command/runner.ts\n",
        statusDigest: "after-digest",
      },
    ];

    const request = {
      commandId: "git-state-provider-capture",
      kind: "workspace-tool" as const,
      executable: "fixture-command",
      argv: ["--write-ok"],
      cwd: repoRoot,
    };

    const result = await Effect.runPromise(
      Effect.gen(function* () {
        const captured = yield* captureCommandGitStateAround(
          request.cwd,
          request.captureGitState,
          Effect.succeed(
            makeHabitatCommandResult(request, {
              stdout: captureOutput("ok"),
            })
          )
        );
        return {
          ...captured.value,
          gitState: captured.gitState,
        };
      }).pipe(
        Effect.provide(
          makeFakeGitStateProviderLayer((cwd) => {
            reads.push(cwd);
            return states[Math.min(reads.length - 1, states.length - 1)]!;
          })
        )
      )
    );

    expect(reads).toEqual([repoRoot, repoRoot]);
    expect(result.gitState).toEqual({ before: states[0], after: states[1] });
    expect(result.stdout.text).toBe("ok");
  });

  test("reports unavailable commands as generic provider errors", async () => {
    const error = commandUnavailableFromCause(
      {
        commandId: "generic-missing-tool",
        kind: "workspace-tool",
        executable: "definitely-not-a-real-habitat-tool",
        argv: ["--version"],
        cwd: repoRoot,
      },
      new Error("ENOENT")
    );

    expect(error).toMatchObject({
      _tag: "CommandUnavailable",
      commandId: "generic-missing-tool",
    } satisfies Partial<CommandUnavailable>);
  });

  test("interrupts commands through explicit timeout policy without spawning", async () => {
    const request = {
      commandId: "generic-timeout",
      kind: "workspace-tool" as const,
      executable: "fixture-command",
      argv: ["--never-completes"],
      cwd: repoRoot,
      timeoutMs: 75,
    };
    const error = await Effect.runPromise(
      Effect.gen(function* () {
        const timedCommand = interruptCommandOnTimeout(
          Effect.never as Effect.Effect<HabitatCommandResult, CommandUnavailable>,
          request,
          request,
          request.timeoutMs
        ).pipe(Effect.catchTag("CommandInterrupted", (error) => Effect.succeed(error)));
        const fiber = yield* Effect.fork(timedCommand);
        yield* TestClock.adjust(Duration.millis(request.timeoutMs));
        return yield* Fiber.join(fiber);
      }).pipe(Effect.provide(TestContext.TestContext))
    );

    expect(error).toMatchObject({
      _tag: "CommandInterrupted",
      commandId: "generic-timeout",
      timeoutMs: 75,
    } satisfies Partial<CommandInterrupted>);
  });
});
