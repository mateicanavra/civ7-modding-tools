import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, test } from "vitest";

const ruleModuleUrl = pathToFileURL(
  resolve(
    import.meta.dirname,
    "../../../../.habitat/global/workspace/rules/require_active_rule_authority_ledger_identity_parity/check.ts"
  )
).href;
const {
  auditActiveRuleAuthorityLedgerIdentityParity,
  auditCurrentRuleAuthorityLedgerIdentityParity,
} = await import(ruleModuleUrl);

function ledger(ruleIds: readonly string[]) {
  return {
    corpus: {
      liveManifestCount: ruleIds.length,
      currentRowCount: ruleIds.length,
      retiredHistoricalRowCount: 0,
      duplicateLiveRows: [],
    },
    rules: ruleIds.map((ruleId) => ({ ruleId })),
    retiredRules: [],
  };
}

describe("active rule-authority ledger identity parity", () => {
  test("accepts order-independent exact identity parity", () => {
    expect(
      auditActiveRuleAuthorityLedgerIdentityParity(["alpha", "beta"], ledger(["beta", "alpha"]))
    ).toEqual([]);
  });

  test("reports omitted live and manifestless ledger identities", () => {
    expect(
      auditActiveRuleAuthorityLedgerIdentityParity(
        ["alpha", "missing"],
        ledger(["alpha", "manifestless"])
      )
    ).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "ledger-live-rule-missing",
          message: expect.stringContaining("missing"),
        }),
        expect.objectContaining({
          code: "ledger-manifestless-rule",
          message: expect.stringContaining("manifestless"),
        }),
      ])
    );
  });

  test("reports duplicate current ledger identities", () => {
    const duplicated = ledger(["alpha", "alpha"]);
    expect(auditActiveRuleAuthorityLedgerIdentityParity(["alpha"], duplicated)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "ledger-rule-id-duplicate",
          message: "Duplicate current ledger rule ids: alpha.",
        }),
      ])
    );
  });

  test.each([
    ["missing rules", { corpus: ledger([]).corpus }],
    ["non-array rules", { ...ledger([]), rules: {} }],
    ["missing corpus", { rules: [] }],
    ["malformed corpus", { ...ledger([]), corpus: { liveManifestCount: "0" } }],
    ["non-string rule id", { ...ledger([]), rules: [{ ruleId: 42 }] }],
  ])("reports %s as malformed", (_name, malformed) => {
    expect(auditActiveRuleAuthorityLedgerIdentityParity([], malformed)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: expect.stringMatching(/^ledger-(shape|rule-id)-invalid$/),
        }),
      ])
    );
  });

  test("reports stale corpus counts and duplicate summary", () => {
    const stale = ledger(["alpha"]) as {
      corpus: {
        liveManifestCount: number;
        currentRowCount: number;
        duplicateLiveRows: string[];
      };
      rules: { ruleId: string }[];
    };
    stale.corpus.liveManifestCount = 7;
    stale.corpus.currentRowCount = 8;
    stale.corpus.duplicateLiveRows = ["alpha"];

    expect(auditActiveRuleAuthorityLedgerIdentityParity(["alpha"], stale)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "ledger-corpus-count-drift",
          message: "corpus.liveManifestCount is 7; expected 1.",
        }),
        expect.objectContaining({
          code: "ledger-corpus-count-drift",
          message: "corpus.currentRowCount is 8; expected 1.",
        }),
        expect.objectContaining({
          code: "ledger-corpus-duplicate-drift",
        }),
      ])
    );
  });

  test("passes against the current canonical registry and ledger", async () => {
    expect(await auditCurrentRuleAuthorityLedgerIdentityParity()).toEqual([]);
  });
});
