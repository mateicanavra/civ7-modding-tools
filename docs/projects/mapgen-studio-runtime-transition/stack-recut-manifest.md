# Stack Recut Manifest

Snapshot: opening branch/commit inventory observed on 2026-07-09. This file is
not live status; current coverage, recovery, and gate state live in
`verification-ledger.md`.

Normative method:
`docs/projects/mapgen-studio-runtime-transition/WORKSTREAM.md`

This manifest keeps source history, semantic units, Graphite accounting, and
verification validity separate. It is not authority for product behavior or
target architecture.

## Opening Anchors

| Field | Value |
| --- | --- |
| Historical opening base | `29e6e4bfdd5a8c576478c809c242b2cd35934501` |
| Stage 0 recovery main | `46943c5f11656773b12ccbf5585f23f64c1cb266` |
| Opening head | `9f2e715fe159755b0db93bc1c80ec9bbdbea0383` |
| Parked readiness tip | `codex/readiness-final-aggregate-proof-green@92cc1513cc5c43795f7b800fddc2325849869f5e` |
| Runtime tip below future authority | `6b6946fe10` |
| Commits above main | 39 |
| Graphite layers above main | 13 |
| Changed paths | 475 |
| Aggregate delta | 66,539 insertions, 13,529 deletions |
| Opening worktree state | clean before this workstream document was authored |
| Opening-lane restack state | no pending restack observed |
| Submission state | no matching remote branch or submitted-version evidence observed |

Stage 0 must revalidate every anchor before creating recovery refs or changing
topology. This file becoming tracked is an intentional workstream delta, not
part of the opening 39-commit corpus.

## Recovery Artifact Contract

Stage 0 uses one selected mechanism, not an implementation-time choice:

1. Resolve the common Git directory with `git rev-parse --git-common-dir` and
   create `<common-git-dir>/codex-recovery/mapgen-studio-runtime-closeout/<UTC>/`.
2. Record a sorted `refs.tsv` containing every in-scope branch name, commit, and
   tree from the opening chain below.
3. Create `opening-stack.bundle` with `git bundle create` over refreshed
   `main@46943c5f1165` and every named opening-chain branch. The historical
   opening base remains ancestry metadata, not the current `main` ref. Do not
   use a glob that can silently adopt sibling branches.
4. Write `opening-stack.bundle.sha256` with `shasum -a 256` and run
   `git bundle verify opening-stack.bundle`.
5. Restore the bundle into a disposable directory made with `mktemp -d`, using
   normal `git clone`/`git fetch` commands. Compare every restored commit and
   tree with `refs.tsv`; zero mismatch is required.
6. Record command transcript, bundle path, checksum, verification output,
   restore directory, comparison result, owner, and retention trigger in
   `gate-register.jsonl` and `cleanup-register.jsonl`.
7. Remove the disposable restore after the comparison. Retain the bundle,
   checksum, and `refs.tsv` until Stage 9 confirms every source has a terminal
   sink/accounting disposition and the closeout PR is ready to merge.

The exact bundle ref list is the 13 branch names in `Opening Graphite Chain`
plus refreshed `main@46943c5f1165`. Stage 0 fails if any listed ref moved from
its revalidated recovery anchor between census and bundle creation. The
historical `29e6e4bfdd5a` base is recorded separately and must not be written as
the `main` row in `refs.tsv`.

The parked readiness tip is an external mutation sentinel, not bundle source.
Planning and Stage 0 record its exact ref/commit before and after every
Git/Graphite mutation. Any movement aborts the cohort and enters investigation;
the closeout must not restack, reparent, merge, or delete that stack.

### Recovery Receipt

The historical recovery contract completed before the source restack:

| Field | Recorded value |
| --- | --- |
| Artifact root | `<common-git-dir>/codex-recovery/mapgen-studio-runtime-closeout/20260710T152657Z/` |
| Creation window | 2026-07-10 11:26-11:28 EDT |
| Bundle checksum | `75f6b9871898cc6c120d6c34555eb70e95d486497401470ad693e6d35e0201bf` |
| Included refs | 13 historical Studio branches plus `main@46943c5f1165` |
| Bundle verification | passed; complete history reported |
| Disposable restore | 14 of 14 commit/tree rows matched; restore removed |
| Retention | bundle, checksum, refs, transcript, and comparison retained through Stage 9 |

`HEAD` reflog records the later source restack beginning at 2026-07-10
13:40:26 EDT. The recovery artifact therefore precedes and covers that rewrite.
Changing branch names after the verified capture does not invalidate the
historical bundle. Any claim that the opening refs were rewritten before
recovery is rejected by these timestamped artifacts.

## Post-Recovery Current Lineage

The historical opening snapshot above remains immutable. The current lineage
is a restacked continuation plus the locally sealed workstream train through
the reviewed takeover frame:

