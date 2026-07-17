#!/usr/bin/env bun

type Mode = Readonly<{
  script: string;
  description: string;
  live: boolean;
}>;

const modes = new Map<string, Mode>([
  [
    "studio-run-in-game-live",
    {
      script: "scripts/live/verify-studio-run-in-game-live.ts",
      description: "Probe live Run in Game setup/start behavior.",
      live: true,
    },
  ],
  [
    "final-surface-parity",
    {
      script: "scripts/live/verify-final-surface-parity.ts",
      description: "Compare saved/local final surfaces to live readback.",
      live: true,
    },
  ],
  [
    "output-parity",
    {
      script: "scripts/live/verify-output-parity.ts",
      description:
        "Load a map live and diff its engine output vs the headless recipe surface (Studio-free).",
      live: true,
    },
  ],
  [
    "resource-delta-feasibility",
    {
      script: "scripts/live/verify-resource-delta-feasibility.ts",
      description: "Classify resource deltas through live ResourceBuilder probes.",
      live: true,
    },
  ],
  [
    "feature-delta-feasibility",
    {
      script: "scripts/live/verify-feature-delta-feasibility.ts",
      description: "Classify feature deltas through live FeatureBuilder probes.",
      live: true,
    },
  ],
  [
    "terrain-edge-live-context",
    {
      script: "scripts/live/verify-terrain-edge-live-context.ts",
      description: "Read live terrain-edge context for final-surface deltas.",
      live: true,
    },
  ],
]);

const aliases = new Map<string, string>([["studio-run-in-game:live", "studio-run-in-game-live"]]);

function usage(): string {
  const rows = [...modes.entries()]
    .map(
      ([mode, entry]) =>
        `  ${mode.padEnd(34)} ${entry.live ? "[live] " : "       "}${entry.description}`
    )
    .join("\n");
  return `Usage:
  nx run mod-swooper-maps:verify:operational -- --mode <mode> [flags]
  nx run mod-swooper-maps:verify:operational -- <mode> [flags]

Modes:
${rows}
`;
}

function parseArgs(argv: string[]): { mode: string | undefined; args: string[]; help: boolean } {
  const args = [...argv];
  let mode: string | undefined;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help" || arg === "-h") {
      help = true;
      args.splice(index, 1);
      index -= 1;
      continue;
    }
    if (arg === "--mode") {
      const next = args[index + 1];
      if (!next || next.startsWith("--")) throw new Error("Missing value for --mode");
      mode = next;
      args.splice(index, 2);
      index -= 1;
      continue;
    }
    if (arg.startsWith("--mode=")) {
      mode = arg.slice("--mode=".length);
      args.splice(index, 1);
      index -= 1;
    }
  }

  if (!mode && args[0] && !args[0].startsWith("-")) {
    mode = args.shift();
  }

  return { mode, args, help };
}

async function runScript(script: string, args: string[]): Promise<number> {
  const proc = Bun.spawn([process.execPath, script, ...args], {
    stdin: "inherit",
    stdout: "inherit",
    stderr: "inherit",
  });
  return proc.exited;
}

async function main(): Promise<number> {
  const parsed = parseArgs(process.argv.slice(2));
  if (parsed.help) {
    console.log(usage());
    return 0;
  }

  if (!parsed.mode) {
    console.error(usage());
    return 2;
  }

  const resolvedMode = aliases.get(parsed.mode) ?? parsed.mode;
  const mode = modes.get(resolvedMode);
  if (!mode) {
    console.error(`Unknown verifier mode: ${parsed.mode}\n`);
    console.error(usage());
    return 2;
  }
  return runScript(mode.script, parsed.args);
}

main().then(
  (code) => {
    process.exitCode = code;
  },
  (error) => {
    console.error(error instanceof Error ? (error.stack ?? error.message) : String(error));
    process.exitCode = 1;
  }
);
