# Verification Ledger

Status: Packets A, A.1, and A.1a closed-passed; no product closure claim

Normative method:
`docs/projects/mapgen-studio-runtime-transition/WORKSTREAM.md`

## Live Control State

- Last updated: 2026-07-12T04:16:00-04:00 EDT
- Current phase: `packet-a1a-closed`
- Last completed gate: A.1a passed strict TypeScript checking, the full Studio
  check/test/build graph, Studio Habitat 17/17, repository lint, OpenSpec
  371/371, three dedicated review lanes, and real browser module evaluation
  after a clean restart from this worktree. Development serve loaded the Studio
  contract from source, generated recipe artifacts remained on `dist`, and the
  mounted React root was nonempty with no module-link error.
- Current gate: align the Codex worktree helper with the canonical Studio
  lifecycle while preserving private ownership and two-worktree isolation.
- Current readiness sentinel:
  `codex/readiness-final-aggregate-proof-green@f325250d087843e13b8c529c4fd036b84d911162`.
  This separately owned stack was restacked at 2026-07-10T19:30:50-04:00,
  outside this workstream's mutation cohort. It is rebound as the external
  sentinel for the resumed cohort and remains excluded from Studio mutation.
- Next action:
  1. align and verify the already-declared bounded Codex worktree lifecycle
     helper child;
  2. prepare and execute A.2 domain-operation topology normalization;
  3. continue A.3 static coverage, A.4 preset removal, Packet B control
     ownership, and Packet C rendered acceptance in order.
- Blocked by: no external or product blocker accepted
- Product/Development DRA: Codex closeout orchestrator in the named worktree
- Prior Planning Supervisor/Enforcer DRA: Kuhn
  (`019f494a-0ef2-7be2-b0a4-9813c8d040ab`), closed with semantic pass over the
  prior bound corpus; the later alignment handoff reopens affected semantic
  closure before static/commit work may resume
- Stage 0 Supervisor/Enforcer DRA: Kierkegaard the 4th
  (`019f5237-deac-7102-b271-50a4d61c1297`); source-freeze review closed-passed
