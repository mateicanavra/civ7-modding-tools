import { Context, Effect, Layer } from "effect";
import type { HabitatDiagnostic } from "../../lib/diagnostics.js";
import { applyBaseline, baselineFailureDiagnostic } from "./application.js";
import type { BaselineContractContext } from "./context.js";
import {
  baselineIntegrityFindings,
  checkBaselineIntegrity,
  guardBaselineExpansion,
  writeBaseline,
} from "./integrity.js";
import type {
  BaselineApplicationResult,
  BaselineAuthorityState,
  BaselineExpansionDecision,
  BaselineIntegrityFinding,
  BaselineIntegrityResult,
  BaselineRefusal,
  BaselineRuleContractInput,
} from "./schema.js";
import { isBaselineLocked, loadBaselineState } from "./state.js";

export interface BaselineAuthorityService {
  readonly loadState: (
    rule: BaselineRuleContractInput,
    options?: BaselineContractContext
  ) => Effect.Effect<BaselineAuthorityState>;
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
    options?: BaselineContractContext
  ) => Effect.Effect<BaselineIntegrityResult>;
  readonly integrityFindings: (
    result: BaselineIntegrityResult
  ) => Effect.Effect<BaselineIntegrityFinding[]>;
  readonly guardExpansion: (
    ruleId: string,
    keys: readonly string[],
    base?: string,
    options?: BaselineContractContext
  ) => Effect.Effect<BaselineExpansionDecision>;
  readonly write: (
    ruleId: string,
    keys: string[],
    options?: BaselineContractContext
  ) => Effect.Effect<void>;
}

export class BaselineAuthority extends Context.Tag("@internal/habitat-harness/BaselineAuthority")<
  BaselineAuthority,
  BaselineAuthorityService
>() {}

export const BaselineAuthorityLive = Layer.succeed(BaselineAuthority, {
  loadState: (rule, options) => Effect.sync(() => loadBaselineState(rule, options)),
  apply: (diagnostics, baseline) => Effect.sync(() => applyBaseline(diagnostics, baseline)),
  isLocked: (state) => Effect.sync(() => isBaselineLocked(state)),
  failureDiagnostic: (ruleId, refusal) =>
    Effect.sync(() => baselineFailureDiagnostic(ruleId, refusal)),
  checkIntegrity: (base, options) => Effect.sync(() => checkBaselineIntegrity(base, options)),
  integrityFindings: (result) => Effect.sync(() => baselineIntegrityFindings(result)),
  guardExpansion: (ruleId, keys, base, options) =>
    Effect.sync(() => guardBaselineExpansion(ruleId, keys, base, options)),
  write: (ruleId, keys, options) => Effect.sync(() => writeBaseline(ruleId, keys, options)),
});

export function makeFakeBaselineAuthorityLayer(service: BaselineAuthorityService) {
  return Layer.succeed(BaselineAuthority, service);
}
