import path from "node:path";
import type { HabitatFileSystemReadPort } from "@habitat/cli/resources/platform/index";
import { Effect, Either, Match, Option, Schema } from "effect";
import { Value } from "typebox/value";
import { errorMessage } from "./context.policy.js";
import {
  type BaselineOccurrence,
  type BaselineRefusal,
  type BaselineRuleContractInput,
  type RuleIntroductionBaselineManifest,
  RuleIntroductionBaselineManifestSchema,
} from "./dto/baseline.schema.js";
import { countOccurrences, sameOccurrenceList, sameStringList } from "./utils.policy.js";

type RuleIntroductionManifestReadPort<R> = Pick<HabitatFileSystemReadPort<R>, "readText">;

interface RuleIntroductionManifestContext<R> {
  readonly fileSystem: RuleIntroductionManifestReadPort<R>;
  readonly repoRoot: string;
  readonly registry: readonly BaselineRuleContractInput[];
  readonly ruleIntroductionManifests: readonly RuleIntroductionBaselineManifest[];
}

interface FileManifestSource<R> {
  readonly status: "file";
  readonly path: string;
  readonly ruleId: string;
  readonly context: RuleIntroductionManifestContext<R>;
}

type RuleIntroductionManifestSource<R> =
  | { readonly status: "injected"; readonly manifest: RuleIntroductionBaselineManifest }
  | { readonly status: "missing" }
  | FileManifestSource<R>;

type RuleIntroductionManifestLoadResult =
  | { readonly status: "loaded"; readonly manifest: RuleIntroductionBaselineManifest }
  | { readonly status: "missing" }
  | { readonly status: "malformed"; readonly path: string; readonly message: string };

type RuleIntroductionManifestAdmission =
  | { readonly ok: true }
  | { readonly ok: false; readonly refusal: BaselineRefusal };

const decodeJsonText = Schema.decodeUnknown(Schema.parseJson());

const loadManifestFileEffect = Effect.fn("baseline.loadRuleIntroductionManifest")(function* <R>(
  source: FileManifestSource<R>
): Effect.fn.Return<RuleIntroductionManifestLoadResult, never, R> {
  const absolutePath = path.resolve(source.context.repoRoot, source.path);
  const raw = yield* source.context.fileSystem.readText(absolutePath).pipe(Effect.either);
  return yield* Either.match(raw, {
    onLeft: (error) =>
      Effect.succeed(
        manifestMalformed(
          source.path,
          `Rule-introduction baseline manifest '${source.path}' for '${source.ruleId}' is unreadable: ${errorMessage(error)}.`
        )
      ),
    onRight: (contents) =>
      decodeJsonText(contents).pipe(
        Effect.flatMap((parsed) =>
          Effect.try({
            try: () => Value.Parse(RuleIntroductionBaselineManifestSchema, parsed),
            catch: errorMessage,
          })
        ),
        Effect.match({
          onFailure: (error) =>
            manifestMalformed(
              source.path,
              `Rule-introduction baseline manifest '${source.path}' for '${source.ruleId}' is malformed: ${errorMessage(error)}.`
            ),
          onSuccess: manifestLoaded,
        })
      ),
  });
});

/** Admits introduced baseline debt only when its manifest matches every occurrence exactly. */
export const admitRuleIntroductionManifestEffect = Effect.fn(
  "baseline.admitRuleIntroductionManifest"
)(function* <R>(
  ruleId: string,
  occurrences: readonly BaselineOccurrence[],
  comparisonBase: string,
  baselinePath: string,
  context: RuleIntroductionManifestContext<R>
): Effect.fn.Return<RuleIntroductionManifestAdmission, never, R> {
  const source = ruleIntroductionManifestSource(ruleId, context);
  const loaded = yield* Match.value(source).pipe(
    Match.when({ status: "injected" }, ({ manifest }) => Effect.succeed(manifestLoaded(manifest))),
    Match.when({ status: "file" }, (fileSource) => loadManifestFileEffect<R>(fileSource)),
    Match.when({ status: "missing" }, () => Effect.succeed(manifestMissing())),
    Match.exhaustive
  );
  return admissionFromLoadedManifest(
    ruleId,
    occurrences,
    comparisonBase,
    baselinePath,
    loaded,
    context
  );
});

function ruleIntroductionManifestSource<R>(
  ruleId: string,
  context: RuleIntroductionManifestContext<R>
): RuleIntroductionManifestSource<R> {
  const injected = Option.fromNullable(
    context.ruleIntroductionManifests.find((candidate) => candidate.ruleId === ruleId)
  ).pipe(Option.map(manifestInjected));
  const supportPath = Option.fromNullable(
    context.registry.find((candidate) => candidate.id === ruleId)?.ruleIntroductionManifestPath
  ).pipe(Option.map((manifestPath) => manifestFile(manifestPath, ruleId, context)));
  return injected.pipe(
    Option.orElse(() => supportPath),
    Option.getOrElse(manifestMissing)
  );
}

