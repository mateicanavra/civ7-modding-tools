import { createRequire } from "node:module";
import path from "node:path";
import type {
  HabitatDirectoryEntry,
  HabitatFileSystemReadPort,
} from "@habitat/cli/resources/platform/index";
import type { HabitatDiagnostic } from "@habitat/cli/service/model/check/index";
import type { RuleRunResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type { RuleStructureFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Match } from "effect";
import { parse as parseToml } from "smol-toml";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

const require = createRequire(import.meta.url);
const picomatch = require("picomatch") as (
  glob: string,
  options?: { readonly contains?: boolean; readonly dot?: boolean }
) => (candidate: string) => boolean;

const StructureCheckScopeSchema = Type.Object(
  {
    name: Type.String({ minLength: 1 }),
    root: Type.String({ minLength: 1 }),
    kind: Type.Union([Type.Literal("directory"), Type.Literal("file")]),
    mode: Type.Union([Type.Literal("open"), Type.Literal("closed")]),
    allowEmpty: Type.Optional(Type.Boolean()),
    required: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
    allowed: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
    forbidden: Type.Optional(Type.Array(Type.String({ minLength: 1 }))),
  },
  { additionalProperties: false }
);

const StructureCheckSpecSchema = Type.Object(
  {
    schemaVersion: Type.Literal(1),
    scopes: Type.Array(StructureCheckScopeSchema, { minItems: 1 }),
  },
  { additionalProperties: false }
);

export type StructureCheckScope = Static<typeof StructureCheckScopeSchema>;
export type StructureCheckSpec = Static<typeof StructureCheckSpecSchema>;
export type StructureCheckFileSystem<R = never> = HabitatFileSystemReadPort<R>;

interface StructureCheckOptions<R> {
  readonly repoRoot: string;
  readonly fileSystem: StructureCheckFileSystem<R>;
  readonly visibleFiles: readonly string[] | null;
}

export type StructureCheckDiagnosticKind =
  | "structure-file-invalid"
  | "visible-path-inventory-unavailable"
  | "root-missing"
  | "wrong-root-kind"
  | "missing-required-child"
  | "forbidden-child"
  | "unexpected-child";

interface MatchedRoot {
  readonly repoPath: string;
  readonly kind: "directory" | "file" | "other" | "missing";
}

interface StructureTraversalCache {
  readonly kindsByRepoPath: Map<string, MatchedRoot["kind"]>;
  readonly childrenByRepoPath: Map<string, readonly HabitatDirectoryEntry[]>;
  readonly visibleRepoPaths: ReadonlySet<string>;
  readonly walksByRequest: Map<string, readonly MatchedRoot[]>;
}

export function parseStructureCheckSpec(
  contents: string
): { ok: true; spec: StructureCheckSpec } | { ok: false; message: string } {
  let parsed: unknown;
  try {
    parsed = parseToml(contents);
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : String(error),
    };
  }
  const issues = [...Value.Errors(StructureCheckSpecSchema, parsed)];
  if (issues.length > 0) {
    return {
      ok: false,
      message: issues.map((issue) => `${issue.instancePath || "/"} ${issue.message}`).join("; "),
    };
  }
  return { ok: true, spec: Value.Parse(StructureCheckSpecSchema, parsed) };
}

export function runStructureRulesEffect<R>(
  rules: readonly RuleStructureFacts[],
  options: StructureCheckOptions<R>
): Effect.Effect<Map<string, RuleRunResult>, never, R> {
  return Effect.gen(function* () {
    if (options.visibleFiles === null) {
      return new Map(rules.map((rule) => [rule.id, visiblePathInventoryUnavailableResult(rule)]));
    }
    const cache = makeStructureTraversalCache(options.visibleFiles);
    const entries = yield* Effect.forEach(rules, (rule) =>
      Effect.map(
        runStructureRuleEffect<R>(rule, options, cache),
        (result) => [rule.id, result] as const
      )
    );
    return new Map(entries);
  });
}

function runStructureRuleEffect<R>(
  rule: RuleStructureFacts,
  options: StructureCheckOptions<R>,
  cache: StructureTraversalCache
): Effect.Effect<RuleRunResult, never, R> {
  return Effect.gen(function* () {
    const structurePath = path.resolve(options.repoRoot, rule.runner.files.structure);
    const text = yield* options.fileSystem.readText(structurePath).pipe(Effect.either);
    if (text._tag === "Left") {
      const diagnostics = [
        diagnostic(rule, {
          kind: "structure-file-invalid",
          path: rule.runner.files.structure,
          message: `Unable to read structure file ${rule.runner.files.structure}.`,
        }),
      ];
      return { exitCode: 1, diagnostics };
    }
    const parsed = parseStructureCheckSpec(text.right);
    if (!parsed.ok) {
      const diagnostics = [
        diagnostic(rule, {
          kind: "structure-file-invalid",
          path: rule.runner.files.structure,
          message: `Invalid Habitat structure TOML: ${parsed.message}`,
        }),
      ];
      return { exitCode: 1, diagnostics };
    }
    return yield* evaluateStructureCheckWithCacheEffect<R>(rule, parsed.spec, options, cache);
  });
}

