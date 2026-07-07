# Studio-Stack Overlap Reconciliation Ledger

Status: RUNNING DRAFT — unsettled. The Studio runtime-realization stack is still
finalizing; this ledger is regenerated whenever that stack changes.

Built: 2026-07-07

Owner: DRA Habitat authority-tree workstream steward

Supersedes the scout in:
`.habitat/.active/workstreams/remediate-rule-authority/receipts/readiness-r6-post-merge-reconciliation.md`
(R6 scouted the wrong Studio tip; see "R6 correction" below). This ledger is the
living successor to that R6 advisory scout.

## Purpose

Hold the semantic overlap between two stacks that branch from the same `main`
and are both intended to land on it:

- PREWORK (this stack) — the pre-descent readiness runway, then the descent
  initiative that continues from it.
- STUDIO — the mapgen-studio run-in-game runtime-realization refactor
  (`agent-codex-mapgen-studio-runtime-openspec-packets`).

STUDIO made infrastructure changes to enable its own work (the Grit provider,
Habitat rule packets, recipe-stage authoring law) that the readiness plan did
not account for up front. This ledger records where those changes overlap,
conflict with, or create forward dependencies for the descent work, so that
when STUDIO settles we can decide whether additional pre-work realignment
branches are needed before draining PREWORK and restacking STUDIO onto it.

What this ledger is not: it is not the standalone review of the PREWORK stack
(that is reported separately and concerns un-sliced-tip / stale-record defects
internal to PREWORK), and it does not itself merge, rebase, or mutate either
stack. It records; the steward decides.

## Ground Truth (record-truth proofs)

```bash
BASE=0c97517d861a22d48a763fe92c93fc31703ad31b            # origin/main merge-base of both stacks
PREWORK=f5633c0d68                                        # codex/readiness-final-aggregate-proof-green tip
STUDIO=3c296f9736                                         # agent-codex-mapgen-studio-runtime-openspec-packets tip ("Close Packet 1 live diagnostics gate")
git merge-base $BASE $PREWORK   # -> BASE
git merge-base $BASE $STUDIO    # -> BASE
```

Rule-manifest corpus counts (`git ls-tree -r --name-only <ref> | grep -c 'rule.json$'`):

| Ref | rule.json count |
| --- | --- |
| BASE (`main` 0c97517d86) | 112 |
| PREWORK tip (f5633c0d68) | 111 (R2 deleted one facade packet) |
| STUDIO tip (3c296f9736) | 117 (net +5: adds pipeline-runtime + run-in-game rules, deletes one ecology rule) |

Proven restack-conflict surface
(`git merge-tree --write-tree f5633c0d68 3c296f9736`, exit 1):

```text
CONFLICT (content): tools/habitat/src/providers/grit/runner.ts
CONFLICT (content): tools/habitat/src/providers/grit/source-check.ts
CONFLICT (content): tools/habitat/test/lib/grit-provider.test.ts
```

Everything else auto-merges. `tools/habitat/src/providers/grit/scan-roots/index.ts`
is byte-identical on both sides (`git diff f5633c0d68 3c296f9736 -- <file>` is empty).

## R6 Correction (why this ledger exists)

The R6 receipt is stale in a way its own revisit hook does not catch:

- R6 recorded `STUDIO=180293b416` — the PARENT of the real branch tip
  `3c296f9736`. It scouted one commit too low.
- R6 was closed while PREWORK `HEAD=a51d3ef0d6` (R1), i.e. BEFORE the
  `f5633c0d68` tip commit existed. At that time the runway genuinely did not
  touch the Grit provider, so R6's non-claim ("does not merge, rebase onto, or
  modify the Studio packet-train") was true.
- The later PREWORK tip commit `f5633c0d68` then made the runway's OWN divergent
  edits to the same three Grit files, converting an advisory delta into a real
  restack conflict. The word "conflict" appears nowhere in R6.
- R6's Studio rule count is off by one (recorded 116; true count at the real tip
  is 117 — the tip adds
  `.habitat/civ7/mapgen/studio/run-in-game/rules/grit-studio-run-public-contract-closed/`
  = rule.json + baseline.json + pattern.md).

