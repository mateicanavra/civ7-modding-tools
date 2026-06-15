#!/usr/bin/env bun
/**
 * habitat — the single enforcement entrypoint (H2 scaffold).
 *
 * Commands: graph | classify <path> | check | fix | verify | hook <name>
 * Every rule emits normalized JSON diagnostics; see lib/diagnostics.ts.
 */
import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { repoRoot, toRepoRelative } from "../lib/paths.js";
import { run } from "../lib/spawn.js";
import { rules, executeRule, eslintProjects, type HarnessRule } from "../rules/architecture.js";
import {
  applyBaseline,
  checkBaselineIntegrity,
  loadBaseline,
  mergeBase,
  violationKey,
  writeBaseline,
} from "../lib/baseline.js";
import type { CheckReport, RuleReport } from "../lib/diagnostics.js";
import { validateCheckReport } from "../lib/diagnostics.js";
import { renderReport } from "../rules/messages.js";

const argv = process.argv.slice(2);
const command = argv[0];

function flag(name: string): boolean {
  return argv.includes(name);
}
function opt(name: string): string | undefined {
  const i = argv.indexOf(name);
  return i !== -1 ? argv[i + 1] : undefined;
}

function selectRules(): HarnessRule[] {
  const owner = opt("--owner");
  const only = opt("--rule");
  let selected = rules;
  if (owner) selected = selected.filter((r) => r.ownerProject === owner);
  if (only) selected = selected.filter((r) => r.id === only);
  return selected;
}

function runCheck(): CheckReport {
  const selected = selectRules();
  const reports: RuleReport[] = [];
  for (const rule of selected) {
    const started = Date.now();
    const baseline = loadBaseline(rule.id);
    const { diagnostics } = executeRule(rule);
    applyBaseline(diagnostics, baseline);
    const newViolations = diagnostics.filter((d) => !d.baselined && d.severity === "error");
    const status: RuleReport["status"] =
      rule.lane === "advisory"
        ? diagnostics.length > 0
          ? "advisory-findings"
          : "pass"
        : newViolations.length > 0
          ? "fail"
          : "pass";
    reports.push({
      ruleId: rule.id,
      ownerTool: rule.ownerTool,
      lane: rule.lane,
      status,
      locked: baseline.size === 0 && rule.exceptionPath === "none",
      durationMs: Date.now() - started,
      diagnostics,
      detect: rule.detect,
      message: rule.message,
      remediate: rule.remediate,
    });
  }

  // Ratchet self-check (CI-visible expansion gate) — always runs with check.
  const integrityStarted = Date.now();
  const integrity = checkBaselineIntegrity(opt("--base") ?? "main");
  reports.push({
    ruleId: "baseline-integrity",
    ownerTool: "habitat-native",
    lane: "enforced",
    status: integrity.length > 0 ? "fail" : "pass",
    locked: true,
    durationMs: Date.now() - integrityStarted,
    diagnostics: integrity.map((f) => ({
      ruleId: "baseline-integrity",
      path: f.file,
      message: f.reason,
      severity: "error" as const,
      baselined: false,
    })),
    detect: ["habitat", "check", "(built-in)"],
    message:
      "Baselines are shrink-only; additions are valid only in the change that introduces the rule itself.",
    remediate: null,
  });

  return {
    schemaVersion: 1,
    command: `habitat ${argv.join(" ")}`,
    startedAt: new Date().toISOString(),
    ok: reports.every((r) => r.status !== "fail"),
    rules: reports,
  };
}

function emit(report: CheckReport): never {
  const out = opt("--output");
  const json = JSON.stringify(report, null, 2);
  const schemaErrors = validateCheckReport(report);
  if (schemaErrors.length > 0) {
    console.error(`habitat internal error: report violates its own schema:\n${schemaErrors.join("\n")}`);
    process.exit(2);
  }
  if (out) writeFileSync(path.resolve(repoRoot, out), `${json}\n`);
  if (flag("--json")) console.log(json);
  else console.log(renderReport(report));
  process.exit(report.ok ? 0 : 1);
}

