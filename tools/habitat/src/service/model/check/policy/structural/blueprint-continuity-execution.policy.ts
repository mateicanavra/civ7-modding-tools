import type { HabitatDiagnostic, RuleReport } from "@habitat/cli/service/model/check/index";
import { deriveRuleReportStatus } from "@habitat/cli/service/model/check/index";
import {
  applyStagedPathActions,
  type StagedMutationPath,
} from "@habitat/cli/service/model/host/index";
import {
  evaluateAffirmedBlueprintContinuity,
  type RuleAuthoritySnapshot,
  type RuleRegistryAuthoritySnapshot,
  type RuleRegistryIndex,
  RuleRegistryIndexSchema,
  type RuleRegistryRecord,
  RuleRegistryRecordInputSchema,
  RuleRegistryRecordSchema,
} from "@habitat/cli/service/model/rules/index";
import {
  referencedRuleAuthorityPaths,
  ruleAuthorityPathFacts,
} from "@habitat/cli/service/model/rules/policy/authority-paths.policy";
import {
  isRuleManifestCandidatePath,
  ruleManifestPathAdmissionIssues,
} from "@habitat/cli/service/model/rules/policy/manifest-path-admission.policy";
import {
  parseRuleRegistryDocument,
  type RuleRegistryIssue,
} from "@habitat/cli/service/model/rules/repositories/registry.repository";
import { Clock, Effect, Record as EffectRecord, Match, Option, Schema } from "effect";
import { Type } from "typebox";
import { Value } from "typebox/value";
import type { StructuralExecutionContext } from "./context.policy.js";
import {
  currentStagedPathActionsEffect,
  isStagedPathActionReadFailure,
} from "./staged-path-actions.policy.js";

const continuityAuthority = {
  ruleId: "affirmed-blueprint-continuity",
  habitatRoot: ".habitat",
  registryIndex: ".habitat/index.json",
};

type RegistryReadResult =
  | { readonly status: "admitted"; readonly rules: readonly RuleRegistryRecord[] }
  | { readonly status: "refused"; readonly diagnostics: readonly HabitatDiagnostic[] };

type ManifestReadResult =
  | { readonly status: "admitted"; readonly rule: RuleRegistryRecord }
  | { readonly status: "refused"; readonly diagnostic: HabitatDiagnostic };

type RegistryIndexReadResult =
  | { readonly status: "admitted"; readonly index: RuleRegistryIndex }
  | { readonly status: "refused"; readonly diagnostic: HabitatDiagnostic };

type RegistryBlobRead<R> = ReturnType<StructuralExecutionContext<R>["git"]["show"]>;
type RegistryBlobReader<R> = (repoPath: string) => RegistryBlobRead<R>;

const decodeJsonText = Schema.decodeUnknown(Schema.parseJson());
const RuleManifestObjectSchema = Type.Record(Type.String(), Type.Unknown());

/**
 * Evaluates affirmed blueprint ownership against Git HEAD and the exact staged index.
 *
 * This is built into Habitat rather than registered as a rule so moving or deleting a
 * manifest cannot disable the guard responsible for detecting that mutation.
 */
export const affirmedBlueprintContinuityReportEffect = Effect.fn(
  "check.affirmedBlueprintContinuity"
)(function* <R>(
  context: Pick<StructuralExecutionContext<R>, "git" | "repoRoot">
): Effect.fn.Return<RuleReport, never, R> {
  const started = yield* Clock.currentTimeMillis;
  const actions = yield* currentStagedPathActionsEffect(context);
  return yield* Match.value(actions).pipe(
    Match.when(isStagedPathActionReadFailure, ({ message }) =>
      continuityReportAt(started, [
        continuityDiagnostic(".", `Unable to read staged path actions. ${message}`),
      ])
    ),
    Match.orElse((stagedActions) => continuityFromActionsEffect<R>(stagedActions, started, context))
  );
});