export function evaluateStructureCheckEffect<R>(
  rule: RuleStructureFacts,
  spec: StructureCheckSpec,
  options: StructureCheckOptions<R>
): Effect.Effect<RuleRunResult, never, R> {
  const visibleFiles = options.visibleFiles;
  if (visibleFiles === null) {
    return Effect.succeed(visiblePathInventoryUnavailableResult(rule));
  }
  return Effect.suspend(() =>
    evaluateStructureCheckWithCacheEffect(
      rule,
      spec,
      options,
      makeStructureTraversalCache(visibleFiles)
    )
  );
}

function evaluateStructureCheckWithCacheEffect<R>(
  rule: RuleStructureFacts,
  spec: StructureCheckSpec,
  options: StructureCheckOptions<R>,
  cache: StructureTraversalCache
): Effect.Effect<RuleRunResult, never, R> {
  return Effect.gen(function* () {
    const diagnostics: HabitatDiagnostic[] = [];
    for (const scope of spec.scopes) {
      diagnostics.push(...(yield* evaluateScopeEffect<R>(rule, scope, options, cache)));
    }
    return { exitCode: diagnostics.length > 0 ? 1 : 0, diagnostics };
  });
}

function evaluateScopeEffect<R>(
  rule: RuleStructureFacts,
  scope: StructureCheckScope,
  options: StructureCheckOptions<R>,
  cache: StructureTraversalCache
): Effect.Effect<HabitatDiagnostic[], never, R> {
  return Effect.gen(function* () {
    const diagnostics: HabitatDiagnostic[] = [];
    const roots = yield* matchedRootsEffect<R>(scope.root, options, cache);
    const matchingKindRoots = roots.filter((root) => root.kind === scope.kind);
    const wrongKindRoots = roots.filter(
      (root) => root.kind !== "missing" && root.kind !== scope.kind
    );
    if (
      !scope.allowEmpty &&
      (roots.length === 0 || roots.every((root) => root.kind === "missing"))
    ) {
      return [
        diagnostic(rule, {
          kind: "root-missing",
          path: normalizeRepoPath(scope.root),
          message: `Structure scope "${scope.name}" matched no ${scope.kind} roots for ${scope.root}.`,
        }),
      ];
    }
    for (const root of wrongKindRoots) {
      diagnostics.push(
        diagnostic(rule, {
          kind: "wrong-root-kind",
          path: root.repoPath,
          message: `Structure scope "${scope.name}" expected ${scope.kind} root, but ${root.repoPath} is ${root.kind}.`,
        })
      );
    }
    for (const root of matchingKindRoots) {
      if (scope.kind === "file") continue;
      const children = yield* readDirectoryCachedEffect<R>(root.repoPath, options, cache);
      diagnostics.push(...evaluateDirectoryChildren(rule, scope, root.repoPath, children));
    }
    return diagnostics;
  });
}

function evaluateDirectoryChildren(
  rule: RuleStructureFacts,
  scope: StructureCheckScope,
  rootPath: string,
  children: readonly HabitatDirectoryEntry[]
): HabitatDiagnostic[] {
  const diagnostics: HabitatDiagnostic[] = [];
  const required = scope.required ?? [];
  const allowed = scope.allowed ?? [];
  const forbidden = scope.forbidden ?? [];
  const requiredMatchers = matchers(required);
  const allowedMatchers = matchers([...required, ...allowed]);
  const forbiddenMatchers = matchers(forbidden);

  for (const pattern of required) {
    const matches = children.filter((child) => matchesName(child.name, requiredMatchers, pattern));
    if (matches.length === 0) {
      diagnostics.push(
        diagnostic(rule, {
          kind: "missing-required-child",
          path: rootPath,
          message: `Structure scope "${scope.name}" requires direct child ${pattern} under ${rootPath}.`,
        })
      );
    }
  }

  for (const child of children) {
    const forbiddenPattern = firstMatchingPattern(child.name, forbiddenMatchers);
    if (forbiddenPattern) {
      diagnostics.push(
        diagnostic(rule, {
          kind: "forbidden-child",
          path: `${rootPath}/${child.name}`,
          message: `Structure scope "${scope.name}" forbids direct child ${child.name} under ${rootPath} via ${forbiddenPattern}.`,
        })
      );
      continue;
    }
    if (scope.mode === "closed" && !firstMatchingPattern(child.name, allowedMatchers)) {
      diagnostics.push(
        diagnostic(rule, {
          kind: "unexpected-child",
          path: `${rootPath}/${child.name}`,
          message: `Structure scope "${scope.name}" is closed and does not allow direct child ${child.name} under ${rootPath}.`,
        })
      );
    }
  }

  return diagnostics;
}

