import { ChildProcess, spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";
import { makeFakeGitStateProviderLayer } from "@habitat/cli/providers/git/index";
import { CommandRunner, CommandRunnerLive } from "@habitat/cli/resources/command/index";
import { acquireOwnedCommandProcess } from "@habitat/cli/resources/command/process";
import { makeHabitatConfig, makeHabitatConfigLayer } from "@habitat/cli/resources/config/index";
import { repoRoot } from "@habitat/cli/resources/paths";
import { Cause, Deferred, Effect, Exit, Fiber, Layer, Match } from "effect";
import { describe, expect, test, vi } from "vitest";

const acceptedProcessSignal: true = true;

describe.runIf(process.platform === "darwin" || process.platform === "linux")(
  "Habitat-owned command processes",
  () => {
    test("releases the live owned group after direct-child completion", async () => {
      const stateRoot = mkdtempSync(path.join(tmpdir(), "habitat-command-completed-"));
      const liveRunner = makeLiveCommandRunnerLayer();
      let descendantPid: number | undefined;

      try {
        const startedAt = Date.now();
        const result = await Effect.runPromise(
          CommandRunner.pipe(
            Effect.flatMap((runner) =>
              runner.run({
                commandId: "completed-without-finalizer-signal",
                kind: "workspace-tool",
                executable: process.execPath,
                argv: ["-e", completedProcessGroupFixtureScript],
                cwd: repoRoot,
                env: {
                  HABITAT_COMMAND_RUNNER_DESCENDANT_SCRIPT:
                    completedProcessGroupDescendantFixtureScript,
                  HABITAT_COMMAND_RUNNER_STATE_ROOT: stateRoot,
                },
                captureGitState: false,
              })
            ),
            Effect.provide(liveRunner)
          )
        );

        descendantPid = readFixturePid(path.join(stateRoot, "descendant.pid"));
        expect(result.exit.code).toBe(7);
        await waitForProcessExit(descendantPid);
        expect(readFileSync(path.join(stateRoot, "descendant.term"), "utf8")).toBe("1");
        expect(Date.now() - startedAt).toBeLessThan(3_000);
      } finally {
        await terminateFixtureProcess(descendantPid);
        rmSync(stateRoot, { recursive: true, force: true });
      }
    });

    test("owns descendants before command startup is admitted to the runner", async () => {
      const stateRoot = mkdtempSync(path.join(tmpdir(), "habitat-command-starting-"));
      const makeStartupHold = Deferred.make<void>();
      const startupHold = Effect.runSync(makeStartupHold);
      const awaitStartupRelease = Deferred.await(startupHold);
      const acquireProcess = acquireOwnedCommandProcess({
        executable: process.execPath,
        argv: ["-e", processGroupFixtureScript(false)],
        cwd: repoRoot,
        env: liveCommandEnv({
          HABITAT_COMMAND_RUNNER_DESCENDANT_SCRIPT: processGroupDescendantFixtureScript,
          HABITAT_COMMAND_RUNNER_STATE_ROOT: stateRoot,
        }),
      });
      const program = acquireProcess.pipe(Effect.andThen(awaitStartupRelease), Effect.scoped);
      const fiber = Effect.runFork(program);
      let rootPid: number | undefined;
      let descendantPid: number | undefined;

      try {
        await waitForPath(path.join(stateRoot, "root.ready"));
        await waitForPath(path.join(stateRoot, "descendant.ready"));
        rootPid = readFixturePid(path.join(stateRoot, "root.pid"));
        descendantPid = readFixturePid(path.join(stateRoot, "descendant.pid"));

        await Effect.runPromise(Fiber.interrupt(fiber));
        await waitForProcessExit(rootPid);
        await waitForProcessExit(descendantPid);

        expect(existsSync(path.join(stateRoot, "descendant.term"))).toBe(true);
      } finally {
        await Effect.runPromise(Fiber.interrupt(fiber));
        await terminateFixtureProcess(rootPid);
        await terminateFixtureProcess(descendantPid);
        rmSync(stateRoot, { recursive: true, force: true });
      }
    });

    test.each([
      { label: "after the direct child exits on TERM", rootResistsTerm: false },
      { label: "after a TERM-resistant root exhausts its grace", rootResistsTerm: true },
    ])("continues owned TERM-to-KILL cleanup $label", async ({ rootResistsTerm }) => {
      const stateRoot = mkdtempSync(path.join(tmpdir(), "habitat-command-runner-"));
      const liveRunner = makeLiveCommandRunnerLayer();
      const program = CommandRunner.pipe(
        Effect.flatMap((runner) =>
          runner.run({
            commandId: "bounded-process-group-termination",
            kind: "workspace-tool",
            executable: process.execPath,
            argv: ["-e", processGroupFixtureScript(rootResistsTerm)],
            cwd: repoRoot,
            env: {
              HABITAT_COMMAND_RUNNER_DESCENDANT_SCRIPT: processGroupDescendantFixtureScript,
              HABITAT_COMMAND_RUNNER_STATE_ROOT: stateRoot,
            },
            captureGitState: false,
          })
        ),
        Effect.provide(liveRunner)
      );
      const fiber = Effect.runFork(program);
      let rootPid: number | undefined;
      let descendantPid: number | undefined;

      try {
        await waitForPath(path.join(stateRoot, "root.ready"));
        await waitForPath(path.join(stateRoot, "descendant.ready"));
        rootPid = readFixturePid(path.join(stateRoot, "root.pid"));
        descendantPid = readFixturePid(path.join(stateRoot, "descendant.pid"));
        expect(processIsAlive(rootPid)).toBe(true);
        expect(processIsAlive(descendantPid)).toBe(true);

        const startedAt = Date.now();
        await Effect.runPromise(Fiber.interrupt(fiber));
        await waitForProcessExit(rootPid);
        await waitForProcessExit(descendantPid);

        expect(existsSync(path.join(stateRoot, "descendant.term"))).toBe(true);
        expect(existsSync(path.join(stateRoot, "root.term"))).toBe(rootResistsTerm);
        expect(Date.now() - startedAt).toBeLessThan(3_000);
      } finally {
        await Effect.runPromise(Fiber.interrupt(fiber));
        await terminateFixtureProcess(rootPid);
        await terminateFixtureProcess(descendantPid);
        rmSync(stateRoot, { recursive: true, force: true });
      }
    });

    test.each([
      { label: "TERM-exiting", absence: "after-term" },
      { label: "TERM-not-found race", absence: "during-term" },
    ] as const)("treats process-group absence as absorbing during $label", async ({ absence }) => {
      const originalProcessKill = process.kill.bind(process);
      const signals: Array<string | number | undefined> = [];
      let termDelivered = false;
      const processKill = vi.spyOn(process, "kill").mockImplementation((pid, signal): true => {
        signals.push(signal);
        return Match.value({ absence, signal, termDelivered }).pipe(
          Match.when({ absence: "during-term", signal: "SIGTERM" }, () => {
            throw new FixtureProcessNotFoundError(signal);
          }),
          Match.when({ absence: "after-term", signal: "SIGTERM" }, () => {
            termDelivered = true;
            return acceptedProcessSignal;
          }),
          Match.when({ absence: "after-term", signal: 0, termDelivered: true }, () => {
            throw new FixtureProcessNotFoundError(signal);
          }),
          Match.orElse((): true => acceptedProcessSignal)
        );
      });
      let rootPid: number | undefined;

      try {
        await Effect.runPromise(
          acquireOwnedCommandProcess({
            executable: process.execPath,
            argv: ["-e", "setInterval(() => {}, 1_000);"],
            cwd: repoRoot,
            env: liveCommandEnv({}),
          }).pipe(
            Effect.tap((owned) =>
              Effect.sync(() => {
                rootPid = owned.child.pid;
              })
            ),
            Effect.flatMap((owned) => owned.awaitStarted),
            Effect.scoped
          )
        );

        expect(signals).toContain("SIGTERM");
        expect(signals).not.toContain("SIGKILL");
      } finally {
        processKill.mockRestore();
        await Match.value(rootPid).pipe(
          Match.when(Match.undefined, () => Promise.resolve()),
          Match.orElse(async (pid) => {
            originalProcessKill(-pid, "SIGKILL");
            await waitForProcessExit(pid);
          })
        );
      }
    });

    test("surfaces bounded incomplete release when group and fallback signals fail", async () => {
      const originalProcessKill = process.kill.bind(process);
      const processKill = vi
        .spyOn(process, "kill")
        .mockImplementation((pid, signal) => refuseOwnedProcessSignals(pid, signal));
      const childKill = vi.spyOn(ChildProcess.prototype, "kill").mockReturnValue(false);
      let rootPid: number | undefined;

      try {
        const program = acquireOwnedCommandProcess({
          executable: process.execPath,
          argv: ["-e", "setInterval(() => {}, 1_000);"],
          cwd: repoRoot,
          env: liveCommandEnv({}),
        }).pipe(
          Effect.tap((owned) =>
            Effect.sync(() => {
              rootPid = owned.child.pid;
            })
          ),
          Effect.flatMap((owned) => owned.awaitStarted),
          Effect.scoped
        );

        const exit = await Effect.runPromiseExit(program);

        expect(Exit.isFailure(exit)).toBe(true);
        Exit.match(exit, {
          onFailure: (cause) => {
            expect(Cause.pretty(cause)).toContain(
              "Habitat could not release owned command process group"
            );
            expect(Cause.squash(cause)).toMatchObject({
              _tag: "OwnedCommandProcessReleaseIncomplete",
              term: {
                kind: "failed",
                groupCause: "fixture refused process-group SIGTERM",
                fallbackCause: "Direct child refused SIGTERM.",
              },
              kill: {
                kind: "failed",
                groupCause: "fixture refused process-group SIGKILL",
                fallbackCause: "Direct child refused SIGKILL.",
              },
            });
          },
          onSuccess: () => {
            throw new Error("Expected owned process release to remain incomplete.");
          },
        });
      } finally {
        childKill.mockRestore();
        processKill.mockRestore();
        await Match.value(rootPid).pipe(
          Match.when(Match.undefined, () => Promise.resolve()),
          Match.orElse(async (pid) => {
            originalProcessKill(-pid, "SIGKILL");
            await waitForProcessExit(pid);
          })
        );
      }
    });
  }
);

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

function processGroupFixtureScript(rootResistsTerm: boolean): string {
  const rootTermHandler = Match.value(rootResistsTerm).pipe(
    Match.when(
      true,
      () => 'process.on("SIGTERM", () => writeFileSync(path.join(stateRoot, "root.term"), ""));'
    ),
    Match.orElse(() => "")
  );
  return [
    'const { spawn } = require("node:child_process");',
    'const { writeFileSync } = require("node:fs");',
    'const path = require("node:path");',
    "const stateRoot = process.env.HABITAT_COMMAND_RUNNER_STATE_ROOT;",
    rootTermHandler,
    'writeFileSync(path.join(stateRoot, "root.pid"), String(process.pid));',
    'const descendant = spawn(process.execPath, ["-e", process.env.HABITAT_COMMAND_RUNNER_DESCENDANT_SCRIPT], { stdio: "ignore" });',
    'writeFileSync(path.join(stateRoot, "descendant.pid"), String(descendant.pid));',
    'writeFileSync(path.join(stateRoot, "root.ready"), "");',
    "setInterval(() => {}, 1_000);",
  ].join("");
}

const processGroupDescendantFixtureScript = [
  'const { writeFileSync } = require("node:fs");',
  'const path = require("node:path");',
  "const stateRoot = process.env.HABITAT_COMMAND_RUNNER_STATE_ROOT;",
  'process.on("SIGTERM", () => writeFileSync(path.join(stateRoot, "descendant.term"), ""));',
  'writeFileSync(path.join(stateRoot, "descendant.ready"), "");',
  "setInterval(() => {}, 1_000);",
].join("");

const completedProcessGroupFixtureScript = [
  'const { spawn } = require("node:child_process");',
  'const { existsSync, writeFileSync } = require("node:fs");',
  'const path = require("node:path");',
  "const stateRoot = process.env.HABITAT_COMMAND_RUNNER_STATE_ROOT;",
  'const descendant = spawn(process.execPath, ["-e", process.env.HABITAT_COMMAND_RUNNER_DESCENDANT_SCRIPT], { stdio: "ignore" });',
  'writeFileSync(path.join(stateRoot, "descendant.pid"), String(descendant.pid));',
  "const ready = setInterval(() => {",
  '  if (!existsSync(path.join(stateRoot, "descendant.ready"))) return;',
  "  clearInterval(ready);",
  "  process.exit(7);",
  "}, 5);",
].join("");

const completedProcessGroupDescendantFixtureScript = [
  'const { existsSync, readFileSync, writeFileSync } = require("node:fs");',
  'const path = require("node:path");',
  "const stateRoot = process.env.HABITAT_COMMAND_RUNNER_STATE_ROOT;",
  'process.on("SIGTERM", () => {',
  '  const termPath = path.join(stateRoot, "descendant.term");',
  '  const count = existsSync(termPath) ? Number(readFileSync(termPath, "utf8")) : 0;',
  "  writeFileSync(termPath, String(count + 1));",
  "});",
  'writeFileSync(path.join(stateRoot, "descendant.ready"), "");',
  "setInterval(() => {}, 1_000);",
].join("");

function liveCommandEnv(delta: Readonly<Record<string, string>>): Record<string, string> {
  return {
    ...Object.fromEntries(
      Object.entries(process.env).filter(
        (entry): entry is [string, string] => entry[1] !== undefined
      )
    ),
    ...delta,
  };
}

async function waitForPath(filePath: string): Promise<void> {
  const deadline = Date.now() + 5_000;
  while (!existsSync(filePath)) {
    if (Date.now() >= deadline) throw new Error(`Timed out waiting for ${filePath}.`);
    await sleep(20);
  }
}

function readFixturePid(filePath: string): number {
  const pid = Number.parseInt(readFileSync(filePath, "utf8"), 10);
  if (!Number.isSafeInteger(pid) || pid <= 0) throw new Error(`Invalid fixture pid: ${pid}.`);
  return pid;
}

async function waitForProcessExit(pid: number): Promise<void> {
  const deadline = Date.now() + 1_000;
  while (processIsAlive(pid)) {
    if (Date.now() >= deadline) throw new Error(`Timed out waiting for process ${pid} to exit.`);
    await sleep(20);
  }
}

function processIsAlive(pid: number): boolean {
  return spawnSync("kill", ["-0", String(pid)], { stdio: "ignore" }).status === 0;
}

async function terminateFixtureProcess(pid: number | undefined): Promise<void> {
  if (pid === undefined || !processIsAlive(pid)) return;
  process.kill(pid, "SIGKILL");
  await waitForProcessExit(pid);
}

class FixtureSignalError extends Error {
  readonly code = "EPERM";

  constructor(signal: string | number | undefined) {
    super(`fixture refused process-group ${String(signal)}`);
  }
}

class FixtureProcessNotFoundError extends Error {
  readonly code = "ESRCH";

  constructor(signal: string | number | undefined) {
    super(`fixture process group disappeared during ${String(signal)}`);
  }
}

function refuseOwnedProcessSignals(pid: number, signal: string | number | undefined): true {
  return Match.value({ pid, signal }).pipe(
    Match.when(
      ({ pid: candidatePid, signal: candidateSignal }) => candidatePid < 0 && candidateSignal !== 0,
      ({ signal: refusedSignal }) => {
        throw new FixtureSignalError(refusedSignal);
      }
    ),
    Match.orElse((): true => acceptedProcessSignal)
  );
}
