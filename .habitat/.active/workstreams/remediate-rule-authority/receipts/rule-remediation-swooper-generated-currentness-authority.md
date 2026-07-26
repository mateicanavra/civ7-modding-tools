# Rule Remediation: Swooper Generated Currentness Authority

Status: implemented

Canonical ledger:
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`

## Supersession

This decision supersedes only the generated-entrypoint mutation-owner statement
in `rule-remediation-mapgen-a2-validator-ownership-supersession.md`. That older
receipt remains unchanged as historical evidence of the decision in force at
the time.

## Retirement

`protect_generated_map_entrypoints_from_hand_edits` and its empty baseline are
retired without a replacement Habitat mutation rule.

The rule observed only that a tracked generated path was staged. It could not
observe whether the bytes came from the owning generator or a hand edit, so its
documented recovery path always failed again after successful regeneration.
Adding a per-generation mutation/provenance receipt would duplicate the
deterministic content oracle without proving action provenance.

## Current Authority

- Nx `mod-swooper-maps:generated:check` compares the complete tracked map and
  mod output plan with canonical map configs and generator logic.
- `mod-swooper-maps:build` depends on that check, and the root CI graph runs
  build.
- The `swooper-map-generated` host declaration remains. It owns generated-path
  classification, recovery routing, and acquisition-root exclusion.
- Missing, mismatched, and unexpected generated files remain covered by the
  shared generated-file-plan behavior tests and the Swooper currentness target.

## Proof

The retirement is closed by native generated currentness, Habitat registry and
test proof, the real staged pre-commit hook, affirmed-blueprint continuity, and
diff hygiene. The sibling Civ7 generated-zone guards remain separate decisions
until their exact currentness owners are present in the native graph.