| Order | Branch | Tip | Tree | Role |
| --- | --- | --- | --- | --- |
| 0 | `main` | `46943c5f1165` | `7045724260a9` | refreshed trunk checkpoint |
| 1 | current runtime tail through `codex/studio-run-live-playability` | `4f501fabfdc6` | `4f5afae58895` | 38 restacked runtime commits; opening Foundry duplicate dropped after its accepted main sink merged |
| 2 | `codex/mapgen-studio-runtime-transition-planning` | `ca6a06d24fff` | `e1fdd42a43c6` | reviewed planning patch, restacked without semantic patch drift |
| 3 | `codex/mapgen-studio-config-envelope-runtime-cutover` | `3f5ed12e81a5` | `cee65cc2cc97` | post-planning candidate source; canonical config-envelope cutover |
| 4 | `codex/mapgen-studio-manifest-parity-replay` | `b2367c50d6ae` | `9fec971dd5dd` | post-planning candidate source; manifest-backed final-surface replay |
| 5 | `codex/mapgen-studio-runtime-stage-0-census` | `76bfbcaa434d` | `b2f9acbb979e` | lightweight source/control census; historical opening recovery remains immutable |
| 6 | `codex/mapgen-studio-complete-config-admission` | `9b082bac2434` | `09bac909abb3` | Packet A closed-passed local candidate; complete recipe config admission |
| 7 | `codex/mapgen-swooper-test-topology` | `ceb6832e329d` | `8b36aa726831` | Packet A.1 closed-passed local candidate; semantic test-owner alignment |
| 8 | `codex/mapgen-studio-dev-contract-freshness` | `3a2630c1085f` | `37d75f0be6ba` | Packet A.1a closed-passed local candidate; serve/build contract freshness split |
| 9 | `codex/mapgen-studio-codex-lifecycle-alignment` | `e69842a4f680` | `a67cdf232432` | closed-passed local lifecycle candidate; private worktree ownership alignment |
| 10 | `codex/mapgen-domain-operation-topology` | `16745e337902` | `4d21d984b55b` | reviewed A.2 execution frame |
| 11 | `codex/mapgen-generated-validator-ownership` | `dd38de22e05b` | `b2db805e9e01` | sealed A.2 prerequisite; generated validation returned to package/Nx owners |
| 12 | `codex/habitat-rule-introduction-baseline-manifests` | `9ff0f711e0d7` | `cead8dce8406` | sealed A.2 prerequisite; registry-owned rule-introduction manifests reach runtime |
| 13 | `codex/mapgen-runtime-closeout-takeover-frame` | `8ec2a96e3319` | `94f656ef318d` | reviewed takeover, DRA transfer, scope supplement, and protected continuation boundary |

Range comparison maps the 39 opening commits to 35 exact restacked patches,
three conflict-adjusted patches, and one dropped future-Foundry duplicate. The
historical and current identities remain separate accounting inputs until the
three adjusted patches receive semantic review.

The current takeover tip is 50 commits and 871 changed paths above
`main@46943c5f1165`. The inherited source immediately before the takeover frame
was 49 commits and 870 paths. All continuation branches remain local and
unsubmitted. Their isolated gates make them source evidence, not pre-authorized
final sinks, and do not close P20, P21, or the product matrix.

The independently owned readiness stack moved after the Studio restack and
before this resumed Stage 0 cohort. Its current sentinel is
`codex/readiness-final-aggregate-proof-green@f325250d087843e13b8c529c4fd036b84d911162`.
The closeout does not mutate it; movement from this rebound identity during a
Studio mutation lease is the new abort condition.

## Planning Child Mutation Contract

The planning layer is the only pre-recovery child permitted. Its staged set is
exactly this project directory plus the two packet-index navigation files. The
command, parent assertions, readiness sentinel, and abort behavior are
normative in `WORKSTREAM.md` under Planning Closure. A successful operation
must leave:

- `codex/mapgen-studio-runtime-transition-planning` with one new commit whose
  sole parent is opening head `9f2e715fe1`;
- all 13 opening branch refs unchanged;
- `main@46943c5f1165` unchanged;
- the parked readiness tip unchanged at `92cc1513cc5c`;
- no staged, unstaged, untracked, merge, rebase, cherry-pick, or Graphite
  mutation residue.

Any mismatch is a failed planning-mutation attempt. Do not recover by restacking
an opening ref; retain the failed command record and enter a focused Graphite
repair loop.

## Opening Graphite Chain

Counts are commits introduced relative to each Graphite parent.

