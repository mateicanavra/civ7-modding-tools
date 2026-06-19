import { Value } from "typebox/value";
import {
  HostApplyGateDecisionSchema,
  HostAuthoringBoundaryStateSchema,
  HostProjectSupportDecisionSchema,
  HostSurfaceDecisionSchema,
  type HostApplyGateDecision,
  type HostAuthoringBoundaryState,
  type HostMatcher,
  type HostPolicyDeclaration,
  type HostPolicyDocument,
  type HostPolicyOwner,
  type HostPolicySourceState,
  type HostPolicyState,
  type HostProjectSupportDecision,
  type HostRecoveryInstruction,
  type HostSurfaceDecision,
} from "./schema.js";
import { defaultHostPolicyState } from "./state.js";

type SurfaceDeclaration = Extract<HostPolicyDeclaration, { matcher: HostMatcher }>;
type GeneratedSurfaceDeclaration = Extract<
  HostPolicyDeclaration,
  { generatedZoneId: string; matcher: HostMatcher }
>;
type ApplyGateDeclaration = Extract<HostPolicyDeclaration, { kind: "apply-gate" }>;
type ProjectSupportDeclaration = Extract<
  HostPolicyDeclaration,
  { kind: "project-support" | "unsupported-host-shape" }
>;

export function hostSurfaceDecisionForPath(
  candidate: string,
  state: HostPolicyState = defaultHostPolicyState
): HostSurfaceDecision {
  if (state.kind !== "declared") return blockedSurfaceDecision(candidate, state);
  const declaration = surfaceDeclarations(state.document).find((item) =>
    matchesHostMatcher(item.matcher, candidate)
  );
  if (!declaration) return notHostOwnedSurfaceDecision(state.document.policyId);
  return declaredSurfaceDecision(state.document, declaration);
}

export function hostSurfaceDecisionForScanRoot(
  candidate: string,
  state: HostPolicyState = defaultHostPolicyState
): HostSurfaceDecision {
  if (state.kind !== "declared") return blockedSurfaceDecision(candidate, state);
  const declaration = surfaceDeclarations(state.document).find((item) =>
    matchesHostScanRoot(item.matcher, candidate)
  );
  if (!declaration) return notHostOwnedSurfaceDecision(state.document.policyId);
  return declaredSurfaceDecision(state.document, declaration);
}

export function hostSurfaceDecisionForGeneratedZone(
  generatedZoneId: string,
  state: HostPolicyState = defaultHostPolicyState
): HostSurfaceDecision {
  if (state.kind !== "declared") {
    return blockedSurfaceDecision(generatedZoneId, state);
  }
  const declaration = generatedSurfaceDeclarations(state.document).find(
    (item) => item.generatedZoneId === generatedZoneId
  );
  if (!declaration) {
    return missingGeneratedZoneDecision(generatedZoneId, state.document.policyId);
  }
  return declaredSurfaceDecision(state.document, declaration);
}

export function hostApplyGateDecision(
  gateId: string,
  state: HostPolicyState = defaultHostPolicyState
): HostApplyGateDecision {
  if (state.kind !== "declared") {
    return Value.Parse(HostApplyGateDecisionSchema, {
      kind: "host-apply-gate-decision",
      gateId,
      policyId: state.policyId,
      declarationState: state.kind,
    });
  }
  const declaration = state.document.declarations.find(
    (item): item is ApplyGateDeclaration =>
      item.kind === "apply-gate" && item.gateId === gateId
  );
  return Value.Parse(HostApplyGateDecisionSchema, {
    kind: "host-apply-gate-decision",
    gateId,
    policyId: state.document.policyId,
    declarationId: declaration?.declarationId,
    triggerClass: declaration?.triggerClass,
    gateContract: declaration?.gateContract,
    recovery: declaration?.recovery,
    declarationState: declaration ? "declared" : "missing",
  });
}

export function hostProjectSupportDecision(
  requestClass: string,
  state: HostPolicyState = defaultHostPolicyState
): HostProjectSupportDecision {
  if (state.kind !== "declared") {
    return projectSupportDecision(requestClass, state.kind, "blocked");
  }
  const declaration = state.document.declarations.find(
    (item): item is ProjectSupportDeclaration =>
      (item.kind === "project-support" ||
        item.kind === "unsupported-host-shape") &&
      item.requestClass === requestClass
  );
  if (!declaration) return projectSupportDecision(requestClass, "missing", "blocked");
  return Value.Parse(HostProjectSupportDecisionSchema, {
    kind: "host-project-support-decision",
    requestClass,
    supportState: declaration.kind === "project-support" ? declaration.supportState : "refused",
    declarationId: declaration.declarationId,
    owner: ownerForDeclaration(state.document, declaration),
    noWrite: true,
    recovery: declaration.recovery,
    declarationState: "declared",
  });
}