const continuityFromActionsEffect = Effect.fn("check.affirmedBlueprintContinuity.actions")(
  function* <R>(
    actions: readonly StagedMutationPath[],
    started: number,
    context: Pick<StructuralExecutionContext<R>, "git" | "repoRoot">
  ): Effect.fn.Return<RuleReport, never, R> {
    const habitatActions = actions.filter(({ path }) => isHabitatPath(path));
    return yield* Match.value(habitatActions.length).pipe(
      Match.when(0, () => continuityReportAt(started, [])),
      Match.orElse(() => continuityFromChangedAuthorityEffect<R>(habitatActions, started, context))
    );
  }
);

const continuityFromChangedAuthorityEffect = Effect.fn(
  "check.affirmedBlueprintContinuity.changedAuthority"
)(function* <R>(
  habitatActions: readonly StagedMutationPath[],
  started: number,
  context: Pick<StructuralExecutionContext<R>, "git" | "repoRoot">
): Effect.fn.Return<RuleReport, never, R> {
  const stagedIndex = yield* readRegistryIndexEffect<R>(
    context.git.showIndex(continuityAuthority.registryIndex, {
      cwd: context.repoRoot,
    }),
    "staged"
  );
  return yield* Match.value(stagedIndex).pipe(
    Match.when({ status: "refused" }, ({ diagnostic }) =>
      continuityReportAt(started, [diagnostic])
    ),
    Match.when({ status: "admitted" }, ({ index }) =>
      continuityFromStagedIndexEffect<R>(index, habitatActions, started, context)
    ),
    Match.exhaustive
  );
});

const continuityFromStagedIndexEffect = Effect.fn("check.affirmedBlueprintContinuity.stagedIndex")(
  function* <R>(
    stagedIndex: RuleRegistryIndex,
    habitatActions: readonly StagedMutationPath[],
    started: number,
    context: Pick<StructuralExecutionContext<R>, "git" | "repoRoot">
  ): Effect.fn.Return<RuleReport, never, R> {
    const headIndex = yield* readRegistryIndexEffect<R>(
      context.git.show("HEAD", continuityAuthority.registryIndex, {
        cwd: context.repoRoot,
      }),
      "HEAD"
    );
    return yield* Match.value(headIndex).pipe(
      Match.when({ status: "refused" }, ({ diagnostic }) =>
        continuityReportAt(started, [diagnostic])
      ),
      Match.when({ status: "admitted" }, ({ index }) =>
        continuityFromRegistryIndexesEffect<R>(index, stagedIndex, habitatActions, started, context)
      ),
      Match.exhaustive
    );
  }
);

const continuityFromRegistryIndexesEffect = Effect.fn(
  "check.affirmedBlueprintContinuity.registryIndexes"
)(function* <R>(
  headIndex: RuleRegistryIndex,
  stagedIndex: RuleRegistryIndex,
  habitatActions: readonly StagedMutationPath[],
  started: number,
  context: Pick<StructuralExecutionContext<R>, "git" | "repoRoot">
): Effect.fn.Return<RuleReport, never, R> {
  const headPaths = yield* context.git.lsTreeNameOnly("HEAD", continuityAuthority.habitatRoot, {
    cwd: context.repoRoot,
  });
  return yield* Option.match(Option.fromNullable(headPaths), {
    onNone: () =>
      continuityReportAt(started, [
        continuityDiagnostic(
          continuityAuthority.habitatRoot,
          "Unable to read Habitat authority paths from HEAD."
        ),
      ]),
    onSome: (paths) =>
      continuityFromHeadPathsEffect<R>(
        paths,
        habitatActions,
        headIndex,
        stagedIndex,
        started,
        context
      ),
  });
});