| Order | Branch | Tip | Commits | Opening role |
| --- | --- | --- | --- | --- |
| 0 | `main` | `29e6e4bfdd` | n/a | trunk |
| 1 | `agent-codex-mapgen-studio-runtime-openspec-packets` | `b58ee710a3` | 25 | original runtime packet train |
| 2 | `codex/effect-biome-lint-rules-audit` | `d41a5d024a` | 3 | Effect plugin audit plus remediation proposal/packets |
| 3 | `codex/effect-biome-lint-baseline-stabilization` | `d7c77a2734` | 1 | Effect diagnostic repairs |
| 4 | `codex/run-game-remediation-frame` | `a2c75a01c3` | 1 | remediation execution frame |
| 5 | `codex/foundation-orogeny-public-config-surface` | `b9a8ef24b2` | 1 | remediation P15 |
| 6 | `codex/run-game-remediation-six-packet-frame` | `a5b04ce049` | 1 | frame update |
| 7 | `codex/studio-run-terminal-adoption-invariant` | `1a0b560e24` | 1 | remediation P16 |
| 8 | `codex/studio-run-browser-originated-contract` | `0a0285ac4f` | 1 | remediation P17 |
| 9 | `codex/studio-run-setup-failure-taxonomy` | `a4c0569e52` | 1 | remediation P18 |
| 10 | `codex/mapgen-studio-dev-runtime-control` | `d4fca4dd2a` | 1 | Studio lifecycle tooling |
| 11 | `codex/studio-preset-authority-single-source` | `d5f81b32a0` | 1 | cross-cutting config authority |
| 12 | `codex/studio-run-live-playability` | `6b6946fe10` | 1 | mixed late runtime/config/daemon repair |
| 13 | `codex/civ7-foundry-target-authority` | `9f2e715fe1` | 1 | future target authority, not runtime implementation |

## Semantic Unit Corpus

`P01` through `P14` follow the original packet index. `P15` through `P21`
follow the remediation packet index.

