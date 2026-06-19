import { Value } from "typebox/value";
import { hostSurfaceProjectionForScanRoot, type HostPolicyState } from "../host-policy.js";
import {
  ScanRootProtectionDecisionSchema,
  type ProtectedZoneOwner,
  type ProtectedZoneRecoveryInstruction,
  type ScanRootProtectionDecision,
} from "./schema.js";

export function decideScanRootProtection(
  root: string,
  options: { protectedPrefixes?: readonly string[]; hostPolicyState?: HostPolicyState } = {}
): ScanRootProtectionDecision {
  const hostSurface = hostSurfaceProjectionForScanRoot(root, options.hostPolicyState);
  if (
    hostSurface.declarationState !== "declared" &&
    hostSurface.declarationState !== "not-applicable"
  ) {
    return protectedRootRefusal({
      root,
      owner: hostPolicyBoundaryOwner(),
      recovery: declarationRecovery(hostSurface.declarationState),
      nonClaims: hostSurface.nonClaims,
    });
  }
  if (hostSurface.declarationState === "declared") {
    if (!hostSurface.owner || !hostSurface.recovery) {
      return protectedRootRefusal({
        root,
        owner: hostPolicyBoundaryOwner(),
        recovery: declarationRecovery("malformed"),
        nonClaims: hostSurface.nonClaims,
      });
    }
    if (
      hostSurface.surfaceKind === "generated" ||
      hostSurface.surfaceKind === "external-resource"
    ) {
      return generatedOutputRefusal({
        root,
        owner: ownerProjection(hostSurface.owner),
        recovery: hostSurface.recovery,
        nonClaims: hostSurface.nonClaims,
      });
    }
    return protectedRootRefusal({
      root,
      owner: ownerProjection(hostSurface.owner),
      recovery: hostSurface.recovery,
      nonClaims: hostSurface.nonClaims,
    });
  }
  if (isProtectedRoot(root, options.protectedPrefixes ?? [])) {
    return protectedRootRefusal({
      root,
      owner: habitatRepoPolicyOwner(),
      recovery: selectApprovedScanRootRecovery(),
      nonClaims: ["does-not-prove-scan-root-safety"],
    });
  }
  return Value.Parse(ScanRootProtectionDecisionSchema, {
    kind: "accepted",
    root,
    nonClaims: ["does-not-prove-scan-root-safety"],
  });
}

function protectedRootRefusal(input: {
  root: string;
  owner: ProtectedZoneOwner;
  recovery: ProtectedZoneRecoveryInstruction;
  nonClaims: readonly string[];
}): ScanRootProtectionDecision {
  return Value.Parse(ScanRootProtectionDecisionSchema, {
    kind: "refused-protected-root",
    reason: "protected-root",
    root: input.root,
    owner: input.owner,
    recovery: input.recovery,
    nonClaims: [...input.nonClaims],
  });
}

function generatedOutputRefusal(input: {
  root: string;
  owner: ProtectedZoneOwner;
  recovery: ProtectedZoneRecoveryInstruction;
  nonClaims: readonly string[];
}): ScanRootProtectionDecision {
  return Value.Parse(ScanRootProtectionDecisionSchema, {
    kind: "refused-generated-output",
    reason: "generated-output",
    root: input.root,
    owner: input.owner,
    recovery: input.recovery,
    nonClaims: [...input.nonClaims],
  });
}

function isProtectedRoot(root: string, prefixes: readonly string[]): boolean {
  const normalized = root.endsWith("/") ? root : `${root}/`;
  return prefixes.some((prefix) => normalized === prefix || normalized.startsWith(prefix));
}

function ownerProjection(input: {
  ownerId: string;
  displayName: string;
  recoveryContact: string;
}): ProtectedZoneOwner {
  return {
    ownerId: input.ownerId,
    displayName: input.displayName,
    recoveryContact: input.recoveryContact,
  };
}

function hostPolicyBoundaryOwner(): ProtectedZoneOwner {
  return {
    ownerId: "G-HOST",
    displayName: "Host Policy Boundary",
    recoveryContact: "openspec/changes/deep-habitat-host-policy-boundary-gate",
  };
}

function habitatRepoPolicyOwner(): ProtectedZoneOwner {
  return {
    ownerId: "habitat-repo-policy",
    displayName: "Habitat repo policy",
    recoveryContact: "docs/process/CONTRIBUTING.md",
  };
}

function declarationRecovery(state: string): ProtectedZoneRecoveryInstruction {
  return {
    ownerId: "G-HOST",
    actionKind: "documented-workflow",
    documentRef: "openspec/changes/deep-habitat-host-policy-boundary-gate",
    retryCondition: `Retry after the host policy declaration state is repaired from '${state}'.`,
    nonClaims: ["does-not-authorize-host-surface"],
  };
}

function selectApprovedScanRootRecovery(): ProtectedZoneRecoveryInstruction {
  return {
    ownerId: "habitat-repo-policy",
    actionKind: "select-approved-scan-root",
    instruction: "Select a D2-approved source scan root outside protected tool output roots.",
    nonClaims: ["does-not-prove-scan-root-safety"],
  };
}