const continuityFromHeadPathsEffect = Effect.fn("check.affirmedBlueprintContinuity.headPaths")(
  function* <R>(
    headPaths: readonly string[],
    habitatActions: readonly StagedMutationPath[],
    headIndex: RuleRegistryIndex,
    stagedIndex: RuleRegistryIndex,
    started: number,
    context: Pick<StructuralExecutionContext<R>, "git" | "repoRoot">
  ): Effect.fn.Return<RuleReport, never, R> {
    const stagedPaths = applyStagedPathActions(headPaths, habitatActions);
    const headManifestPaths = headPaths.map(normalizeRepoPath).filter(isRuleManifestCandidatePath);
    const headPathDiagnostics = manifestPathDiagnostics(headManifestPaths);
    return yield* Effect.if(headPathDiagnostics.length > 0, {
      onTrue: () => continuityReportAt(started, headPathDiagnostics),
      onFalse: () =>
        continuityFromAdmittedHeadPathsEffect<R>(
          headPaths,
          stagedPaths,
          habitatActions,
          headManifestPaths,
          headIndex,
          stagedIndex,
          started,
          context
        ),
    });
  }
);

const continuityFromAdmittedHeadPathsEffect = Effect.fn(
  "check.affirmedBlueprintContinuity.admittedHeadPaths"
)(function* <R>(
  headPaths: readonly string[],
  stagedPaths: readonly string[],
  habitatActions: readonly StagedMutationPath[],
  headManifestPaths: readonly string[],
  headIndex: RuleRegistryIndex,
  stagedIndex: RuleRegistryIndex,
  started: number,
  context: Pick<StructuralExecutionContext<R>, "git" | "repoRoot">
): Effect.fn.Return<RuleReport, never, R> {
  const headRead = yield* readRegistryRecordsEffect<R>(
    headManifestPaths,
    (repoPath) => context.git.show("HEAD", repoPath, { cwd: context.repoRoot }),
    "HEAD",
    headIndex.ownerRoots
  );
  return yield* Match.value(headRead).pipe(
    Match.when({ status: "refused" }, ({ diagnostics }) =>
      continuityReportAt(started, diagnostics)
    ),
    Match.when({ status: "admitted" }, ({ rules }) =>
      continuityFromHeadRulesEffect<R>(
        headPaths,
        stagedPaths,
        habitatActions,
        rules,
        stagedIndex,
        started,
        context
      )
    ),
    Match.exhaustive
  );
});

const continuityFromHeadRulesEffect = Effect.fn("check.affirmedBlueprintContinuity.headRules")(
  function* <R>(
    headPaths: readonly string[],
    stagedPaths: readonly string[],
    habitatActions: readonly StagedMutationPath[],
    headRules: readonly RuleRegistryRecord[],
    stagedIndex: RuleRegistryIndex,
    started: number,
    context: Pick<StructuralExecutionContext<R>, "git" | "repoRoot">
  ): Effect.fn.Return<RuleReport, never, R> {
    const stagedManifestPaths = stagedPaths.filter(isRuleManifestCandidatePath);
    const stagedPathDiagnostics = manifestPathDiagnostics(stagedManifestPaths);
    return yield* Effect.if(stagedPathDiagnostics.length > 0, {
      onTrue: () => continuityReportAt(started, stagedPathDiagnostics),
      onFalse: () =>
        continuityFromAdmittedStagedPathsEffect<R>(
          headPaths,
          stagedPaths,
          habitatActions,
          headRules,
          stagedIndex,
          started,
          context
        ),
    });
  }
);

