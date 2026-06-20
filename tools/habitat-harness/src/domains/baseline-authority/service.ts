import { Context, Effect, Layer } from "effect";
import type { FileWriteFailed } from "../../errors/index.js";
import type { HabitatDiagnostic } from "../../lib/diagnostics.js";
import type { GitProvider, GitProviderRequirements } from "../../providers/git/index.js";
import type { HabitatFileSystem } from "../../resources/index.js";
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
  ) => Effect.Effect<BaselineAuthorityState, never, HabitatFileSystem>;
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
    HabitatFileSystem | GitProvider | GitProviderRequirements
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
    HabitatFileSystem | GitProvider | GitProviderRequirements
  >;
  readonly write: (
    ruleId: string,
    keys: string[],
    options?: BaselineAuthorityContext
  ) => Effect.Effect<void, FileWriteFailed, HabitatFileSystem>;
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
