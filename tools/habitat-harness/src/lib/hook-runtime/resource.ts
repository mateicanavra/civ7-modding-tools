import { Value } from "typebox/value";
import {
  type ResourcePreCommitDecision,
  ResourcePreCommitDecisionSchema,
  type ResourceStateFacade,
  ResourceStateFacadeSchema,
} from "./schema.js";

type AllowedKind = Extract<ResourcePreCommitDecision, { commit: "allowed" }>["kind"];
type RefusedKind = Extract<ResourcePreCommitDecision, { commit: "refused" }>["kind"];

export function allowedResourceDecision(
  kind: AllowedKind,
  detail: string
): ResourcePreCommitDecision {
  return Value.Parse(ResourcePreCommitDecisionSchema, {
    kind,
    commit: "allowed",
    detail,
    recovery: [],
  });
}

export function refusedResourceDecision(
  kind: RefusedKind,
  detail: string,
  recovery: readonly string[]
): ResourcePreCommitDecision {
  return Value.Parse(ResourcePreCommitDecisionSchema, {
    kind,
    commit: "refused",
    detail,
    recovery,
  });
}

export function resourceAllowsPreCommit(decision: ResourcePreCommitDecision): boolean {
  return decision.commit === "allowed";
}

export function resourceDecisionToFacade(decision: ResourcePreCommitDecision): ResourceStateFacade {
  return Value.Parse(ResourceStateFacadeSchema, {
    kind: decision.kind,
    allowPreCommit: resourceAllowsPreCommit(decision),
    detail: decision.detail,
    remediation: [...decision.recovery],
  });
}

export function renderResourceDecisionFailure(decision: ResourcePreCommitDecision): string {
  if (decision.commit === "allowed") return "";
  return [
    `habitat hook pre-commit: resources state '${decision.kind}' requires explicit action.`,
    decision.detail,
    ...decision.recovery.map((command) => `- ${command}`),
    "",
  ].join("\n");
}