const continuityFromAdmittedStagedPathsEffect = Effect.fn(
  "check.affirmedBlueprintContinuity.admittedStagedPaths"
)(function* <R>(
  headPaths: readonly string[],
  stagedPaths: readonly string[],
  habitatActions: readonly StagedMutationPath[],
  headRules: readonly RuleRegistryRecord[],
  stagedIndex: RuleRegistryIndex,
  started: number,
  context: Pick<StructuralExecutionContext<R>, "git" | "repoRoot">
): Effect.fn.Return<RuleReport, never, R> {
  const changedManifestPaths = stagedManifestDestinations(habitatActions).filter((repoPath) =>
    stagedPaths.includes(repoPath)
  );
  const changedManifestPathSet = new Set(changedManifestPaths);
  const inheritedHeadRules = headRules.filter(
    (rule) =>
      Boolean(rule.manifestFilePath) &&
      stagedPaths.includes(rule.manifestFilePath ?? "") &&
      !changedManifestPathSet.has(rule.manifestFilePath ?? "")
  );
  const stagedRead = yield* readRegistryRecordsEffect<R>(
    changedManifestPaths,
    (repoPath) => context.git.showIndex(repoPath, { cwd: context.repoRoot }),
    "staged index",
    stagedIndex.ownerRoots,
    inheritedHeadRules
  );
  return yield* Match.value(stagedRead).pipe(
    Match.when({ status: "refused" }, ({ diagnostics }) =>
      continuityReportAt(started, diagnostics)
    ),
    Match.when({ status: "admitted" }, ({ rules }) =>
      continuityReportAt(
        started,
        stagedContinuityDiagnostics(headPaths, headRules, stagedPaths, rules, stagedIndex)
      )
    ),
    Match.exhaustive
  );
});

const readRegistryIndexEffect = Effect.fn("check.affirmedBlueprintContinuity.readRegistryIndex")(
  function* <R>(
    read: RegistryBlobRead<R>,
    source: string
  ): Effect.fn.Return<RegistryIndexReadResult, never, R> {
    const text = yield* read;
    const admission = Option.match(Option.fromNullable(text), {
      onNone: () =>
        Effect.succeed(
          registryIndexReadRefused(
            `Unable to read ${source} registry index ${continuityAuthority.registryIndex}.`
          )
        ),
      onSome: (contents) => parsePresentRegistryIndexEffect(contents, source),
    });
    return yield* admission;
  }
);

const parsePresentRegistryIndexEffect = Effect.fn(
  "check.affirmedBlueprintContinuity.parsePresentRegistryIndex"
)(function* (contents: string, source: string): Effect.fn.Return<RegistryIndexReadResult> {
  return yield* decodeJsonText(contents).pipe(
    Effect.flatMap((parsed) =>
      Effect.try({
        try: () => Value.Parse(RuleRegistryIndexSchema, parsed),
        catch: errorMessage,
      })
    ),
    Effect.match({
      onFailure: (error) =>
        registryIndexReadRefused(`${source} registry index is malformed: ${error}.`),
      onSuccess: (index) => ({ status: "admitted" as const, index }),
    })
  );
});

const readRegistryRecordsEffect = Effect.fn("check.affirmedBlueprintContinuity.readRegistry")(
  function* <R>(
    manifestPaths: readonly string[],
    read: RegistryBlobReader<R>,
    source: string,
    ownerRoots: Readonly<Record<string, string>>,
    inheritedRules: readonly RuleRegistryRecord[] = []
  ): Effect.fn.Return<RegistryReadResult, never, R> {
    const reads = yield* Effect.all(
      manifestPaths.map((manifestPath) =>
        read(manifestPath).pipe(
          Effect.flatMap((text) => parseManifestRecordEffect(text, manifestPath, source))
        )
      ),
      { concurrency: 4 }
    );
    const diagnostics = manifestReadDiagnostics(reads);
    return yield* Match.value(diagnostics.length).pipe(
      Match.when(
        (length) => length > 0,
        () => Effect.succeed({ status: "refused" as const, diagnostics })
      ),
      Match.orElse(() =>
        Effect.succeed(
          registryAdmission(
            [...inheritedRules, ...admittedManifestRules(reads)],
            source,
            ownerRoots
          )
        )
      )
    );
  }
);

function stagedRegistryDiagnostics(
  rules: readonly RuleRegistryRecord[],
  index: RuleRegistryIndex
): HabitatDiagnostic[] {
  const parsed = parseRuleRegistryDocument(
    {
      schemaVersion: index.schemaVersion,
      ownerRoots: index.ownerRoots,
      rules,
    },
    continuityAuthority.registryIndex
  );
  return Match.value(parsed).pipe(
    Match.when({ ok: false }, ({ issues }) => issues.map(registryIssueDiagnostic)),
    Match.when({ ok: true }, () => []),
    Match.exhaustive
  );
}

