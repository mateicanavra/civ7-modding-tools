import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { HabitatDiagnostic } from "./diagnostics.js";
import { baselinesDir, repoRoot } from "./paths.js";
import { run, type SpawnResult } from "./spawn.js";

/**
 * Ratchet baselines (FRAME hard core #3).
 *
 * One file per rule: tools/habitat-harness/baselines/<rule-id>.json — a sorted
 * JSON array of stable violation keys. Missing files are contract failures
 * unless the rule is explicitly modeled as an external exception source.
 *
 * Shrink-only: `habitat check` never writes baselines unless invoked with the
 * explicit `--expand-baseline` gate (local authoring for rule-introduction
 * slices). CI enforcement does not trust that flag: the self-check rejects any
 * entry added relative to the merge-base unless the entry's ruleId is itself
 * NEW at the merge-base (cross-referenced against the rule pack diff).
 */

const adapterBoundaryAllowlistMessage =
  "/base-standard/ reference allowlisted in scripts/lint/lint-adapter-boundary.sh (tracked debt)";

export type BaselineContractFailureReason =
  | "missing-baseline"
  | "malformed-baseline"
  | "unsorted-baseline"
  | "duplicate-baseline-key"
  | "non-string-baseline-key"
  | "orphan-baseline"
  | "unmodeled-external-exception"
  | "conflicting-baseline-state"
  | "baseline-growth-existing-rule"
  | "comparison-base-unavailable"
  | "base-rule-registry-missing"
  | "base-rule-registry-malformed"
  | "base-baseline-unreadable"
  | "external-exception-source-unreadable"
  | "external-exception-source-malformed"
  | "external-exception-projection-mismatch"
  | "parser-owned-baseline-without-contract"
  | "rule-introduction-manifest-missing"
  | "rule-introduction-manifest-mismatch";

export interface BaselineContractFailure {
  kind: "contract-failure";
  ruleId?: string;
  path?: string;
  reason: BaselineContractFailureReason;
  message: string;
}

export interface ExplicitEmptyBaselineState {
  kind: "explicit-empty";
  ruleId: string;
  path: string;
  locked: true;
  keys: [];
}

export interface ExplicitDebtBaselineState {
  kind: "explicit-debt";
  ruleId: string;
  path: string;
  locked: false;
  keys: string[];
}

export interface ExternalExceptionBaselineState {
  kind: "external-exception-source";
  ruleId: string;
  sourcePath: string;
  owner: string;
  migrationOwner: string;
  projectedKeys: string[];
  locked: false;
}

export type BaselineState =
  | ExplicitEmptyBaselineState
  | ExplicitDebtBaselineState
  | ExternalExceptionBaselineState
  | BaselineContractFailure;

export interface BaselineRuleContractInput {
  id: string;
  exceptionPath?: string;
}

export interface RuleIntroductionBaselineManifest {
  changeId: string;
  ruleId: string;
  ownerProject: string;
  ownerTool: string;
  baselinePath: string;
  initialBaselineKeys: string[];
  comparisonBase: string;
}

export interface BaselineContractContext {
  repoRoot?: string;
  baselinesDir?: string;
  registry?: readonly BaselineRuleContractInput[];
  runCommand?: (argv: string[], options?: { cwd?: string }) => SpawnResult;
  externalSources?: Record<string, ExternalExceptionSourceModel>;
  ruleIntroductionManifests?: readonly RuleIntroductionBaselineManifest[];
}

export interface ExternalExceptionSourceModel {
  sourcePath: string;
  owner: string;
  migrationOwner: string;
  projectedKeys?: string[];
  projectKeys?: (context: RequiredBaselineContext) => string[] | BaselineContractFailure;
  validate?: (context: RequiredBaselineContext, model: ExternalExceptionSourceModel) => BaselineContractFailure | null;
}

interface RequiredBaselineContext {
  repoRoot: string;
  baselinesDir: string;
  registry: readonly BaselineRuleContractInput[];
  runCommand: (argv: string[], options?: { cwd?: string }) => SpawnResult;
  externalSources: Record<string, ExternalExceptionSourceModel>;
  ruleIntroductionManifests: readonly RuleIntroductionBaselineManifest[];
}