- Last Graphite mutation lease:
  S0-01 used no pre-recorded durable lease row. Its shell cohort was serialized
  to this DRA and asserted parent/source/sentinel identities before and after
  `gt create`; the omission is `S0-01-LEASE-01`. No mutation lease is active.
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-mapgen-studio-runtime-openspec-packets`
- Branch/head: `codex/mapgen-studio-dev-contract-freshness`, closing commit
  subject `fix(studio): keep dev contract imports fresh`.
- Worktree state: A.1a closing documents are the only additions to the reviewed
  three-file candidate; no `.playwright-cli` files or Git operation are present.
- Current-lane Graphite state: `main == origin/main == 46943c5f1165`; the
  receipt-bearing census branch is 42 commits ahead and 0 behind, with 30 valid
  Graphite layers and no restack
  marker on the current tail. The planning and two implementation branches are
  local-only, unsubmitted, and have no remote branch or PR.
- Runtime preservation: the prior Studio process receipt is historical and is
  not used as Packet A acceptance. Runtime checks restart from a committed tree.

This section is the sole live resume state. Update it at every phase change,
DRA handoff, Graphite mutation, evidence invalidation, pause, and closure.

## Agent Fleet State

| Wave | Purpose | State | Required follow-up |
| --- | --- | --- | --- |
| opening research | stack corpus, systematic geometry, authority/docs boundary | closed | packet/resources: `waves/planning-research-01.md`; terminal rows in cleanup register |
| planning review 1 | information shape, sequencing, closed-loop operability | closed | P1/P2 repairs in progress |
| repair re-review | fresh information, sequencing, and closed-loop lanes | closed | packet/output/findings: `waves/planning-rereview-01.md`; all agents closed |
| final planning review | standalone state, dependency/backflow, and supervisor closure audit | closed | packet/output/findings: `waves/planning-final-review-01.md`; semantic supervisor passed; all agents closed |
| environment handoff affected review | prerequisite DAG, lifecycle authority, and closed-loop placement | closed | packet/output/findings: `waves/planning-handoff-review-01.md`; findings accepted; agents closed |
| prerequisite and retirement audit | merge-before-restack candidates, authorized branch retirement, readiness sequencing | closed | packet/output/findings: `waves/planning-prerequisite-audit-01.md`; decisions accepted; agents closed |
| prerequisite branch-local closure review | environment, Foundry, and token branch findings plus declared gates | closed | packet/output/findings: `waves/planning-prerequisite-closure-01.md`; changes requested; agents closed |
| prerequisite branch repair implementation | disjoint environment test/evidence, Foundry authority, and token local-gate repairs | closed | packet/output: `waves/planning-prerequisite-implementation-01.md`; local repairs complete; agents closed |
| prerequisite repair affected review | environment tests, Foundry ontology, and token local gate repairs | closed | packet/output/findings: `waves/planning-prerequisite-rereview-01.md`; residuals accepted; agents closed |
| prerequisite second repair | hermetic Git fixture, corrected Foundry ontology/source order, fail-closed token canary | closed | local repairs complete; implementation agents closed |
| prerequisite second-repair affected review | environment hermeticity, 15-file Foundry authority scope, token fail-closed behavior | closed | packet/output/findings: `waves/planning-prerequisite-final-review-01.md`; residuals accepted; agents closed |
| prerequisite third repair | split Git fixture/invocation, sole Foundry source order, collector export marker and real guard coverage | closed-with-transfer | prior token agent was externally closed and never reused; actual worktree state transferred to a fresh implementation lane |
| environment terminal closure | linked-worktree gitlink regression, hostile-hook/config preservation, purpose comments, final review | closed | local gates passed; PR `#2056` merged as `ada321597b98` |
| Foundry terminal closure | canonical roots/runtime ownership repairs and bounded final authority review | closed | local gates passed; PR `#2057` merged as `2eea5f7dedec` |
| token local closure | exact selection, visible singleton roots, real-browser negative seams, OKLCH artifact guards | closed | local gates passed at `e455f7a427`, then stable-restacked as `4204e82b0b01` |
| token Graphite/external route | main parentage, readiness isolation, native DesignSync path, auth preconditions | closed | targeted restack passed; Claude Code native `/design-sync` is the accepted external path |
| token external closure | atomic full-content upload, classifier falsifier, memory update, archive, lifecycle hardening, PR merge | closed | PR `#2052` merged as `46943c5f1165`; source branch/worktree removed; final three review lanes approved |
| Habitat formatting/Grit repair | retire stale bridge behavior, stabilize Habitat rule execution, narrow native Biome ownership, preserve semantic fixtures | closed | PRs `#2058@fab37f842728` and `#2059@3735af2ada6f` merged; classify-reported gates green |
| prerequisite reconciliation audit | terminal identity, closed-loop admission, and no-restack Graphite audit | closed-with-one-no-result | Hooke and Copernicus produced accepted findings; long-running closed-loop reviewer was closed without result and is not reused |
| orphan Foundry-worktree residue audit | classify failed filesystem cleanup residue without adopting or deleting unknown files | closed | two agents returned no result; local temporary-index comparison found no unique nonignored content or live tmux owner, and the exact deregistered directory was removed |
| fresh planning admission review | information/loop, dependency/Graphite, and semantic supervisor lanes | repair active | Pauli returned one P1 and three P2 findings; Wegener returned no result; affected re-review and fresh replacement lanes required |
| planning admission affected re-review | repaired live records, dependency/Graphite path, and exact semantic corpus | closed-with-changes | Archimedes returned no result; Boole and Tesla findings repaired in `planning-admission-review-02.md` |
| planning admission terminal review | information/loop, exact Graphite mutation contract, and zsh-safe semantic digest | closed-with-changes | Plato, Mendel, and Boyle findings repaired in `planning-admission-review-03.md` |
| planning admission final review | repaired live receipt, fail-closed mutation contract, and fail-closed semantic digest | closed-with-changes-and-invalidation | Hegel returned no result; Huygens findings repaired; Beauvoir invalidated by source-first Habitat contract |
| planning admission current-corpus review | source-first Habitat contract plus final command repairs | closed-passed | Pasteur and Dewey passed; Euler's anchors repaired; Franklin returned no result; Poincare passed the affected re-review |
| Stage 0 topology reconciliation | current Graphite lineage, historical recovery timing, remote/PR state, and protected boundaries | closed-with-correction | Socrates the 4th returned a valid current census but incorrectly claimed the restack preceded recovery; that P1 is rejected by the timestamped verified bundle |
| post-planning semantic accounting | packet/config/tooling ownership and invalidated evidence for `3f5ed12e8` and `b2367c50d` | closed-with-findings | Arendt the 4th mapped both commits; Stage 0 carries ownership conflicts without treating them as final dispositions |
| continuous Stage 0 supervision | admission, source accounting, corpus, and exit gates | closed-passed | Kierkegaard the 4th completed the source-freeze review; agent is closed |
| current browser/oRPC investigation | rendered state, browser-to-endpoint path, daemon freshness | closed-with-one-invalid-attempt | stale daemon/browser state identified; current path unified after restart; accidental direct mutation is recorded and excluded from acceptance |
| all-config investigation | nine-config admission, complete materialization, deterministic generation, output sanity | closed-with-shared-defect | all current configs healthy; generic partial-default admission defect becomes Packet A |
| direct-control/Civ7 investigation | live shell state, saved setup, generated row, setup/start ownership | closed-with-architectural-defect | missing control-oRPC setup/lifecycle family and caller-local Studio orchestration become Packet B |
| Packet A implementation | complete-config contracts, TypeBox-native defaults, exact admission, generic schema/config tests, typed operation fixtures | closed-passed | none; A.1 starts on a separate Graphite child |
| A.1 test-topology preparation | historical move recovery, semantic ownership extension, import/path hazards, discovery and Habitat authority | closed-with-scope-correction | the move-only frame was superseded when review found wrong-owner behavior tests, dead source scans, an omitted generic engine law, and an adapter test target gap |
| A.1 implementation | component-owned test topology, semantic test splits, dead source-scan removal, generic engine-law retention, adapter Nx reachability, Habitat ledger reconciliation | closed | three disjoint implementation agents completed naturally; integrated gates passed |
| A.1 final review | TypeScript refactoring, code quality/test topology, and library/Habitat correctness | closed-passed | all concrete findings repaired; final bounded rereviews cleared the candidate; all agents closed |
| A.1a implementation | serve-only Studio contract source alias, deterministic loopback binding, and resolved Vite configuration authority | closed | disjoint Vite and Habitat implementation lanes completed naturally; integrated gates passed |
| A.1a initial review | TypeScript runtime boundary, code quality/Habitat structure, and current Vite behavior | closed-with-findings | environment restoration, runtime narrowing, semantic alias matching, authority-claim precision, and purpose-comment findings repaired |
| A.1a boundary investigation | app-local Vite ownership and `.habitat` TypeScript resolution | closed-with-decision | retained Vite ownership in the app and treated the loaded runtime as `unknown`; rejected a root dependency, app helper, copied Vite schema, subprocess, and bespoke checker project |
| A.1a terminal review | TypeScript refactoring, code quality/Habitat authority, and Vite/library correctness | closed-passed | all three fresh lanes cleared the repaired candidate; all agents closed |

Stage promotion requires every agent row to be `closed` or explicitly
transferred to the continuous supervisor.

## Packet A Closure Receipts

All receipts in this table bind to the dirty Packet A tree immediately before
its Graphite commit. Generated build outputs remain ignored and are not part of
the write set.