R6's revisit hook only fires "if the Studio stack lands, rebases, or is selected
as the execution base" — it does not cover "the PREWORK stack later edits the
same files." This ledger closes that gap.

## 1. The Conflict Surface — Grit Provider (3 files, UNSETTLED)

All three conflicts are the SAME underlying fact: PREWORK's tip commit
`f5633c0d68` introduced a THIRD divergent variant of the Grit-provider fix that
STUDIO also makes. The changes are semantically reconcilable, not contradictory
in intent.

Shared substrate (already identical on both sides, no action):
`scan-roots/index.ts` — both stacks add `scanRootIsWithinDeclaredRoot` /
`scanRootMatchesDeclaredRoot` and rewire `selectedScanRootsForRules` /
`isApprovedScanRoot` off `pathsOverlap` (base `24106d6d6d` -> `4bb3b502ca`).
Caveat: because this is now shared authority, any LATE edit on either stack
breaks the current clean auto-merge.

Shared refactor (identical intent, auto-resolves modulo adjacency):
`source-check.ts` — both replace symlink `materializeGritWorkspace` with
`Effect.scoped materializeGritConfig` (scoped temp `--grit-dir` + `rmSync`
cleanup via `acquireRelease`, `cwd=repoRoot`). The only real divergence is the
batch-matching block, mirrored from `runner.ts`.

Divergent decision (the actual conflict): `runner.ts` batch matcher.

| | PREWORK (`f5633c0d68`) | STUDIO (`3c296f9736`) |
| --- | --- | --- |
| Explicit-scanRoot matcher | `pathsOverlap` (prefix overlap) | `scanRootIsWithinDeclaredRoot` (directional containment) |
| Unmatched rules | `fallbackBatches` re-run against all requested scan-roots (fail-closed, no silent drop) | dropped (no fallback) |
| Coupling | none extra | narrows two domain-operation rules' scanRoots (see §3) so drop-on-no-match is safe |

Two-way dependency (the load-bearing subtlety): STUDIO's drop-on-no-match
semantics is WHY it narrowed the two domain-operation rules' scanRoots. If
STUDIO's matcher wins WITHOUT also carrying those rule.json narrowings, any
broad-`declaredRoot` rule could silently stop firing — a regression in exactly
the aggregate-proof completeness R3 established. Conversely, PREWORK's
`fallbackBatches` is the completeness guarantee R3's aggregate proof currently
depends on.

Candidate reconciliation (steward to ratify — this is the hinge decision):
choose ONE canonical Grit implementation and land it once, referenced by both
lanes. A defensible default: keep PREWORK's default exact-match matcher +
`fallbackBatches` completeness guarantee, and re-apply STUDIO's one net-new
intent by swapping the explicit branch to `scanRootIsWithinDeclaredRoot`; verify
against STUDIO's "does not include narrow-root rules in broader sibling batches"
test. For `grit-provider.test.ts`, superset both suites (dedupe the shared
`gritDirFromRequest` / `requestArgvWithoutGritDir` helpers; keep PREWORK's
fail-closed refusal tests AND STUDIO's per-rule config-isolation + cleanup
tests); re-run the combined suite after the code merge.

Because PREWORK is intended to merge to `main` first, whichever Grit shape lands
on PREWORK becomes the rebase baseline STUDIO reconciles against. That makes the
Grit-ownership decision a PREWORK-side prerequisite, not a STUDIO-side one.

## 2. Disjoint (SETTLED — no dependency either direction)

The STUDIO product surface is confirmed independent of descent-002's target law:
`packages/studio-contract`, `packages/studio-server`,
`packages/mapgen-studio-ui` (runInGame/errors, operationRuntime/router,
GameConsole/statusLabels), the ~13 openspec run-in-game packets, and STUDIO's
single `src/domain` touch
(`mods/mod-swooper-maps/src/domain/resources/model/schemas/resource-family.schema.ts`).
None touch `.habitat/scopes/**`, `structure.toml`, or the `src/domain` ops
interior. `resource-family.schema.ts` sits under `model/schemas/`, which the
descent-002 frame explicitly parks EXTERIOR (domain `model/` internals are
descent 3). Neither stack materially touches `.habitat/scopes/**` or
`structure.toml`, so the descent's authority-owner surface is clean.