export interface BaselineContractValidation {
  states: Map<string, BaselineState>;
  failures: BaselineContractFailure[];
}

export function baselinePath(ruleId: string): string {
  return path.join(baselinesDir, `${ruleId}.json`);
}

export function loadBaseline(ruleId: string): Set<string> {
  const state = loadBaselineState({ id: ruleId, exceptionPath: "none" });
  if (state.kind === "contract-failure") {
    throw new Error(state.message);
  }
  if (state.kind === "external-exception-source") return new Set(state.projectedKeys);
  return new Set(state.keys);
}

/** Stable key for a violation. Coarse wrapped rules key on path+message. */
export function violationKey(d: HabitatDiagnostic): string {
  return `${d.path}::${d.message}`;
}

export function applyBaseline(
  diags: HabitatDiagnostic[],
  baseline: Set<string> | BaselineState
): BaselineContractFailure[] {
  if (baseline instanceof Set) {
    for (const d of diags) {
      if (baseline.has(violationKey(d))) d.baselined = true;
    }
    return [];
  }

  if (baseline.kind === "contract-failure") return [baseline];

  const preBaselinedKeys = diags
    .filter((diagnostic) => diagnostic.baselined)
    .map(violationKey)
    .sort();

  if (baseline.kind === "external-exception-source") {
    const expected = [...baseline.projectedKeys].sort();
    if (!sameStringList(preBaselinedKeys, expected)) {
      return [
        {
          kind: "contract-failure",
          ruleId: baseline.ruleId,
          path: baseline.sourcePath,
          reason: "external-exception-projection-mismatch",
          message:
            `External exception source for '${baseline.ruleId}' projected ${expected.length} ` +
            `baseline key${expected.length === 1 ? "" : "s"}, but the rule reported ` +
            `${preBaselinedKeys.length} pre-baselined diagnostic${preBaselinedKeys.length === 1 ? "" : "s"}.`,
        },
      ];
    }
    return [];
  }

  if (preBaselinedKeys.length > 0) {
    return [
      {
        kind: "contract-failure",
        ruleId: baseline.ruleId,
        path: baseline.path,
        reason: "parser-owned-baseline-without-contract",
        message:
          `Rule '${baseline.ruleId}' reported parser-owned baselined diagnostics while using ` +
          "explicit Habitat baseline state; parser output must not bypass the baseline contract.",
      },
    ];
  }

  const keys = new Set(baseline.keys);
  for (const d of diags) {
    if (keys.has(violationKey(d))) d.baselined = true;
  }
  return [];
}

export function writeBaseline(ruleId: string, keys: string[]): void {
  mkdirSync(baselinesDir, { recursive: true });
  writeFileSync(baselinePath(ruleId), `${JSON.stringify([...keys].sort(), null, 2)}\n`);
}

export interface BaselineIntegrityFinding {
  file: string;
  ruleId: string;
  addedKeys: string[];
  reason: string;
}

export interface BaselineExpansionGuardResult {
  ok: boolean;
  message: string;
  reason?: BaselineContractFailureReason;
}

function gitShow(ref: string, repoRelPath: string, context = resolveBaselineContext()): string | null {
  const res = context.runCommand(["git", "show", `${ref}:${repoRelPath}`], { cwd: context.repoRoot });
  return res.exitCode === 0 ? res.stdout : null;
}

export function mergeBase(base = "main", context = resolveBaselineContext()): string | null {
  // The ref as given wins (so --base HEAD means HEAD); origin/<base> is the
  // fallback for CI checkouts where the local branch does not exist.
  for (const ref of [base, `origin/${base}`]) {
    const res = context.runCommand(["git", "merge-base", "HEAD", ref], { cwd: context.repoRoot });
    if (res.exitCode === 0) return res.stdout.trim();
  }
  return null;
}

/**
 * The CI-visible expansion gate: compare every baseline file against the
 * merge-base. Added entries are rejected unless the ruleId does not exist in
 * the merge-base rule pack (i.e. this change introduces the rule).
 */