| Unit | Change | Source commits or candidate | Accounting / cut signal |
| --- | --- | --- | --- |
| FRAME-ORIGINAL | runtime packet framing | `cd891c31da`, `3a3582645e` | one framing/control layer or distribute packet records |
| P01 | `studio-run-public-status-diagnostics` | `1f73d48865`, `99051d6df0`, `3c9644ea51` | fold packet commits; split broad Habitat/MapGen repairs from `1f73d` |
| P02 | `studio-run-operation-registry-identity` | `d86870a6f2`, `771606114b` | fold |
| P03 | `studio-run-explicit-cancellation` | `06f95d5eef` | own packet branch after P02 |
| P04 | `swooper-catalog-source-index` | `2e33be0812` | independent original-train root |
| P05 | `studio-run-launch-source-resolution` | `7c574c3a81`, `2d51a75805` | fold |
| P06 | `swooper-map-artifact-file-plan` | `580715f067` | split generic Habitat provider repair from packet code |
| P07 | `studio-run-generation-manifest` | `596496752a` | own packet branch |
| P08 | `swooper-run-manifest-generator` | `061b5d677b` | keep together by default; Stage 1 must decide any shared run-workspace extraction before sink graph design |
| P09 | `swooper-catalog-index-cutover` | `16d6b17652` | own packet branch |
| P10 | `studio-run-generator-integration` | `ec82f65274` | own packet branch; retained logs require whitespace disposition |
| P11 | `studio-run-deployment-snapshot-lease` | `216a9e6dbe` | own packet branch |
| P12 | `studio-run-runtime-observation` | `d4990c9333`, `2ca6f35401`, `e1f6e2be3a`, `d601395a42`, `1359e50bde` | fold |
| P13 | `studio-run-attribution-report` | `592654704d` | own packet branch |
| P14 | `studio-run-diagnostics-retention-guards` | `546331fad0`, `b58ee710a3` | fold; separate aggregate authority disposition |
| TOOL-EFFECT | Effect Biome plugin admission and repair | `d26a2b8148`, `d7c77a2734` | one tooling family; Stage 1 fixes its semantic diagnostic groups before sink graph design |
| FRAME-REMEDIATION | proposal, packet train, and execution frame | `09b9caea3f`, `d41a5d024a`, `a2c75a01c3`, `a5b04ce049` | distribute packet directories to owning packet layers; keep one directional frame |
| P15 | `foundation-orogeny-public-config-surface` | `b9a8ef24b2` | own packet branch |
| P16 | `studio-run-terminal-adoption-invariant` | `1a0b560e24` plus late `6b6946fe10` slices | refresh evidence after late repair |
| P17 | `studio-run-browser-originated-contract` | `0a0285ac4f` plus overlapping late config/request slices | refresh evidence after late repair |
| P18 | `studio-run-setup-failure-taxonomy` | `a4c0569e52` plus overlapping late setup slices | refresh evidence after late repair |
| P19 | `studio-run-generated-map-mod-visibility` | packet docs plus `6b6946fe10` renderer/deployment/setup slices | amend stable-row authority before implementation |
| P20 | `studio-run-saved-config-modset-reconciliation` | packet docs plus `6b6946fe10` setup/direct-control slices | implementation partial; verification records contradictory |
| P21 | `studio-run-real-user-matrix-closure` | packet docs and retained runtime logs | open; exact rendered/browser/Civ7 matrix required |
| TOOL-STUDIO-LIFECYCLE | shared developer Studio down/restart lifecycle | `d4fca4dd2a` | process-control tooling unit, separate from daemon runtime stability and private Codex ownership |
| DAEMON-STABILITY | stable non-watch Studio runtime host | daemon/project/Habitat slices from `6b6946fe10` | prerequisite of P16 live ownership/adoption behavior |
| CODEX-WORKTREE-LIFECYCLE | private Codex worktree Studio composition | final local-environment handoff plus integration-tree helper change | consumes canonical daemon/Vite owners; private socket/ports/state and ownership-only teardown |
| CONFIG-AUTHORITY | all-config single-source JSON behavior | `d5f81b32a0` plus config regeneration slices from `6b6946fe10` | requires explicit change owner before recut |
| CONFIG-ENVELOPE | complete portable config admission and one-envelope propagation | `3f5ed12e81a5`; contract, generated config, browser, server, manifest, SDK, diagnostics, and affected OpenSpec slices | candidate source only; Stage 1 must reconcile P01-P02, P04-P20, Save/Deploy, generic TypeBox admission, terminology, and removed structural-test ownership before sink design |
| CONFIG-PARITY | final-surface replay from the retained run manifest | `b2367c50d6ae`; eight paths | depends on CONFIG-ENVELOPE and consumes P01/P07/P13/P14 diagnostics; behavior tests passed, live Civ7 comparison not run |
| PACKET-A | complete recipe-config admission | `9b082bac2434` | closed-passed local candidate; retain the generic complete-config boundary and re-certify after recut |
| PACKET-A1 | test topology and semantic-owner alignment | `ceb6832e329d` | closed-passed local candidate; split only if Stage 3 proves a smaller coherent sink |
| PACKET-A1A | serve-mode contract freshness | `3a2630c1085f` | closed-passed local candidate; retain the serve/build authority split |
| TOOL-CONTRACT-ADMISSION | generic non-mutating TypeBox admission behavior | shared adapter slice from `3f5ed12e81a5` | Stage 1 decides whether this is retained generic tooling or config-local behavior |
| TOOL-STUDIO-STRUCTURAL-TEST-DISPOSITION | removed brittle source/topology tests and their valid residual invariants | deleted Studio source-test slices from `3f5ed12e81a5` | map each deleted assertion to TypeScript, behavior verification, Habitat structure/boundary authority, or terminal deletion; do not recreate code-shape tests |
| EVIDENCE-VOCABULARY | nonstandard runtime marker, coordinate, authorship, diagnostics, and inspector terminology | SDK, generated artifact, direct-control, Studio runtime, and visualization slices from `3f5ed12e81a5` | cross-owner candidate with no final sink until Stage 1 confirms each professional term and updates its controlling contract |
| MIXED-LATE | late daemon/config/runtime repair | `6b6946fe10` | must be split by P16-P20, lifecycle, and config owner |
| CONTROL-TAKEOVER | DRA transfer, closeout scope reconciliation, and protected continuation | `8ec2a96e3319` plus the current control reconciliation | retain one control layer; no final sink topology before Stage 3 |
| A2-FRAME | closed domain-operation ontology and execution train | `16745e337902` | reviewed execution authority; not product closure |
| A2-VALIDATOR-OWNERSHIP | generated-validator owner correction | `dd38de22e05b` | sealed prerequisite; package/Nx behavior retained and wrong-owner Habitat checks retired |
| TOOL-RULE-INTRODUCTION | rule-introduction manifest runtime flow | `9ff0f711e0d7` | sealed generic prerequisite; preserve independently of A.2 rule identities |
| TOOL-GRIT-DIAGNOSTIC-ACQUISITION | generic `check | apply-dry-run` observation | mixed inherited dirt above `9ff0f711e0d7` | `needs-adoption`; reconstruct and repair on a clean child, never stage the mixed dirt |
| TOOL-GRIT-FIX-ADMISSION | authority-derived safe transformation admission | no current implementation source | separate post-provider unit; one-or-many selection and dry-run planning retained, unsupported live mutation refused |
| A2-AUTHORITY | six generic domain-operation authority packets, fixtures, baselines, and retirements | preserved mixed candidate above `9ff0f711e0d7` | `needs-adoption`; re-derive only after both generic Grit capabilities seal |
| A2-DOMAINS | Ecology, Foundation, Morphology, Hydrology, Resources, and Placement normalization | not started | six ordered semantic slices; re-census operation roots before acceptance |
| A3-STATIC | test/dev/tool TypeScript authority | planned | close static ownership after A.2 destination paths stabilize |
| A3A-ATOMIC-REROLL | one authoring command produces one worker start | confirmed browser defect; no admitted implementation yet | independently admissible after the two Grit capability prerequisites unless source mapping proves a real dependency |
| A4-CONFIG-ONTOLOGY | delete redundant Studio preset ontology | planned | retain only if consumer inventory confirms one complete-config concept |
| A5-PAYLOAD-READINESS | lazy selected-config payload and worker readiness observations | proposed; cohesion not proven | decide and, if needed, split before admission; not one mandatory packet by default |
| B-CONTROL-ORPC | daemon-owned typed setup/start/soft-restart composition | planned | precedes P19/P20 integration readiness; no caller-local direct-control choreography |
| AUTH-FOUNDRY | future foundry and semantic-ratchet authority | PR `#2057`, source `0b09b350f85c`, merged main identity `2eea5f7dedec`; opening draft `9f2e715fe1` | merged main-root authority prerequisite; keep the opening-chain draft reference-only until recovery/accounting permits retirement |
| EXTERNAL-ENVIRONMENT | clean-worktree environment and Habitat bootstrap repair | PR `#2056`, source `36eb7be574`, merged main identity `ada321597b98` | merged trunk prerequisite; only its Studio handoff obligation enters the lifecycle sink |
| EXTERNAL-HABITAT-HARNESS | authority-correct Habitat execution and formatting/import harness | PR `#2058`, merged main identity `fab37f842728`; supersedes failed attempt `planning-habitat-formatting-01` | external verification substrate; not a Studio recut source |
| EXTERNAL-STUDIO-UI-FIXTURE | semantic recipe-layout fixture comparison | PR `#2059`, merged main identity `3735af2ada6f`; repairs the formatting-order consequence without excluding owned code | external test-harness correction; not a Studio recut source |
| EXTERNAL-TOKEN-VALUE | accepted Studio token-value trunk change | final source `f86f03453802`; PR `#2052` merged as `46943c5f1165` after atomic DesignSync closure, archive, and three review lanes | external trunk stabilization; not a Studio semantic dependency or recut source |
| READINESS-CONSUMER | pre-descent/readiness stack through `codex/readiness-final-aggregate-proof-green` | PRs `#2036..#2043`, including local-only final successor | independent post-Studio consumer; target-restack and reverify only after closeout merge |
| CLOSEOUT | transition, recut, archive, and handoff records | this project | final closeout layers |

