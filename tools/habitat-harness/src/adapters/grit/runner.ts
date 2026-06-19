import { Effect, type Layer } from "effect";
import { runHabitatEffect } from "../../lib/effect-runtime.js";
import { HabitatProcess, HabitatProcessLive } from "../../lib/habitat-process.js";
import type { RuleRunResult } from "../../rules/architecture.js";
import type { RuleGritFacts } from "../../rules/registry/index.js";
import { runDocsApplyBackedGritRules } from "./docs-apply.js";
import { infrastructureFailure } from "./failure.js";
import { projectGritResults } from "./projection.js";
import { gritCheckProgram } from "./request.js";
import {
  effectiveGritScanRoots,
  ruleHasDocsScanRoot,
  ruleUsesDocsApplyDryRun,
  selectedScanRootsForRules,
  validateScanRoots,
} from "./scan-roots/index.js";
import type { GritCheckCacheMode, GritCheckOutputFormat, GritProjectionOptions } from "./types.js";

export async function runGritRule(rule: RuleGritFacts): Promise<RuleRunResult> {
  const results = await runGritRules([rule]);
  return (
    results.get(rule.id) ?? infrastructureFailure(rule, "GritAdapterInternalContractViolation")
  );
}

export async function runGritRules(
  selectedRules: readonly RuleGritFacts[],
  options: {
    scanRoots?: readonly string[];
    processLayer?: Layer.Layer<HabitatProcess>;
    cacheMode?: GritCheckCacheMode;
    requireObservableCacheStatus?: boolean;
    allowInjectedProbeRoot?: boolean;
    projection?: GritProjectionOptions;
  } = {}
): Promise<Map<string, RuleRunResult>> {
  if (selectedRules.length === 0) return new Map();
  const docsRules = selectedRules.filter(ruleHasDocsScanRoot);
  const docsApplyBackedRules = docsRules.filter(ruleUsesDocsApplyDryRun);
  const docsCheckRules = docsRules.filter((rule) => !ruleUsesDocsApplyDryRun(rule));
  const sourceRules = selectedRules.filter((rule) => !ruleHasDocsScanRoot(rule));
  if (docsRules.length > 0 && sourceRules.length > 0) {
    return new Map([
      ...(await runGritRuleGroup(sourceRules, options, "json")),
      ...(await runDocsApplyBackedGritRules(docsApplyBackedRules, options)),
      ...(await runGritRuleGroup(docsCheckRules, options, "text")),
    ]);
  }
  if (docsApplyBackedRules.length > 0 && docsCheckRules.length > 0) {
    return new Map([
      ...(await runDocsApplyBackedGritRules(docsApplyBackedRules, options)),
      ...(await runGritRuleGroup(docsCheckRules, options, "text")),
    ]);
  }
  if (docsApplyBackedRules.length > 0) {
    return runDocsApplyBackedGritRules(docsApplyBackedRules, options);
  }
  return runGritRuleGroup(selectedRules, options, docsRules.length > 0 ? "text" : "json");
}

async function runGritRuleGroup(
  selectedRules: readonly RuleGritFacts[],
  options: {
    scanRoots?: readonly string[];
    processLayer?: Layer.Layer<HabitatProcess>;
    cacheMode?: GritCheckCacheMode;
    requireObservableCacheStatus?: boolean;
    allowInjectedProbeRoot?: boolean;
    projection?: GritProjectionOptions;
  },
  outputFormat: GritCheckOutputFormat
): Promise<Map<string, RuleRunResult>> {
  const scanRoots = effectiveGritScanRoots(
    selectedRules,
    selectedScanRootsForRules(selectedRules, options.scanRoots)
  );
  const emptyRootFailure = validateScanRoots(scanRoots, {
    allowInjectedProbeRoot: options.allowInjectedProbeRoot,
    allowDocsRoot: selectedRules.some(ruleHasDocsScanRoot),
    approvedScanRoots: selectedRules.flatMap((rule) => rule.scanRoots),
  });
  if (emptyRootFailure) {
    return new Map(
      selectedRules.map((rule) => [
        rule.id,
        infrastructureFailure(rule, "GritEmptyScanRoots", emptyRootFailure),
      ])
    );
  }

  const parseResult = await runHabitatEffect(
    gritCheckProgram(scanRoots, {
      cacheMode: options.cacheMode,
      requireObservableCacheStatus: options.requireObservableCacheStatus,
      allowInjectedProbeRoot: options.allowInjectedProbeRoot,
      allowDocsRoot: selectedRules.some(ruleHasDocsScanRoot),
      outputFormat,
    }).pipe(Effect.provide(options.processLayer ?? HabitatProcessLive))
  );
  switch (parseResult.kind) {
    case "parsed":
      return projectGritResults(selectedRules, parseResult.report, options.projection);
    case "adapter-failed":
      return new Map(
        selectedRules.map((rule) => [
          rule.id,
          infrastructureFailure(rule, parseResult.failure, parseResult.message),
        ])
      );
    case "scan-root-refused":
      return new Map(
        selectedRules.map((rule) => [
          rule.id,
          infrastructureFailure(rule, "GritEmptyScanRoots", parseResult.message),
        ])
      );
  }
}
