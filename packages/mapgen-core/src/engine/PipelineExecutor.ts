import type { MapContext } from "@mapgen/core/map-context.js";
import {
  assertMapContextInternal,
  beginMapContextExecutionInternal,
  finishMapContextExecutionInternal,
  setMapContextTraceInternal,
} from "@mapgen/core/map-context.js";
import {
  MissingDependencyError,
  PipelineAbortError,
  StepExecutionError,
  UnsatisfiedProvidesError,
} from "@mapgen/engine/errors.js";
import {
  type ExecutionPlan,
  getExecutionPlanBindingInternal,
} from "@mapgen/engine/execution-plan.js";
import {
  createTraceSessionForExecutionInternal,
  type PlanTraceOptions,
} from "@mapgen/engine/observability.js";
import type { StepRegistry } from "@mapgen/engine/StepRegistry.js";
import {
  dispatchStepFacets,
  type StepFacetSinkContext,
  type StepFacetSinks,
} from "@mapgen/engine/step-facets.js";
import {
  computeInitialSatisfiedTags,
  isDependencyTagSatisfied,
  type TagRegistry,
  validateDependencyTags,
} from "@mapgen/engine/tags.js";
import type { MapGenStep, PipelineStepResult } from "@mapgen/engine/types.js";
import type { TraceSession } from "@mapgen/trace/index.js";
import { createNoopTraceSession } from "@mapgen/trace/index.js";

export interface PipelineExecutorOptions {
  logPrefix?: string;
  log?: (message: string) => void;
}

export interface PipelineExecutionOptions {
  trace?: PlanTraceOptions | null;
  /** Optional execution-owned consumers for post-provides step evidence. */
  facets?: StepFacetSinks;
  /**
   * Optional cancellation signal for async execution. If aborted, the executor
   * will throw a PipelineAbortError between steps.
   */
  abortSignal?: { readonly aborted: boolean } | null;
  /**
   * When true, the async executor will yield to the event loop between steps.
   * This enables cooperative cancellation in runtimes where abort requests arrive
   * via message events (e.g., Web Workers).
   */
  yieldToEventLoop?: boolean;
  /**
   * Override the yield behavior when `yieldToEventLoop` is enabled.
   */
  yieldFn?: (() => Promise<void>) | null;
}

type PipelineFacetIdentity = Readonly<{
  runId: string;
  planFingerprint: string;
  dimensions: Readonly<{ width: number; height: number }>;
}>;

function facetIdentityFromPlan(
  plan: ExecutionPlan,
  planFingerprint: string,
  nodes: readonly Readonly<{ step: MapGenStep<unknown, unknown> }>[],
  runId: string,
  sinks: StepFacetSinks | undefined
): PipelineFacetIdentity | undefined {
  const hasApplicableFacet = nodes.some(
    ({ step }) =>
      (sinks?.metrics !== undefined && step.facets?.metrics !== undefined) ||
      (sinks?.viz !== undefined && step.facets?.viz !== undefined)
  );
  if (!hasApplicableFacet) return undefined;

  return Object.freeze({
    runId,
    planFingerprint,
    dimensions: Object.freeze({ ...plan.setup.dimensions }),
  });
}

function traceSessionForExecution(
  runId: string,
  planFingerprint: string,
  trace: PlanTraceOptions | null | undefined
): TraceSession {
  return trace === null || trace === undefined
    ? createNoopTraceSession()
    : createTraceSessionForExecutionInternal(runId, planFingerprint, trace);
}

function stepFacetContext(
  identity: PipelineFacetIdentity,
  step: Readonly<{ id: string; stageId: string }>,
  stepIndex: number
): StepFacetSinkContext {
  return Object.freeze({
    runId: identity.runId,
    planFingerprint: identity.planFingerprint,
    stepId: step.id,
    stageId: step.stageId,
    stepIndex,
  });
}

function nowMs(): number {
  try {
    if (typeof performance !== "undefined" && typeof performance.now === "function") {
      return performance.now();
    }
  } catch {
    // ignore
  }
  return Date.now();
}

function assertPlanContextSetup(context: MapContext, plan: ExecutionPlan): void {
  if (context.setup === plan.setup) return;
  throw new Error(
    "Pipeline context setup must be the exact admitted setup retained by the execution plan."
  );
}

