# Pre-Descent Readiness Plan

Status: active readiness plan; no slice executed yet

Built: 2026-07-06

Owner: DRA Habitat authority-tree workstream steward

Purpose:
gather the mechanical runway work that should land before the next blueprint
descent begins execution. Each item below is already adjudicated or purely
enabling; none requires a new semantic decision. Landing them first gives the
descent a cleaner base: working proof tooling, a smaller residual rule surface,
and records that match the current tree.

This plan authorizes nothing by itself. Each slice executes on its own Graphite
branch with its own receipt under
`.habitat/.active/workstreams/remediate-rule-authority/receipts/`, and mutating
slices follow `.habitat/.active/frames/RULE-REMEDIATION-SLICE-FRAME.md`.

Position:
the operational ledger's `gateState.nextLegalAction` is "Select the next
highest-leverage blueprint authority descent or remediation slice." The
selection is recorded in
`.habitat/.active/workstreams/blueprint-descent-roadmap.md`, and the selected
descent's opening packet lives at
`.habitat/.active/workstreams/descend-002-domain-operation-interior/`.
This plan is the runway between that selection and descent execution. Descent
execution should not begin until R2, R3, and R4 are closed; R1 is independent
and may land in parallel with anything.

## Slice R1: Helper-Surface Consolidation

Status: implementation-ready; warrant already sealed.

Source of authority:
ledger slice `mapgen-helper-surface-authority-consolidation` (queueOrder 1) in
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`,
with receipt
`receipts/rule-remediation-mapgen-helper-surface-authority-consolidation.md`
and reviewer disposition `approve-with-repairs` already recorded.

Action (quoting the sealed `nextLegalAction`):
enter Layer 3 for one bounded slice that widens/polishes
`prohibit_runtime_helper_redeclarations` for exact-equivalent public MapGen
core helper redeclarations, then absorbs/deletes
`prohibit_foundation_duplicate_math_helper_redefinitions` only to the covered
extent.

Not authorized (carried from the warrant):
moving byte/int8/vector quantization helpers into MapGen core; creating a broad
shared-utils owner; adding package-owned tests for helper redeclaration
residue; mutating product source outside the selected slice; changing unrelated
helper-family rows.

Proof gate:
source absence proof, runner/support path proof, focused Habitat check
(`bun habitat check --json --rule prohibit_runtime_helper_redeclarations`),
Record truth proof for ledger/receipt reconciliation. The warrant's proof
limits carry forward unchanged.

## Slice R2: Config-Facade Consolidation

Status: pre-adjudicated implementation-ready row inside the
`domain-operation-generic-surfaces` ledger slice.

Source of authority:
`perRuleDecisions.prohibit_foundation_op_contract_config_bags` in the ledger:
"Layer 3 should extend `prohibit_root_config_facade_imports_in_domain_ops` to
alias imports, preserve allowed op-local config imports, prove absence, then
retire this Foundation row." The existing owner is
`.habitat/blueprints/domain-operation/prohibit_root_config_facade_imports_in_domain_ops`.

Action:
widen the surviving domain-operation config-facade import rule to cover alias
imports, keep allowed op-local config imports green, prove absence of the old
shape, then delete `prohibit_foundation_op_contract_config_bags` and its
retired `FoundationConfigSchema` literal residue.

Why before the descent:
this is the only row of the domain-operation residual cluster with a locked
destination that does not depend on any descent decision. Landing it first
shrinks the cluster the descent must absorb from six rules to five.

Proof gate:
Habitat wrapper behavior for the widened rule; Injected violation proof for an
alias-import probe; Clean sample proof for allowed op-local config imports;
Record truth proof for ledger row retirement.

## Slice R3: Aggregate Habitat Check Runnability

Status: open tooling gate; enabling work, not rule semantics.

Problem:
the domain-source-topology ratchet closure receipt records this non-claim:
aggregate `bun habitat check --json` produced no JSON output after several
minutes and was interrupted. Every descent closure since has substituted
focused per-rule checks plus a named non-claim. The initiative's end state is
one aggregate command producing one green light; until aggregate check is
runnable, every proof gate pays this cost.

Action:
diagnose where aggregate execution spends its time across the 112 live rules
(structure runner, Grit pattern scans, command checks, provider scan roots),
then either make aggregate `bun habitat check --json` complete in bounded time
on this machine, or define and document an accepted sharded equivalent (per
blueprint kind or per lane) that closure receipts may cite as the aggregate
gate. Fix dependency or script issues in `tools/habitat` as needed to make the
gate runnable from a fresh worktree.

Acceptance:
a named command (aggregate or documented shard set) that completes with JSON
output in bounded time from a clean worktree, recorded in a receipt with exact
timings, plus the non-claim language closure receipts should stop carrying.

Not authorized:
changing any rule's semantics, selectors, baselines, or manifests to make
checks faster; deleting or disabling rules; treating a green shard as proof of
surfaces it does not scan.

Proof gate:
Native tool behavior (command completes, output parses), Record truth proof
for the receipt. No product source claims.

## Slice R4: Stale-Blocker Record Refresh

Status: open record-truth slice; no rule mutation.

Problem:
the `domain-operation-generic-surfaces` ledger slice records this blocker:
"operation-module verifier/generator and support-directory exception model"
for `score-shared`/`shared`/`mountains-shared`. Those support directories no
longer exist. Fresh evidence (2026-07-06):

```bash
for d in mods/mod-swooper-maps/src/domain/*/ops/*/; do
  [ -f "$d/contract.ts" ] || echo "$d"