function stagedContinuityDiagnostics(
  headPaths: readonly string[],
  headRules: readonly RuleRegistryRecord[],
  stagedPaths: readonly string[],
  stagedRules: readonly RuleRegistryRecord[],
  stagedIndex: RuleRegistryIndex
): HabitatDiagnostic[] {
  const registryDiagnostics = stagedRegistryDiagnostics(stagedRules, stagedIndex);
  const continuityDiagnostics = evaluateAffirmedBlueprintContinuity(
    authoritySnapshot(headPaths, headRules),
    authoritySnapshot(stagedPaths, stagedRules)
  ).map((finding) => continuityDiagnostic(finding.path, finding.message));
  return [...registryDiagnostics, ...continuityDiagnostics];
}

const parseManifestRecordEffect = Effect.fn("check.affirmedBlueprintContinuity.parseManifest")(
  function* (
    text: string | null,
    manifestPath: string,
    source: string
  ): Effect.fn.Return<ManifestReadResult> {
    const admission = Option.match(Option.fromNullable(text), {
      onNone: () =>
        Effect.succeed(
          manifestReadRefused(
            manifestPath,
            `Unable to read ${source} rule manifest ${manifestPath}.`
          )
        ),
      onSome: (contents) => parsePresentManifestRecordEffect(contents, manifestPath, source),
    });
    return yield* admission;
  }
);

const parsePresentManifestRecordEffect = Effect.fn(
  "check.affirmedBlueprintContinuity.parsePresentManifest"
)(function* (
  contents: string,
  manifestPath: string,
  source: string
): Effect.fn.Return<ManifestReadResult> {
  return yield* decodeJsonText(contents).pipe(
    Effect.flatMap((parsed) =>
      Effect.try({
        try: () =>
          Value.Parse(
            RuleRegistryRecordSchema,
            EffectRecord.set(
              Value.Parse(
                RuleManifestObjectSchema,
                Value.Parse(RuleRegistryRecordInputSchema, parsed)
              ),
              "manifestFilePath",
              manifestPath
            )
          ),
        catch: errorMessage,
      })
    ),
    Effect.match({
      onFailure: (error) =>
        manifestReadRefused(manifestPath, `${source} rule manifest is malformed: ${error}.`),
      onSuccess: (rule) => ({ status: "admitted" as const, rule }),
    })
  );
});

function registryAdmission(
  rules: readonly RuleRegistryRecord[],
  source: string,
  ownerRoots: Readonly<Record<string, string>>
): RegistryReadResult {
  const parsed = parseRuleRegistryDocument(
    {
      schemaVersion: 2,
      ownerRoots,
      rules,
    },
    `${source} Habitat registry`
  );
  return Match.value(parsed).pipe(
    Match.when({ ok: false }, ({ issues }) => ({
      status: "refused" as const,
      diagnostics: issues.map(registryIssueDiagnostic),
    })),
    Match.when({ ok: true }, ({ document }) => ({
      status: "admitted" as const,
      rules: document.rules,
    })),
    Match.exhaustive
  );
}

function manifestReadDiagnostics(reads: readonly ManifestReadResult[]): HabitatDiagnostic[] {
  return reads.flatMap((result) =>
    Match.value(result).pipe(
      Match.when({ status: "refused" }, ({ diagnostic }) => [diagnostic]),
      Match.when({ status: "admitted" }, () => []),
      Match.exhaustive
    )
  );
}

function admittedManifestRules(reads: readonly ManifestReadResult[]): RuleRegistryRecord[] {
  return reads.flatMap((result) =>
    Match.value(result).pipe(
      Match.when({ status: "admitted" }, ({ rule }) => [rule]),
      Match.when({ status: "refused" }, () => []),
      Match.exhaustive
    )
  );
}