function matchedRootsEffect<R>(
  rootGlob: string,
  options: StructureCheckOptions<R>,
  cache: StructureTraversalCache
): Effect.Effect<readonly MatchedRoot[], never, R> {
  return Effect.gen(function* () {
    const normalizedRoot = normalizeRepoPath(rootGlob);
    const isGlob = hasGlobSyntax(normalizedRoot);
    if (!isGlob) {
      const kind = yield* pathKindEffect<R>(normalizedRoot, options, cache);
      return kind === "missing" ? [] : [{ repoPath: normalizedRoot, kind }];
    }
    const base = normalizeRepoPath(literalWalkBase(normalizedRoot));
    const maxDepth = maximumGlobDepth(normalizedRoot, base);
    const candidates = yield* walkRepoPathsEffect<R>(base, maxDepth, options, cache);
    const rootMatches = picomatch(normalizedRoot, { contains: false, dot: true });
    return candidates.filter((candidate) => rootMatches(candidate.repoPath));
  });
}

function walkRepoPathsEffect<R>(
  repoPath: string,
  maxDepth: number | undefined,
  options: StructureCheckOptions<R>,
  cache: StructureTraversalCache
): Effect.Effect<readonly MatchedRoot[], never, R> {
  return Effect.gen(function* () {
    const requestKey = `${repoPath}\0${maxDepth ?? "**"}`;
    const cached = cache.walksByRequest.get(requestKey);
    if (cached) return cached;

    const kind = yield* pathKindEffect<R>(repoPath, options, cache);
    if (kind === "missing") {
      const missingWalk: readonly MatchedRoot[] = [];
      cache.walksByRequest.set(requestKey, missingWalk);
      return missingWalk;
    }

    const out: MatchedRoot[] = [{ repoPath, kind }];
    if (kind === "directory" && (maxDepth === undefined || maxDepth > 0)) {
      yield* appendDescendantPathsEffect<R>(repoPath, maxDepth, options, cache, out);
    }
    const completedWalk: readonly MatchedRoot[] = out;
    cache.walksByRequest.set(requestKey, completedWalk);
    return completedWalk;
  });
}

function appendDescendantPathsEffect<R>(
  repoPath: string,
  remainingDepth: number | undefined,
  options: StructureCheckOptions<R>,
  cache: StructureTraversalCache,
  out: MatchedRoot[]
): Effect.Effect<void, never, R> {
  return Effect.gen(function* () {
    const children = yield* readDirectoryCachedEffect<R>(repoPath, options, cache);
    for (const child of children) {
      const { name, kind } = child;
      const childRepoPath = appendRepoPath(repoPath, name);
      cacheListedPathKind(childRepoPath, kind, cache);
      out.push({ repoPath: childRepoPath, kind });
      if (kind === "directory" && (remainingDepth === undefined || remainingDepth > 1)) {
        yield* appendDescendantPathsEffect<R>(
          childRepoPath,
          remainingDepth === undefined ? undefined : remainingDepth - 1,
          options,
          cache,
          out
        );
      }
    }
  });
}

function cacheListedPathKind(
  repoPath: string,
  kind: HabitatDirectoryEntry["kind"],
  cache: StructureTraversalCache
): void {
  if (kind === "other" || cache.kindsByRepoPath.has(repoPath)) return;
  cache.kindsByRepoPath.set(repoPath, kind);
}

function readDirectoryCachedEffect<R>(
  repoPath: string,
  options: StructureCheckOptions<R>,
  cache: StructureTraversalCache
): Effect.Effect<readonly HabitatDirectoryEntry[], never, R> {
  return Effect.gen(function* () {
    const cached = cache.childrenByRepoPath.get(repoPath);
    if (cached) return cached;
    const children = yield* options.fileSystem
      .readDirectory(path.resolve(options.repoRoot, repoPath))
      .pipe(Effect.catchAll(() => Effect.succeed([])));
    const visibleChildren = children
      .map((child) => ({ name: child.name, kind: child.kind }))
      .filter((child) => cache.visibleRepoPaths.has(appendRepoPath(repoPath, child.name)));
    cache.childrenByRepoPath.set(repoPath, visibleChildren);
    return visibleChildren;
  });
}