| Surface | Command or method | Result |
| --- | --- | --- |
| affected production TypeScript | Nx `check` across MapGen Core, SDK, Studio contract, Swooper Maps, Studio UI, and Studio; MapGen Core and Swooper rerun after the final schema-value boundary rename | passed |
| affected behavior graph | Nx `test` across MapGen Core, SDK, Swooper Maps, Studio UI, and Studio, followed by affected-target reruns | passed |
| Swooper Maps | `nx run mod-swooper-maps:test --skip-nx-cache` | 534 passed, 2 intentionally skipped, 0 failed; owner Habitat 85/85 |
| focused Studio Run in Game selection | `nx run mod-swooper-maps:test:studio-run-in-game --skip-nx-cache` after replacing its deleted brittle identity-shape test with the generic complete-config boundary test | dependency graph passed; 20 selected tests passed, 0 failed |
| MapGen Core | `nx run mapgen-core:test --skip-nx-cache` | 126 passed, 0 failed |
| Studio contract | `bun test packages/studio-contract/test` | 10 passed, 0 failed |
| Studio build | `nx run mapgen-studio:build --skip-nx-cache` | passed, including Studio check and Vite production build |
| formatting and lint | `bun run lint`, then the affected Swooper target after its one formatter repair | passed |
| OpenSpec | `bun run openspec:validate` | 371 passed, 0 failed |
| Habitat, Studio | `bun habitat check --owner mapgen-studio` | 17 passed, 0 failing or advisory |
| Habitat, Swooper | owner check invoked by the final Nx Swooper test graph | 85 passed, 0 failing or advisory |
| Habitat, MapGen Core | `bun habitat check --owner mapgen-core` | 1 passed, 0 failing or advisory |
| source-derived recipe artifacts | `bun habitat check --rule verify_standard_recipe_artifacts_match_source_stages --json` | passed with no diagnostics |
| classify routing | `bun habitat classify /tmp/packet-a.diff`; every available reported target was run, with the unavailable Studio contract test covered by its direct package suite | passed |
| test-inclusive TypeScript comparison | base-comparable scan plus correctly typed current scan | 566 base diagnostics to 535 current; the only unmatched file/code pair is the intentionally ambient-incomplete Bun import; 284 independent historical test/dev/script diagnostics remain for A.3, with no changed config-test diagnostic |
| change hygiene | `git diff --check` plus added-line suppression/cast and terminology scans | passed; no temporary TypeScript scan configs or `.playwright-cli` files remain |
| committed-tree isolation | regular detached Git worktree at the initial Packet A commit, fresh `bun install --frozen-lockfile`, affected six-project check, affected five-project test graph, Studio build, and final tracked-status check | all passed; generated artifacts reproduced without tracked drift; temporary worktree removed |

## Packet A.1 Receipts

These rows record the post-repair reruns and committed-tree receipt. Packet A.1
is closed-passed.

| Surface | Command or method | Result |
| --- | --- | --- |
| integrated project graph | `nx run-many -t build,check,test --projects=mapgen-core,civ7-adapter,mod-swooper-maps,mapgen-studio --parallel=4 --skip-nx-cache --outputStyle=static` | post-repair rerun passed all 32 requested and dependent tasks; Nx reported the already-recorded flaky manifest/build tasks only after successful execution |
| Swooper Maps | two consecutive quiescent runs of `NX_DAEMON=false nx run mod-swooper-maps:test --skip-nx-cache --outputStyle=static` | each run passed 504 tests, intentionally skipped 2, and failed 0; the suite completed in 51.88s and 53.31s respectively; owner Habitat 80/80 |
| loaded-host timeout investigation | exact Nx gate and isolated failing files while Civilization VII was actively consuming CPU | varying test cases exceeded wall-clock timeouts while all isolated cases passed; reviewer confirmed Bun `--max-concurrency` does not govern this sequential suite, so no harness, retry, parallelism, or timeout change was admitted |
| MapGen Core | `nx run mapgen-core:test --skip-nx-cache` | 121 passed, 0 failed |
| Civ7 adapter | `nx run civ7-adapter:test --skip-nx-cache` | 23 passed, 0 failed; target is now Nx-visible |
| Studio | integrated Nx graph | 308 passed, 0 failed; production build passed |
| targeted Studio Run selection | `nx run mod-swooper-maps:test:studio-run-in-game --skip-nx-cache` | post-repair target passed; 20 selected tests passed, 0 failed |
| strict OpenSpec | `bun run openspec:validate` | post-repair rerun passed 371/371 |
| formatting/lint | `bun run lint` | post-repair rerun passed all 9 project targets |
| Habitat owners | Swooper owner through its test graph; direct Studio, MapGen Core, and Civ7 adapter owner checks | post-repair reruns passed Swooper 80/80, Studio 17/17, MapGen Core 1/1, and Civ7 adapter 1/1 with no advisory findings |
| classify routing | `bun habitat classify` for the Swooper test tree, MapGen Core test tree, Civ7 adapter, and changed authority ledger | every available reported check/test/lint target ran; authority ledger has no project-local check/test target |
| test-inclusive TypeScript observation | in-memory TypeScript project using the production options plus `test/**` and Bun/Node types | 281 diagnostics: 223 tests, 48 dev, 10 scripts; 280 are the independent A.3 corpus and one is the existing unresolved `@swooper/mapgen-core/trace` export; touched A.1 files add no diagnostic or moved-path import failure |
| hygiene | `git diff --check`, added-line suppression/cast scan, and terminology scan | whitespace clean; no added suppression or `any`/`never` cast; no added nonstandard evidence term |
| committed-tree isolation | regular detached Git worktree at `acfc7f3217ed`, fresh `bun install --frozen-lockfile`, owner checks/builds, affected project tests, focused Studio Run tests, and final tracked-status check | checks passed for MapGen Core, Civ7 Adapter, and Swooper Maps; tests passed 121/121, 23/23, 504/504 with 2 intentional skips, and 29/29 respectively; generated artifacts reproduced without tracked drift |

## Packet A.1a Receipts

These rows bind to the reviewed A.1a candidate immediately before its Graphite
commit. They close development freshness only; they do not close the rendered
Run in Game product matrix.