function admissionFromLoadedManifest<R>(
  ruleId: string,
  occurrences: readonly BaselineOccurrence[],
  comparisonBase: string,
  baselinePath: string,
  loaded: RuleIntroductionManifestLoadResult,
  context: RuleIntroductionManifestContext<R>
): RuleIntroductionManifestAdmission {
  return Match.value(loaded).pipe(
    Match.when({ status: "missing" }, () => missingAdmission(ruleId, occurrences, baselinePath)),
    Match.when({ status: "malformed" }, ({ path: manifestPath, message }) =>
      malformedAdmission(ruleId, occurrences, manifestPath, message)
    ),
    Match.when({ status: "loaded" }, ({ manifest }) =>
      loadedManifestAdmission(ruleId, occurrences, comparisonBase, baselinePath, manifest, context)
    ),
    Match.exhaustive
  );
}

function loadedManifestAdmission<R>(
  ruleId: string,
  occurrences: readonly BaselineOccurrence[],
  comparisonBase: string,
  baselinePath: string,
  manifest: RuleIntroductionBaselineManifest,
  context: RuleIntroductionManifestContext<R>
): RuleIntroductionManifestAdmission {
  const sortedManifestKeys = [...manifest.initialBaselineKeys].sort();
  const manifestOccurrences = countOccurrences(manifest.initialBaselineKeys);
  const currentRule = context.registry.find((rule) => rule.id === ruleId);
  const matches =
    manifest.ruleId === ruleId &&
    manifest.comparisonBase === comparisonBase &&
    manifest.baselinePath === baselinePath &&
    manifest.ownerProject === currentRule?.ownerProject &&
    manifest.runner === currentRule?.runner &&
    sameStringList(manifest.initialBaselineKeys, sortedManifestKeys) &&
    sameOccurrenceList(manifestOccurrences, occurrences);
  return Match.value(matches).pipe(
    Match.when(true, admissionAccepted),
    Match.when(false, () => mismatchAdmission(ruleId, occurrences, baselinePath)),
    Match.exhaustive
  );
}

function missingAdmission(
  ruleId: string,
  occurrences: readonly BaselineOccurrence[],
  baselinePath: string
): RuleIntroductionManifestAdmission {
  return {
    ok: false,
    refusal: {
      kind: "baseline-refusal",
      ruleId,
      path: baselinePath,
      reason: "rule-introduction-manifest-missing",
      addedKeys: occurrences.map(({ key }) => key),
      message:
        `baseline for introduced rule '${ruleId}' has seeded keys but no accepted rule-introduction ` +
        "baseline manifest; refusing baseline growth",
    },
  };
}

function malformedAdmission(
  ruleId: string,
  occurrences: readonly BaselineOccurrence[],
  manifestPath: string,
  message: string
): RuleIntroductionManifestAdmission {
  return {
    ok: false,
    refusal: {
      kind: "baseline-refusal",
      ruleId,
      path: manifestPath,
      reason: "rule-introduction-manifest-malformed",
      addedKeys: occurrences.map(({ key }) => key),
      message,
    },
  };
}

function mismatchAdmission(
  ruleId: string,
  occurrences: readonly BaselineOccurrence[],
  baselinePath: string
): RuleIntroductionManifestAdmission {
  return {
    ok: false,
    refusal: {
      kind: "baseline-refusal",
      ruleId,
      path: baselinePath,
      reason: "rule-introduction-manifest-mismatch",
      addedKeys: occurrences.map(({ key }) => key),
      message: `rule-introduction baseline manifest for '${ruleId}' does not match the requested write`,
    },
  };
}

function admissionAccepted(): RuleIntroductionManifestAdmission {
  return { ok: true };
}

function manifestInjected(
  manifest: RuleIntroductionBaselineManifest
): RuleIntroductionManifestSource<never> {
  return { status: "injected", manifest };
}

function manifestFile<R>(
  manifestPath: string,
  ruleId: string,
  context: RuleIntroductionManifestContext<R>
): RuleIntroductionManifestSource<R> {
  return { status: "file", path: manifestPath, ruleId, context };
}

function manifestLoaded(
  manifest: RuleIntroductionBaselineManifest
): RuleIntroductionManifestLoadResult {
  return { status: "loaded", manifest };
}

function manifestMissing(): { readonly status: "missing" } {
  return { status: "missing" };
}

function manifestMalformed(path: string, message: string): RuleIntroductionManifestLoadResult {
  return { status: "malformed", path, message };
}
