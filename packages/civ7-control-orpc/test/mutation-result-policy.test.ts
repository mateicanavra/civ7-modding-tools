import { describe, expect, test } from "vitest";

import {
  civ7MutationPostconditionSummary,
  civ7MutationRequestStatusWithoutGuarded,
} from "../src/policy/mutation-result";

describe("control-oRPC mutation result policy", () => {
  test("keeps missing postcondition summaries no-repeat guarded", () => {
    const postcondition = civ7MutationPostconditionSummary({
      postcondition: null,
      missing: {
        classification: "missing-postcondition",
        reason: "No explicit postcondition evidence was returned.",
        outcome: "unknown",
      },
    });

    expect(postcondition).toEqual({
      classification: "missing-postcondition",
      reason: "No explicit postcondition evidence was returned.",
      outcome: "unknown",
      confidence: "unverified",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
    expect(civ7MutationRequestStatusWithoutGuarded({
      sent: true,
      postcondition,
    })).toBe("sent-unverified");
  });

  test("does not treat pending runtime proof as confirmed or repeat-safe", () => {
    const postcondition = civ7MutationPostconditionSummary({
      postcondition: {
        classification: "pending-runtime-proof",
        reason: "Live runtime proof has not been collected.",
        outcome: "unknown",
        confidence: "pending-runtime-proof",
        noRepeatAfterUnverified: true,
      },
      missing: {
        classification: "missing-postcondition",
        reason: "No explicit postcondition evidence was returned.",
        outcome: "unknown",
      },
    });

    expect(postcondition).toEqual({
      classification: "pending-runtime-proof",
      reason: "Live runtime proof has not been collected.",
      outcome: "unknown",
      confidence: "pending-runtime-proof",
      confirmed: false,
      noRepeatAfterUnverified: true,
    });
    expect(civ7MutationRequestStatusWithoutGuarded({
      sent: true,
      postcondition,
    })).toBe("sent-unverified");
  });

  test("marks only confirmed unguarded postconditions as confirmed", () => {
    const postcondition = civ7MutationPostconditionSummary({
      postcondition: {
        classification: "blocker-cleared",
        reason: "The blocker was cleared.",
        outcome: "cleared",
        confidence: "confirmed",
        noRepeatAfterUnverified: false,
      },
      missing: {
        classification: "missing-postcondition",
        reason: "No explicit postcondition evidence was returned.",
        outcome: "unknown",
      },
    });

    expect(postcondition).toMatchObject({
      confidence: "confirmed",
      confirmed: true,
      noRepeatAfterUnverified: false,
    });
    expect(civ7MutationRequestStatusWithoutGuarded({
      sent: true,
      postcondition,
    })).toBe("sent-confirmed");
  });
});
