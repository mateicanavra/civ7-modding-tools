import path from "node:path";
import type { FileSystem } from "@effect/platform";
import type {
  HabitatDirectoryEntry,
  HabitatFileSystemReadPort,
} from "@habitat/cli/resources/platform/index";
import type { HabitatDiagnostic } from "@habitat/cli/service/model/check/index";
import type { RuleRunResult } from "@habitat/cli/service/model/diagnostics/policy/rule-runtime/architecture.policy";
import type { RuleStructureFacts } from "@habitat/cli/service/model/rules/index";
import { Effect, Either, Match } from "effect";
import picomatch from "picomatch";
import { parse as parseToml } from "smol-toml";
import { type Static, Type } from "typebox";
import { Value } from "typebox/value";

const StructureCheckScopeSchema = Type.Object(
  {
    name: Type.String({ minLength: 1 }),
    root: Type.String({ minLength: 1 }),
    kind: Type.Union([Type.Literal("directory"), Type.Literal("file")]),
    mode: Type.Union([Type.Literal("open"), Type.Literal("closed")]),
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
export type StructureCheckFileSystem = HabitatFileSystemReadPort;

interface StructureCheckOptions {
  readonly repoRoot: string;
  readonly fileSystem: StructureCheckFileSystem;
}

export type StructureCheckDiagnosticKind =
  | "structure-file-invalid"
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
  readonly walksByLiteralBase: Map<string, readonly MatchedRoot[]>;
}

export function parseStructureCheckSpec(
  contents: string
): { ok: true; spec: StructureCheckSpec } | { ok: false; message: string } {
  const parsed = Either.try({ try: () => parseToml(contents), catch: renderUnknownError });
  return Either.match(parsed, {
    onLeft: (message) => ({ ok: false as const, message }),
    onRight: parsedStructureCheckSpec,
  });
}

function parsedStructureCheckSpec(
  parsed: unknown
): { ok: true; spec: StructureCheckSpec } | { ok: false; message: string } {
  const issues = [...Value.Errors(StructureCheckSpecSchema, parsed)];
  return Match.value(issues.length).pipe(
    Match.when(0, () => ({ ok: true as const, spec: Value.Parse(StructureCheckSpecSchema, parsed) })),
    Match.orElse(() => ({
      ok: false as const,
      message: issues.map((issue) => `${issue.instancePath || "/"} ${issue.message}`).join("; "),
    }))
  );
}

function renderUnknownError(error: unknown): string {
  return Match.value(error).pipe(
    Match.when(Match.instanceOf(Error), (cause) => cause.message),
    Match.orElse(String)
  );
}

export const runStructureRulesEffect = Effect.fn("habitat.structure.runRules")(function* (
  rules: readonly RuleStructureFacts[],
  options: StructureCheckOptions
) {
    const cache = makeStructureTraversalCache();
    const entries = yield* Effect.forEach(rules, (rule) =>
      Effect.map(
        runStructureRuleEffect(rule, options, cache),
        (result) => [rule.id, result] as const
      )
    );
    return new Map(entries);
});

const runStructureRuleEffect = Effect.fn("habitat.structure.runRule")(function* (
  rule: RuleStructureFacts,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
    const structurePath = path.resolve(options.repoRoot, rule.runner.files.structure);
    const text = yield* options.fileSystem.readText(structurePath).pipe(Effect.either);
    return yield* Either.match(text, {
      onLeft: () => Effect.succeed(unreadableStructureRuleResult(rule)),
      onRight: (contents) => parsedStructureRuleEffect(rule, contents, options, cache),
    });
});

const parsedStructureRuleEffect = Effect.fn("habitat.structure.runParsedRule")(function* (
  rule: RuleStructureFacts,
  contents: string,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
  const parsed = parseStructureCheckSpec(contents);
  return yield* Match.value(parsed).pipe(
    Match.when({ ok: false }, ({ message }) =>
      Effect.succeed(invalidStructureRuleResult(rule, message))
    ),
    Match.when({ ok: true }, ({ spec }) =>
      evaluateStructureCheckWithCacheEffect(rule, spec, options, cache)
    ),
    Match.exhaustive
  );
});

function unreadableStructureRuleResult(rule: RuleStructureFacts): RuleRunResult {
  return invalidStructureRuleResult(
    rule,
    `Unable to read structure file ${rule.runner.files.structure}.`,
    false
  );
}

function invalidStructureRuleResult(
  rule: RuleStructureFacts,
  message: string,
  parsed = true
): RuleRunResult {
  const renderedMessage = Match.value(parsed).pipe(
    Match.when(true, () => `Invalid Habitat structure TOML: ${message}`),
    Match.orElse(() => message)
  );
  return {
    exitCode: 1,
    diagnostics: [
      diagnostic(rule, {
        kind: "structure-file-invalid",
        path: rule.runner.files.structure,
        message: renderedMessage,
      }),
    ],
  };
}

export const evaluateStructureCheckEffect = Effect.fn("habitat.structure.evaluate")(function* (
  rule: RuleStructureFacts,
  spec: StructureCheckSpec,
  options: StructureCheckOptions
) {
  return yield* Effect.suspend(() =>
    evaluateStructureCheckWithCacheEffect(rule, spec, options, makeStructureTraversalCache())
  );
});

const evaluateStructureCheckWithCacheEffect = Effect.fn("habitat.structure.evaluateWithCache")(
  function* (
  rule: RuleStructureFacts,
  spec: StructureCheckSpec,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
    const diagnostics: HabitatDiagnostic[] = [];
    for (const scope of spec.scopes) {
      diagnostics.push(...(yield* evaluateScopeEffect(rule, scope, options, cache)));
    }
    return { exitCode: exitCodeFromDiagnostics(diagnostics), diagnostics };
  }
);

const evaluateScopeEffect = Effect.fn("habitat.structure.evaluateScope")(function* (
  rule: RuleStructureFacts,
  scope: StructureCheckScope,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
    const roots = yield* matchedRootsEffect(scope.root, options, cache);
    return yield* Match.value(hasMatchedScopeRoot(roots)).pipe(
      Match.when(false, () => Effect.succeed(missingScopeRootDiagnostics(rule, scope))),
      Match.when(true, () => evaluateMatchedScopeEffect(rule, scope, roots, options, cache)),
      Match.exhaustive
    );
});

function hasMatchedScopeRoot(roots: readonly MatchedRoot[]): boolean {
  return roots.length > 0 && roots.some((root) => root.kind !== "missing");
}

function missingScopeRootDiagnostics(
  rule: RuleStructureFacts,
  scope: StructureCheckScope
): HabitatDiagnostic[] {
  return [
    diagnostic(rule, {
      kind: "root-missing",
      path: normalizeRepoPath(scope.root),
      message: `Structure scope "${scope.name}" matched no ${scope.kind} roots for ${scope.root}.`,
    }),
  ];
}

const evaluateMatchedScopeEffect = Effect.fn("habitat.structure.evaluateMatchedScope")(
  function* (
    rule: RuleStructureFacts,
    scope: StructureCheckScope,
    roots: readonly MatchedRoot[],
    options: StructureCheckOptions,
    cache: StructureTraversalCache
  ) {
    const wrongKindDiagnostics = roots
      .filter((root) => root.kind !== "missing" && root.kind !== scope.kind)
      .map((root) =>
        diagnostic(rule, {
          kind: "wrong-root-kind",
          path: root.repoPath,
          message: `Structure scope "${scope.name}" expected ${scope.kind} root, but ${root.repoPath} is ${root.kind}.`,
        })
      );
    const matchingDirectoryRoots = Match.value(scope.kind).pipe(
      Match.when("file", () => []),
      Match.when("directory", () => roots.filter((root) => root.kind === "directory")),
      Match.exhaustive
    );
    const directoryDiagnostics = yield* Effect.forEach(matchingDirectoryRoots, (root) =>
      readDirectoryCachedEffect(root.repoPath, options, cache).pipe(
        Effect.map((children) => evaluateDirectoryChildren(rule, scope, root.repoPath, children))
      )
    );
    return [...wrongKindDiagnostics, ...directoryDiagnostics.flat()];
  }
);

function evaluateDirectoryChildren(
  rule: RuleStructureFacts,
  scope: StructureCheckScope,
  rootPath: string,
  children: readonly HabitatDirectoryEntry[]
): HabitatDiagnostic[] {
  const required = scope.required ?? [];
  const allowed = scope.allowed ?? [];
  const forbidden = scope.forbidden ?? [];
  const requiredMatchers = matchers(required);
  const allowedMatchers = matchers([...required, ...allowed]);
  const forbiddenMatchers = matchers(forbidden);
  const missingRequiredDiagnostics = required
    .filter(
      (pattern) =>
        !children.some((child) => matchesName(child.name, requiredMatchers, pattern))
    )
    .map((pattern) =>
      diagnostic(rule, {
        kind: "missing-required-child",
        path: rootPath,
        message: `Structure scope "${scope.name}" requires direct child ${pattern} under ${rootPath}.`,
      })
    );
  const childDiagnostics = children.flatMap((child) =>
    evaluateDirectoryChild(rule, scope, rootPath, child, forbiddenMatchers, allowedMatchers)
  );

  return [...missingRequiredDiagnostics, ...childDiagnostics];
}

function evaluateDirectoryChild(
  rule: RuleStructureFacts,
  scope: StructureCheckScope,
  rootPath: string,
  child: HabitatDirectoryEntry,
  forbiddenMatchers: ReadonlyMap<string, (candidate: string) => boolean>,
  allowedMatchers: ReadonlyMap<string, (candidate: string) => boolean>
): HabitatDiagnostic[] {
  return Match.value(firstMatchingPattern(child.name, forbiddenMatchers)).pipe(
    Match.when(Match.string, (forbiddenPattern) => [
      diagnostic(rule, {
        kind: "forbidden-child",
        path: `${rootPath}/${child.name}`,
        message: `Structure scope "${scope.name}" forbids direct child ${child.name} under ${rootPath} via ${forbiddenPattern}.`,
      }),
    ]),
    Match.when(Match.undefined, () =>
      unexpectedDirectoryChildDiagnostics(rule, scope, rootPath, child, allowedMatchers)
    ),
    Match.exhaustive
  );
}

function unexpectedDirectoryChildDiagnostics(
  rule: RuleStructureFacts,
  scope: StructureCheckScope,
  rootPath: string,
  child: HabitatDirectoryEntry,
  allowedMatchers: ReadonlyMap<string, (candidate: string) => boolean>
): HabitatDiagnostic[] {
  const isUnexpected =
    scope.mode === "closed" && firstMatchingPattern(child.name, allowedMatchers) === undefined;
  return Match.value(isUnexpected).pipe(
    Match.when(true, () => [
      diagnostic(rule, {
        kind: "unexpected-child",
        path: `${rootPath}/${child.name}`,
        message: `Structure scope "${scope.name}" is closed and does not allow direct child ${child.name} under ${rootPath}.`,
      }),
    ]),
    Match.when(false, () => []),
    Match.exhaustive
  );
}

function exitCodeFromDiagnostics(diagnostics: readonly HabitatDiagnostic[]): number {
  return Match.value(diagnostics.length).pipe(
    Match.when(0, () => 0),
    Match.orElse(() => 1)
  );
}

const matchedRootsEffect = Effect.fn("habitat.structure.matchRoots")(function* (
  rootGlob: string,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
    const normalizedRoot = normalizeRepoPath(rootGlob);
    return yield* Match.value(hasGlobSyntax(normalizedRoot)).pipe(
      Match.when(false, () => literalMatchedRootEffect(normalizedRoot, options, cache)),
      Match.when(true, () => globMatchedRootsEffect(normalizedRoot, options, cache)),
      Match.exhaustive
    );
});

const literalMatchedRootEffect = Effect.fn("habitat.structure.matchLiteralRoot")(function* (
  repoPath: string,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
  const kind = yield* pathKindEffect(repoPath, options, cache);
  return Match.value(kind).pipe(
    Match.when("missing", () => []),
    Match.orElse((matchedKind) => [{ repoPath, kind: matchedKind }])
  );
});

const globMatchedRootsEffect = Effect.fn("habitat.structure.matchGlobRoots")(function* (
  rootGlob: string,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
  const candidates = yield* walkRepoPathsEffect(literalWalkBase(rootGlob), options, cache);
  const rootMatches = picomatch(rootGlob, { contains: false, dot: true });
  return candidates.filter((candidate) => rootMatches(candidate.repoPath));
});

const walkRepoPathsEffect = Effect.fn("habitat.structure.walkRepoPaths")(function* (
  repoPath: string,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
  return yield* Match.value(cache.walksByLiteralBase.get(repoPath)).pipe(
    Match.when(Match.undefined, () => walkUncachedRepoPathsEffect(repoPath, options, cache)),
    Match.orElse((cached) => Effect.succeed(cached))
  );
});

const walkUncachedRepoPathsEffect = Effect.fn("habitat.structure.walkUncachedRepoPaths")(
  function* (repoPath: string, options: StructureCheckOptions, cache: StructureTraversalCache) {
    const kind = yield* pathKindEffect(repoPath, options, cache);
    return yield* Match.value(kind).pipe(
      Match.when("missing", () => cacheMissingWalkEffect(repoPath, cache)),
      Match.orElse((matchedKind) =>
        completeRepoWalkEffect(repoPath, matchedKind, options, cache)
      )
    );
  }
);

const cacheMissingWalkEffect = Effect.fn("habitat.structure.cacheMissingWalk")(function* (
  repoPath: string,
  cache: StructureTraversalCache
) {
  const missingWalk: readonly MatchedRoot[] = [];
  cache.walksByLiteralBase.set(repoPath, missingWalk);
  return missingWalk;
});

const completeRepoWalkEffect = Effect.fn("habitat.structure.completeRepoWalk")(function* (
  repoPath: string,
  kind: Exclude<MatchedRoot["kind"], "missing">,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
  const out: MatchedRoot[] = [{ repoPath, kind }];
  const appendDescendants = appendDescendantPathsEffect(repoPath, options, cache, out);
  yield* appendDescendants.pipe(Effect.when(() => kind === "directory"));
  const completedWalk: readonly MatchedRoot[] = out;
  cache.walksByLiteralBase.set(repoPath, completedWalk);
  return completedWalk;
});

const appendDescendantPathsEffect = Effect.fn("habitat.structure.appendDescendantPaths")(
  function* (
    repoPath: string,
    options: StructureCheckOptions,
    cache: StructureTraversalCache,
    out: MatchedRoot[]
  ): Effect.fn.Return<void, never, FileSystem.FileSystem> {
    const children = yield* readDirectoryCachedEffect(repoPath, options, cache);
    yield* Effect.forEach(
      children,
      (child) => appendDescendantPathEffect(repoPath, child, options, cache, out),
      { discard: true }
    );
  }
);

const appendDescendantPathEffect = Effect.fn("habitat.structure.appendDescendantPath")(
  function* (
    repoPath: string,
    child: HabitatDirectoryEntry,
    options: StructureCheckOptions,
    cache: StructureTraversalCache,
    out: MatchedRoot[]
  ): Effect.fn.Return<void, never, FileSystem.FileSystem> {
    const { name, kind } = child;
    const childRepoPath = `${repoPath}/${name}`;
    yield* cacheListedPathKindEffect(childRepoPath, kind, cache);
    out.push({ repoPath: childRepoPath, kind });
    const appendDescendants = appendDescendantPathsEffect(childRepoPath, options, cache, out);
    yield* appendDescendants.pipe(Effect.when(() => kind === "directory"));
  }
);

const cacheListedPathKindEffect = Effect.fn("habitat.structure.cacheListedPathKind")(function* (
  repoPath: string,
  kind: HabitatDirectoryEntry["kind"],
  cache: StructureTraversalCache
) {
  const shouldCache = kind !== "other" && !cache.kindsByRepoPath.has(repoPath);
  const cacheKind = cachePathKindEffect(repoPath, kind, cache);
  yield* cacheKind.pipe(Effect.when(() => shouldCache));
});

const readDirectoryCachedEffect = Effect.fn("habitat.structure.readDirectoryCached")(function* (
  repoPath: string,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
  return yield* Match.value(cache.childrenByRepoPath.get(repoPath)).pipe(
    Match.when(Match.undefined, () => readUncachedDirectoryEffect(repoPath, options, cache)),
    Match.orElse((cached) => Effect.succeed(cached))
  );
});

const readUncachedDirectoryEffect = Effect.fn("habitat.structure.readUncachedDirectory")(
  function* (
    repoPath: string,
    options: StructureCheckOptions,
    cache: StructureTraversalCache
  ) {
    const children = yield* options.fileSystem
      .readDirectory(path.resolve(options.repoRoot, repoPath))
      .pipe(Effect.catchAll(() => Effect.succeed([])));
    cache.childrenByRepoPath.set(repoPath, children);
    return children;
  }
);

const pathKindEffect = Effect.fn("habitat.structure.pathKind")(function* (
  repoPath: string,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
  return yield* Match.value(cache.kindsByRepoPath.get(repoPath)).pipe(
    Match.when(Match.undefined, () => readUncachedPathKindEffect(repoPath, options, cache)),
    Match.orElse((cached) => Effect.succeed(cached))
  );
});

const readUncachedPathKindEffect = Effect.fn("habitat.structure.readUncachedPathKind")(
  function* (repoPath: string, options: StructureCheckOptions, cache: StructureTraversalCache) {
    const absolute = path.resolve(options.repoRoot, repoPath);
    const isDirectory = yield* options.fileSystem
      .isDirectory(absolute)
      .pipe(Effect.catchAll(() => Effect.succeed(false)));
    return yield* Match.value(isDirectory).pipe(
      Match.when(true, () => cachePathKindEffect(repoPath, "directory", cache)),
      Match.when(false, () => readFilePathKindEffect(repoPath, absolute, options, cache)),
      Match.exhaustive
    );
  }
);

const readFilePathKindEffect = Effect.fn("habitat.structure.readFilePathKind")(function* (
  repoPath: string,
  absolute: string,
  options: StructureCheckOptions,
  cache: StructureTraversalCache
) {
  const isFile = yield* options.fileSystem
    .isFile(absolute)
    .pipe(Effect.catchAll(() => Effect.succeed(false)));
  const kind: "file" | "missing" = Match.value(isFile).pipe(
    Match.when(true, (): "file" => "file"),
    Match.when(false, (): "missing" => "missing"),
    Match.exhaustive
  );
  return yield* cachePathKindEffect(repoPath, kind, cache);
});

const cachePathKindEffect = Effect.fn("habitat.structure.cachePathKind")(function* (
  repoPath: string,
  kind: MatchedRoot["kind"],
  cache: StructureTraversalCache
) {
  cache.kindsByRepoPath.set(repoPath, kind);
  return kind;
});

function makeStructureTraversalCache(): StructureTraversalCache {
  return {
    kindsByRepoPath: new Map(),
    childrenByRepoPath: new Map(),
    walksByLiteralBase: new Map(),
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
  return [...candidates].find(([, matches]) => matches(name))?.[0];
}

function diagnostic(
  rule: RuleStructureFacts,
  input: {
    readonly kind: StructureCheckDiagnosticKind;
    readonly path: string;
    readonly message: string;
  }
): HabitatDiagnostic {
  const severity = Match.value(rule.lane).pipe(
    Match.when("advisory", () => "advisory" as const),
    Match.orElse(() => "error" as const)
  );
  return {
    ruleId: rule.id,
    path: input.path,
    message: `[${input.kind}] ${input.message}`,
    severity,
    baselined: false,
  };
}

function literalWalkBase(rootGlob: string): string {
  const firstMagic = rootGlob.search(/[*?[{(!+@]/u);
  return Match.value(firstMagic).pipe(
    Match.when(-1, () => rootGlob),
    Match.orElse((magicIndex) => literalWalkBaseFromMagicIndex(rootGlob, magicIndex))
  );
}

function literalWalkBaseFromMagicIndex(rootGlob: string, firstMagic: number): string {
  const literalPrefix = rootGlob.slice(0, firstMagic);
  const lastSlash = literalPrefix.lastIndexOf("/");
  return Match.value(lastSlash <= 0).pipe(
    Match.when(true, () => "."),
    Match.when(false, () => literalPrefix.slice(0, lastSlash)),
    Match.exhaustive
  );
}

function hasGlobSyntax(candidate: string): boolean {
  return /[*?[{(!+@]/u.test(candidate);
}

function normalizeRepoPath(candidate: string): string {
  const normalized = path.normalize(candidate).split(path.sep).join("/");
  return Match.value(normalized).pipe(
    Match.when(".", () => ""),
    Match.orElse((repoPath) => repoPath.replace(/^\.\//, ""))
  );
}