export function checkBaselineIntegrity(
  base = "main",
  options: BaselineContractContext = {}
): BaselineIntegrityFinding[] {
  const context = resolveBaselineContext(options);
  const findings: BaselineIntegrityFinding[] = [];
  const contract = validateBaselineContract(options);
  for (const failure of contract.failures) findings.push(findingFromFailure(failure));

  const mb = mergeBase(base, context);
  if (!mb) {
    findings.push(
      findingFromFailure({
        kind: "contract-failure",
        path: ".",
        reason: "comparison-base-unavailable",
        message: `Unable to resolve a trusted comparison base for '${base}'.`,
      })
    );
    return findings;
  }

  const rulePackAtBase = gitShow(mb, "tools/habitat-harness/src/rules/rules.json", context);
  if (rulePackAtBase === null) {
    findings.push(
      findingFromFailure({
        kind: "contract-failure",
        path: "tools/habitat-harness/src/rules/rules.json",
        reason: "base-rule-registry-missing",
        message: `Unable to read base rule registry at ${mb.slice(0, 9)}.`,
      })
    );
    return findings;
  }

  const baseRules = parseRuleRegistry(rulePackAtBase, "tools/habitat-harness/src/rules/rules.json");
  if (baseRules.kind === "contract-failure") {
    findings.push(baseRegistryFinding(baseRules, mb));
    return findings;
  }

  for (const [ruleId, state] of contract.states) {
    if (state.kind !== "explicit-empty" && state.kind !== "explicit-debt") continue;
    const file = `${ruleId}.json`;
    const beforeRaw = gitShow(mb, `tools/habitat-harness/baselines/${file}`, context);
    const beforeParsed =
      beforeRaw === null
        ? { ok: true as const, keys: [] }
        : parseBaselineArrayText(beforeRaw, `tools/habitat-harness/baselines/${file}`, ruleId);
    if (!beforeParsed.ok) {
      findings.push(
        findingFromFailure({
          ...beforeParsed.failure,
          reason: "base-baseline-unreadable",
          message: `Unable to read base baseline for '${ruleId}' at ${mb.slice(0, 9)}: ${beforeParsed.failure.message}`,
        })
      );
      continue;
    }
    const before = new Set<string>(beforeParsed.keys);
    const added = state.keys.filter((key) => !before.has(key));
    if (added.length === 0) continue;
    const ruleIsNew = !baseRules.ruleIds.has(ruleId);
    if (!ruleIsNew) {
      findings.push({
        file: `tools/habitat-harness/baselines/${file}`,
        ruleId,
        addedKeys: added,
        reason:
          `baseline for existing rule '${ruleId}' grew by ${added.length} entr${added.length === 1 ? "y" : "ies"} ` +
          `relative to merge-base ${mb.slice(0, 9)} — baselines are shrink-only outside rule-introduction changes`,
      });
      continue;
    }

    const manifest = acceptedRuleIntroductionManifest(ruleId, added, base, context);
    if (!manifest.ok) {
      findings.push({
        file: `tools/habitat-harness/baselines/${file}`,
        ruleId,
        addedKeys: added,
        reason: manifest.message,
      });
    }
  }
  return findings;
}

export function loadBaselineState(
  rule: BaselineRuleContractInput,
  options: BaselineContractContext = {}
): BaselineState {
  const context = resolveBaselineContext(options);
  const p = baselinePathForRule(rule.id, context);
  if (existsSync(p)) return parseBaselineFile(p, rule.id, context);

  const external = context.externalSources[rule.id];
  if (external) return loadExternalExceptionState(rule.id, external, context);

  if (rule.exceptionPath && rule.exceptionPath !== "none") {
    return {
      kind: "contract-failure",
      ruleId: rule.id,
      path: rule.exceptionPath,
      reason: "unmodeled-external-exception",
      message: `Rule '${rule.id}' declares external exception source '${rule.exceptionPath}' but no modeled baseline contract exists.`,
    };
  }

  return {
    kind: "contract-failure",
    ruleId: rule.id,
    path: baselinePathForRule(rule.id, context),
    reason: "missing-baseline",
    message: `Registered rule '${rule.id}' has no explicit baseline file and no modeled external exception source.`,
  };
}