## Dependency Graph

Original packet dependencies:

```text
P01 -> P02 -> P03
P01 + P04 -> P05
P02 + P05 -> P07
P06 + P07 -> P08
P04 + P08 -> P09
P07 + P08 -> P10 -> P11 -> P12 -> P13
P01..P13 -> P14
```

P01, P04, and P06 have no dependency on one another and may be researched in
parallel. A single submitted Graphite chain may still linearize them for review
and merge.

Remediation dependencies:

```text
runtime train -> P15
runtime train -> P16
P15 + P16 -> P17 -> P18
P18 + generation/deployment packets -> P19 -> P20
P15..P20 + original closure obligations -> P21
```

`CONFIG-AUTHORITY`, `CONFIG-ENVELOPE`, `CONFIG-PARITY`,
`TOOL-CONTRACT-ADMISSION`, `TOOL-STUDIO-STRUCTURAL-TEST-DISPOSITION`,
`EVIDENCE-VOCABULARY`, `TOOL-STUDIO-LIFECYCLE`,
`CODEX-WORKTREE-LIFECYCLE`, and `TOOL-EFFECT` receive final parents only after
Stage 1 establishes whether they are prerequisites, independent stacks, or
packet-owned changes.

Opening review establishes this minimum hard-edge graph for Stage 1
confirmation:

```text
EXTERNAL-ENVIRONMENT + AUTH-FOUNDRY + EXTERNAL-HABITAT-HARNESS + EXTERNAL-STUDIO-UI-FIXTURE + EXTERNAL-TOKEN-VALUE -> refreshed main checkpoint
P01..P14 -> TOOL-EFFECT
P09 + P14 + P15 + TOOL-EFFECT -> CONFIG-AUTHORITY
CONFIG-AUTHORITY + affected P01..P20 -> CONFIG-ENVELOPE -> CONFIG-PARITY
TOOL-STUDIO-LIFECYCLE -> DAEMON-STABILITY -> P16
DAEMON-STABILITY -> CODEX-WORKTREE-LIFECYCLE
P15 + CONFIG-AUTHORITY + P16 -> P17 -> P18
P08 amended + P10 + P11 + P18 -> P19 -> P20
P01..P20 + Editor decision -> P21
merged P21/CLOSEOUT -> READINESS-CONSUMER reconciliation
```

`TOOL-STUDIO-LIFECYCLE` may be reviewed as an independent tooling stack, but
the runtime stack consumes `DAEMON-STABILITY` before P16. The private Codex
helper consumes the daemon target without inheriting shared restart/down
ownership. The environment, Foundry, and token inputs are product-independent.
The Habitat harness and semantic fixture repairs are verification-substrate
consequences. Their five-way join is a base-checkpoint requirement, not a
Studio packet dependency.
Stage 1 may add a hard edge only with a cited owner/behavior reason; branch
linearization for review is not itself a semantic dependency.

