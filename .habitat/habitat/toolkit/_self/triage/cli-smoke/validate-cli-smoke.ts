// Habitat-owned command adapter. Integration note: this smoke check is still
// invoked through the Habitat package script; it should become an admitted
// command-check or test-check rule before being treated as structural authority.
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "..", "..", "..");

runExpectSuccess(["bun", "run", "habitat", "--", "--help"], "root habitat help");
runExpectSuccess(["bun", "run", "habitat", "--", "check", "--help"], "check help");

const checkResult = run([
  "bun",
  "run",
  "habitat:check",
  "--",
  "--json",
  "--rule",
  "workspace-entrypoints",
]);
if (checkResult.status !== 0 && checkResult.status !== 1) {
  fail("check JSON", checkResult, "expected exit 0 or 1");
}

const parsed = parseJsonObject(checkResult.stdout, "check JSON");
if (parsed.schemaVersion !== 1) {
  fail("check JSON", checkResult, "expected schemaVersion 1");
}

function runExpectSuccess(command: string[], label: string): void {
  const result = run(command);
  if (result.status !== 0) {
    fail(label, result, "expected exit 0");
  }
}

function run(command: string[]): { status: number; stdout: string; stderr: string } {
  const result = Bun.spawnSync(command, {
    cwd: repoRoot,
    env: { ...process.env, FORCE_COLOR: "0" },
    stderr: "pipe",
    stdout: "pipe",
  });

  return {
    status: result.exitCode,
    stdout: result.stdout.toString(),
    stderr: result.stderr.toString(),
  };
}

function parseJsonObject(stdout: string, label: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(stdout);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    // Error detail is rendered by fail.
  }

  fail(label, { status: 0, stdout, stderr: "" }, "expected JSON object stdout");
}

function fail(
  label: string,
  result: { status: number; stdout: string; stderr: string },
  reason: string
): never {
  console.error(`${label}: ${reason}`);
  console.error(`exit: ${result.status}`);
  if (result.stdout.trim()) {
    console.error(result.stdout.trim());
  }
  if (result.stderr.trim()) {
    console.error(result.stderr.trim());
  }
  process.exit(1);
}