export function isBaselineLocked(state: BaselineState): boolean {
  return state.kind === "explicit-empty";
}

export function baselineFailureDiagnostic(
  ruleId: string,
  failure: BaselineContractFailure
): HabitatDiagnostic {
  return {
    ruleId,
    path: failure.path ?? ".",
    message: `Baseline contract failure (${failure.reason}): ${failure.message}`,
    severity: "error",
    baselined: false,
  };
}

export function validateBaselineContract(
  options: BaselineContractContext = {}
): BaselineContractValidation {
  const context = resolveBaselineContext(options);
  const states = new Map<string, BaselineState>();
  const failures: BaselineContractFailure[] = [];
  const registered = new Set(context.registry.map((rule) => rule.id));

  if (existsSync(context.baselinesDir)) {
    for (const file of readdirSync(context.baselinesDir)) {
      if (!file.endsWith(".json")) continue;
      const ruleId = file.replace(/\.json$/, "");
      if (!registered.has(ruleId)) {
        failures.push({
          kind: "contract-failure",
          ruleId,
          path: path.join(context.baselinesDir, file),
          reason: "orphan-baseline",
          message: `Baseline file '${file}' has no registered Habitat rule.`,
        });
      }
    }
  }

  for (const rule of context.registry) {
    const state = loadBaselineState(rule, context);
    states.set(rule.id, state);
    if (state.kind === "contract-failure") failures.push(state);
  }

  return { states, failures };
}

export function guardBaselineExpansion(
  ruleId: string,
  keys: readonly string[],
  base = "main",
  options: BaselineContractContext = {}
): BaselineExpansionGuardResult {
  const context = resolveBaselineContext(options);
  const uniqueKeys = [...new Set(keys)].sort();
  const mb = mergeBase(base, context);
  if (!mb) {
    return {
      ok: false,
      reason: "comparison-base-unavailable",
      message: `Refusing baseline write for '${ruleId}': unable to resolve comparison base '${base}'.`,
    };
  }
  const rulePackAtBase = gitShow(mb, "tools/habitat-harness/src/rules/rules.json", context);
  if (rulePackAtBase === null) {
    return {
      ok: false,
      reason: "base-rule-registry-missing",
      message: `Refusing baseline write for '${ruleId}': unable to read base rule registry at ${mb.slice(0, 9)}.`,
    };
  }
  const baseRules = parseRuleRegistry(rulePackAtBase, "tools/habitat-harness/src/rules/rules.json");
  if (baseRules.kind === "contract-failure") {
    return {
      ok: false,
      reason: "base-rule-registry-malformed",
      message: `Refusing baseline write for '${ruleId}': ${baseRules.message}`,
    };
  }
  if (baseRules.ruleIds.has(ruleId)) {
    return {
      ok: false,
      reason: "baseline-growth-existing-rule",
      message:
        `Refusing baseline write for existing rule '${ruleId}': ${uniqueKeys.length} new ` +
        `baseline key${uniqueKeys.length === 1 ? "" : "s"} would grow tracked debt relative to ${mb.slice(0, 9)}.`,
    };
  }

  const manifest = acceptedRuleIntroductionManifest(ruleId, uniqueKeys, base, context);
  if (!manifest.ok) return { ok: false, reason: manifest.reason, message: manifest.message };
  return { ok: true, message: `baseline write accepted for introduced rule '${ruleId}'` };
}

function resolveBaselineContext(options: BaselineContractContext = {}): RequiredBaselineContext {
  return {
    repoRoot: options.repoRoot ?? repoRoot,
    baselinesDir: options.baselinesDir ?? baselinesDir,
    registry: options.registry ?? readCurrentRuleRegistry(options.repoRoot ?? repoRoot),
    runCommand:
      options.runCommand ??
      ((argv, runOptions) => run(argv, { cwd: runOptions?.cwd ?? options.repoRoot ?? repoRoot })),
    externalSources: options.externalSources ?? defaultExternalExceptionSources(),
    ruleIntroductionManifests: options.ruleIntroductionManifests ?? [],
  };
}