The admitted continuation dependency spine is:

```text
CONTROL-TAKEOVER
  -> TOOL-GRIT-DIAGNOSTIC-ACQUISITION
  -> TOOL-GRIT-FIX-ADMISSION
  -> A2-AUTHORITY

TOOL-GRIT-FIX-ADMISSION -> A3A-ATOMIC-REROLL
A2-AUTHORITY + A3A-ATOMIC-REROLL -> A2-DOMAINS
A2-DOMAINS -> A3-STATIC + A4-CONFIG-ONTOLOGY
A4-CONFIG-ONTOLOGY -> A5-PAYLOAD-READINESS (only after cohesion decision)
A2-DOMAINS + A3-STATIC + A4-CONFIG-ONTOLOGY + accepted A5 concerns
  -> B-CONTROL-ORPC -> P19 -> P20 -> P21 semantic readiness
```

This is semantic sequencing, not the final sink graph. Stage 3 remains the sole
place that assigns final Graphite parents and sinks.

## Proposed Stage 1 Authority Amendments

This is an amendment register, not accepted executable authority. Stage 1 must
resolve each current conflict, record the decision owner and accepted anchor,
amend every downstream file, run strict validation, and close the named review
lanes before any packet index may name an executable unit.

| Amendment | Current/conflicting anchors | Proposed payload | Decision owner | Acceptance record | Downstream files |
| --- | --- | --- | --- | --- | --- |
| `A1-STABLE-ROW` | P19 request-local `maps/<runArtifactId>.js`; target vocabulary and P20 stable-row model | one overwritten `maps/studio-run.js`; freshness in identities/digests/correlation | Product/Development DRA under packet/source-map authority | amended P08/P18/P19/P20/P21 records, strict OpenSpec validation, product/architecture reviews | P08, P18, P19, P20, P21, target vocabulary, manifest/renderer tests |
| `A2-DIRECT-CONTROL-COMPOSITION` | P19 whole-app relaunch language; overlapping P20 preparation | P19 owns one reusable direct-control soft catalog-refresh/targeted-mod/row-visibility contract; P20 invokes it after saved-config load | Product/Development DRA; direct-control and oRPC authorities | amended P19/P20 proposal/design/spec/tasks plus direct-control/library reviews | P19, P20, P21 and affected direct-control contracts |
| `A3-COMPLETE-MATRIX` | current P21 rows omit required target-vocabulary/remediation paths | exact Stage 6 and Stage 8 row set with checkpoint-specific evidence | Product/Development DRA under accepted product direction | amended P21/target vocabulary, strict validation, testing-design/product reviews | P21 tasks/spec/evidence and aggregate matrix register |

The proposed `A1-STABLE-ROW` destination is:

```text
{mod-swooper-studio-run}/maps/studio-run.js
```

The file would be overwritten per request. Freshness and exact authorship would
be carried by `runArtifactId`, manifests, digests, deployment identity, and
embedded correlation markers. These statements become controlling only through
the accepted Stage 1 records named above. This manifest records the proposal
and later links its accepted or rejected disposition; it does not independently
define product behavior.

## Known Record Contradictions

| Record | Opening contradiction | Required disposition |
| --- | --- | --- |
| Original packet index | says draft/adversarial-review-ready although all 14 task files are checked | describe historical endpoint-matrix closure and later rendered-user-path reopening |
| Remediation index | says ready for implementation | record P15-P18 checked, P19 `0/14`, P20 `14/18`, P21 `0/20`, subject to late-change invalidation |
| Remediation execution frame | describes six untouched packets and treats restart script as unrelated | rewrite to current closeout state |
| P06 evidence | says task 3.4 open while task file says complete | rerun or correct one record from current evidence |
| P16-P18 evidence | predates `d5f81b32a0` and `6b6946fe10` changes to effective surfaces | mark historical and rerun affected gates |
| P20 tasks/evidence | tasks claim focused/live work while every evidence row says not run | inspect raw artifacts, correct false rows, rerun all required current-head gates |
| P20 retained live JSON | endpoint completions use seeds `1538316521..523`, lack rendered-button provenance, and contain incomplete diagnostics retention | investigation only, not final matrix closure |
| P21 | all tasks and evidence rows open | complete at exact recut head in Stage 6 |
| P10 retained logs | committed trailing whitespace causes `git diff --check main..HEAD` to fail | normalize, remove, or archive through a reviewed evidence-retention decision |
| Local-environment CI | reports Studio failures in `defaultConfigSchema.test.ts`, `standardRecipeArtifactGuards.test.ts`, and `standardLayerVisibility.test.ts`, plus Habitat failures, at an external branch tree | import exact attempts row by row; assign Studio/Habitat semantic owners; rerun at the accepted integration tree rather than blaming environment setup |

