import { createHash } from "node:crypto";
import { makeFakeGitStateProviderLayer } from "@habitat/cli/providers/git/index";
import {
  CommandRunner,
  CommandRunnerLive,
  captureOutput,
  makeFakeCommandRunnerLayer,
  makeHabitatCommandResult,
  materializeHabitatCommandWithConfig,
  redactEnvDelta,
  renderCommandObservation,
} from "@habitat/cli/resources/command/index";
import { collectOutputCapture } from "@habitat/cli/resources/command/output";
import { makeHabitatConfig, makeHabitatConfigLayer } from "@habitat/cli/resources/config/index";
import { CommandInterrupted, CommandUnavailable } from "@habitat/cli/resources/errors/index";
import { repoRoot } from "@habitat/cli/resources/paths";
import { Effect, Layer, Stream } from "effect";
import { describe, expect, test } from "vitest";

const expectedCommandOutputCaptureLimitBytes = 4 * 1024 * 1024;

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
    const command = CommandRunner.pipe(
      Effect.flatMap((runner) =>
        runner.run({
          commandId: "fake-command",
          kind: "workspace-tool",
          executable: "node",
          argv: ["--version"],
          cwd: repoRoot,
        })
      )
    );
    const result = await Effect.runPromise(
      command.pipe(
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

  test("redacts sensitive env values and captures in-memory output", () => {
    const env = redactEnvDelta({
      HABITAT_TOKEN: "secret-token",
      HABITAT_MODE: "local",
    });
    const output = captureOutput("visible 🌊\n");

    expect(env.HABITAT_TOKEN).toEqual({ value: "<redacted>", redacted: true });
    expect(env.HABITAT_MODE).toEqual({ value: "local", redacted: false });
    expect(output).toMatchObject({
      text: "visible 🌊\n",
      truncated: false,
      bytes: Buffer.byteLength("visible 🌊\n", "utf8"),
    });
    expect(output.sha256).toHaveLength(64);
  });

  test("decodes Unicode only after all output chunks have been retained", async () => {
    const encoded = Buffer.from("alpha 🌊 omega\n", "utf8");
    const splitInsideWave = Buffer.byteLength("alpha ", "utf8") + 2;
    const chunks = [
      encoded.subarray(0, splitInsideWave),
      encoded.subarray(splitInsideWave, splitInsideWave + 1),
      encoded.subarray(splitInsideWave + 1),
    ];

    const output = await Effect.runPromise(collectOutputCapture(Stream.fromIterable(chunks)));

    expect(output).toEqual({
      text: encoded.toString("utf8"),
      truncated: false,
      sha256: createHash("sha256").update(encoded).digest("hex"),
      bytes: encoded.byteLength,
    });
  });

  test("bounds retained output while hashing and counting the complete stream", async () => {
    const block = Buffer.alloc(64 * 1024, "x");
    const overflow = Buffer.from("overflow-🌊", "utf8");
    const blockCount = expectedCommandOutputCaptureLimitBytes / block.byteLength;
    const chunks = [...Array.from({ length: blockCount }, () => block), overflow];
    const expectedHash = createHash("sha256");
    for (const chunk of chunks) expectedHash.update(chunk);

    const output = await Effect.runPromise(collectOutputCapture(Stream.fromIterable(chunks)));

    expect(output.truncated).toBe(true);
    expect(output.text).toHaveLength(expectedCommandOutputCaptureLimitBytes);
    expect(output.text[0]).toBe("x");
    expect(output.text.at(-1)).toBe("x");
    expect(output.bytes).toBe(expectedCommandOutputCaptureLimitBytes + overflow.byteLength);
    expect(output.sha256).toBe(expectedHash.digest("hex"));
  });

  test("captures a live command through the bounded stream collector", async () => {
    const encoded = Buffer.from("live 🌊 output\n", "utf8");
    const script = [
      'const bytes = Buffer.from("live \\u{1f30a} output\\n", "utf8");',
      "process.stdout.write(bytes.subarray(0, 7));",
      "process.stdout.write(bytes.subarray(7, 9));",
      "process.stdout.write(bytes.subarray(9));",
    ].join("");
    const liveRunner = makeLiveCommandRunnerLayer();

    const result = await Effect.runPromise(
      CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: "bounded-live-output",
            kind: "workspace-tool",
            executable: process.execPath,
            argv: ["-e", script],
            cwd: repoRoot,
            captureGitState: false,
          })
        ),
        Effect.provide(liveRunner)
      )
    );

    expect(result.exit.code).toBe(0);
    expect(result.stdout).toEqual({
      text: encoded.toString("utf8"),
      truncated: false,
      sha256: createHash("sha256").update(encoded).digest("hex"),
      bytes: encoded.byteLength,
    });
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
    const dependencies = Layer.mergeAll(
      makeHabitatConfigLayer(makeHabitatConfig({ repoRoot })),
      makeFakeGitStateProviderLayer(
        (cwd) => states[Math.min(reads.push(cwd) - 1, states.length - 1)]!
      )
    );
    const liveRunner = CommandRunnerLive.pipe(Layer.provide(dependencies));

    const result = await Effect.runPromise(
      CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: "git-state-provider-capture",
            kind: "workspace-tool",
            executable: process.execPath,
            argv: ["-e", 'process.stdout.write("ok")'],
            cwd: repoRoot,
            captureGitState: true,
          })
        ),
        Effect.provide(liveRunner)
      )
    );

    expect(reads).toEqual([repoRoot, repoRoot]);
    expect(result.gitState).toEqual({ before: states[0], after: states[1] });
    expect(result.stdout.text).toBe("ok");
  });

  test("reports a real spawn failure as a generic provider error", async () => {
    const error = await Effect.runPromise(
      CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: "generic-missing-tool",
            kind: "workspace-tool",
            executable: "definitely-not-a-real-habitat-tool",
            argv: ["--version"],
            cwd: repoRoot,
            captureGitState: false,
          })
        ),
        Effect.catchTag("CommandUnavailable", (failure) => Effect.succeed(failure)),
        Effect.provide(makeLiveCommandRunnerLayer())
      )
    );

    expect(error).toMatchObject({
      _tag: "CommandUnavailable",
      commandId: "generic-missing-tool",
    } satisfies Partial<CommandUnavailable>);
  });

  test("interrupts and releases a live command through explicit timeout policy", async () => {
    const request = {
      commandId: "generic-timeout",
      kind: "workspace-tool" as const,
      executable: process.execPath,
      argv: ["-e", "setInterval(() => {}, 1_000)"],
      cwd: repoRoot,
      timeoutMs: 75,
      captureGitState: false,
    };
    const error = await Effect.runPromise(
      CommandRunner.pipe(
        Effect.flatMap((runner) => runner.run(request)),
        Effect.catchTag("CommandInterrupted", (error) => Effect.succeed(error)),
        Effect.provide(makeLiveCommandRunnerLayer())
      )
    );

    expect(error).toMatchObject({
      _tag: "CommandInterrupted",
      commandId: "generic-timeout",
      timeoutMs: 75,
    } satisfies Partial<CommandInterrupted>);
  });
});

function makeLiveCommandRunnerLayer() {
  const dependencies = Layer.mergeAll(
    makeHabitatConfigLayer(makeHabitatConfig({ repoRoot })),
    makeFakeGitStateProviderLayer(() => ({
      branch: null,
      head: null,
      dirty: false,
      statusShort: "",
      statusDigest: "fixture",
    }))
  );
  return CommandRunnerLive.pipe(Layer.provide(dependencies));
}