| Surface | Command or method | Result |
| --- | --- | --- |
| strict TypeScript boundary | standalone strict `tsc --noEmit` over the Habitat checker and Studio Vite config | passed with no diagnostics |
| Studio project graph | `NX_DAEMON=false nx run-many -t check,test,build -p mapgen-studio --parallel=3 --skip-nx-cache --outputStyle=static` | all 26 requested and dependent tasks passed; Studio passed 308 tests and the production Vite build completed |
| Studio Habitat owner | `bun habitat check --owner mapgen-studio --json` | 17/17 passed with no diagnostics or advisories |
| formatting and lint | `bunx biome check` over the three changed implementation/authority files, then `bun run lint` | passed; all 9 repository lint targets passed |
| OpenSpec | `bun run openspec:validate` | 371/371 passed |
| classify routing | one `bun habitat classify` invocation per changed Vite or Habitat path | every available reported target was run and passed; the initial invalid multi-path invocation was discarded and not treated as a gate |
| runtime health | clean `restart:mapgen-studio --no-build`; daemon `/healthz`; listener inspection | frontend reachable at `127.0.0.1:5173`, daemon healthy at `127.0.0.1:5174`, and daemon repository root matched this worktree |
| browser module graph | real browser navigation after the clean restart, console/request observation, and React-root inspection | Studio contract source entry returned 200; generated Standard recipe artifacts remained on `dist`; `#root` mounted two children; no module-link error occurred; only the existing favicon 404 was observed |
| dedicated review lanes | fresh TypeScript refactoring, code quality/Habitat authority, and Vite/library correctness reviews after repairs | all lanes clear |
| change hygiene | `git diff --check`, changed-file Biome check, terminology/suppression review, and Playwright cleanup | passed; no compatibility alias, broad package alias, source-specific export assertion, suppression, or `.playwright-cli` residue remains |

## Stage State

| Stage | State | Closing condition |
| --- | --- | --- |
| 0 Opening census | complete under 2026-07-11 lightweight-tracking correction; historical recovery and current lineage recorded | recovery artifact and sufficient source/owner accounting to execute product repair |
| 1 Semantic disposition | bounded decisions move with each concrete product repair | zero unresolved authority conflict in the active repair |
| 2 Integration tree | active | no known accepted product defect at recorded integration tree |
| 3 Sink stack design | not started | deterministic acyclic sink graph |
| 4 Mechanical recut | not started | approved sink stacks with source/sink integrity |
| 5 Change-unit closure | not started | P01-P20/tooling branches closed and P21 `runtime-ready` |
| 6 Preliminary runtime | not started | P21 pre-archive full browser/Civ7 matrix green, reviewed, and closed |
| 7 Record/archive | not started | packet/spec/archive state reconciled |
| 8 Final runtime/merge | not started | post-archive full matrix green; accepted sinks merged; source accounting terminal |
| 9 Habitat return | not started | final docs-only handoff branch merged and zero-context return accepted |

## Opening Verification Facts

| Gate | Tree or scope | Result | Claim boundary | Required action |
| --- | --- | --- | --- | --- |
| Worktree state | before authoring this project | clean | opening repo state only | commit reviewed planning artifacts before Stage 0 closure |
| Graphite current lane | `main@46943c5f1165..9f2e715fe1` | 13 opening layers; source root reports `needs restack`; head is 39 ahead and 7 behind | local topology only; no source mutation permitted | commit only the planning child, then preserve all opening refs through Stage 0 recovery |
| OpenSpec full validation | opening head | 371 passed, 0 failed during read-only corpus audit | artifact syntax/consistency only | rerun after planning edits and at every affected stage |
| `git diff --check main..HEAD` | opening committed stack | failed | whitespace integrity only | disposition P10 retained logs and three baseline/spec EOF issues |
| Package tests | opening planning pass | not run | no behavior claim | execute by packet and integrated gates |
| Rendered browser/Civ7 matrix | opening planning pass | not validly closed | no product closure claim | run Stage 6 preliminary matrix and complete Stage 8 final matrix |

The opening `git diff --check` failures are concentrated in:

- `.habitat/.../structure-swooper-catalog-source-index/baseline.json`;
- P10 promoted/spec files with extra EOF blanks;
- eight retained P10 command-log files containing carriage-return or trailing
  whitespace output.

The logs are evidence artifacts, so their retention and normalization must be
decided deliberately rather than silently reformatted or ignored.

## Packet State Baseline

The task counts below describe opening files only. Checked tasks may be reopened
when late changes invalidated their evidence.

| Packet | Opening tasks | Opening validity |
| --- | --- | --- |
| P01 public status/diagnostics | checked | review against late public/error/config changes |
| P02 operation identity | checked | review against late operation/runtime changes |
| P03 cancellation | checked | retain cancellation and lease-release live row |
| P04 catalog source index | checked | Habitat/topology disposition required |
| P05 launch source resolution | checked | revisit if `EditorLaunchSource` changes |
| P06 artifact file plan | checked | evidence contradicts task 3.4; reconcile |
| P07 generation manifest | checked | refresh if config/correlation contract changed |
| P08 run manifest generator | checked | refresh stable-row generation assertions |
| P09 catalog cutover | checked | topology disposition required |
| P10 generator integration | checked | retained logs fail diff-check; evidence retention review |
| P11 deployment snapshot lease | checked | refresh digest/visibility behavior |
| P12 runtime observation | checked | refresh exact stable-row/in-game marker behavior |
| P13 attribution report | checked | refresh final required-section behavior |
| P14 diagnostics retention/guards | checked | aggregate Habitat closure rule is `proposed-retirement` |
| P15 public config surface | checked | refresh against later all-config single-source change |
| P16 terminal adoption | checked | late branch changed overlapping state; prior evidence historical |
| P17 browser-originated contract | checked | late branch changed overlapping request/config state; rerun |
| P18 setup failure taxonomy | checked | late branch changed overlapping setup/runtime state; rerun |
| P19 generated map mod visibility | 0 of 14 checked | open; stable-row authority must be amended first |
| P20 saved-config reconciliation | 14 of 18 checked | open; all evidence rows say not run and current logs are insufficient |
| P21 real-user matrix closure | 0 of 20 checked | open; exact-head matrix required |

## Evidence Invalidation Register