/**
 * Executes compiled plan nodes against their registered step implementations.
 *
 * Every public plan entrypoint rejects execution unless `context.setup` is the exact admitted
 * object retained by the plan; structurally equal setups admitted separately cannot cross runs.
 */
export class PipelineExecutor {
  private readonly registry: StepRegistry;
  private readonly log: (message: string) => void;
  private readonly logPrefix: string;

  constructor(registry: StepRegistry, options: PipelineExecutorOptions = {}) {
    this.registry = registry;
    this.log = options.log ?? (() => undefined);
    this.logPrefix = options.logPrefix ?? "[PipelineExecutor]";
  }

  /** Executes synchronously and throws on the first failed step or violated invariant. */
  executePlan(
    context: MapContext,
    plan: ExecutionPlan,
    options: PipelineExecutionOptions = {}
  ): { stepResults: PipelineStepResult[]; satisfied: ReadonlySet<string> } {
    assertMapContextInternal(context);
    const binding = getExecutionPlanBindingInternal(plan, this.registry);
    assertPlanContextSetup(context, plan);
    const runId = beginMapContextExecutionInternal(context);
    try {
      const trace = traceSessionForExecution(runId, binding.fingerprint, options.trace);
      const facetIdentity = facetIdentityFromPlan(
        plan,
        binding.fingerprint,
        binding.nodes,
        runId,
        options.facets
      );
      return this.executeNodes(
        context,
        binding.nodes,
        binding.tagRegistry,
        options,
        trace,
        "throw",
        facetIdentity
      );
    } finally {
      finishMapContextExecutionInternal(context);
    }
  }

  /** Executes synchronously while returning failed step evidence instead of rethrowing it. */
  executePlanReport(
    context: MapContext,
    plan: ExecutionPlan,
    options: PipelineExecutionOptions = {}
  ): { stepResults: PipelineStepResult[]; satisfied: ReadonlySet<string> } {
    assertMapContextInternal(context);
    const binding = getExecutionPlanBindingInternal(plan, this.registry);
    assertPlanContextSetup(context, plan);
    const runId = beginMapContextExecutionInternal(context);
    try {
      const trace = traceSessionForExecution(runId, binding.fingerprint, options.trace);
      const facetIdentity = facetIdentityFromPlan(
        plan,
        binding.fingerprint,
        binding.nodes,
        runId,
        options.facets
      );
      return this.executeNodes(
        context,
        binding.nodes,
        binding.tagRegistry,
        options,
        trace,
        "report",
        facetIdentity
      );
    } finally {
      finishMapContextExecutionInternal(context);
    }
  }

