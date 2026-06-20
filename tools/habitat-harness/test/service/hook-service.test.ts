import { Effect } from "effect";
import { describe, expect, test } from "vitest";
import type { HookRuntime } from "../../src/lib/hook-runtime/runtime.js";
import { createHabitatServiceClient } from "../../src/service/client.js";
import { runHookService } from "../../src/service/modules/hook/router.js";

describe("Habitat hook service", () => {
  test("runs owned hook orchestration from service input", async () => {
    const fake = makePrePushRuntime();

    const result = await Effect.runPromise(
      runHookService({ name: "pre-push", base: "HEAD~1" }, { runtime: fake.runtime })
    );

    expect(result).toEqual({
      exitCode: 0,
      stdout:
        "hook result: workstation check only; CI remains authoritative.\nhabitat hook pre-push: repo Nx affected base=HEAD~1\naffected ok\n",
      stderr: "",
    });
    expect(fake.calls).toEqual([
      "nx affected -t biome:ci,boundaries,grit:check,habitat:check,test --base HEAD~1 --head HEAD --outputStyle=static",
    ]);
  });

  test("preserves unknown hook stream behavior", async () => {
    const result = await Effect.runPromise(runHookService({}));

    expect(result).toEqual({
      exitCode: 2,
      stdout: "",
      stderr: "Unknown Habitat hook '(missing)'. Expected pre-commit or pre-push.\n",
    });
  });

  test("preserves empty base as hook runtime input", async () => {
    const fake = makePrePushRuntime({ graphiteParent: "agent-parent" });

    const result = await Effect.runPromise(
      runHookService({ name: "pre-push", base: "" }, { runtime: fake.runtime })
    );

    expect(result.stdout).toContain("base=agent-parent");
    expect(fake.calls).toEqual([
      "gt branch info --no-interactive",
      "nx affected -t biome:ci,boundaries,grit:check,habitat:check,test --base agent-parent --head HEAD --outputStyle=static",
    ]);
  });

  test("runs through the in-process Habitat service client", async () => {
    const fake = makePrePushRuntime();

    const result = await createHabitatServiceClient({
      hook: { runtime: fake.runtime },
    }).hook.run({ name: "pre-push", base: "HEAD~1" });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("base=HEAD~1");
    expect(fake.calls).toEqual([
      "nx affected -t biome:ci,boundaries,grit:check,habitat:check,test --base HEAD~1 --head HEAD --outputStyle=static",
    ]);
  });

  test("runs pre-commit through the in-process Habitat service client", async () => {
    const fake = makePreCommitRuntime();

    const result = await createHabitatServiceClient({
      hook: { runtime: fake.runtime },
    }).hook.run({ name: "pre-commit" });

    expect(result).toEqual({
      exitCode: 0,
      stdout: [
        "habitat hook pre-commit\n",
        "hook result: workstation check only; CI remains authoritative.\n",
        "resources: not-configured\n",
        "\n[file-layer staged check]\n",
        fileLayerCheckReport(),
        "biome: no staged supported files\n",
        "patterns: no staged TypeScript/JavaScript files in approved scan roots\n",
        "habitat hook pre-commit: PASS\n",
      ].join(""),
      stderr: "",
    });
    expect(fake.calls).toEqual([
      "git diff --cached --name-status -z",
      "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json",
    ]);
  });
});

function makePrePushRuntime(options: { graphiteParent?: string } = {}): {
  runtime: HookRuntime;
  calls: string[];
} {
  const calls: string[] = [];
  return {
    calls,
    runtime: {
      runCommand: (argv) => {
        const call = argv.join(" ");
        calls.push(call);
        if (call === "gt branch info --no-interactive") {
          return options.graphiteParent
            ? { exitCode: 0, stdout: `Parent: ${options.graphiteParent}\n`, stderr: "" }
            : { exitCode: 1, stdout: "", stderr: "no graphite parent\n" };
        }
        if (call.startsWith("nx affected ")) {
          return { exitCode: 0, stdout: "affected ok\n", stderr: "" };
        }
        throw new Error(`Unexpected hook service test command: ${call}`);
      },
      nowMs: () => 1_000,
    },
  };
}

function makePreCommitRuntime(): {
  runtime: HookRuntime;
  calls: string[];
} {
  const calls: string[] = [];
  return {
    calls,
    runtime: {
      runCommand: (argv) => {
        const call = argv.join(" ");
        calls.push(call);
        if (call === "git diff --cached --name-status -z") {
          return { exitCode: 0, stdout: "", stderr: "" };
        }
        if (
          call === "bun tools/habitat-harness/bin/dev.ts check --staged --tool file-layer --json"
        ) {
          return { exitCode: 0, stdout: fileLayerCheckReport(), stderr: "" };
        }
        throw new Error(`Unexpected hook pre-commit service test command: ${call}`);
      },
      pathExists: () => false,
      nowMs: () => 1_000,
    },
  };
}

function fileLayerCheckReport(): string {
  return `${JSON.stringify({
    schemaVersion: 1,
    command: "habitat check --staged --tool file-layer --json",
    startedAt: "2026-06-20T00:00:00.000Z",
    ok: true,
    rules: [],
  })}\n`;
}
