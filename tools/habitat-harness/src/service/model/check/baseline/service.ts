import type { FileSystem } from "@effect/platform";
import type { HabitatDiagnostic } from "@internal/habitat-harness/service/model/check/structural/schema";
import type { FileWriteFailed } from "@internal/habitat-harness/service/runtime/errors/index";
import type {
  GitProvider,
  GitProviderRequirements,
} from "@internal/habitat-harness/service/runtime/git/index";
import { Context, Effect, Layer } from "effect";
import { applyBaseline, baselineFailureDiagnostic } from "./application.js";
import type { BaselineAuthorityContext } from "./context.js";
import {
  baselineIntegrityFindingsEffect,
  checkBaselineIntegrityEffect,
  guardBaselineExpansionEffect,
  loadBaselineStateEffect,
  writeBaselineEffect,
} from "./operations.js";
import type {
  BaselineApplicationResult,
  BaselineAuthorityState,
  BaselineExpansionDecision,
  BaselineIntegrityFinding,
  BaselineIntegrityResult,
  BaselineRefusal,
  BaselineRuleContractInput,
} from "./schema.js";
import { isBaselineLocked } from "./state.js";

export interface BaselineAuthorityService {
  readonly loadState: (
    rule: BaselineRuleContractInput,
    options?: BaselineAuthorityContext
  ) => Effect.Effect<BaselineAuthorityState, never, FileSystem.FileSystem>;
  readonly apply: (
    diagnostics: HabitatDiagnostic[],
    baseline: Set<string> | BaselineAuthorityState
  ) => Effect.Effect<BaselineApplicationResult>;
  readonly isLocked: (state: BaselineAuthorityState) => Effect.Effect<boolean>;
  readonly failureDiagnostic: (
    ruleId: string,
    refusal: BaselineRefusal
  ) => Effect.Effect<HabitatDiagnostic>;
  readonly checkIntegrity: (
    base?: string,
    options?: BaselineAuthorityContext
  ) => Effect.Effect<
    BaselineIntegrityResult,
    never,
    FileSystem.FileSystem | GitProvider | GitProviderRequirements
  >;
  readonly integrityFindings: (
    result: BaselineIntegrityResult
  ) => Effect.Effect<BaselineIntegrityFinding[]>;
  readonly guardExpansion: (
    ruleId: string,
    keys: readonly string[],
    base?: string,
    options?: BaselineAuthorityContext
  ) => Effect.Effect<
    BaselineExpansionDecision,
    never,
    FileSystem.FileSystem | GitProvider | GitProviderRequirements
  >;
  readonly write: (
    ruleId: string,
    keys: string[],
    options?: BaselineAuthorityContext
  ) => Effect.Effect<void, FileWriteFailed, FileSystem.FileSystem>;
}

export class BaselineAuthority extends Context.Tag("@internal/habitat-harness/BaselineAuthority")<
  BaselineAuthority,
  BaselineAuthorityService
>() {}

export const BaselineAuthorityLive = Layer.succeed(BaselineAuthority, {
  loadState: (rule, options) => loadBaselineStateEffect(rule, options),
  apply: (diagnostics, baseline) => Effect.sync(() => applyBaseline(diagnostics, baseline)),
  isLocked: (state) => Effect.sync(() => isBaselineLocked(state)),
  failureDiagnostic: (ruleId, refusal) =>
    Effect.sync(() => baselineFailureDiagnostic(ruleId, refusal)),
  checkIntegrity: (base, options) => checkBaselineIntegrityEffect(base, options),
  integrityFindings: baselineIntegrityFindingsEffect,
  guardExpansion: (ruleId, keys, base, options) =>
    guardBaselineExpansionEffect(ruleId, keys, base, options),
  write: (ruleId, keys, options) => writeBaselineEffect(ruleId, keys, options),
});

export function makeFakeBaselineAuthorityLayer(service: BaselineAuthorityService) {
  return Layer.succeed(BaselineAuthority, service);
}