Descent-002's named ecology-local targets
(`require_ecology_canonical_op_module_topology`,
`validate_ecology_op_contract_quality`) are NOT touched by STUDIO (verified via
grep). Descent-002 target law is disjoint from STUDIO.

## 3. Forward-Dependency Register (UNSETTLED — feeds future descent frames)

These do not conflict at merge; they change the terrain a future descent must
census. Recorded here so the roadmap coordination note and the affected descent
frames absorb them rather than re-derive them.

| # | Surface | STUDIO change | Affects | Trigger to act |
| --- | --- | --- | --- | --- |
| F1 | `.habitat/blueprints/domain-operation/{require_domain_operation_contract_file_shape,require_domain_ops_registry_surface}/rule.json` | Narrows scanRoots from `['.../src/domain']` to six explicit per-domain `.../ops` paths, coupled to its runner matcher. PREWORK leaves both at base (auto-merge; PREWORK edits a DIFFERENT row in the same dir via R2, non-overlapping). | descent-002 (SELECTED) | When Grit reconciliation settles: descent-002 must author its new ops-interior rules to the explicit-per-domain-ops scanRoot convention + matcher expectations, not base broad-root, or they silently under-fire. Fold into decision packet 003 (contract-quality owner). |
| F2 | `.habitat/blueprints/recipe-stage/require_recipe_stage_authoring_file_shape/{rule.json,pattern.md}` + `mods/mod-swooper-maps/src/recipes/standard/stages/*-public-config.ts` | ALREADY LANDED (c2568ce3f5): shared `*-public-config.ts` rails, formerly forbidden "topology residue", are now a permitted authoring surface; 6 new public-config modules. | descent 4 (recipes/stages) | Descent 4's opening frame must re-census recipe/stage terrain AFTER this lands on main and treat "shared public-config rail" as an input, not a conflict. Cannot be planned against the main-era recipe-stage rule. |
| F3 | openspec `swooper-catalog-index-cutover` / `swooper-catalog-source-index` / `swooper-map-artifact-file-plan` / `swooper-run-manifest-generator` + new structural rows SA-04/06/08/09 + a temporary grit pattern | PROPOSED-ONLY (tasks unchecked, no src/nx impl on the tip). Will replace directory-scan catalog membership with a tracked CatalogSourceIndex, fix generated map entrypoints, extract a SwooperMapArtifactFilePlan boundary. | descents 4 and 5 | Re-census trigger is STUDIO packet IMPLEMENTATION, not merge of the current tip. SA-04/06/08/09 will pre-occupy catalog-source and Nx-target authority those descents would claim — absorb rather than re-derive. |
| F4 | `.habitat/civ7/mapgen/pipeline/runtime/_remainder/**` (5 new ecology/hydrology/legacy-generator token-prohibition rules) + `studio/run-in-game/rules/grit-studio-run-public-contract-closed` | Adds 5 pipeline-runtime negative-guard rules + 1 run-in-game rule, deletes 1 ecology rule → corpus 112→117 at the STUDIO tip. | descents 4 and 7; corpus-count accounting (R3/R6, roadmap burn-down math) | Descent 4 (and descent 7 for the run-in-game rule) inventory these guards as absorption candidates. Re-pin the roadmap's 112 baseline to the post-STUDIO-merge corpus count so descent burn-down measures against the corpus that will actually exist. |
| F5 | openspec `mod-swooper-catalog-order-proof` habitat-harness H4 spec + per-packet `openspec validate --strict` gates | Authors an H4 harness requirement (Formatter-Stable Catalog Ownership Proofs) and couples openspec tooling to the habitat rail / config-facade authority R2 consolidated. Confidence medium (proposed/frozen). | descents 8 and 4; aggregate-proof runtime | Descent 8 (aggregate green gate) and descent 4's catalog-ownership proof must ensure H4 lands in the same harness the aggregate gate runs, and that the added proof does not re-inflate the aggregate-check runtime R3 just made runnable. Consequent on Grit reconciliation. |