## Sibling And Worktree Accounting

| Source | State | Accounting disposition |
| --- | --- | --- |
| `codex/civ7-modding-foundry-architecture-draft@bf7b9f2519` | repaired in place, amended as `ee6681f465`, and targeted-restacked as `0b09b350f85c`; PR `#2057` merged to main as `2eea5f7dedec` | terminal Foundry prerequisite and sole merge sink; stable pre/post-restack patch-id `89b3b4eb27570af36cf03cf66ccea1a8e14cfb4a` |
| `codex/civ7-foundry-target-authority@9f2e715fe1` | opening three-file Foundry draft stacked above the runtime range; later main-root semantic repairs expanded and superseded that draft | opening source/reference-only; never merge as the Foundry sink and never substitute for the merged `#2057` authority tree |
| `codex/fix-local-environment-setup@dd335022965c` | repaired in place and amended as `36eb7be574`; PR `#2056` merged to main as `ada321597b98` | terminal environment prerequisite; implementation remains environment-owned, while its Studio lifecycle and inherited-red handoff obligations enter this closeout |
| `studio-ui-token-oklch@f86f03453802` | atomic DesignSync full-content write closed; 47 components unchanged; archived OpenSpec and final review lanes closed; PR `#2052` merged as `46943c5f1165`; source worktree and local branch removed | terminal token prerequisite; never replay into Studio sinks |
| Habitat harness repair `#2058@fab37f842728` | merged main-root repair makes classify-reported execution terminate, preserves Habitat as the sole authority tree, and narrows native formatting ownership | terminal external prerequisite; import its prior red-gate consequences into Stage 0, not its implementation into Studio sinks |
| Studio UI semantic fixture repair `#2059@3735af2ada6f` | merged semantic object comparison replaces a byte-whitespace assertion exposed by the harness repair | terminal external prerequisite; not a Studio runtime source |
| detached `wt-MAPGEN-STUDIO-RUNNER@625c1dc630` | committed work patch-equivalent to current runtime commits; dirty restart script superseded by `d4fca4dd2a`; other churn unrelated | `excluded` |
| `codex/readiness-final-aggregate-proof-green` and PRs `#2036..#2043` | downstream consumer records an older rule/Studio tree and conflicts in Grit provider files | parked/reference-only through Studio closeout; target-restack, reconcile, reverify, review, then merge after Studio closeout |
| `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-sol-a2-domain-operation` at `codex/mapgen-domain-operation-authority@9ff0f711e0d7` | preserved mixed tree: 62 tracked changes plus 13 untracked porcelain roots containing 31 files; nothing staged; provider, A.2 Authority, and record edits interleave | in-scope read-only source evidence; never broad-stage, stash, reset, or commit; reconstruct provider first and A.2 Authority later on clean descendants |
| `studio_runner_parked` | already an ancestor of main | `excluded` |
| `codex/mapgen-breakpoint-explorer@fd53ac11bf92` | unique unaccepted investigation, no descendant/worktree/remote/PR | intentionally retired through Graphite during planning; identity retained only in the planning audit/cleanup record |
| `codex/earth-physics-mapgen-foundation-investigation@7cce44db15e1` | unique unaccepted investigation, no descendant/worktree/remote/PR | intentionally retired through Graphite during planning; identity retained only in the planning audit/cleanup record |
| all other independent or dirty worktrees | no accepted unique patch identified | `excluded` |

No sibling becomes a source because it is dirty, overlaps a filename, or has a
restack marker.

Those dirty worktrees are not owned by this workstream and are not candidates
for adoption. They appear only in the opening safety census because all
worktrees share Git/Graphite metadata and a global restack or repository-wide
undo could damage them. Opening observations include three untracked files in a
detached primary worktree, untracked `docs/handoffs/` in a restack-frame
worktree, and two modified files in detached `wt-MAPGEN-STUDIO-RUNNER`. Stage 0
revalidates only their identity and dirty-state boundary; it does not inspect,
modify, clean, stash, or recut their contents.

Opening Git stash census contains 52 entries. Stage 0 creates one
`control-input` row per stash hash before any topology mutation. Priority rows
requiring content/path comparison are:

| Opening stash hash | Subject | Initial state |
| --- | --- | --- |
| `e752fccb3a47` | WIP on setup-failure-taxonomy | `needs-inspection` |
| `ed7fd0bf4701` | restart-script branch | `needs-inspection`; likely superseded by `d4fca4dd2a` |
| `14a6fcbf43f9` | Save/Deploy overwrite of shipped map artifact | `needs-inspection` |
| `fa96ab066023` | browser-verification runtime WIP | `needs-inspection` |
| `ff1ef24ebf66` | prior Studio Run in Game workstream | `needs-inspection` |
| `3241cbe2ea9c` | unrelated intelligence-bridge bundle churn parked from this lane | `proposed-exclude` |

