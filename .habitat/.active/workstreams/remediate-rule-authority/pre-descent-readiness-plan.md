# Pre-Descent Readiness Plan

Status: hardened execution plan; no slice executed yet

Built: 2026-07-06 (hardened same day after two-lane investigation)

Owner: DRA Habitat authority-tree workstream steward

Purpose:
land the mechanical runway before the next blueprint descent executes: working
proof tooling, a smaller residual rule surface, records that match the current
tree, the descent workspace shape applied, and a clean reconciliation with the
Studio runtime packet-train merge. Every slice below is adjudicated or purely
enabling; none requires a new semantic decision beyond what its text states.

This plan authorizes execution of its own slices. Each slice runs as its own
layer on this readiness stack (base
`codex/pre-descent-readiness-and-descent-roadmap`), with its own receipt under
`.habitat/.active/workstreams/remediate-rule-authority/receipts/`. Mutating
rule slices follow `.habitat/.active/frames/RULE-REMEDIATION-SLICE-FRAME.md`.
Each slice gets a fresh implementation lane and a separate fresh review lane;
accepted P1/P2 findings block that slice's closure.

Execution home:
all runway work executes on this stack and nowhere else. No slice touches,
lands, or depends on any other branch or worktree. The parked Studio runner
worktree and the Studio runtime packet-train stack are read-only context for
this plan; nothing here modifies them. When the runway is ready, the bottom of
this stack merges and descent execution continues from there.

Stack topology:
this stack, bottom to top, is `main` → `codex/pre-descent-readiness-and-descent-roadmap`
(this plan, the roadmap, the shape doc) → `codex/domain-operation-blueprint-descent-opening`
(the descent opening packet) → the runway execution layers below. Each rule /
tooling slice (R1, R2, R3) is a layer above the opening packet; R4 and R5 must
run above the opening packet because they reference and rename its files
(`.habitat/.active/workstreams/descend-002-domain-operation-interior/`),
which exist only from `codex/domain-operation-blueprint-descent-opening`
upward. A slice run below that branch would not find the packet. R6 runs after
the Studio packet-train merges to `main` and this stack rebases onto it.

Position:
the operational ledger's `gateState.nextLegalAction` is "Select the next
highest-leverage blueprint authority descent or remediation slice." The
selection is recorded in
`.habitat/.active/workstreams/blueprint-descent-roadmap.md`; the selected
descent's opening packet lives at
`.habitat/.active/workstreams/descend-002-domain-operation-interior/`.
Descent execution opens only after R2, R3, R4, R5, and R6 close. R1 is
independent, non-gating, and should land whenever convenient.

## Investigation Findings (2026-07-06)

Two fresh read-only lanes (one Codex, one Opus) grounded this plan. Their
load-bearing findings, so no slice re-derives them:

1. The Studio runtime packet-train stack
   (`agent-codex-mapgen-studio-runtime-openspec-packets`, 2 commits, 80 files,
   4443 insertions) is docs-only at merge time: OpenSpec packets and indexes,
   zero changes to `.habitat/**`, `tools/habitat/**`, `mods/mod-swooper-maps/src/domain/**`,
   or `mods/mod-swooper-maps/src/recipes/**`. Live rule count stays 112 after
   its merge. Its 14 implementation packets define future structural-authority
   rows (SA-01 through SA-14) that are not yet live rules.
2. The parked Studio runner worktree's 11 dirty files are a coherent
   Run-in-Game redesign prototype (daemon `--watch` removal; deploy/registry
   semantics; a 639-line untracked proposal doc that the packet train
   formalizes). None is a `main` drift repair: on main-content,
   `bun habitat check --json --rule enforce_studio_dev_runner_topology` passes
   (`ok: true`, 0 findings) because `check.ts` and
   `apps/mapgen-studio/project.json` agree today. Disposition: leave parked;
   the redesign lands through the runtime workstream, not this runway. The
   untracked proposal doc is worth committing from the Studio lane; that is a
   recommendation to that lane, not a slice here.
3. Aggregate `bun habitat check --json` hang reproduced and root-caused:
   killed at 240s with zero-byte output (exit 124; JSON is written only at
   the end; `user` CPU 1.33s over 240s wall means the run blocks on serial
   child processes). Causes: (a) strictly serial lane execution in
   `tools/habitat/src/service/model/check/policy/structural/execution.policy.ts`
   (native → grit → structure → graph-command → command → file-layer) with a
   ~5-6s per-process bootstrap that cannot amortize; (b) heavyweight rules
   that serialize: `preserve_mapgen_core_runtime_neutrality` ~40s,
   `enforce_formatting_and_import_hygiene` ~18s (shells to `bun run biome:ci`),
   `verify_habitat_cli_smoke_contract` ~16s; (c) the 70-rule grit lane alone
   exceeds 235s. The CLI already has `--owner`, `--rule` (repeatable),
   `--runner`, `--staged`, `--output` flags; coarse shards time out
   (`--runner grit` >235s, `--owner mod-swooper-maps` >120s) while small
   buckets complete (`--owner mapgen-studio` 7 rules ~21s,
   `--owner mapgen-core` ~49s, single `--rule` runs 6-18s).
