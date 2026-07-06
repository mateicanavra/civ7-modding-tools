# Domino 059: Derive Standard Recipe Stage Topology From Source Authority

Status: active sequence record

Source: extracted from the former monolithic domino ledger.

## Detail

#### Domino 59: Derive Standard Recipe Stage Topology From Source Authority

Status: closed on `codex/habitat-standard-recipe-topology-rail`.

Purpose: close the standard recipe stage-root topology sub-slice without
collapsing it into the adjacent G9 wrapper-only `advanced` config guard.

Disposition receipt:

| Rule id | Action | Reason | Receipt |
| --- | --- | --- | --- |
| `preserve_standard_stage_topology_and_path_invariants` | preserved and converted from structure runner to source-derived script runner | Active standard recipe stage roots are already declared in `contract-manifest.ts` and the `orderStandardStages` call in `recipe.ts`; the old `structure.toml` repeated a hardcoded inventory and treated support hubs as required stage roots. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-standard-recipe-topology-slice.md` |
| `prohibit_wrapper_only_advanced_config` | excluded and requeued | This row is G9 wrapper-only `advanced` recurrence pressure, not stage-root topology. It remains live until a separate consolidation/source-validation packet can absorb or replace it without package-test blacklist assertions. | `.habitat/.active/workstreams/remediate-rule-authority/receipts/rule-remediation-standard-recipe-topology-slice.md` |

Moves it forward:

- Replaces a stale hardcoded stage-root list with a Habitat script that parses
  the runtime recipe and contract manifest source, compares their stage ids, and
  checks the filesystem topology.
- Keeps `ecology`, `foundation`, and `morphology` visible as support hubs rather
  than pretending they are active stages.
- Preserves the user correction that package tests are not junk drawers for
  retired or wrapper-key assertions.

Closure note:

- The proof claim is standard recipe stage-root topology, not stage order,
  step parity, config schema behavior, or support-hub rehoming.
- The next recorded move is a Layer 2 packet for G9 wrapper-only `advanced`
  guard consolidation from the canonical JSON.
