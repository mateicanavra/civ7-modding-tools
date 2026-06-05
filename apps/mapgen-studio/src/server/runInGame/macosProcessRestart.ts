export type CommandOutput = {
  command: string;
  stdout: string;
  stderr: string;
};

export type ExecFileAsync = (
  file: string,
  args: string[],
  options: { timeout: number; maxBuffer: number },
) => Promise<{ stdout: string; stderr: string }>;

export type WaitForMacProcessExitResult = {
  exited: boolean;
  elapsedMs: number;
  polls: number;
  stableAbsentPolls: number;
};

export type Civ7MacProcessShutdownResult = {
  quit: CommandOutput;
  gracefulExit: WaitForMacProcessExitResult;
  kill?: CommandOutput;
  forcedExit?: WaitForMacProcessExitResult;
  forceKill?: CommandOutput;
  forceKilledExit?: WaitForMacProcessExitResult;
};

export type Civ7MacProcessShutdownOptions = {
  execFileAsync: ExecFileAsync;
  sleep: (ms: number) => Promise<void>;
  tail: (value: string) => string;
  now?: () => number;
  processPattern: string;
  gracefulQuitTimeoutMs: number;
  forceQuitTimeoutMs: number;
  forceKillTimeoutMs: number;
  pollIntervalMs: number;
  stableAbsentPolls: number;
};

function commandOutput(command: string, stdout: string, stderr: string, tail: (value: string) => string): CommandOutput {
  return { command, stdout: tail(stdout), stderr: tail(stderr) };
}

function errorExitCode(err: unknown): string | number | undefined {
  if (err && typeof err === "object" && "code" in err) {
    return (err as { code?: string | number }).code;
  }
  return undefined;
}

function errorOutput(err: unknown): { stdout: string; stderr: string } {
  if (err && typeof err === "object" && ("stdout" in err || "stderr" in err)) {
    return {
      stdout: String((err as { stdout?: unknown }).stdout ?? ""),
      stderr: String((err as { stderr?: unknown }).stderr ?? ""),
    };
  }
  return { stdout: "", stderr: "" };
}

export async function isMacProcessRunning(
  execFileAsync: ExecFileAsync,
  processPattern: string,
): Promise<boolean> {
  try {
    const { stdout } = await execFileAsync("pgrep", ["-f", processPattern], {
      timeout: 5_000,
      maxBuffer: 1024 * 1024,
    });
    return stdout.trim().length > 0;
  } catch (err) {
    const code = errorExitCode(err);
    if (code === 1 || code === "1") return false;
    throw err;
  }
}

export async function waitForMacProcessExit(options: {
  execFileAsync: ExecFileAsync;
  sleep: (ms: number) => Promise<void>;
  now?: () => number;
  processPattern: string;
  timeoutMs: number;
  pollIntervalMs: number;
  stableAbsentPolls: number;
}): Promise<WaitForMacProcessExitResult> {
  const now = options.now ?? Date.now;
  const startedAt = now();
  let polls = 0;
  let stableAbsentPolls = 0;

  while (now() - startedAt <= options.timeoutMs) {
    polls += 1;
    const running = await isMacProcessRunning(options.execFileAsync, options.processPattern);
    stableAbsentPolls = running ? 0 : stableAbsentPolls + 1;
    if (stableAbsentPolls >= options.stableAbsentPolls) {
      return {
        exited: true,
        elapsedMs: now() - startedAt,
        polls,
        stableAbsentPolls,
      };
    }
    await options.sleep(options.pollIntervalMs);
  }

  return {
    exited: false,
    elapsedMs: now() - startedAt,
    polls,
    stableAbsentPolls,
  };
}

async function runPossiblyEmptyPkill(
  options: Civ7MacProcessShutdownOptions,
  args: string[],
): Promise<{ stdout: string; stderr: string }> {
  try {
    return await options.execFileAsync("pkill", args, {
      timeout: 10_000,
      maxBuffer: 1024 * 1024,
    });
  } catch (err) {
    const code = errorExitCode(err);
    if (code === 1 || code === "1") return errorOutput(err);
    throw err;
  }
}

export async function shutdownCiv7MacProcess(
  options: Civ7MacProcessShutdownOptions,
): Promise<Civ7MacProcessShutdownResult> {
  const quitCommand = "osascript -e 'tell application id \"com.2k.civ7\" to quit'";
  const quitResult = await options.execFileAsync("osascript", ["-e", 'tell application id "com.2k.civ7" to quit'], {
    timeout: 10_000,
    maxBuffer: 1024 * 1024,
  }).catch((err: unknown) => errorOutput(err));

  const gracefulExit = await waitForMacProcessExit({
    execFileAsync: options.execFileAsync,
    sleep: options.sleep,
    now: options.now,
    processPattern: options.processPattern,
    timeoutMs: options.gracefulQuitTimeoutMs,
    pollIntervalMs: options.pollIntervalMs,
    stableAbsentPolls: options.stableAbsentPolls,
  });

  const result: Civ7MacProcessShutdownResult = {
    quit: commandOutput(quitCommand, quitResult.stdout, quitResult.stderr, options.tail),
    gracefulExit,
  };
  if (gracefulExit.exited) return result;

  const killCommand = `pkill -f ${options.processPattern}`;
  const killResult = await runPossiblyEmptyPkill(options, ["-f", options.processPattern]);
  result.kill = commandOutput(killCommand, killResult.stdout, killResult.stderr, options.tail);
  result.forcedExit = await waitForMacProcessExit({
    execFileAsync: options.execFileAsync,
    sleep: options.sleep,
    now: options.now,
    processPattern: options.processPattern,
    timeoutMs: options.forceQuitTimeoutMs,
    pollIntervalMs: options.pollIntervalMs,
    stableAbsentPolls: options.stableAbsentPolls,
  });
  if (result.forcedExit.exited) return result;

  const forceKillCommand = `pkill -9 -f ${options.processPattern}`;
  const forceKillResult = await runPossiblyEmptyPkill(options, ["-9", "-f", options.processPattern]);
  result.forceKill = commandOutput(forceKillCommand, forceKillResult.stdout, forceKillResult.stderr, options.tail);
  result.forceKilledExit = await waitForMacProcessExit({
    execFileAsync: options.execFileAsync,
    sleep: options.sleep,
    now: options.now,
    processPattern: options.processPattern,
    timeoutMs: options.forceKillTimeoutMs,
    pollIntervalMs: options.pollIntervalMs,
    stableAbsentPolls: options.stableAbsentPolls,
  });

  if (!result.forceKilledExit.exited) {
    throw new Error(`Civ7 process did not exit after quit, pkill, and pkill -9 for pattern: ${options.processPattern}`);
  }

  return result;
}