function defaultExternalExceptionSources(): Record<string, ExternalExceptionSourceModel> {
  return {
    "adapter-boundary": {
      sourcePath: "scripts/lint/lint-adapter-boundary.sh#ALLOWLIST",
      owner: "scripts/lint/lint-adapter-boundary.sh",
      migrationOwner: "habitat-scaffold-contract-repair",
      projectKeys: adapterBoundaryProjectedKeys,
      validate: validateReadableTextSource,
    },
    "doc-ambiguity": {
      sourcePath: "docs/.doc-ambiguity-lint-baseline.json",
      owner: "tools/habitat-harness/src/rules/native/doc-ambiguity.mjs",
      migrationOwner: "doc-ambiguity native rule",
      projectedKeys: [],
      validate: validateDocAmbiguityBaseline,
    },
  };
}

function baselinePathForRule(ruleId: string, context: RequiredBaselineContext): string {
  return path.join(context.baselinesDir, `${ruleId}.json`);
}

function parseBaselineFile(
  filePath: string,
  ruleId: string,
  context: RequiredBaselineContext
): BaselineState {
  let text: string;
  try {
    text = readFileSync(filePath, "utf8");
  } catch (error) {
    return {
      kind: "contract-failure",
      ruleId,
      path: toContextRelative(filePath, context),
      reason: "malformed-baseline",
      message: `Unable to read baseline file for '${ruleId}': ${errorMessage(error)}.`,
    };
  }
  const parsed = parseBaselineArrayText(text, toContextRelative(filePath, context), ruleId);
  if (!parsed.ok) return parsed.failure;
  return parsed.keys.length === 0
    ? {
        kind: "explicit-empty",
        ruleId,
        path: toContextRelative(filePath, context),
        locked: true,
        keys: [],
      }
    : {
        kind: "explicit-debt",
        ruleId,
        path: toContextRelative(filePath, context),
        locked: false,
        keys: parsed.keys,
      };
}

function parseBaselineArrayText(
  text: string,
  filePath: string,
  ruleId: string
): { ok: true; keys: string[] } | { ok: false; failure: BaselineContractFailure } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return {
      ok: false,
      failure: {
        kind: "contract-failure",
        ruleId,
        path: filePath,
        reason: "malformed-baseline",
        message: `Baseline '${filePath}' is not valid JSON: ${errorMessage(error)}.`,
      },
    };
  }
  if (!Array.isArray(parsed)) {
    return {
      ok: false,
      failure: {
        kind: "contract-failure",
        ruleId,
        path: filePath,
        reason: "malformed-baseline",
        message: `Baseline '${filePath}' is not a JSON array.`,
      },
    };
  }
  const nonStringIndex = parsed.findIndex((entry) => typeof entry !== "string");
  if (nonStringIndex >= 0) {
    return {
      ok: false,
      failure: {
        kind: "contract-failure",
        ruleId,
        path: filePath,
        reason: "non-string-baseline-key",
        message: `Baseline '${filePath}' contains a non-string entry at index ${nonStringIndex}.`,
      },
    };
  }
  const keys = parsed as string[];
  const seen = new Set<string>();
  const duplicate = keys.find((entry) => {
    if (seen.has(entry)) return true;
    seen.add(entry);
    return false;
  });
  if (duplicate) {
    return {
      ok: false,
      failure: {
        kind: "contract-failure",
        ruleId,
        path: filePath,
        reason: "duplicate-baseline-key",
        message: `Baseline '${filePath}' contains duplicate key '${duplicate}'.`,
      },
    };
  }
  const sorted = [...keys].sort();
  if (!sameStringList(keys, sorted)) {
    return {
      ok: false,
      failure: {
        kind: "contract-failure",
        ruleId,
        path: filePath,
        reason: "unsorted-baseline",
        message: `Baseline '${filePath}' entries must be sorted lexicographically.`,
      },
    };
  }
  return { ok: true, keys };
}