4. Toolkit doc drift: `tools/habitat/docs/CAPABILITIES.md` still says 124
   rules with stale per-owner counts; the live tree has 112 manifests.

## Slice R1: Helper-Surface Consolidation

Gating: no (independent of descent open).

Stack layer: `codex/readiness-r1-helper-surface-consolidation`, on this stack.

Source of authority:
ledger slice `mapgen-helper-surface-authority-consolidation` (queueOrder 1) in
`.habitat/.active/workstreams/remediate-rule-authority/ledgers/rule-authority-cleanup-ledger.json`,
receipt
`receipts/rule-remediation-mapgen-helper-surface-authority-consolidation.md`,
reviewer disposition `approve-with-repairs` recorded.

Action (quoting the sealed `nextLegalAction`):
enter Layer 3 for one bounded slice that widens/polishes
`prohibit_runtime_helper_redeclarations` for exact-equivalent public MapGen
core helper redeclarations, then absorbs/deletes
`prohibit_foundation_duplicate_math_helper_redefinitions` only to the covered
extent.

Write set:
the two rule packets' files; the ledger rows and receipt; no product source
except deletions the warrant already authorizes.

Not authorized (carried from the warrant):
moving byte/int8/vector quantization helpers into MapGen core; creating a
broad shared-utils owner; adding package-owned tests for helper redeclaration
residue; mutating product source outside the selected slice; changing
unrelated helper-family rows.

Acceptance (proof classes named):
Habitat wrapper behavior — `bun habitat check --json --rule prohibit_runtime_helper_redeclarations`
passes on the widened rule; Injected violation proof — an injected
exact-equivalent core-helper redeclaration fails the widened rule for each
absorbed failure class; Clean sample proof — a legitimately distinct helper
family (the excluded byte/int8/vector, Hydrology, Ecology, Resources families
the warrant names) does not false-positive; Native tool behavior / Record
truth proof — `rg` absence evidence for the retired shape and ledger/receipt
reconciliation, quoted with its limits. Deletion of
`prohibit_foundation_duplicate_math_helper_redefinitions` stays blocked until
the survivor's Injected violation proof covers the absorbed class.
`git diff --check` clean.

Stop conditions:
any widening that would require behavioral-equivalence judgment beyond
exact-equivalent redeclarations; any row outside the two selected rule ids;
any absorbed class the survivor cannot catch by Injected violation proof.

## Slice R2: Config-Facade Consolidation

Gating: yes.

Stack layer: `codex/readiness-r2-config-facade-consolidation`, on this stack.

Source of authority:
`perRuleDecisions.prohibit_foundation_op_contract_config_bags` in the ledger:
"Layer 3 should extend `prohibit_root_config_facade_imports_in_domain_ops` to
alias imports, preserve allowed op-local config imports, prove absence, then
retire this Foundation row." Existing owner:
`.habitat/blueprints/domain-operation/prohibit_root_config_facade_imports_in_domain_ops`.

Action:
widen the surviving rule to cover alias imports; keep allowed op-local config
imports green; prove absence of the old shape; delete
`prohibit_foundation_op_contract_config_bags` and its retired
`FoundationConfigSchema` literal residue; update ledger rows and write the
receipt.

Write set:
the surviving rule packet (pattern/check + manifest), the deleted packet
directory, ledger, receipt.

Acceptance (proof classes named):
Habitat wrapper behavior for the widened rule; Injected violation proof for
an alias-import probe under a domain op; Clean sample proof for an allowed
op-local config import; absence proof (`rg` for the retired literal and old
import shapes, zero hits quoted); Record truth proof for row retirement; live
manifest/ledger parity re-checked (expected 111 live rules after deletion).

Stop conditions:
the widened pattern lights up imports outside the config-facade class (blast
radius violation) — narrow or stop; any need to preserve the Foundation rule
id for a distinct concern.

## Slice R3: Aggregate Habitat Check Runnability

Gating: yes.

Stack layer: `codex/readiness-r3-aggregate-check-runnability`, on this stack.

Problem (evidenced; see Investigation Findings item 3):
aggregate `bun habitat check --json` cannot complete or emit partial output;
per-rule timing already exists in the report JSON (`durationMs`, shared
timing groups). Diagnosis is done. What remains is the fix.

