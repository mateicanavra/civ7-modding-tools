import { Value } from "typebox/value";
import {
  HostApplyGateProjectionSchema,
  HostAuthoringBoundaryProjectionSchema,
  HostProjectSupportProjectionSchema,
  HostSurfaceProjectionSchema,
  type HostApplyGateProjection,
  type HostAuthoringBoundaryProjection,
  type HostMatcher,
  type HostPolicyDeclaration,
  type HostPolicyDocument,
  type HostPolicyOwner,
  type HostPolicySourceState,
  type HostPolicyState,
  type HostProjectSupportProjection,
  type HostRecoveryInstruction,
  type HostSurfaceProjection,
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

export function hostSurfaceProjectionForPath(
  candidate: string,
  state: HostPolicyState = defaultHostPolicyState
): HostSurfaceProjection {
  if (state.kind !== "declared") return blockedSurfaceProjection(candidate, state);
  const declaration = surfaceDeclarations(state.document).find((item) =>
    matchesHostMatcher(item.matcher, candidate)
  );
  if (!declaration) return notHostOwnedSurfaceProjection(state.document.policyId);
  return declaredSurfaceProjection(state.document, declaration);
}

export function hostSurfaceProjectionForScanRoot(
  candidate: string,
  state: HostPolicyState = defaultHostPolicyState
): HostSurfaceProjection {
  if (state.kind !== "declared") return blockedSurfaceProjection(candidate, state);
  const declaration = surfaceDeclarations(state.document).find((item) =>
    matchesHostScanRoot(item.matcher, candidate)
  );
  if (!declaration) return notHostOwnedSurfaceProjection(state.document.policyId);
  return declaredSurfaceProjection(state.document, declaration);
}

export function hostSurfaceProjectionForGeneratedZone(
  generatedZoneId: string,
  state: HostPolicyState = defaultHostPolicyState
): HostSurfaceProjection {
  if (state.kind !== "declared") {
    return blockedSurfaceProjection(generatedZoneId, state);
  }
  const declaration = generatedSurfaceDeclarations(state.document).find(
    (item) => item.generatedZoneId === generatedZoneId
  );
  if (!declaration) {
    return missingGeneratedZoneProjection(generatedZoneId, state.document.policyId);
  }
  return declaredSurfaceProjection(state.document, declaration);
}

export function hostApplyGateProjection(
  gateId: string,
  state: HostPolicyState = defaultHostPolicyState
): HostApplyGateProjection {
  if (state.kind !== "declared") {
    return Value.Parse(HostApplyGateProjectionSchema, {
      kind: "host-apply-gate-projection",
      gateId,
      policyId: state.policyId,
      declarationState: state.kind,
      nonClaims: ["does-not-authorize-host-gate"],
    });
  }
  const declaration = state.document.declarations.find(
    (item): item is ApplyGateDeclaration =>
      item.kind === "apply-gate" && item.gateId === gateId
  );
  return Value.Parse(HostApplyGateProjectionSchema, {
    kind: "host-apply-gate-projection",
    gateId,
    policyId: state.document.policyId,
    declarationId: declaration?.declarationId,
    triggerClass: declaration?.triggerClass,
    gateContract: declaration?.gateContract,
    recovery: declaration?.recovery,
    declarationState: declaration ? "declared" : "missing",
    nonClaims: declaration?.nonClaims ?? ["does-not-authorize-host-gate"],
  });
}

export function hostProjectSupportProjection(
  requestClass: string,
  state: HostPolicyState = defaultHostPolicyState
): HostProjectSupportProjection {
  if (state.kind !== "declared") {
    return projectSupportProjection(requestClass, state.kind, "blocked");
  }
  const declaration = state.document.declarations.find(
    (item): item is ProjectSupportDeclaration =>
      (item.kind === "project-support" ||
        item.kind === "unsupported-host-shape") &&
      item.requestClass === requestClass
  );
  if (!declaration) return projectSupportProjection(requestClass, "missing", "blocked");
  return Value.Parse(HostProjectSupportProjectionSchema, {
    kind: "host-project-support-projection",
    requestClass,
    supportState: declaration.kind === "project-support" ? declaration.supportState : "refused",
    declarationId: declaration.declarationId,
    owner: ownerForDeclaration(state.document, declaration),
    noWrite: true,
    recovery: declaration.recovery,
    declarationState: "declared",
    nonClaims: declaration.nonClaims,
  });
}

export function hostAuthoringBoundaryProjection(
  scenario: string,
  state: HostPolicyState = defaultHostPolicyState
): HostAuthoringBoundaryProjection {
  return Value.Parse(HostAuthoringBoundaryProjectionSchema, {
    kind: "host-authoring-boundary-projection",
    scenario,
    relation: "not-public-authority",
    declarationState: state.kind === "declared" ? "not-applicable" : state.kind,
    nonClaims: ["does-not-authorize-host-owned-authoring-topology"],
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

function declaredSurfaceProjection(
  document: HostPolicyDocument,
  declaration: SurfaceDeclaration
): HostSurfaceProjection {
  return Value.Parse(HostSurfaceProjectionSchema, {
    kind: "host-surface-projection",
    policyId: declaration.policyId,
    declarationId: declaration.declarationId,
    owner: ownerForDeclaration(document, declaration),
    surfaceKind: surfaceKind(declaration),
    matcher: declaration.matcher,
    mutationLane: declaration.mutationLane,
    recovery: declaration.recovery,
    declarationState: "declared",
    nonClaims: declaration.nonClaims,
  });
}

function notHostOwnedSurfaceProjection(policyId: string): HostSurfaceProjection {
  return Value.Parse(HostSurfaceProjectionSchema, {
    kind: "host-surface-projection",
    policyId,
    surfaceKind: "not-host-owned",
    mutationLane: "allowed",
    declarationState: "not-applicable",
    nonClaims: ["does-not-prove-path-safety"],
  });
}

function blockedSurfaceProjection(
  candidate: string,
  state: Extract<
    HostPolicyState,
    { kind: "missing" | "unavailable" | "malformed" | "conflicting" }
  >
): HostSurfaceProjection {
  return Value.Parse(HostSurfaceProjectionSchema, {
    kind: "host-surface-projection",
    policyId: state.policyId,
    surfaceKind: "not-host-owned",
    mutationLane: "blocked",
    declarationState: state.kind,
    nonClaims: [`does-not-authorize-host-surface:${candidate}`],
  });
}

function missingGeneratedZoneProjection(
  generatedZoneId: string,
  policyId: string
): HostSurfaceProjection {
  return Value.Parse(HostSurfaceProjectionSchema, {
    kind: "host-surface-projection",
    policyId,
    surfaceKind: "not-host-owned",
    mutationLane: "blocked",
    declarationState: "missing",
    nonClaims: [`does-not-authorize-generated-zone:${generatedZoneId}`],
  });
}

function projectSupportProjection(
  requestClass: string,
  declarationState: HostPolicySourceState,
  supportState: "supported" | "refused" | "blocked"
): HostProjectSupportProjection {
  return Value.Parse(HostProjectSupportProjectionSchema, {
    kind: "host-project-support-projection",
    requestClass,
    supportState,
    noWrite: true,
    declarationState,
    nonClaims: ["does-not-prove-authoring-support"],
  });
}

function surfaceKind(declaration: SurfaceDeclaration): HostSurfaceProjection["surfaceKind"] {
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
