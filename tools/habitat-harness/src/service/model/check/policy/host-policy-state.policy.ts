import { Value } from "typebox/value";
import {
  type HostMatcher,
  type HostPolicyDeclaration,
  type HostPolicyDocument,
  HostPolicyDocumentSchema,
  type HostPolicySourceState,
  type HostPolicyState,
  HostPolicyStateSchema,
} from "../dto/host-policy.schema.js";
import { defaultHostPolicyDocument } from "./host-policy-declarations.policy.js";

type SurfaceDeclaration = Extract<HostPolicyDeclaration, { matcher: HostMatcher }>;
type GeneratedSurfaceDeclaration = Extract<HostPolicyDeclaration, { generatedZoneId: string }>;
type ApplyGateDeclaration = Extract<HostPolicyDeclaration, { kind: "apply-gate" }>;
type ProjectSupportDeclaration = Extract<
  HostPolicyDeclaration,
  { kind: "project-support" | "unsupported-host-shape" }
>;

export const defaultHostPolicyState: HostPolicyState =
  declaredHostPolicyState(defaultHostPolicyDocument);

export function parseHostPolicyDocument(value: unknown): HostPolicyDocument {
  return Value.Parse(HostPolicyDocumentSchema, value);
}

export function readHostPolicyState(value: unknown): HostPolicyState {
  const errors = [...Value.Errors(HostPolicyDocumentSchema, value)];
  if (errors.length > 0) {
    return policyIssueState(
      "malformed",
      "unknown-host-policy",
      errors.map((error) => error.message)
    );
  }

  const document = parseHostPolicyDocument(value);
  const conflicts = hostPolicyConflicts(document);
  if (conflicts.length > 0) {
    return policyIssueState("conflicting", document.policyId, conflicts);
  }
  return declaredHostPolicyState(document);
}

export function missingHostPolicyState(policyId: string, issue: string): HostPolicyState {
  return policyIssueState("missing", policyId, [issue]);
}

export function unavailableHostPolicyState(policyId: string, issue: string): HostPolicyState {
  return policyIssueState("unavailable", policyId, [issue]);
}

function declaredHostPolicyState(document: HostPolicyDocument): HostPolicyState {
  return Value.Parse(HostPolicyStateSchema, { kind: "declared", document });
}

function policyIssueState(
  kind: Exclude<HostPolicySourceState, "declared" | "not-applicable">,
  policyId: string,
  issues: string[]
): HostPolicyState {
  return Value.Parse(HostPolicyStateSchema, { kind, policyId, issues });
}

function hostPolicyConflicts(document: HostPolicyDocument): string[] {
  const ownerIds = new Set<string>();
  const ids = new Set<string>();
  const generatedZoneIds = new Set<string>();
  const applyGateIds = new Set<string>();
  const requestClasses = new Set<string>();
  const surfaces: SurfaceDeclaration[] = [];
  const issues: string[] = [];
  for (const owner of document.owners) {
    if (ownerIds.has(owner.ownerId)) {
      issues.push(`Duplicate host owner '${owner.ownerId}'.`);
    }
    ownerIds.add(owner.ownerId);
  }
  for (const declaration of document.declarations) {
    if (ids.has(declaration.declarationId)) {
      issues.push(`Duplicate host declaration '${declaration.declarationId}'.`);
    }
    ids.add(declaration.declarationId);
    if (declaration.policyId !== document.policyId) {
      issues.push(
        `Host declaration '${declaration.declarationId}' uses policy '${declaration.policyId}' instead of '${document.policyId}'.`
      );
    }
    if (!hasOwner(document, declaration)) {
      issues.push(
        `Host declaration '${declaration.declarationId}' references unknown owner '${declaration.ownerId}'.`
      );
    }
    if (declaration.recovery.ownerId !== declaration.ownerId) {
      issues.push(
        `Host declaration '${declaration.declarationId}' recovery owner '${declaration.recovery.ownerId}' does not match declaration owner '${declaration.ownerId}'.`
      );
    }
    if (isGeneratedSurfaceDeclaration(declaration)) {
      if (generatedZoneIds.has(declaration.generatedZoneId)) {
        issues.push(`Duplicate generated zone '${declaration.generatedZoneId}'.`);
      }
      generatedZoneIds.add(declaration.generatedZoneId);
    }
    if (isApplyGateDeclaration(declaration)) {
      if (applyGateIds.has(declaration.gateId)) {
        issues.push(`Duplicate host apply gate '${declaration.gateId}'.`);
      }
      applyGateIds.add(declaration.gateId);
    }
    if (isProjectSupportDeclaration(declaration)) {
      if (requestClasses.has(declaration.requestClass)) {
        issues.push(`Duplicate host project support request '${declaration.requestClass}'.`);
      }
      requestClasses.add(declaration.requestClass);
    }
    if (isSurfaceDeclaration(declaration)) {
      for (const existing of surfaces) {
        if (matchersOverlap(existing.matcher, declaration.matcher)) {
          issues.push(
            `Host surface declarations '${existing.declarationId}' and '${declaration.declarationId}' overlap.`
          );
        }
      }
      surfaces.push(declaration);
    }
  }
  return issues;
}

function hasOwner(
  document: HostPolicyDocument,
  declaration: Pick<HostPolicyDeclaration, "ownerId">
): boolean {
  return document.owners.some((owner) => owner.ownerId === declaration.ownerId);
}

function isSurfaceDeclaration(
  declaration: HostPolicyDeclaration
): declaration is SurfaceDeclaration {
  return "matcher" in declaration;
}

function isGeneratedSurfaceDeclaration(
  declaration: HostPolicyDeclaration
): declaration is GeneratedSurfaceDeclaration {
  return "generatedZoneId" in declaration;
}

function isApplyGateDeclaration(
  declaration: HostPolicyDeclaration
): declaration is ApplyGateDeclaration {
  return declaration.kind === "apply-gate";
}

function isProjectSupportDeclaration(
  declaration: HostPolicyDeclaration
): declaration is ProjectSupportDeclaration {
  return declaration.kind === "project-support" || declaration.kind === "unsupported-host-shape";
}

function matchersOverlap(left: HostMatcher, right: HostMatcher): boolean {
  if (left.kind === "exact" && right.kind === "exact") return left.value === right.value;
  if (left.kind === "prefix" && right.kind === "prefix") {
    return pathPrefixesOverlap(left.value, right.value);
  }
  const prefix = left.kind === "prefix" ? left.value : right.value;
  const exact = left.kind === "exact" ? left.value : right.value;
  return exact === prefixRoot(prefix) || exact.startsWith(normalizedPrefix(prefix));
}

function pathPrefixesOverlap(left: string, right: string): boolean {
  const leftPrefix = normalizedPrefix(left);
  const rightPrefix = normalizedPrefix(right);
  return left === right || leftPrefix.startsWith(rightPrefix) || rightPrefix.startsWith(leftPrefix);
}

function prefixRoot(prefix: string): string {
  return prefix.replace(/\/$/, "");
}

function normalizedPrefix(prefix: string): string {
  return prefix.endsWith("/") ? prefix : `${prefix}/`;
}