Action — Path A (primary): make the aggregate command runnable.
Introduce bounded concurrency across and/or within the independent rule
lanes in `executeSelectedRulesEffect` (lanes are independent map-writes into
results; grit already batches internally), and/or stream results so a
timeout still yields parseable partial JSON with per-rule status. No rule
semantics, selectors, baselines, or manifests change.

Path B (fallback, only if A proves invasive): define a named shard set of
small buckets where every shard completes with JSON in bounded time, and a
coverage verifier proves the union of shard rule ids equals the live rule id
set with no missing, extra, or duplicate id. Coarse shards are measured
non-viable (`--runner grit` >235s, whole `--owner mod-swooper-maps` >120s), so
the buckets must be small: per-owner for every owner except `mod-swooper-maps`,
the three heavyweight rules isolated by `--rule`
(`preserve_mapgen_core_runtime_neutrality`,
`enforce_formatting_and_import_hygiene`, `verify_habitat_cli_smoke_contract`),
and the `mod-swooper-maps` remainder split into `--rule` groups each under the
time bound. The shard commands and their per-shard `--output` files are
declared in the R3 receipt, not improvised. The coverage verifier is concrete:

```bash
# union of shard-reported ids
jq -r '.rules[].id' shard-*.json | sort -u > /tmp/covered.ids
# live rule id set
find .habitat/blueprints .habitat/civ7 .habitat/docs .habitat/global .habitat/habitat \
  -name rule.json -exec jq -r '.id' {} + | sort -u > /tmp/live.ids
diff /tmp/live.ids /tmp/covered.ids   # must be empty; any line is missing/extra
# duplicate guard: a shard reporting an id another shard also reports
jq -r '.rules[].id' shard-*.json | sort | uniq -d   # must be empty
```

Also in scope (record truth): correct `tools/habitat/docs/CAPABILITIES.md`
rule counts (124 → live count) and stale per-owner counts while touching the
tooling docs.

Write set:
`tools/habitat/**` execution/reporting code (Path A) or a shard script plus
gate documentation (Path B); `tools/habitat/docs/CAPABILITIES.md`; receipt.

Acceptance:
- Path A: `time bun habitat check --json --output agg.json` completes from a
  clean worktree with parseable JSON in bounded time (target under ~180s on
  this machine; record the wall time), exit reflecting real rule state.
- Path B: every shard emits JSON under ~120s; a coverage command proves
  union-of-shards equals the live manifest count; the shard set and timings
  are recorded as the accepted aggregate gate.
- Either path: the receipt names the gate that closure receipts cite from now
  on, replacing the standing aggregate non-claim.

Stop conditions:
any change that alters a rule's pass/fail semantics; concurrency that breaks
report determinism (row order may vary, content may not); Path B shard set
that silently drops rules (coverage check is mandatory).

## Slice R4: Stale-Blocker Record Refresh

Gating: yes.

Stack layer: `codex/readiness-r4-stale-blocker-record-refresh`, above the
opening packet (it points at the packet path, which exists only from
`codex/domain-operation-blueprint-descent-opening` upward). If R5 has already
renamed the container, R4 points at the renamed path instead.

Problem:
the `domain-operation-generic-surfaces` ledger slice records the blocker
"operation-module verifier/generator and support-directory exception model"
for `score-shared`/`shared`/`mountains-shared`. Those directories no longer
exist (2026-07-06):

```bash
for d in mods/mod-swooper-maps/src/domain/*/ops/*/; do
  [ -f "$d/contract.ts" ] || echo "$d"
done
# zero hits: every ops child is an operation root with a contract
```

Action:
update that slice record (blocker list, `residualFollowUp`, `blockedBy`,
evidence notes) to current-tree truth and point to the descent opening packet
(`.habitat/.active/workstreams/descend-002-domain-operation-interior/`)
as the live design surface for the surviving source-owner questions. No
`rules[]` mutation, no disposition changes, no gate-state change beyond this
record refresh.

Write set:
`ledgers/rule-authority-cleanup-ledger.json` (the one slice record), receipt.

Acceptance:
Record truth proof — the refreshed record quotes the fresh evidence commands
and output; `bun habitat classify .habitat` still routes cleanly;
`git diff --check` clean.

Stop conditions:
any temptation to touch rule rows or dispositions while in the file.

## Slice R5: Apply The Descent Workspace Shape

Gating: yes (the last preparation slice before descent execution).

Branch: applied on the open descent stack (amend/commit on
`codex/pre-descent-readiness-and-descent-roadmap` and
`codex/domain-operation-blueprint-descent-opening` while unmerged; no
separate branch needed).

Source of authority:
`.habitat/.active/workstreams/descent-workspace-shape.md` after its review
passes.