done
# zero hits: every ops child is an operation root with a contract
```

The exception-model half of that blocker is stale; the source-owner design
half (how operation-interior law is enforced) remains live and is carried by
the descent opening packet's decision packets.

Action:
update the `domain-operation-generic-surfaces` slice record (blocker list,
`residualFollowUp`, `blockedBy`, evidence notes) so it reflects the current
tree and points to the descent opening packet as the live design surface. Do
not change `rules[]` rows, dispositions, or gate state beyond this record
refresh.

Why before the descent:
the descent must open from true blockers. A stale exception-model blocker
would either waste a decision packet or, worse, train agents to design for
directories that no longer exist.

Proof gate:
Record truth proof (ledger record matches fresh evidence commands, all quoted
in the receipt).

## Optional O1: Workspace Biome Sweep

Status: parked; native rail, not authority-tree remediation.

The `workspace-hygiene-native-rail-residual` ledger slice already concluded
that Biome owns formatting/import hygiene and that
`enforce_formatting_and_import_hygiene` is a Habitat-routed alias, currently
red from broad workspace drift. If a green hygiene light is wanted before the
descent, run a separate workspace-native cleanup against `biome:ci` /
`biome:format`. Do not count it as authority-tree semantic remediation and do
not let it block the descent.

## Sequencing

1. R4 first: cheapest, and it corrects the descent's input state.
2. R3 next: it changes what every later proof gate can claim.
3. R2 then R1 (or in parallel with each other): both are bounded rule slices
   with sealed destinations.
4. O1 any time or never.

Descent execution opens only after R2, R3, and R4 close. The descent opening
packet may be reviewed and refined in parallel; its decision packets may even
be ruled in parallel, but no descent source or rule mutation starts before
this runway is clear.

## Review And Closure

Each slice gets a fresh implementation lane and a separate fresh review lane
per the house review protocol; accepted P1/P2 findings block that slice's
closure. Each slice writes its own receipt with proof commands, proof classes,
and non-claims. This plan closes when R1-R4 receipts exist (or a slice is
explicitly rejected with evidence) and the roadmap's runway note is updated.

Non-claims:
this plan does not prove any current rule state, does not authorize descent
work, and does not decide any of the descent's open decision packets.