All remaining stash hashes start as `needs-classification`, not implicitly
unrelated. Stage 0 records path overlap, unique accepted intent, and final
`adopted`, `superseded`, `reference-only`, or `excluded` disposition without
applying a stash to the source or recut worktree.

## Sparse Accounting Schema

Each manifest row uses:

| Field | Meaning |
| --- | --- |
| `row_id` | stable closeout row identity |
| `unit_id` | packet or cross-cutting unit |
| `source_branch` | opening source branch |
| `source_commits_or_slices` | full commits or selected hunks |
| `path_selector` | path prefix/glob owned by the row |
| `exceptions` | shared paths requiring separate adjudication |
| `change_id` | OpenSpec change when present |
| `owner` | semantic owner, not current container |
| `hard_dependencies` | required prior units |
| `decision_refs` | accepted user/authority decisions controlling the row |
| `authority_refs` | packet, canonical, or Habitat records that own expected behavior |
| `opening_proposal` | Stage 0 semantic proposal; never overloaded with final disposition |
| `semantic_disposition` | Stage 1 meaning decision |
| `accounting_state` | Graphite source/sink state |
| `accounting_method` | fold, split, reconstruct, delete, reference |
| `sink` | sink branch or terminal disposition |
| `finding_disposition` | independent review-finding decision when a finding controls the row |
| `repair_state` | independent repair and affected-gate rerun lifecycle |
| `evidence_class` | strongest evidence class currently represented |
| `verification_state` | independent attempt validity/result state from the workstream vocabulary |
| `tree_checkpoint` | source, integration, recut, submitted, or merged tree hash |

Use path selectors plus exceptions rather than 475 manually duplicated rows.
Create explicit path rows for shared root manifests and lockfiles, packet
indexes, structural matrices, generated configs/artifacts, and files split
across units. Coverage queries must still show zero unmatched opening paths.

Allowed Stage 0 opening proposals:

- `unresolved`
- `proposed-retain`
- `proposed-repair`
- `proposed-split`
- `proposed-delete`
- `proposed-park`
- `proposed-exclude`

Allowed Stage 1 semantic dispositions:

- `retain-behavior`
- `retain-pure-kernel`
- `repair-before-merge`
- `split-before-review`
- `delete-or-supersede`
- `park-future-initiative`
- `exclude-unrelated`

Allowed Graphite accounting states:

- `needs-adoption`
- `adopted`
- `superseded`
- `excluded`
- `reference-only`
- `adoption-sink`

These axes are independent. A behavior can be retained while its source branch
is superseded.

## Corpus Accounting Contract

The planned `obligation-corpus.jsonl` was never instantiated and is not an
execution prerequisite. `obligation-corpus-contract.md` remains planning
history. Row-level truth stays in the existing packet/task/evidence records,
this source/sink manifest, authority manifests and ledgers,
`gate-register.jsonl`, and `cleanup-register.jsonl`.

No config, diagnostic, Habitat rule, packet gate, source hunk, or material
control input may disappear into an aggregate count. Coverage is demonstrated
through those owning records and direct queries; do not construct a second
validator, collector, or progress database around them.

## Recut Stop And Recovery Rules

Stop before mutation when a source ref moved, local/remote/PR state is unknown,
an in-scope worktree is dirty without an owner, the recovery bundle is
unreadable, or a hunk lacks a decided semantic row.

Stop during recut on unexplained tree/file-set drift, product decisions exposed
by conflict resolution, generated outputs that cannot be reproduced through an
owner command, repeated conflicts indicating a bad cut, or an intermediate
branch that cannot satisfy its declared working-state contract.

Recovery order:

1. abort the active Graphite conflict operation;
2. use Graphite undo only for the last understood local, unsubmitted mutation
   while the same recorded mutation lease is still held; never undo a
   submitted, remote, or merged operation;
3. return to preserved source refs or the recovery bundle;
4. repair and re-review a proven mechanical manifest error, or follow the
   workstream's mandatory Stage 1/2 semantic backflow for any behavior,
   contract, authority, ownership, or code-design discovery;
5. reconstruct the affected sink;
6. resume only after source/sink and tree comparisons agree.

Never delete opening branches merely because proposed sinks exist.

## Stage Promotion Fields

Stage 0 fills source coverage, recovery, and current verification state.
Stage 1 fills semantic disposition and owner.
Stage 2 adds integration commits and integration tree checkpoints.
Stage 3 admits sink branches and exact Graphite parents.
Stage 4 records physical adoption and source/sink comparison.
Stage 5 records branch-local gates and reviews.
Stage 6 records exact-head integrated runtime evidence.
Stage 7 records OpenSpec archive disposition.
Stage 8 records PR/merge state and source retirement.
Stage 9 records final exclusions, deferrals, and Habitat handoff.
