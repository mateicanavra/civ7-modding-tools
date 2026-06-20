import { Effect } from "effect";
import { describe, expect, test } from "vitest";
import { makeHabitatConfig } from "../../src/config/index.js";
import { CommandInterrupted, CommandUnavailable } from "../../src/errors/index.js";
import { repoRoot } from "../../src/lib/paths.js";
import {
  CommandRunner,
  makeFakeCommandRunnerLayer,
  makeHabitatCommandResult,
  materializeHabitatCommandWithConfig,
} from "../../src/providers/command/index.js";
import { runHabitatEffect } from "../../src/runtime/index.js";

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
    const result = await runHabitatEffect(
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
  });

  test("reports unavailable commands as generic provider errors", async () => {
    const error = await runHabitatEffect(
      Effect.gen(function* () {
        const runner = yield* CommandRunner;
        return yield* runner.run({
          commandId: "generic-missing-tool",
          kind: "workspace-tool",
          executable: "definitely-not-a-real-habitat-tool",
          argv: ["--version"],
          cwd: repoRoot,
        });
      }).pipe(Effect.catchTag("CommandUnavailable", (error) => Effect.succeed(error)))
    );

    expect(error).toMatchObject({
      _tag: "CommandUnavailable",
      commandId: "generic-missing-tool",
    } satisfies Partial<CommandUnavailable>);
  });

  test("interrupts live commands through explicit timeout policy", async () => {
    const error = await runHabitatEffect(
      Effect.gen(function* () {
        const runner = yield* CommandRunner;
        return yield* runner.run({
          commandId: "generic-timeout",
          kind: "workspace-tool",
          executable: "node",
          argv: ["-e", "setInterval(() => {}, 1000)"],
          cwd: repoRoot,
          timeoutMs: 75,
        });
      }).pipe(Effect.catchTag("CommandInterrupted", (error) => Effect.succeed(error)))
    );

    expect(error).toMatchObject({
      _tag: "CommandInterrupted",
      commandId: "generic-timeout",
      timeoutMs: 75,
    } satisfies Partial<CommandInterrupted>);
  }, 2_000);
});