export function hostAuthoringBoundaryState(
  scenario: string,
  state: HostPolicyState = defaultHostPolicyState
): HostAuthoringBoundaryState {
  return Value.Parse(HostAuthoringBoundaryStateSchema, {
    kind: "host-authoring-boundary-state",
    scenario,
    relation: "not-public-authority",
    declarationState: state.kind === "declared" ? "not-applicable" : state.kind,
  });
}

export function hostGeneratedSurfaceDeclarations(
  state: HostPolicyState = defaultHostPolicyState
): {
  generatedZoneId: string;
  matcher: HostMatcher;
  recovery: HostRecoveryInstruction;
}[] {
  if (state.kind !== "declared") return [];
  return generatedSurfaceDeclarations(state.document).map((item) => ({
    generatedZoneId: item.generatedZoneId,
    matcher: item.matcher,
    recovery: item.recovery,
  }));
}

export function renderHostRecoveryInstruction(
  recovery: HostRecoveryInstruction
): string {
  if (recovery.actionKind === "command" && recovery.command) {
    return `Run \`${recovery.command}\` and commit the generated output.`;
  }
  if (recovery.actionKind === "documented-workflow" && recovery.documentRef) {
    return `Regenerate through ${recovery.documentRef}; this repo cannot regenerate that surface in CI.`;
  }
  return recovery.retryCondition;
}

export function matchesHostMatcher(matcher: HostMatcher, candidate: string): boolean {
  return matcher.kind === "exact"
    ? candidate === matcher.value
    : matchesPathPrefix(matcher.value, candidate);
}

function matchesHostScanRoot(matcher: HostMatcher, candidate: string): boolean {
  if (matchesHostMatcher(matcher, candidate)) return true;
  return matcher.kind === "prefix" && candidate === matcher.value.replace(/\/$/, "");
}

function matchesPathPrefix(prefix: string, candidate: string): boolean {
  const normalizedPrefix = prefix.endsWith("/") ? prefix : `${prefix}/`;
  return candidate === prefix || candidate.startsWith(normalizedPrefix);
}

function surfaceDeclarations(document: HostPolicyDocument): SurfaceDeclaration[] {
  return document.declarations.filter(
    (item): item is SurfaceDeclaration => "matcher" in item
  );
}

function generatedSurfaceDeclarations(
  document: HostPolicyDocument
): GeneratedSurfaceDeclaration[] {
  return document.declarations.filter(
    (item): item is GeneratedSurfaceDeclaration => "generatedZoneId" in item
  );
}

function declaredSurfaceDecision(
  document: HostPolicyDocument,
  declaration: SurfaceDeclaration
): HostSurfaceDecision {
  return Value.Parse(HostSurfaceDecisionSchema, {
    kind: "host-surface-decision",
    policyId: declaration.policyId,
    declarationId: declaration.declarationId,
    owner: ownerForDeclaration(document, declaration),
    surfaceKind: surfaceKind(declaration),
    matcher: declaration.matcher,
    mutationLane: declaration.mutationLane,
    recovery: declaration.recovery,
    declarationState: "declared",
  });
}

function notHostOwnedSurfaceDecision(policyId: string): HostSurfaceDecision {
  return Value.Parse(HostSurfaceDecisionSchema, {
    kind: "host-surface-decision",
    policyId,
    surfaceKind: "not-host-owned",
    mutationLane: "allowed",
    declarationState: "not-applicable",
  });
}

function blockedSurfaceDecision(
  candidate: string,
  state: Extract<
    HostPolicyState,
    { kind: "missing" | "unavailable" | "malformed" | "conflicting" }
  >
): HostSurfaceDecision {
  return Value.Parse(HostSurfaceDecisionSchema, {
    kind: "host-surface-decision",
    policyId: state.policyId,
    surfaceKind: "not-host-owned",
    mutationLane: "blocked",
    declarationState: state.kind,
  });
}

function missingGeneratedZoneDecision(
  generatedZoneId: string,
  policyId: string
): HostSurfaceDecision {
  return Value.Parse(HostSurfaceDecisionSchema, {
    kind: "host-surface-decision",
    policyId,
    surfaceKind: "not-host-owned",
    mutationLane: "blocked",
    declarationState: "missing",
  });
}

function projectSupportDecision(
  requestClass: string,
  declarationState: HostPolicySourceState,
  supportState: "supported" | "refused" | "blocked"
): HostProjectSupportDecision {
  return Value.Parse(HostProjectSupportDecisionSchema, {
    kind: "host-project-support-decision",
    requestClass,
    supportState,
    noWrite: true,
    declarationState,
  });
}

function surfaceKind(declaration: SurfaceDeclaration): HostSurfaceDecision["surfaceKind"] {
  switch (declaration.kind) {
    case "generated-surface":
      return "generated";
    case "protected-surface":
      return "protected";
    case "external-resource-surface":
      return "external-resource";
  }
}

function ownerForDeclaration(
  document: HostPolicyDocument,
  declaration: Pick<HostPolicyDeclaration, "ownerId">
): HostPolicyOwner | undefined {
  return document.owners.find((owner) => owner.ownerId === declaration.ownerId);
}