function manifestReadRefused(path: string, message: string): ManifestReadResult {
  return {
    status: "refused",
    diagnostic: continuityDiagnostic(path, message),
  };
}

function registryIndexReadRefused(message: string): RegistryIndexReadResult {
  return {
    status: "refused",
    diagnostic: continuityDiagnostic(continuityAuthority.registryIndex, message),
  };
}

function authoritySnapshot(
  paths: readonly string[],
  rules: readonly RuleRegistryRecord[]
): RuleRegistryAuthoritySnapshot {
  return {
    paths,
    rules: rules.map(ruleAuthoritySnapshot),
  };
}

function ruleAuthoritySnapshot(rule: RuleRegistryRecord): RuleAuthoritySnapshot {
  const manifestPath = rule.manifestFilePath ?? "";
  const authorityFacts = ruleAuthorityPathFacts([rule])[0];
  const authorityPaths = Option.fromNullable(authorityFacts).pipe(
    Option.match({
      onNone: () => [manifestPath],
      onSome: referencedRuleAuthorityPaths,
    })
  );
  return {
    id: rule.id,
    manifestPath,
    placementBlueprint: rule.placement.blueprint,
    authorityPaths: [...new Set(authorityPaths.map(normalizeRepoPath))],
  };
}

function stagedManifestDestinations(actions: readonly StagedMutationPath[]): string[] {
  return [
    ...new Set(
      actions
        .filter(
          ({ action }) =>
            action === "added" ||
            action === "modified" ||
            action === "renamed-to" ||
            action === "copied-to"
        )
        .map(({ path }) => normalizeRepoPath(path))
        .filter(isRuleManifestCandidatePath)
    ),
  ].sort();
}

function registryIssueDiagnostic(issue: RuleRegistryIssue): HabitatDiagnostic {
  return continuityDiagnostic(issue.path, issue.message);
}

function continuityDiagnostic(path: string, message: string): HabitatDiagnostic {
  return {
    ruleId: continuityAuthority.ruleId,
    path,
    message,
    severity: "error",
    baselined: false,
  };
}

function continuityReportAt(started: number, diagnostics: readonly HabitatDiagnostic[]) {
  return Clock.currentTimeMillis.pipe(
    Effect.map((ended) => continuityReport(diagnostics, Math.max(0, ended - started)))
  );
}

function continuityReport(
  diagnostics: readonly HabitatDiagnostic[],
  durationMs: number
): RuleReport {
  const disposition = { kind: "executed" as const };
  const reportDiagnostics = [...diagnostics];
  return {
    ruleId: continuityAuthority.ruleId,
    runner: "habitat",
    lane: "enforced",
    status: deriveRuleReportStatus({
      lane: "enforced",
      disposition,
      diagnostics: reportDiagnostics,
    }),
    locked: true,
    durationMs,
    disposition,
    diagnostics: reportDiagnostics,
    message:
      "Affirmed blueprint rule identity and ownership remain monotonic across the staged commit.",
    remediate:
      "Keep the rule inside its affirmed blueprint, stage the complete declared authority packet, or retire the complete packet atomically.",
  };
}

function manifestPathDiagnostics(paths: readonly string[]): HabitatDiagnostic[] {
  return ruleManifestPathAdmissionIssues(paths).map(({ path: issuePath, message }) =>
    continuityDiagnostic(issuePath, message)
  );
}

function isHabitatPath(repoPath: string): boolean {
  const normalized = normalizeRepoPath(repoPath);
  return (
    normalized === continuityAuthority.habitatRoot ||
    normalized.startsWith(`${continuityAuthority.habitatRoot}/`)
  );
}

function normalizeRepoPath(repoPath: string): string {
  return repoPath.replace(/\\/g, "/").replace(/^\.\//, "");
}

function errorMessage(error: unknown): string {
  return Match.value(error).pipe(
    Match.when(
      (candidate: unknown): candidate is Error => candidate instanceof Error,
      ({ message }) => message
    ),
    Match.orElse(String)
  );
}