function loadExternalExceptionState(
  ruleId: string,
  model: ExternalExceptionSourceModel,
  context: RequiredBaselineContext
): BaselineState {
  const validation = model.validate?.(context, model);
  if (validation) return { ...validation, ruleId };
  const projected = model.projectKeys?.(context) ?? model.projectedKeys ?? [];
  if (!Array.isArray(projected)) return projected;
  const sortedProjected = [...projected].sort();
  if (!sameStringList(projected, sortedProjected)) {
    return {
      kind: "contract-failure",
      ruleId,
      path: model.sourcePath,
      reason: "external-exception-source-malformed",
      message: `External exception source for '${ruleId}' produced unsorted projected keys.`,
    };
  }
  return {
    kind: "external-exception-source",
    ruleId,
    sourcePath: model.sourcePath,
    owner: model.owner,
    migrationOwner: model.migrationOwner,
    projectedKeys: sortedProjected,
    locked: false,
  };
}

function validateReadableTextSource(
  context: RequiredBaselineContext,
  model: ExternalExceptionSourceModel
): BaselineContractFailure | null {
  const sourcePath = externalSourceFilePath(model.sourcePath);
  const absolutePath = path.join(context.repoRoot, sourcePath);
  if (!existsSync(absolutePath)) {
    return {
      kind: "contract-failure",
      path: model.sourcePath,
      reason: "external-exception-source-unreadable",
      message: `External exception source '${model.sourcePath}' does not exist.`,
    };
  }
  return null;
}

function validateDocAmbiguityBaseline(
  context: RequiredBaselineContext,
  model: ExternalExceptionSourceModel
): BaselineContractFailure | null {
  const sourcePath = externalSourceFilePath(model.sourcePath);
  const absolutePath = path.join(context.repoRoot, sourcePath);
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(absolutePath, "utf8"));
  } catch (error) {
    return {
      kind: "contract-failure",
      path: model.sourcePath,
      reason: "external-exception-source-malformed",
      message: `External exception source '${model.sourcePath}' is not readable JSON: ${errorMessage(error)}.`,
    };
  }
  const value = parsed as { schemaVersion?: unknown; items?: unknown };
  if (!parsed || typeof parsed !== "object" || value.schemaVersion !== 1 || !Array.isArray(value.items)) {
    return {
      kind: "contract-failure",
      path: model.sourcePath,
      reason: "external-exception-source-malformed",
      message: `External exception source '${model.sourcePath}' must have schemaVersion 1 and an items array.`,
    };
  }
  return null;
}

function adapterBoundaryProjectedKeys(context: RequiredBaselineContext): string[] | BaselineContractFailure {
  const scriptPath = path.join(context.repoRoot, "scripts/lint/lint-adapter-boundary.sh");
  let text: string;
  try {
    text = readFileSync(scriptPath, "utf8");
  } catch (error) {
    return {
      kind: "contract-failure",
      ruleId: "adapter-boundary",
      path: "scripts/lint/lint-adapter-boundary.sh#ALLOWLIST",
      reason: "external-exception-source-unreadable",
      message: `Unable to read adapter-boundary allowlist: ${errorMessage(error)}.`,
    };
  }
  const allowlistMatch = text.match(/ALLOWLIST=\(\n(?<body>[\s\S]*?)\n\)/);
  const body = allowlistMatch?.groups?.body;
  if (!body) {
    return {
      kind: "contract-failure",
      ruleId: "adapter-boundary",
      path: "scripts/lint/lint-adapter-boundary.sh#ALLOWLIST",
      reason: "external-exception-source-malformed",
      message: "Unable to parse adapter-boundary ALLOWLIST entries.",
    };
  }
  const files = [...body.matchAll(/^\s*"([^"]+)"\s*$/gm)].map((match) => match[1]);
  if (files.length === 0) {
    return {
      kind: "contract-failure",
      ruleId: "adapter-boundary",
      path: "scripts/lint/lint-adapter-boundary.sh#ALLOWLIST",
      reason: "external-exception-source-malformed",
      message: "Adapter-boundary ALLOWLIST contains no projected entries.",
    };
  }
  return files.map((file) => `${file}::${adapterBoundaryAllowlistMessage}`).sort();
}