| Evidence family | Opening issue | Current status | Re-entry gate |
| --- | --- | --- | --- |
| Original 14-packet live matrix | endpoint-centered and predates rendered-user failure | historical | branch-local review plus Stage 6 matrix |
| P16 terminal adoption | predates late `6b6946fe10` adoption changes | invalidated for final head | focused tests, live reload/reconnect row, reviewers |
| P17 browser admission | predates late config/request construction changes | invalidated for final head | rendered request capture and current-head public surface checks |
| P18 setup taxonomy | predates late direct-control/setup changes | invalidated for final head | current setup behavior tests and live failure row |
| P20 July 9 runs | wrong declared seeds, endpoint provenance, local path retention, incomplete diagnostics | investigation-only | exact declared rendered rows |
| P21 | no completed rows | absent | every packet-declared success/failure/recovery row |
| Screenshots | supporting visual records | supporting only | never substitute for endpoint/setup/in-game evidence |
| Fake direct-control tests | controlled behavior | behavior only | never substitute for live Studio/Civ7 |
| Config-envelope cutover | changes config, source, manifest, persistence, status, diagnostics, and runtime identity contracts at `3f5ed12e8` | prior evidence for affected P01-P02 and P04-P20 surfaces is stale or invalidated | current-tree behavior/endpoint/browser/setup/in-game gates by affected packet |
| Manifest parity replay | behavior tests passed at `b2367c50d`; no live final-surface comparison ran | bounded implementation evidence only | exact retained-manifest replay against the request-correlated live Civ7 run |
| P21 after post-planning commits | no completed current-tree rows | absent | every declared success, failure, recovery, and freshness row at the frozen final tree |

## Required Review Register

Every code unit requires fresh TypeScript refactoring, code quality/structure,
and library-correctness lanes. Add testing-design, Habitat, config/default,
direct-control/Civ7, redaction, docs, and Graphite lanes according to the
workstream stage.

Finding fields:

- `finding_id`
- `stage`
- `unit`
- `lane`
- `severity`
- `confidence`
- `claim`
- `source_refs`
- `repair_demand`
- `disposition`
- `repair_state`
- `repair_or_reason`
- `affected_gates`
- `next_packet_consequence`
- `reviewer`
- `closed_at_tree`

No accepted P1/P2 may remain when its dependent gate closes.

## Stage And Unit Gate Register

Detailed attempts live in `gate-register.jsonl`. This section indexes aggregate
closure only; it never replaces the row-level command, preconditions, result,
artifact, oracle, verdict, invalidation, and rerun records required by the
workstream contract.

| Scope | Expected gate set | Current state | Row home |
| --- | --- | --- | --- |
| Planning document | classify-reported docs checks, OpenSpec validation, review lanes, clean Graphite commit | passed at the historical planning tree; topology receipt superseded by the recorded restack | `gate-register.jsonl` plus planning wave packets |
| Stages 0-4 | each stage entry, corpus/recovery, authority, integration, simulation, and recut gate | Stage 0 admission reconciliation active | `gate-register.jsonl` |
| Stage 5 packets | every packet-declared and classify-reported gate | not-run | packet evidence plus typed `gate-register.jsonl` cross-links |
| Stage 5 cross-cutting units | Effect, config authority, lifecycle, daemon, transition/records | not-run | `gate-register.jsonl` |
| Stages 6 and 8 | static, endpoint, browser, setup, in-game, review, and cleanup gates per checkpoint | not-run | `gate-register.jsonl` plus immutable runtime evidence |
| Stages 7 and 9 | archive/promotion and final handoff/merge predicate gates | not-run | `gate-register.jsonl` plus PR/Graphite records |

A scope cannot promote while a declared gate lacks a row, is skipped, failed,
stale, invalidated, or environment-unavailable. `not-applicable` closes only
with a cited authority decision.

## Cleanup Register

Detailed resource rows live in `cleanup-register.jsonl`.

| Resource class | Opening state | Terminal requirement |
| --- | --- | --- |
| review/worker agents | planning agents indexed by wave packet | closed or explicitly transferred before gate promotion |
| scratch and retained diagnostics | Stage 0 census pending | removed, or retained with owner/reason/trigger |
| Studio/Civ7 watchers, listeners, processes, tmux | Stage 0 census pending | down unless an explicit handoff row exists |
| dedicated/temporary worktrees | none admitted yet | clean and removed after their owning loop |
| recovery bundle/protected refs | not created | verified, retained through recut, then retired at recorded trigger |
| generated/runtime artifacts | opening census pending | reproduced, attributed, then retained/removed by owner policy |

The Agent Fleet State above is a live index. Every concrete agent or resource
also receives its own cleanup row with identity, owner, purpose, state,
evidence, and preservation/retirement reason.

## Obligation Corpus Checkpoints

| Kind | Expected opening rows | Captured | Row home | Closure rule |
| --- | --- | --- | --- | --- |
| built-in configs | 9 | 0 | `obligation-corpus.jsonl` | zero missing, proxy, or config-specific exception rows |
| Effect diagnostics | frozen structured-report count | 0 | `obligation-corpus.jsonl` | every in-scope diagnostic dispositioned |
| touched Habitat rules | frozen diff/manifest count | 0 | `obligation-corpus.jsonl` | every retained/retired rule has complete authority lifecycle fields |
| packet obligations | 21 packet task/evidence surfaces | 0 | packet records plus corpus crosswalk | every declared gate has current state |
| control inputs | frozen review/watcher/session/scratch count | 0 | `obligation-corpus.jsonl` | zero unmatched material finding/correction rows |

Opening config rows to extract:

| Config id | Source path | Current row state |
| --- | --- | --- |
| `latest-juicy` | `mods/mod-swooper-maps/src/maps/configs/latest-juicy.config.json` | pending Stage 0 extraction |
| `mountain-patch` | `mods/mod-swooper-maps/src/maps/configs/mountain-patch.config.json` | pending Stage 0 extraction |
| `mountain-rivers-patch` | `mods/mod-swooper-maps/src/maps/configs/mountain-rivers-patch.config.json` | pending Stage 0 extraction |
| `mountains-of-time-earthlike` | `mods/mod-swooper-maps/src/maps/configs/mountains-of-time-earthlike.config.json` | pending Stage 0 extraction |
| `mountains-of-time-original` | `mods/mod-swooper-maps/src/maps/configs/mountains-of-time-original.config.json` | pending Stage 0 extraction |
| `shattered-ring` | `mods/mod-swooper-maps/src/maps/configs/shattered-ring.config.json` | pending Stage 0 extraction |
| `sundered-archipelago` | `mods/mod-swooper-maps/src/maps/configs/sundered-archipelago.config.json` | pending Stage 0 extraction |
| `swooper-desert-mountains` | `mods/mod-swooper-maps/src/maps/configs/swooper-desert-mountains.config.json` | pending Stage 0 extraction |
| `swooper-earthlike` | `mods/mod-swooper-maps/src/maps/configs/swooper-earthlike.config.json` | pending Stage 0 extraction |