switch (command) {
  case "check": {
    if (flag("--expand-baseline")) {
      // Local authoring gate for rule-introduction slices. CI does NOT trust
      // this flag; the baseline-integrity rule cross-references the rule pack.
      const selected = selectRules();
      for (const rule of selected) {
        const { diagnostics } = executeRule(rule);
        // Diagnostics already covered by a legacy allowlist arrive pre-marked
        // baselined; the ratchet baseline records only the uncovered remainder.
        const keys = diagnostics
          .filter((d) => d.severity === "error" && !d.baselined)
          .map(violationKey);
        if (keys.length > 0) {
          writeBaseline(rule.id, keys);
          console.log(`baseline written: ${rule.id} (${keys.length} entries)`);
        }
      }
      process.exit(0);
    }
    emit(runCheck());
    break;
  }
  case "fix": {
    // Zero fixable rules are registered in H2 (codemods land with the grit catalog, H5).
    console.log("no fixable rules registered");
    process.exit(0);
    break;
  }
  case "verify": {
    const report = runCheck();
    console.log(renderReport(report));
    if (!report.ok) process.exit(1);
    const base = opt("--base") ?? mergeBase("main") ?? "main";
    console.log(`\nhabitat verify: running nx affected (base=${base}) ...`);
    const res = run(
      ["bunx", "nx", "affected", "-t", "build,check,test", "--base", base],
      { cwd: repoRoot },
    );
    process.stdout.write(res.stdout);
    process.stderr.write(res.stderr);
    process.exit(res.exitCode);
    break;
  }
  case "graph": {
    const tmp = path.join(repoRoot, ".nx", "habitat-graph.json");
    const res = run(["bunx", "nx", "graph", "--file", tmp], { cwd: repoRoot });
    if (res.exitCode !== 0) {
      process.stderr.write(res.stderr);
      process.exit(res.exitCode);
    }
    const graph = JSON.parse(readFileSync(tmp, "utf8"));
    console.log(JSON.stringify(graph.graph ?? graph, null, flag("--json") ? 0 : 2));
    process.exit(0);
    break;
  }
  case "classify": {
    // H2 scope: project + tags + owning rules by ownerProject/path. H8 completes this.
    const target = argv[1];
    if (!target) {
      console.error("usage: habitat classify <path>");
      process.exit(2);
    }
    const rel = toRepoRelative(target);
    const roots: Array<{ name: string; root: string; tags: string[] }> = [];
    for (const glob of ["apps", "packages", "packages/plugins", "mods", "tools"]) {
      const dir = path.join(repoRoot, glob);
      if (!existsSync(dir)) continue;
      for (const entry of readdirSync(dir)) {
        const pkgPath = path.join(dir, entry, "package.json");
        if (!existsSync(pkgPath)) continue;
        const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
        roots.push({
          name: pkg.name,
          root: toRepoRelative(path.join(dir, entry)),
          tags: pkg.nx?.tags ?? [],
        });
      }
    }
    const owner = roots
      .filter((r) => rel === r.root || rel.startsWith(`${r.root}/`))
      .sort((a, b) => b.root.length - a.root.length)[0];
    if (!owner) {
      console.log(JSON.stringify({ path: rel, project: null, note: "workspace-level path" }, null, 2));
      process.exit(0);
    }
    const owningRules = rules
      .filter((r) => r.ownerProject === owner.name || r.ownerProject === "@internal/habitat-harness")
      .map((r) => r.id);
    console.log(
      JSON.stringify(
        {
          path: rel,
          project: owner.name,
          projectRoot: owner.root,
          tags: owner.tags,
          rulesInScope: owningRules,
          verifyTargets: [`nx run ${owner.name}:check`, `nx run ${owner.name}:test`, "habitat check"],
        },
        null,
        2,
      ),
    );
    process.exit(0);
    break;
  }
  case "hook": {
    // Hooks are wired in habitat-git-hooks (H7); the surface exists so husky
    // delegators have a stable target.
    console.log(`habitat hook '${argv[1] ?? ""}': not wired yet (lands in habitat-git-hooks/H7)`);
    process.exit(0);
    break;
  }
  default: {
    console.log(
      [
        "habitat — repo enforcement harness",
        "",
        "usage: habitat <command>",
        "  check   [--json] [--output <file>] [--owner <project>] [--rule <id>] [--expand-baseline]",
        "  fix     [--dry-run]",
        "  verify  [--base <ref>]",
        "  graph   [--json]",
        "  classify <path>",
        "  hook    <name>",
        "",
        `rule pack: ${rules.length} rules (+ baseline-integrity built-in); eslint fan-out over ${eslintProjects.length} projects`,
      ].join("\n"),
    );
    process.exit(command ? 2 : 0);
  }
}