  private executeNodes(
    context: MapContext,
    nodes: readonly Readonly<{
      step: MapGenStep<unknown, unknown>;
      config: Readonly<Record<string, unknown>>;
    }>[],
    tagRegistry: TagRegistry,
    options: PipelineExecutionOptions,
    trace: TraceSession,
    mode: "throw" | "report",
    facetIdentity: PipelineFacetIdentity | undefined
  ): { stepResults: PipelineStepResult[]; satisfied: ReadonlySet<string> } {
    const stepResults: PipelineStepResult[] = [];
    const satisfied = computeInitialSatisfiedTags(context);
    const satisfactionState = { satisfied };
    const baseTrace = context.trace;

    const total = nodes.length;

    trace.emitRunStart();

    try {
      for (let index = 0; index < total; index++) {
        const node = nodes[index];
        const step = node.step;
        validateDependencyTags(step.requires, tagRegistry);
        validateDependencyTags(step.provides, tagRegistry);

        const missing = step.requires.filter(
          (tag) => !isDependencyTagSatisfied(tag, context, satisfactionState, tagRegistry)
        );
        if (missing.length > 0) {
          throw new MissingDependencyError({
            stepId: step.id,
            missing,
            satisfied: Array.from(satisfied).sort(),
          });
        }

        const stepMeta = { stepId: step.id, stageId: step.stageId };
        const previousTrace = context.trace;
        setMapContextTraceInternal(context, trace.createStepScope(stepMeta));

        this.log(`${this.logPrefix} [${index + 1}/${total}] start ${step.id}`);
        trace.emitStepStart(stepMeta);
        const t0 = nowMs();
        try {
          const result = step.run(context, node.config);
          if (result && typeof (result as PromiseLike<unknown>).then === "function") {
            throw new Error(
              `Step "${step.id}" returned a Promise in a sync executor call. Use executePlanAsync().`
            );
          }
          for (const tag of step.provides) satisfied.add(tag);

          const missingProvides = step.provides.filter(
            (tag) => !isDependencyTagSatisfied(tag, context, satisfactionState, tagRegistry)
          );
          if (missingProvides.length > 0) {
            throw new UnsatisfiedProvidesError(step.id, missingProvides);
          }

          if (facetIdentity) {
            dispatchStepFacets({
              facets: step.facets,
              sinks: options.facets,
              result,
              config: node.config,
              dimensions: facetIdentity.dimensions,
              context: stepFacetContext(facetIdentity, step, index),
            });
          }

          const durationMs = nowMs() - t0;
          this.log(
            `${this.logPrefix} [${index + 1}/${total}] ok ${step.id} (${durationMs.toFixed(2)}ms)`
          );
          trace.emitStepFinish({ ...stepMeta, durationMs, success: true });
          stepResults.push({ stepId: step.id, success: true, durationMs });
        } catch (err) {
          const durationMs = nowMs() - t0;
          const errorMessage = err instanceof Error ? err.message : String(err);
          this.log(
            `${this.logPrefix} [${index + 1}/${total}] fail ${step.id} (${durationMs.toFixed(
              2
            )}ms): ${errorMessage}`
          );
          trace.emitStepFinish({
            ...stepMeta,
            durationMs,
            success: false,
            error: errorMessage,
          });
          stepResults.push({
            stepId: step.id,
            success: false,
            durationMs,
            error: errorMessage,
          });
          if (mode === "throw") {
            throw err instanceof StepExecutionError || err instanceof PipelineAbortError
              ? err
              : new StepExecutionError(step.id, err);
          }
          break;
        } finally {
          setMapContextTraceInternal(context, previousTrace);
        }
      }

      const success = stepResults.every((result) => result.success);
      const error = stepResults.find((result) => !result.success)?.error;
      trace.emitRunFinish({ success, error });
      return { stepResults, satisfied };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      trace.emitRunFinish({ success: false, error: errorMessage });
      throw err;
    } finally {
      setMapContextTraceInternal(context, baseTrace);
    }
  }

  /** Executes asynchronously with optional cooperative cancellation and event-loop yielding. */
  async executePlanAsync(
    context: MapContext,
    plan: ExecutionPlan,
    options: PipelineExecutionOptions = {}
  ): Promise<{ stepResults: PipelineStepResult[]; satisfied: ReadonlySet<string> }> {
    assertMapContextInternal(context);
    const binding = getExecutionPlanBindingInternal(plan, this.registry);
    assertPlanContextSetup(context, plan);
    const runId = beginMapContextExecutionInternal(context);
    try {
      const trace = traceSessionForExecution(runId, binding.fingerprint, options.trace);
      const facetIdentity = facetIdentityFromPlan(
        plan,
        binding.fingerprint,
        binding.nodes,
        runId,
        options.facets
      );
      return await this.executeNodesAsync(
        context,
        binding.nodes,
        binding.tagRegistry,
        options,
        trace,
        "throw",
        facetIdentity
      );
    } finally {
      finishMapContextExecutionInternal(context);
    }
  }

  /** Executes asynchronously while returning failed step evidence instead of rethrowing it. */
  async executePlanReportAsync(
    context: MapContext,
    plan: ExecutionPlan,
    options: PipelineExecutionOptions = {}
  ): Promise<{ stepResults: PipelineStepResult[]; satisfied: ReadonlySet<string> }> {
    assertMapContextInternal(context);
    const binding = getExecutionPlanBindingInternal(plan, this.registry);
    assertPlanContextSetup(context, plan);
    const runId = beginMapContextExecutionInternal(context);
    try {
      const trace = traceSessionForExecution(runId, binding.fingerprint, options.trace);
      const facetIdentity = facetIdentityFromPlan(
        plan,
        binding.fingerprint,
        binding.nodes,
        runId,
        options.facets
      );
      return await this.executeNodesAsync(
        context,
        binding.nodes,
        binding.tagRegistry,
        options,
        trace,
        "report",
        facetIdentity
      );
    } finally {
      finishMapContextExecutionInternal(context);
    }
  }

