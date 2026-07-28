import { describe, expect, test } from "vitest";
import {
  createSemanticCliEnvelope,
  SEMANTIC_CLI_ENVELOPE_SLOTS,
  SEMANTIC_CLI_ENVELOPE_VERSION,
} from "../../../../src/adapters/play/semantic-envelope";

describe("semantic CLI envelope owner", () => {
  test("keeps the planned player-agent slot vocabulary explicit", () => {
    expect(SEMANTIC_CLI_ENVELOPE_SLOTS).toEqual([
      "version",
      "scope",
      "state",
      "blockers",
      "decisions",
      "actions",
      "result",
      "nextSteps",
      "evidence",
      "notes",
    ]);
  });

  test("constructs a structural envelope with every planned slot", () => {
    const envelope = createSemanticCliEnvelope({
      scope: { surface: "game play priorities" },
      state: { turn: { ok: true, value: 80 } },
      blockers: [{ kind: "ready-unit", summary: "unit needs orders" }],
      decisions: [{ kind: "ready-unit", nextAction: { kind: "inspect-ready-unit" } }],
      actions: [{ family: "ready-unit", kind: "inspect-ready-unit", readOnly: true }],
      result: { status: "read-only", sent: false },
      nextSteps: [
        { kind: "inspect-ready-unit", label: "Inspect the ready unit before choosing an action." },
      ],
      evidence: [{ label: "local-cli-test", proofClass: "local-cli-output" }],
      notes: ["local tests do not prove live runtime behavior"],
    });

    expect(Object.keys(envelope)).toEqual(SEMANTIC_CLI_ENVELOPE_SLOTS);
    expect(envelope.version).toBe(SEMANTIC_CLI_ENVELOPE_VERSION);
  });
});