function readCurrentRuleRegistry(root: string): BaselineRuleContractInput[] {
  const p = path.join(root, "tools/habitat-harness/src/rules/rules.json");
  const parsed = parseRuleRegistry(readFileSync(p, "utf8"), "tools/habitat-harness/src/rules/rules.json");
  if (parsed.kind === "contract-failure") throw new Error(parsed.message);
  return parsed.rules;
}

function parseRuleRegistry(
  text: string,
  filePath: string
):
  | { kind: "ok"; rules: BaselineRuleContractInput[]; ruleIds: Set<string> }
  | BaselineContractFailure {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return {
      kind: "contract-failure",
      path: filePath,
      reason: "base-rule-registry-malformed",
      message: `Rule registry '${filePath}' is not valid JSON: ${errorMessage(error)}.`,
    };
  }
  const value = parsed as { rules?: unknown };
  if (!parsed || typeof parsed !== "object" || !Array.isArray(value.rules)) {
    return {
      kind: "contract-failure",
      path: filePath,
      reason: "base-rule-registry-malformed",
      message: `Rule registry '${filePath}' must contain a rules array.`,
    };
  }
  const rules = value.rules.map((entry) => entry as Partial<BaselineRuleContractInput>);
  if (rules.some((entry) => typeof entry.id !== "string")) {
    return {
      kind: "contract-failure",
      path: filePath,
      reason: "base-rule-registry-malformed",
      message: `Rule registry '${filePath}' contains a rule without a string id.`,
    };
  }
  const normalized = rules.map((entry) => ({
    id: entry.id as string,
    exceptionPath: typeof entry.exceptionPath === "string" ? entry.exceptionPath : "none",
  }));
  return {
    kind: "ok",
    rules: normalized,
    ruleIds: new Set(normalized.map((rule) => rule.id)),
  };
}

function acceptedRuleIntroductionManifest(
  ruleId: string,
  keys: readonly string[],
  base: string,
  context: RequiredBaselineContext
): { ok: true } | { ok: false; reason: BaselineContractFailureReason; message: string } {
  const manifest = context.ruleIntroductionManifests.find((candidate) => candidate.ruleId === ruleId);
  if (!manifest) {
    return {
      ok: false,
      reason: "rule-introduction-manifest-missing",
      message:
        `baseline for introduced rule '${ruleId}' has seeded keys but no accepted rule-introduction ` +
        "baseline manifest; refusing baseline growth",
    };
  }
  const manifestKeys = [...manifest.initialBaselineKeys].sort();
  const sortedKeys = [...keys].sort();
  if (
    manifest.comparisonBase !== base ||
    manifest.baselinePath !== `tools/habitat-harness/baselines/${ruleId}.json` ||
    !sameStringList(manifestKeys, sortedKeys)
  ) {
    return {
      ok: false,
      reason: "rule-introduction-manifest-mismatch",
      message: `rule-introduction baseline manifest for '${ruleId}' does not match the requested write`,
    };
  }
  return { ok: true };
}

function baseRegistryFinding(failure: BaselineContractFailure, mb: string): BaselineIntegrityFinding {
  return findingFromFailure({
    ...failure,
    reason: "base-rule-registry-malformed",
    message: `Unable to parse base rule registry at ${mb.slice(0, 9)}: ${failure.message}`,
  });
}

function findingFromFailure(failure: BaselineContractFailure): BaselineIntegrityFinding {
  return {
    file: failure.path ?? ".",
    ruleId: failure.ruleId ?? "baseline-integrity",
    addedKeys: [],
    reason: `baseline contract failure (${failure.reason}): ${failure.message}`,
  };
}

function externalSourceFilePath(sourcePath: string): string {
  return sourcePath.split("#")[0] ?? sourcePath;
}

function sameStringList(a: readonly string[], b: readonly string[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

function toContextRelative(filePath: string, context: RequiredBaselineContext): string {
  return path.relative(context.repoRoot, path.resolve(filePath)).split(path.sep).join("/");
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