  private async executeNodesAsync(
    context: MapContext,
    nodes: readonly Readonly<{
      step: MapGenStep<unknown, unknown>;
      config: Readonly<Record<string, unknown>>;
    }>[],
    tagRegistry: TagRegistry,
    options: PipelineExecutionOptions,
    trace: TraceSession,
    mode: "throw" | "report",
    facetIdentity: PipelineFacetIdentity | undefined
  ): Promise<{ stepResults: PipelineStepResult[]; satisfied: ReadonlySet<string> }> {
    const stepResults: PipelineStepResult[] = [];
    const satisfied = computeInitialSatisfiedTags(context);
    const satisfactionState = { satisfied };
    const baseTrace = context.trace;

    const total = nodes.length;

    const abortSignal = options.abortSignal ?? null;
    const yieldFn: (() => Promise<void>) | null =
      options.yieldFn ??
      (options.yieldToEventLoop ? () => new Promise((r) => setTimeout(r, 0)) : null);

    trace.emitRunStart();

    try {
      for (let index = 0; index < total; index++) {
        if (abortSignal?.aborted) throw new PipelineAbortError();

        const node = nodes[index];
        const step = node.step;
        validateDependencyTags(step.requires, tagRegistry);
        validateDependencyTags(step.provides, tagRegistry);

        const missing = step.requires.filter(
          (tag) => !isDependencyTagSatisfied(tag, context, satisfactionState, tagRegistry)
        );
        if (missing.length > 0) {
          throw new MissingDependencyError({
            stepId: step.id,
            missing,
            satisfied: Array.from(satisfied).sort(),
          });
        }

        const stepMeta = { stepId: step.id, stageId: step.stageId };
        const previousTrace = context.trace;
        setMapContextTraceInternal(context, trace.createStepScope(stepMeta));

        this.log(`${this.logPrefix} [${index + 1}/${total}] start ${step.id}`);
        trace.emitStepStart(stepMeta);
        const t0 = nowMs();
        try {
          const result = await step.run(context, node.config);
          for (const tag of step.provides) satisfied.add(tag);

          const missingProvides = step.provides.filter(
            (tag) => !isDependencyTagSatisfied(tag, context, satisfactionState, tagRegistry)
          );
          if (missingProvides.length > 0) {
            throw new UnsatisfiedProvidesError(step.id, missingProvides);
          }
          if (abortSignal?.aborted) throw new PipelineAbortError();
          if (facetIdentity) {
            dispatchStepFacets({
              facets: step.facets,
              sinks: options.facets,
              result,
              config: node.config,
              dimensions: facetIdentity.dimensions,
              context: stepFacetContext(facetIdentity, step, index),
            });
          }

          const durationMs = nowMs() - t0;
          this.log(
            `${this.logPrefix} [${index + 1}/${total}] ok ${step.id} (${durationMs.toFixed(2)}ms)`
          );
          trace.emitStepFinish({ ...stepMeta, durationMs, success: true });
          stepResults.push({ stepId: step.id, success: true, durationMs });
        } catch (err) {
          const durationMs = nowMs() - t0;
          const errorMessage = err instanceof Error ? err.message : String(err);
          this.log(
            `${this.logPrefix} [${index + 1}/${total}] fail ${step.id} (${durationMs.toFixed(
              2
            )}ms): ${errorMessage}`
          );
          trace.emitStepFinish({
            ...stepMeta,
            durationMs,
            success: false,
            error: errorMessage,
          });
          stepResults.push({
            stepId: step.id,
            success: false,
            durationMs,
            error: errorMessage,
          });
          if (err instanceof PipelineAbortError) throw err;
          if (mode === "throw") {
            throw err instanceof StepExecutionError || err instanceof PipelineAbortError
              ? err
              : new StepExecutionError(step.id, err);
          }
          break;
        } finally {
          setMapContextTraceInternal(context, previousTrace);
        }

        // If enabled, yield between steps to allow cancellation/messages to be processed.
        if (yieldFn && index + 1 < total) {
          await yieldFn();
        }
      }

      const success = stepResults.every((result) => result.success);
      const error = stepResults.find((result) => !result.success)?.error;
      trace.emitRunFinish({ success, error });
      return { stepResults, satisfied };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      trace.emitRunFinish({ success: false, error: errorMessage });
      throw err;
    } finally {
      setMapContextTraceInternal(context, baseTrace);
    }
  }
}
