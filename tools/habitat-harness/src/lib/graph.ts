import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { repoRoot } from "./paths.js";
import { run, type SpawnResult } from "./spawn.js";

/**
 * Command adapter for `habitat graph`: delegates to Nx graph export and returns
 * the serialized graph without making Workspace Graph classification claims.
 */
export function runGraph(options: { json?: boolean } = {}): SpawnResult {
  const dir = mkdtempSync(path.join(tmpdir(), "habitat-graph-"));
  const graphPath = path.join(dir, "graph.json");
  try {
    const graphResult = run(["nx", "graph", "--file", graphPath], {
      cwd: repoRoot,
    });
    if (graphResult.exitCode !== 0) return graphResult;
    const graph = JSON.parse(readFileSync(graphPath, "utf8"));
    return {
      exitCode: 0,
      stdout: `${JSON.stringify(graph.graph ?? graph, null, options.json ? 0 : 2)}\n`,
      stderr: "",
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