Action:
apply the shape doc's Application section so descent 002's born-conformant
container is `descend-002-domain-operation-interior/`; update the workstreams
`README.md` row, the roadmap container column, the transition-anchor pointer,
this plan's pointers, and internal cross-references. Phase folders
(`execution/`, `receipts/`) and `ascent.md` are created by first use, not at
shape application.

Acceptance:
zero stale references to the retired pre-shape paths across
`.habitat/.active/**`; `bun habitat classify .habitat` clean; stack submitted.

Stop conditions:
review findings against the shape doc that change the grammar — apply the
repaired grammar, not the draft.

## Slice R6: Post-Merge Reconciliation

Gating: yes (executes after the Studio runtime packet-train stack merges to
`main`; expected before descent execution).

Stack layer: `codex/readiness-r6-post-merge-reconciliation`, above the
opening packet. Always writes a receipt (a lightweight one if the delta is
empty); never silently skipped.

Base refs (this is the F1 fix — do not diff `0c97517d86...HEAD`, which would
show this stack's own R1-R5 mutations, not the Studio merge):
- `PRE` = the `main` tip immediately before the Studio packet-train merges
  (capture it: `PRE=$(git rev-parse origin/main)` before the merge, or
  `git merge-base HEAD origin/main` after);
- `POST` = `origin/main` after the Studio merge.

Action — two independent checks, a record-truth pass, not a redesign:

Check 1, Studio-merge delta (diff PRE..POST, isolates only what the merge
added; expected docs-only):

```bash
git diff --name-status "$PRE".."$POST" -- .habitat tools/habitat package.json bun.lock nx.json
git diff --name-status "$PRE".."$POST" -- mods/mod-swooper-maps/src/domain mods/mod-swooper-maps/src/recipes
# rule count on main is unchanged by the Studio merge (the merge adds no rules;
# this stack's R2 deletion is NOT on main at R6 time):
git ls-tree -r --name-only "$PRE" | rg 'rule\.json$' | wc -l
git ls-tree -r --name-only "$POST" | rg 'rule\.json$' | wc -l   # must equal PRE
```

Check 2, descent-seed reproduction (absolute snapshots on the reconciled tree
after this stack rebases onto POST; independent of R2 because they census
source, not rules):

```bash
find mods/mod-swooper-maps/src/recipes/standard -maxdepth 1 -mindepth 1 | sort
for d in mods/mod-swooper-maps/src/domain/*/ops/*/; do [ -f "$d/contract.ts" ] || echo "$d"; done
rg -o "from ['\"]([^'\"]+)['\"]" -r '$1' --no-filename mods/mod-swooper-maps/src/domain/*/ops/*/strategies/*.ts | sort | uniq -c | sort -rn
```

Expected per the investigation: Check 1 shows no `.habitat`/tooling/domain/
recipe delta and an unchanged main rule count; Check 2 reproduces the descent
`ledger.md` censuses. Any deviation updates the descent `ledger.md` seed and,
if material, reopens the affected decision packet with the new evidence.

Acceptance:
Record truth proof — PRE/POST refs, both checks' commands and outputs, and
deltas (expected none) recorded in the receipt; descent `ledger.md` seed
marked re-verified or updated.

Stop conditions:
a non-empty Check-1 domain/recipe/tooling delta or a changed main rule count —
that is new evidence, not an error; route it to the descent ledger and stop
the reconciliation slice there.

## Optional O1: Workspace Biome Sweep

Unchanged: parked native-rail cleanup
(`workspace-hygiene-native-rail-residual`); run only if a green hygiene light
is wanted; never counts as authority-tree remediation; never blocks the
descent. Note: R3 Path A reduces the pain of this rule's ~18s cost inside
aggregate runs but does not clean the drift.

## Execution Order

```text
now (pre-merge, any order):  R4 -> R3 -> R2   (R1 whenever convenient)
shape review passes:         R5 (on the open stack, before it merges)
packet-train stack merges:   R6
descent execution gate:      R2 + R3 + R4 + R5 + R6 closed
```

All of R1-R4 are measured safe to execute before the packet-train merge (the
committed stack touches none of their inputs). R5 exploits the unmerged
window: renames cost nothing while descent 002's container exists only on
this stack. R6 is pinned to the merge event, whenever it lands.

## Review And Closure

Each slice: fresh implementation lane, separate fresh review lane, P1/P2
findings block that slice's closure, receipt with proof commands, proof
classes, and non-claims. This plan closes when R1-R6 receipts exist (or a
slice is explicitly rejected with evidence) and the roadmap's runway note is
updated to point at the receipts.

Non-claims:
this plan does not prove any current rule state beyond the dated findings
quoted above; it does not authorize descent work; it does not decide the
descent's decision packets; investigation findings are dated evidence and
each gating slice re-verifies what it depends on.
