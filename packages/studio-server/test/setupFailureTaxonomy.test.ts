import { describe, expect, test } from "vitest";

import {
  isSetupFailureReason,
  SETUP_FAILURE_REASONS,
  setupFailureReasonFromDirectControlCode,
} from "../src/runInGameSetupFailureTaxonomy.js";

describe("setup failure taxonomy", () => {
  test("keeps the internal setup reason union closed", () => {
    expect(SETUP_FAILURE_REASONS).toEqual([
      "setup-map-row-not-visible",
      "setup-map-row-mismatched",
      "generated-map-mod-not-enabled",
      "setup-read-timeout",
      "tuner-unavailable",
      "direct-control-command-failed",
    ]);
    expect(isSetupFailureReason("generated-map-mod-not-enabled")).toBe(true);
    expect(isSetupFailureReason("map-mod-not-loaded")).toBe(false);
  });

  test.each([
    ["connection-failed", "tuner-unavailable"],
    ["response-timeout", "tuner-unavailable"],
    ["setup-apply-timeout", "setup-read-timeout"],
    ["setup-phase-invalid", "setup-read-timeout"],
    ["setup-readback-mismatch", "setup-map-row-mismatched"],
    ["setup-seed-mismatch", "setup-map-row-mismatched"],
    ["setup-map-row-missing", "setup-map-row-not-visible"],
    ["civ7-tuner-backoff", "tuner-unavailable"],
    ["command-failed", "direct-control-command-failed"],
    [undefined, "direct-control-command-failed"],
  ] as const)("maps direct-control code %s to %s", (code, expected) => {
    expect(setupFailureReasonFromDirectControlCode(code)).toBe(expected);
  });
});
