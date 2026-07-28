import {
  defaultHostPolicyDocument,
  hostApplyGateDecision,
  hostAuthoringBoundaryState,
  hostProjectSupportDecision,
  hostSurfaceDecisionForAcquisitionRoot,
  hostSurfaceDecisionForGeneratedZone,
  hostSurfaceDecisionForPath,
  missingHostPolicyState,
  readHostPolicyState,
  unavailableHostPolicyState,
} from "@habitat/cli/service/model/host/index";
import { describe, expect, test } from "vitest";

function declaredHostPolicyRow(declarationId: string) {
  const declaration = defaultHostPolicyDocument.declarations.find(
    (candidate) => candidate.declarationId === declarationId
  );
  if (!declaration) throw new Error(`Missing host policy declaration: ${declarationId}`);
  return declaration;
}

describe("host policy boundary", () => {
  test("projects declared generated surfaces from host declarations", () => {
    expect(
      hostSurfaceDecisionForPath("apps/mods/map/swooper-physics/src/maps/generated/demo.ts")
    ).toMatchObject({
      declarationState: "declared",
      surfaceKind: "generated",
      mutationLane: "blocked",
      declarationId: "swooper-map-generated",
    });
    expect(hostSurfaceDecisionForGeneratedZone("civ7-setup-parameters")).toMatchObject({
      declarationState: "declared",
      surfaceKind: "generated",
      mutationLane: "blocked",
      declarationId: "civ7-setup-parameters",
    });
  });

  test("routes generated Civ7 declarations to the map-policy owner", () => {
    expect(hostSurfaceDecisionForPath("packages/civ7-types/generated/data.ts")).toMatchObject({
      declarationState: "declared",
      surfaceKind: "generated",
      mutationLane: "blocked",
      declarationId: "civ7-types-generated",
      owner: {
        ownerId: "map-policy-workflow",
      },
      recovery: {
        actionKind: "command",
        command: "nx run civ7-map-policy:generate",
      },
    });
  });

  test("projects protected surfaces from host declarations", () => {
    const state = readHostPolicyState({
      ...defaultHostPolicyDocument,
      declarations: [
        ...defaultHostPolicyDocument.declarations,
        {
          policyId: defaultHostPolicyDocument.policyId,
          declarationId: "protected-demo",
          ownerId: "mapgen-domain-workflow",
          kind: "protected-surface",
          matcher: { kind: "exact", value: "packages/demo/protected.ts" },
          mutationLane: "blocked",
          recovery: {
            ownerId: "mapgen-domain-workflow",
            actionKind: "documented-workflow",
            documentRef: "docs/system/libs/mapgen/",
            retryCondition: "Retry after owner approval.",
          },
        },
      ],
    });

    expect(hostSurfaceDecisionForPath("packages/demo/protected.ts", state)).toMatchObject({
      declarationState: "declared",
      surfaceKind: "protected",
      mutationLane: "blocked",
      declarationId: "protected-demo",
    });
  });

  test("matches generated acquisition roots through host declarations", () => {
    expect(
      hostSurfaceDecisionForAcquisitionRoot("apps/mods/map/swooper-physics/src/maps/generated")
    ).toMatchObject({
      declarationState: "declared",
      surfaceKind: "generated",
      declarationId: "swooper-map-generated",
    });
  });

  test("reports not-applicable instead of inventing host ownership", () => {
    expect(hostSurfaceDecisionForPath("packages/sdk/src/index.ts")).toMatchObject({
      declarationState: "not-applicable",
      surfaceKind: "not-host-owned",
      mutationLane: "allowed",
    });
  });

  test("keeps unknown generated-zone ids as missing host declarations", () => {
    expect(hostSurfaceDecisionForGeneratedZone("unknown-zone")).toMatchObject({
      declarationState: "missing",
      mutationLane: "blocked",
    });
  });

  test("does not collapse unavailable host policy into not-applicable", () => {
    expect(
      hostSurfaceDecisionForPath(
        "apps/mods/map/swooper-physics/src/maps/generated/demo.ts",
        unavailableHostPolicyState("civ7-repo-host-policy", "host policy source unavailable")
      )
    ).toMatchObject({
      declarationState: "unavailable",
      mutationLane: "blocked",
    });
  });

  test("does not collapse missing host policy into not-applicable", () => {
    expect(
      hostApplyGateDecision(
        "mapgen-public-ops",
        missingHostPolicyState("civ7-repo-host-policy", "missing apply-gate declaration")
      )
    ).toMatchObject({
      declarationState: "missing",
    });
  });

  test("reports malformed host policy source through TypeBox validation", () => {
    expect(
      readHostPolicyState({ schemaVersion: 1, policyId: "bad", declarations: [] })
    ).toMatchObject({
      kind: "malformed",
    });
  });

  test("reports conflicting host declarations", () => {
    expect(
      readHostPolicyState({
        ...defaultHostPolicyDocument,
        declarations: [
          defaultHostPolicyDocument.declarations[0],
          defaultHostPolicyDocument.declarations[0],
        ],
      })
    ).toMatchObject({
      kind: "conflicting",
      issues: expect.arrayContaining(["Duplicate host declaration 'swooper-map-generated'."]),
    });
  });

  test("reports host policy conflicts before decisions can allow writes", () => {
    const state = readHostPolicyState({
      ...defaultHostPolicyDocument,
      declarations: [
        ...defaultHostPolicyDocument.declarations,
        {
          ...declaredHostPolicyRow("swooper-map-generated"),
          declarationId: "overlapping-generated-zone",
          generatedZoneId: "swooper-map-generated",
          matcher: {
            kind: "prefix",
            value: "apps/mods/map/swooper-physics/src/maps/generated/demo/",
          },
          recovery: {
            ...declaredHostPolicyRow("swooper-map-generated").recovery,
            ownerId: "mapgen-domain-workflow",
          },
        },
        {
          ...declaredHostPolicyRow("mapgen-public-ops-apply-gate"),
          declarationId: "duplicate-apply-gate",
        },
        {
          ...declaredHostPolicyRow("unsupported-project-kind-mod"),
          declarationId: "duplicate-project-support",
        },
      ],
    });

    expect(state).toMatchObject({
      kind: "conflicting",
      issues: expect.arrayContaining([
        "Duplicate generated zone 'swooper-map-generated'.",
        "Host declaration 'overlapping-generated-zone' recovery owner 'mapgen-domain-workflow' does not match declaration owner 'swooper-maps-workflow'.",
        "Host surface declarations 'swooper-map-generated' and 'overlapping-generated-zone' overlap.",
        "Duplicate host apply gate 'mapgen-public-ops'.",
        "Duplicate host project support request 'project-kind:mod'.",
      ]),
    });
  });

  test("projects host apply gates without exposing host semantics to D9", () => {
    expect(hostApplyGateDecision("mapgen-public-ops")).toMatchObject({
      declarationState: "declared",
      triggerClass: "import-pattern",
      gateContract: "Swooper definition domain contract validation",
    });
  });

  test("projects unsupported host-owned project requests as no-write refusals", () => {
    expect(hostProjectSupportDecision("project-kind:mod")).toMatchObject({
      declarationState: "declared",
      supportState: "refused",
      noWrite: true,
    });
  });

  test("projects host authoring references as non-authority", () => {
    expect(hostAuthoringBoundaryState("mapgen-authoring-topology")).toMatchObject({
      declarationState: "not-applicable",
      relation: "not-public-authority",
    });
  });
});