function pathKindEffect<R>(
  repoPath: string,
  options: StructureCheckOptions<R>,
  cache: StructureTraversalCache
): Effect.Effect<MatchedRoot["kind"], never, R> {
  return Effect.gen(function* () {
    if (!cache.visibleRepoPaths.has(repoPath)) return "missing" as const;
    const cached = cache.kindsByRepoPath.get(repoPath);
    if (cached) return cached;

    const absolute = path.resolve(options.repoRoot, repoPath);
    const isDirectory = yield* options.fileSystem
      .isDirectory(absolute)
      .pipe(Effect.catchAll(() => Effect.succeed(false)));
    if (isDirectory) {
      cache.kindsByRepoPath.set(repoPath, "directory");
      return "directory" as const;
    }
    const isFile = yield* options.fileSystem
      .isFile(absolute)
      .pipe(Effect.catchAll(() => Effect.succeed(false)));
    const kind: "file" | "missing" = Match.value(isFile).pipe(
      Match.when(true, (): "file" => "file"),
      Match.orElse((): "missing" => "missing")
    );
    cache.kindsByRepoPath.set(repoPath, kind);
    return kind;
  });
}

function makeStructureTraversalCache(visibleFiles: readonly string[]): StructureTraversalCache {
  return {
    kindsByRepoPath: new Map(),
    childrenByRepoPath: new Map(),
    visibleRepoPaths: visibleRepoPathSet(visibleFiles),
    walksByRequest: new Map(),
  };
}

function matchers(patterns: readonly string[]): Map<string, (candidate: string) => boolean> {
  return new Map(
    patterns.map((pattern) => [pattern, picomatch(pattern, { contains: false, dot: true })])
  );
}

function matchesName(
  name: string,
  candidates: ReadonlyMap<string, (candidate: string) => boolean>,
  pattern: string
): boolean {
  return candidates.get(pattern)?.(name) ?? false;
}

function firstMatchingPattern(
  name: string,
  candidates: ReadonlyMap<string, (candidate: string) => boolean>
): string | undefined {
  for (const [pattern, matches] of candidates) {
    if (matches(name)) return pattern;
  }
  return undefined;
}

function diagnostic(
  rule: RuleStructureFacts,
  input: {
    readonly kind: StructureCheckDiagnosticKind;
    readonly path: string;
    readonly message: string;
  }
): HabitatDiagnostic {
  return {
    ruleId: rule.id,
    path: input.path,
    message: `[${input.kind}] ${input.message}`,
    severity: rule.lane === "advisory" ? "advisory" : "error",
    baselined: false,
  };
}

function visiblePathInventoryUnavailableResult(rule: RuleStructureFacts): RuleRunResult {
  return {
    exitCode: 1,
    diagnostics: [
      diagnostic(rule, {
        kind: "visible-path-inventory-unavailable",
        path: ".",
        message:
          "Unable to enumerate Git-visible paths; structure checks refuse to inspect an unbounded filesystem tree.",
      }),
    ],
  };
}

function literalWalkBase(rootGlob: string): string {
  const firstMagic = rootGlob.search(/[*?[{(!+@]/u);
  if (firstMagic === -1) return rootGlob;
  const literalPrefix = rootGlob.slice(0, firstMagic);
  const lastSlash = literalPrefix.lastIndexOf("/");
  if (lastSlash <= 0) return ".";
  return literalPrefix.slice(0, lastSlash);
}

function hasGlobSyntax(candidate: string): boolean {
  return /[*?[{(!+@]/u.test(candidate);
}

function maximumGlobDepth(rootGlob: string, literalBase: string): number | undefined {
  if (rootGlob.includes("**")) return undefined;
  return Math.max(0, repoPathSegments(rootGlob).length - repoPathSegments(literalBase).length);
}

function repoPathSegments(repoPath: string): string[] {
  return repoPath.split("/").filter((segment) => segment.length > 0 && segment !== ".");
}

function visibleRepoPathSet(visibleFiles: readonly string[]): ReadonlySet<string> {
  const paths = new Set<string>([""]);
  for (const file of visibleFiles) {
    const normalized = normalizeRepoPath(file);
    if (!normalized || normalized === ".." || normalized.startsWith("../")) continue;
    paths.add(normalized);
    let cursor = normalized;
    while (cursor.includes("/")) {
      cursor = cursor.slice(0, cursor.lastIndexOf("/"));
      paths.add(cursor);
    }
  }
  return paths;
}

function appendRepoPath(parent: string, child: string): string {
  return parent ? `${parent}/${child}` : child;
}

function normalizeRepoPath(candidate: string): string {
  const normalized = path.normalize(candidate).split(path.sep).join("/");
  return normalized === "." ? "" : normalized.replace(/^\.\//, "");
}
