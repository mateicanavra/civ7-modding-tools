import { describe, expect, test } from "vitest";

import {
  civ7CloseoutMutationProjection,
  civ7MutationPostconditionSummary,
  civ7MutationRequestStatusWithoutGuarded,
} from "../src/policy/mutation-result";
import {
  civ7MutationProofBoundaryViolation as civ7MutationMiddlewareProofBoundaryViolation,
} from "../src/middleware/mutation-proof-boundary";

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

  test("projects closeout-style postconditions into status and next steps", () => {
    const confirmed = civ7CloseoutMutationProjection({
      sent: true,
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
      source: "progression.technology.choice.request",
      inspectKind: "inspect-progression-choice",
      inspectLabel: "Inspect progression state before retrying.",
      doNotRepeatLabel: "Do not repeat until fresh progression evidence is read.",
    });

    expect(confirmed.status).toBe("sent-confirmed");
    expect(confirmed.postcondition).toMatchObject({
      confirmed: true,
      noRepeatAfterUnverified: false,
    });
    expect(confirmed.nextSteps).toEqual([{
      kind: "refresh-attention",
      source: "progression.technology.choice.request",
      label: "Refresh current attention before choosing the next player action.",
    }]);

    const pending = civ7CloseoutMutationProjection({
      sent: true,
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
      source: "progression.technology.choice.request",
      inspectKind: "inspect-progression-choice",
      inspectLabel: "Inspect progression state before retrying.",
      doNotRepeatLabel: "Do not repeat until fresh progression evidence is read.",
    });

    expect(pending.status).toBe("sent-unverified");
    expect(pending.postcondition.confirmed).toBe(false);
    expect(pending.nextSteps).toEqual([{
      kind: "do-not-repeat",
      source: "progression.technology.choice.request",
      label: "Do not repeat until fresh progression evidence is read.",
    }]);
  });

  test("guards mutation outputs from repeat-safe unverified proof states", () => {
    const repeatSafeUnverified = {
      status: "sent-unverified",
      postcondition: {
        confidence: "pending-runtime-proof",
        noRepeatAfterUnverified: false,
      },
      nextSteps: [{ kind: "refresh-attention" }],
    };

    expect(civ7MutationMiddlewareProofBoundaryViolation(repeatSafeUnverified))
      .toBe("unverified-repeat-safe");
    expect(civ7MutationMiddlewareProofBoundaryViolation({
      status: "sent-unverified",
      postcondition: {
        confidence: "unverified",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "refresh-attention" }],
    })).toBe("sent-unverified-without-do-not-repeat");
    expect(civ7MutationMiddlewareProofBoundaryViolation({
      status: "sent-unverified",
      postcondition: {
        confidence: "unverified",
        noRepeatAfterUnverified: true,
      },
      nextSteps: [{ kind: "do-not-repeat" }],
    })).toBeNull();
  });
});