## Runtime Matrix Register

The rows below are the planned Stage 1 amendment payload. Current P21 and
`target-vocabulary.md` remain controlling until Stage 1 amends and validates
them; no planned row is executable authority yet. Stage 1 replaces each
`planned` owner with an exact accepted packet/spec anchor.

The aggregate register indexes checkpoint-specific attempts. It does not store
one mutable state for both runs and does not replace packet or runtime evidence.

| Row id | Authority state | Stage 6 preliminary | Stage 8 final freeze |
| --- | --- | --- | --- |
| `success-earthlike` | planned P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `success-latest-juicy` | planned P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `success-desert-mountains` | planned P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `repeat-freshness` | planned target-vocabulary/P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `distinct-input` | planned target-vocabulary/P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `editor-source` | planned decision plus P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `validation-failure` | planned target-vocabulary/P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `ownership-conflict` | planned target-vocabulary/P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `cancellation` | planned target-vocabulary/P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `terminal-recovery` | planned remediation/P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `generated-row-missing` | planned remediation/P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `saved-config-mismatch` | planned remediation/P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `save-deploy-status` | planned target-vocabulary/P21 amendment | pending attempt/evidence | pending attempt/evidence |
| `live-status-snapshot` | planned target-vocabulary/P21 amendment | pending attempt/evidence | pending attempt/evidence |

For each checkpoint and row, the register materializes `checkpoint_id`,
`row_id`, `attempt_id`, exact accepted authority anchor, state, source tree,
runtime/environment fingerprints, immutable evidence path, gate-attempt ids,
accepted-attempt id, and invalidation reason. Failed attempts remain linked.
Stage 6 writes under
`evidence/runtime/preliminary/<row-id>/<attempt-id>.md`; Stage 8 writes under
`evidence/runtime/final-freeze/<row-id>/<attempt-id>.md`. Neither checkpoint nor
later attempts overwrite another record.

Matrix checkpoint promotion:

| Checkpoint | State | Tree binding | Evidence home | Promotion rule |
| --- | --- | --- | --- | --- |
| Stage 6 preliminary P21 | pending | pending | `evidence/runtime/preliminary/` plus P21 evidence | closes P21 for archive only |
| Stage 7 archive/promotion | pending | pending | gate register and archive diff records | runtime tree must remain unchanged; semantic spec diff recorded |
| Stage 8 final freeze | pending | pending | `evidence/runtime/final-freeze/` | complete matrix rerun required |
| submitted tip | pending | pending | PR checks plus gate register | runtime-relevant PR change reopens Stage 2 and matrix replay |
| merged runtime baseline | pending | pending | merged-tree comparison record | relevant-tree equivalence or complete rerun |
| Stage 9 closeout branch | pending | docs-only | final PR/Graphite record | runtime tree hash unchanged; docs checks/review only |

## Planning Document Review

This table is the chronological review index. Detailed findings live in the
named Wave Packets.

| Lane | Reviewer | Result | Findings | Disposition state |
| --- | --- | --- | --- | --- |
| opening information shape | Cicerone | changes requested | `INFO-01..09` | closed; findings carried to repair |
| opening sequencing | Fermat | changes requested | `SEQ-01..12` | closed; findings carried to repair |
| opening closed-loop operability | Popper | changes requested | `LOOP-01..11` | closed; findings carried to repair |
| repair information re-review | Faraday | changes requested | `RINFO-01..06` | closed; findings carried to second repair |
| repair sequencing re-review | Hume | changes requested | `RSEQ-01..06` | closed; findings carried to second repair |
| repair closed-loop re-review | Plato | changes requested | `RLOOP-01..09` | closed; findings carried to second repair |
| final standalone information | Aristotle | changes requested | `FINFO-01..08` | closed; repaired and cleared by affected/final information reviews |
| final dependency/Graphite | Planck | changes requested | `FSEQ-01..04` | closed; repaired and cleared by affected/final dependency reviews |
| affected information re-review | Kierkegaard | changes requested | `FINFO-RR-01..03` | closed; fourth repair applied |
| affected dependency re-review | Godel | changes requested | `FSEQ-RR-01` | closed; fourth repair applied |
| residual information micro-review | Confucius | changes requested | `FINFO-RR2-01..02` | closed; repaired and cleared by later information reviews |
| residual dependency micro-review | Copernicus | passed | none | closed; dependency lane clear |
| fifth-pass information micro-review | Pascal | changes requested | `FINFO-RR3-01..02` | closed; exact collector repair applied |
| sixth-pass exact collector check | Bernoulli | changes requested | `FINFO-RR3-01..02` | closed; repaired and cleared by later information reviews |
| seventh-pass normalized-envelope check | Noether | changes requested | `FINFO-RR3-02` | closed; repaired and cleared by Hilbert |
| eighth-pass three-field check | Hilbert | passed | none | closed; information lane clear |
| planning supervisor closure | Kuhn | semantic pass; admin changes requested | `ADMIN-01..04` | closed; allowed admin repairs applied; static gates follow |
| environment-handoff dependency review | Tesla | changes requested | `HANDOFF-DEP-01..02` | closed; prerequisite barrier and Foundry admission loop repaired |
| environment-handoff lifecycle review | Hooke | changes requested | `HANDOFF-LIFE-01..02`, `HANDOFF-DAEMON-01` | closed; lifecycle owners and cleanup gates repaired |
| environment-handoff control review | Boole | changes requested | `HANDOFF-CI-01`, `HANDOFF-DIGEST-01`, `HANDOFF-ROUTE-01`, `HANDOFF-ID-01` | closed; incoming-red and digest closure repaired |
| terminal prerequisite reconciliation | Hooke the 2nd | changes requested | stale five-PR checkpoint and terminal records | active repair in planning corpus |
| no-restack Graphite admission audit | Copernicus the 2nd | passed with stop conditions | planning-child command/lease sequence | closed; command plan retained for mutation cohort |

