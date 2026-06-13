import { describe, expect, test } from "vitest";

import {
  DEBUG_SERVICE_PROJECTION_FIELD_CLASSES,
  DEBUG_SERVICE_PROJECTION_OWNER,
  DEBUG_SERVICE_PROJECTION_VERSION,
  type DebugServiceProjectionExpectation,
  debugServiceProjectionFieldHits,
  debugServiceProjectionMissingPaths,
} from "../../../src/game-debug/debug-service-projection";

describe("debug service projection owner", () => {
  test("defines debug/internal projection ownership without accepting the row", () => {
    expect(DEBUG_SERVICE_PROJECTION_VERSION).toBe("civ7.debug-service-projection.v0");
    expect(DEBUG_SERVICE_PROJECTION_OWNER).toMatchObject({
      row: "Debug/Internal Service Output",
      sourceOwner: "packages/cli/src/game-debug/debug-service-projection.ts",
      schemaChoice: "typescript-structural-owner-seed",
      acceptanceStatus: "owner-seed-not-row-acceptance",
    });
    expect(DEBUG_SERVICE_PROJECTION_FIELD_CLASSES).toEqual([
      "transport-session-state",
      "raw-probe",
      "route-selection",
      "closeout-postcondition-internal",
      "correlation-diagnostic",
      "resource-log-database-proof",
    ]);
  });

  test("checks expected debug field classes against concrete payload paths", () => {
    const payload = {
      request: {
        command: "Network.restartGame()",
        hosts: ["127.0.0.1"],
        port: 4318,
        state: "App UI",
      },
      inspection: {
        roots: [
          {
            ownKeys: ["isInSession"],
            methods: [
              { owner: "prototype", signature: "function restartGame() { [native code] }" },
            ],
          },
        ],
      },
    };
    const expectations: DebugServiceProjectionExpectation[] = [
      { fieldClass: "route-selection", path: ["request", "command"] },
      { fieldClass: "transport-session-state", path: ["request", "hosts"] },
      { fieldClass: "raw-probe", path: ["inspection", "roots", 0, "methods", 0, "signature"] },
      { fieldClass: "correlation-diagnostic", path: ["missing", "requestId"] },
    ];

    expect(debugServiceProjectionFieldHits(payload, expectations)).toEqual([
      { fieldClass: "route-selection", path: ["request", "command"], description: undefined },
      { fieldClass: "transport-session-state", path: ["request", "hosts"], description: undefined },
      {
        fieldClass: "raw-probe",
        path: ["inspection", "roots", 0, "methods", 0, "signature"],
        description: undefined,
      },
    ]);
    expect(debugServiceProjectionMissingPaths(payload, expectations)).toEqual([
      {
        fieldClass: "correlation-diagnostic",
        path: ["missing", "requestId"],
        description: undefined,
      },
    ]);
  });
});