## 4. Load-Bearing Decisions (what only the steward can settle)

1. GRIT OWNERSHIP (the hinge). Does the readiness runway OWN a Grit-provider fix,
   or does the STUDIO lane? One canonical implementation must be chosen before
   EITHER stack merges. Sub-decisions: explicit-branch matcher (`pathsOverlap`
   vs `scanRootIsWithinDeclaredRoot`) and `fallbackBatches` yes/no — noting the
   §1 two-way dependency with STUDIO's domain-operation scanRoot narrowings (F1).
2. RE-SLICE THE TIP? Whether to split PREWORK's `f5633c0d68` before merge:
   (a) route the Grit surgery to its own receipted slice OR remove it from the
   runway entirely so STUDIO owns the single canonical fix; (b) land/drop the
   Biome formatter sweep as its own O1 hygiene commit; (c) land the mapgen-docs
   anchor rewrite as its own reviewed change. (This is also a standalone-review
   blocker independent of STUDIO — see the review report.)
3. MERGE SEQUENCING. Merge PREWORK to `main` first (its Grit shape becomes the
   rebase baseline) or hold until STUDIO freezes so the single canonical Grit fix
   and the F1 domain-operation scanRoot narrowings land coherently.

## 5. Accommodation Options (to decide once STUDIO settles)

- OPTION A — shared Grit pre-work branch. Land ONE canonical Grit provider (best
  of both variants) as a dedicated pre-work branch at the bottom of PREWORK that
  BOTH stacks depend on; STUDIO rebases onto it and drops its own Grit edits.
  Eliminates the 3-file conflict, R6's blindspot, and R3-staleness in one move.
- OPTION B — strip Grit from the runway. Remove the Grit surgery from
  `f5633c0d68`; let STUDIO own the canonical Grit fix; PREWORK keeps only R3's
  `execution.policy.ts` concurrency change. Smallest PREWORK footprint; defers
  the canonical-Grit decision to STUDIO.
- OPTION C — merge PREWORK-minus-grit first, reconcile at STUDIO's rebase.
  Accept a known 3-file conflict resolved once, during STUDIO's restack, per §1's
  candidate reconciliation. Least up-front work; carries the conflict forward.

Recommended default: Option A if STUDIO is close to freezing (cleanest, makes the
Grit fix a first-class shared dependency); Option B if STUDIO will keep churning
the Grit provider (avoid chasing a moving target on the runway).

## Revisit Triggers

Regenerate this ledger when any of these occur:
- STUDIO tip advances beyond `3c296f9736` (re-run the merge-tree and re-count).
- STUDIO freezes / is submitted for merge (settle §4 and pick a §5 option).
- Any STUDIO openspec packet in F3/F5 moves from proposed to implemented
  (fires the descent-4/5/8 re-census triggers).
- PREWORK re-slices `f5633c0d68` (the conflict surface and Grit shape change).

## Non-Claims

This ledger does not merge, rebase, or modify either stack. It does not decide
the Grit ownership question or re-slice any commit. It does not claim the STUDIO
tip is final. Counts and conflict surfaces are snapshots at the SHAs named in
Ground Truth and are only valid until either tip advances. The disjoint and
redundant classifications (§2 and the scan-roots case in §1) are settled at the
current SHAs; every conflict and forward-dependency entry is UNSETTLED pending
STUDIO finalization.

## Cross-Links

- Stale predecessor scout: `receipts/readiness-r6-post-merge-reconciliation.md`.
- Runway plan: `pre-descent-readiness-plan.md` (R3 aggregate runnability, R6).
- Selected descent: `../descend-002-domain-operation-interior/` (F1 target).
- Cross-descent view: `../blueprint-descent-roadmap.md` (F2–F5 forward triggers;
  re-pin the 112 baseline per F4).
- Rule corpus: `ledgers/rule-authority-cleanup-ledger.json`.