## Planning Finding Disposition

Full claims, source references, affected gates, reviewers, and reviewed-tree
bindings live in `waves/planning-review-01.md` and
`waves/planning-rereview-01.md`. This table keeps disposition and repair state
as independent axes.

| Finding | Severity | Disposition | Repair state | Repair |
| --- | --- | --- | --- | --- |
| `INFO-01` P21 Stage 5/6 cycle | P1 | accepted | repaired | P01-P20 close in Stage 5; P21 becomes `runtime-ready` and closes in Stage 6 |
| `INFO-02` split live status ownership | P1 | accepted | repaired | live control state belongs only to this ledger; manifest is snapshot/accounting |
| `INFO-03` stale packet authority corrected too late | P1 | accepted | repaired | Stage 1 now amends indexes, target vocabulary, and affected packets before implementation |
| `INFO-04` cross-cutting rows lack homes | P2 | accepted | repaired | obligation, gate, cleanup, and checkpoint-specific runtime record homes added |
| `INFO-05` Foundry work becomes second objective | P2 | accepted | repaired | exactly one separately reviewed/merged main-based authority prerequisite; no Foundry realization in closeout |
| `INFO-06` temporal transition doc promoted as canon | P2 | accepted | repaired | durable law stays in Habitat/ADR; project doc is linked subordinate execution mapping |
| `INFO-07` overloaded state terms | P2 | accepted | repaired | semantic proposal/disposition, accounting, finding, repair, verification, and lifecycle axes separated |
| `INFO-08` aggregate ledger duplicates runtime contract | P2 | accepted | repaired | planned rows are amendment payload until Stage 1; accepted P21 anchors own behavior afterward |
| `INFO-09` orphan project home | P3 | accepted | repaired | both packet indexes now link this planning workstream |
| `LOOP-01` no implementation-entry lock | P1 | accepted | repaired | workstream state, opening packet, scratch policy, and design lock added |
| `LOOP-02` rotating supervisor owner | P1 | accepted | repaired | one continuous supervisor per admitted execution interval with explicit takeover protocol required |
| `LOOP-03` P21 cycle | P1 | invalidated | not-required | duplicate of `INFO-01`, closed by the shared repair |
| `LOOP-04` P1/P2 waiver/defer escape | P1 | accepted | repaired | only P3 may be waived/deferred; material findings need repair/rejection/invalidation/authority decision |
| `LOOP-05` prior corrections omitted | P1 | accepted | repaired | Stage 0 control-input corpus and zero-unmatched-material-finding gate added |
| `LOOP-06` no agent/wave packet contract | P2 | accepted | repaired | packet fields, durable wave homes, fleet register, and close/transfer rules added |
| `LOOP-07` all-config rows aggregate away | P2 | accepted | repaired | per-config obligation schema/checkpoints and nine opening rows added |
| `LOOP-08` retained Habitat rule lifecycle incomplete | P2 | accepted | repaired | per-rule corpus requires positive assertion, promotion/removal, fixtures, baseline, hook, and current-tree fields |
| `LOOP-09` live rows omit endpoint/correlation fields | P2 | accepted | repaired | Stage 6 requires every applicable RPC surface, full correlation, process identity, and soft-restart receipt |
| `LOOP-10` same-rank authority conflict unsealed | P2 | accepted | repaired | `needs-authority` stop/escalation rule added |
| `LOOP-11` final checklist misses cleanup | P3 | accepted | repaired | cleanup register, handoff merge, scratch/agent/process, and final-state rules added |
| `SEQ-01` Stage 5 redesigns after recut | P1 | accepted | repaired | Stage 5 is certification-only; implementation/design finding returns to Stage 2 and repeats recut |
| `SEQ-02` P21 cycle | P1 | invalidated | not-required | duplicate of `INFO-01`, closed by the shared repair |
| `SEQ-03` stable-row correction incomplete | P1 | accepted | repaired | Stage 1 amendments expanded to P08/P18/P19/P20/P21 |
| `SEQ-04` P19 depends on P20 implementation | P1 | accepted | repaired | P19 owns a named reusable direct-control contract; P20 must depend on and invoke it |
| `SEQ-05` final live evidence precedes later mutation | P1 | accepted | repaired | checkpoint-specific Stage 6 and Stage 8 records cannot overwrite one another |
| `SEQ-06` Stage 9 creates unmerged handoff | P1 | accepted | repaired | final branch uses a named structured post-merge PR comment, not self-identity |
| `SEQ-07` hidden cross-cutting parents | P2 | accepted | repaired | minimum hard-edge graph added; daemon stability split from lifecycle |
| `SEQ-08` Foundry dependency ambiguous | P2 | accepted | repaired | integration tree starts on exact refreshed main containing one separately merged prerequisite |
| `SEQ-09` P21 packet matrix incomplete | P2 | accepted | repaired | Stage 1 expands P21 to full target-vocabulary/remediation rows |
| `SEQ-10` stash/worktree/undo recovery weak | P2 | accepted | repaired | exact bundle/restore contract, standard recut worktree, repeated mutation leases, and remote-safe repair rule added |
| `SEQ-11` live preflight mutates subject | P2 | accepted | repaired | frozen install and post-constructor clean/digest gates return deltas to Stage 2 |
| `SEQ-12` target vocabulary names only original train | P3 | accepted | repaired | Stage 1 explicitly amends executable-train language |

Second-pass findings are fully stated in
`waves/planning-rereview-01.md`; this live index records their current state.

| Finding | Severity | Disposition | Repair state | Repair |
| --- | --- | --- | --- | --- |
| `RINFO-01` sole live state | P1 | accepted | repaired | temporal control state is ledger-only |
| `RINFO-02` recoverable planning handoff | P1 | accepted | repaired | durable wave packet and explicit Stage 0 supervisor admission |
| `RINFO-03` packet execution lock | P1 | accepted | repaired | both indexes route execution through the locked ledger |
| `RINFO-04` independent state axes | P2 | accepted | repaired | vocabulary, manifest, and finding tables normalized |
| `RINFO-05` future P21 authority | P2 | accepted | repaired | matrix is planned amendment payload until Stage 1 |
| `RINFO-06` complete finding records | P2 | accepted | repaired | wave packets own full records and repair refs |
| `RSEQ-01` self-referential closeout identity | P1 | accepted | repaired | named structured post-merge terminal record |
| `RSEQ-02` P19/P20 contract edge | P1 | accepted | repaired | P20 must depend on and invoke P19's named primitive |
| `RSEQ-03` integration-tree base | P2 | accepted | repaired | exact refreshed Foundry-bearing main is mandatory |
| `RSEQ-04` mutation lease coverage | P2 | accepted | repaired | fresh-census lease required for every Graphite/topology mutation cohort |
| `RSEQ-05` Stage 8 semantic repair escape | P2 | accepted | repaired | material findings backflow to Stage 2 and replay affected stages |
| `RSEQ-06` post-archive evidence home | P2 | accepted | repaired | immutable final-freeze runtime evidence sink reserved |
| `RLOOP-01` findings not auditable | P1 | accepted | repaired | full wave finding records plus live index |
| `RLOOP-02` supervisor/packet control | P1 | accepted | repaired | pre-admission packet explicit; supervisor required before Stage 0 |
| `RLOOP-03` missing gate contract | P1 | accepted | repaired | row-level stage/unit gate register defined |
| `RLOOP-04` checkpoint overwrite | P1 | accepted | repaired | preliminary and final runtime attempts are separate immutable records |
| `RLOOP-05` unnamed terminal record | P1 | accepted | repaired | structured post-merge PR comment owns merge and local-cleanup identity |
| `RLOOP-06` incomplete obligation rows | P2 | accepted | repaired | exact corpus contract defines keys, types, cardinality, uniqueness, and validation |
| `RLOOP-07` checklist-only cleanup | P2 | accepted | repaired | row-level cleanup register defined and planning agents populated |
| `RLOOP-08` undecided recovery mechanism | P2 | accepted | repaired | exact bundle/checksum/restore procedure selected |
| `RLOOP-09` imprecise live observation | P3 | accepted | repaired | precise timestamp and concrete dirty/fleet state required at finalization |

Final-wave findings are fully stated in
`waves/planning-final-review-01.md`. The supervisor accepted that historical
bound corpus, but `planning-handoff-affected-review-01` and the five-PR
prerequisite closure later invalidated it. All accepted findings remain
repaired; a fresh affected review and semantic-supervisor digest are required
before the planning layer commits.

| Finding | Severity | Disposition | Repair state | Repair |
| --- | --- | --- | --- | --- |
| `FINFO-01` stale live reviewer state | P1 | accepted | repaired | actual wave identities, cleanup rows, and chronological review table recorded |
| `FINFO-02` expiring packet hold | P1 | accepted | repaired | hold now persists until accepted Stage 1 authority names an executable unit |
| `FINFO-03` underdetermined corpus | P1 | accepted | repaired | exact obligation-corpus contract and validation procedure added |
| `FINFO-04` overwritable runtime attempt | P1 | accepted | repaired | every runtime path is checkpoint/row/attempt indexed |
| `FINFO-05` incomplete finding records | P1 | accepted | repaired | canonical confidence, repair demand/state, and resume consequence fields added |
| `FINFO-06` incomplete external closure | P1 | accepted | repaired | structured post-merge PR comment records repository and local cleanup state |
| `FINFO-07` evidence/state conflation | P2 | accepted | repaired | manifest separates `evidenceClass` and `verificationState` |
| `FINFO-08` proposal presented as authority | P2 | accepted | repaired | amendment register separates current anchors, proposal, decision owner, acceptance, and downstream files |
| `FSEQ-01` non-universal semantic backflow | P1 | accepted | repaired | all semantic findings in Stages 3-9 reseal Stage 1 when needed and always rebuild Stage 2 |
| `FSEQ-02` partial mutation lease | P2 | accepted | repaired | every Graphite/topology mutation cohort uses fresh census, lease, and release |
| `FSEQ-03` final attempt path | P2 | accepted | repaired | final-freeze paths include row and attempt ids |
| `FSEQ-04` PR identity bootstrap | P2 | accepted | repaired | Stage 9 specifies bootstrap commit, draft submission, identity commit, publish, and merge |

| Finding | Severity | Disposition | Repair state | Repair |
| --- | --- | --- | --- | --- |
| `FINFO-RR2-01` stale fourth-pass control state | P1 | accepted | repaired | live ledger, wave bindings, review index, and cleanup rows now name the actual pass |
| `FINFO-RR2-02` invalid Effect reporter model | P1 | accepted | repaired | tracked target collector uses `category: plugin`, message-derived keys/ids, and reporter fixtures |
| `FSEQ-RR-01` unpublished final draft | P2 | accepted | repaired | Stage 9 publishes with `gt submit --stack --update-only --publish --ai` |
| `FINFO-RR3-01` incomplete pass chronology | P1 | accepted | repaired | fifth through eighth pass rows, bindings, cleanup, and output homes corrected |
| `FINFO-RR3-02` underdetermined normalized Effect output | P1 | accepted | repaired | raw summary, tuples, normalized schema, counts, digests, serialization, collisions, and golden bytes specified |

Supervisor administrative findings do not reopen the accepted semantic digest.
They must nevertheless be terminal before the planning layer closes.

| Finding | Severity | Disposition | Repair state | Repair |
| --- | --- | --- | --- | --- |
| `ADMIN-01` stale Git/Graphite and repair state | P1 | accepted | repaired | live state now records current main, ahead/behind, restack need, and terminal semantic repair states |
| `ADMIN-02` missing zero-context continuation | P1 | accepted | repaired | `NEXT-PACKET.md` projects the reviewed Stage 0 admission lock without becoming a second live state |
| `ADMIN-03` planning commit omitted mutation lease | P2 | accepted | repaired | fresh census, explicit lease row, exact no-restack child, ending census, and release recorded in `planning-child-mutation-01` |
| `ADMIN-04` opening research resource gap | P2 | accepted | repaired | opening research Wave Packet and terminal cleanup rows now account for every research agent |
