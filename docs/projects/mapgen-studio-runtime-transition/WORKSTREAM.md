# MapGen Studio Runtime Stack Closeout Workstream

Document role: normative execution contract. Current phase, owners, branch,
gate, blockers, agent fleet, and next action live only in
`verification-ledger.md`.

Execution correction (2026-07-11): this workstream exists to close the product
outcome, not to build a project-management runtime. Existing Markdown and JSONL
records may track decisions, attempts, and cleanup. Do not create custom schema
validators, diagnostic collectors, generators, dashboards, or harnesses whose
only purpose is progress accounting. Use the repository's existing TypeScript,
Biome, Nx, Habitat, OpenSpec, browser, endpoint, and direct-control commands
directly. When tracking detail competes with product diagnosis, repair, or live
verification, the product loop wins.

## Control Routing

- Record: `docs/projects/mapgen-studio-runtime-transition/WORKSTREAM.md`
- Live control record: `verification-ledger.md`
- Snapshot/accounting record: `stack-recut-manifest.md`

`verification-ledger.md` is the only live status and resume authority. Other
project files provide method, snapshots, corpora, decisions, or handoff context;
they do not independently declare the current gate.

## Opening Packet

Typed inputs:

- authority inputs: current user direction, canonical repo authority, Habitat
  authority, accepted MapGen baselines, packet train contracts, and future
  foundry direction at its declared draft status;
- execution inputs: the opening 39-commit Graphite range, current source/tests,
  OpenSpec changes, generated artifacts, and runtime tooling;
- evidence inputs: task ledgers, verification records, logs, screenshots,
  endpoint captures, browser captures, and Civ7 readback;
- coordination/control inputs: phase records, review and downstream ledgers,
  Next Packets, `NOTE-TO-DRA*`, watcher/correction notes, inline correction
  TODOs, prior session records, scratch artifacts, the local-environment Studio
  handoff, and exact inherited red-gate output exposed by prerequisite CI;
- external trunk inputs: the final merged local-environment repair, main-root
  Foundry authority sink, Habitat execution-harness repair, semantic Studio UI
  fixture repair, and token-value change; their implementations remain
  externally owned while their exact merged commits, trees, and relevant
  handoff digests bind the integration base;
- excluded inputs: unrelated worktrees/stacks and stale records without an
  accepted source or control role.

Selected skills:

- `habitat:systematic-workstream`, `habitat:workstream-runner`,
  `habitat:workstream-review-loops`, and `habitat:dual-role-workstream`;
- `civ7-open-spec-workstream`, `civ7-architecture-authority`, and
  `civ7-product-authority`;
- `dev:graphite`, `dev:effect-ts`, `dev:orpc`, `dev:typebox`,
  `typescript-refactoring`, `dev:review-code-quality`, and
  `cognition:testing-design`;
- `civ7-orpc-control-architecture` and `civ7-operational-debugging` for live
  runtime stages.

Selected agent roles:

- one Product/Development DRA and one continuously assigned
  Supervisor/Enforcer DRA;
- fresh bounded research/advisor waves for unresolved evidence;
- fresh implementation workers with isolated/disjoint write scopes;
- fresh required review lanes that never implement the slice they review.

Hooks/watchers:

- no new hook or watcher is introduced by the planning frame;
- existing Husky delegates and Habitat/Nx/Biome routing remain authoritative;
- any execution watcher is declared in its Wave Packet, writes only to its
  assigned scratch/control record, and is stopped at stage close.

Output contract:

- accepted transition decision and authority routing;
- complete obligation/source accounting;
- semantically complete integration tree;
- deterministic recut stacks and closed branches;
- exact-head browser/Civ7 matrix;
- reconciled and archived OpenSpec records;
- merged/drained Graphite state and zero-context Habitat return packet.

Scratch policy:

- ephemeral agent and command output lives under an OS temporary directory named
  for this workstream, stage, and wave;
- durable evidence or findings move into their declared project/packet record;
- no scratch file, generated runtime workspace, screenshot, or raw private log
  enters a branch without an explicit row, owner, redaction decision, and
  retention reason;
- every stage promotion confirms scratch and active-agent disposition.

## Design Lock

Implementation may enter Stage 0 only after all planning-review findings are
dispositioned, affected review lanes pass on the repaired plan, planning
artifacts are committed on their own Graphite layer, the Product/Development
and Supervisor/Enforcer owners are recorded, and Git/Graphite state is clean and
re-recorded in `verification-ledger.md`.

The planning layer is added as a new child of the unchanged opening tip. Its
creation may not restack, fold, reparent, or otherwise rewrite an opening source
ref. Stage 0 freezes and verifies the recovery corpus before any later source
history mutation.

Semantic supervisor review binds exactly the newline-delimited paths in
`semantic-review-paths.txt`. Reproduce its digest from the repository root with:

```bash
set -euo pipefail
{
  while IFS= read -r review_path; do
    test -n "$review_path"
    test -f "$review_path"
    review_object_id="$(git hash-object -- "$review_path")"
    test -n "$review_object_id"
    printf '%s\t%s\n' "$review_path" "$review_object_id"
  done < docs/projects/mapgen-studio-runtime-transition/semantic-review-paths.txt
} | LC_ALL=C sort | shasum -a 256
```

The path-list file includes itself, so a corpus-membership change invalidates
the digest. Live ledger, gate, cleanup, and wave records remain outside this
semantic digest and use their own append/update contracts. Any semantic change
to a bound file requires affected re-review and a new supervisor attempt.

Whenever execution pauses before closure, `NEXT-PACKET.md` is written or
refreshed with the exact current gate and next action. It is not reserved only
for Stage 9.

## Objective

Close the current MapGen Studio Run in Game body of work as an honest,
reviewable, verified, and merged transitional behavioral baseline. Account for
every change already made, repair every accepted but incomplete behavior, remove
or reject work that should not survive, archive completed change records, park
the later architecture initiatives with precise re-entry triggers, drain the
Graphite stacks, and leave the repository ready to return to Habitat authority
descent.

This is one bounded closeout workstream. Its phases, packet loops, agent waves,
and review lanes are internal operating mechanics. It does not own the later
Habitat platform initiative or the later Studio replacement.

The intended user outcome remains boring in the best way:

```text
one selected config
  -> one resolved source
  -> one generation manifest
  -> one request-local generated mod
  -> one deployed snapshot
  -> one prepared Civ7 setup
  -> one softly restarted Civ7 game
  -> one request-correlated in-game map
  -> one safe public status stream
  -> one explicit private diagnostics path
```

## Closeout State

This workstream is complete only when all of the following are true:

- `main` contains the accepted behavioral baseline in semantically reviewable
  Graphite changes rather than one historically entangled branch.
- Every commit and changed path from the opening stack has one recorded sink or
  terminal disposition.
- The 14 original runtime packets and 7 real-user-path remediation packets
  agree with their code, tasks, verification ledgers, promoted specs, and
  archive state.
- Every built-in map config is a complete instance of the current recipe config
  contract, derived from recipe-owned schemas and defaults without Studio-side
  property migration, scrubbing, injection, or per-config special cases.
- The rendered Studio Run in Game path completes the required browser and Civ7
  matrix from the merged integration tree, including exact generated-content
  attribution and terminal recovery.
- Run in Game restarts the Civ7 game through the direct-control oRPC capability;
  it does not restart the whole Civilization VII application for an ordinary
  launch.
- Public status, current-operation, and event surfaces remain safe; private
  diagnostics remain available only through explicit lookup.
- Retained Effect linting changes have a closed diagnostic corpus and no
  undispositioned Effect-plugin diagnostics in their declared scope.
- Habitat owns all retained structural authority. Stale rules are retired or
  repaired through Habitat, and retained rules express durable classes of
  structure rather than copies of transitional files, symbols, or config keys.
- The current Studio runtime topology is explicitly labeled transitional and is
  not promoted as the future architecture merely because it merged.
- Later Habitat realization, Studio behavior decomposition, target
  construction, and exclusive cutover are durably parked with owners,
  prerequisites, and re-entry triggers.
- Graphite, Git, OpenSpec, workstream records, running Studio processes, and
  worktrees agree on closure; the owned worktree is clean.

## Non-Goals

This workstream does not:

- realize the RAWR architecture as Habitat blueprints;
- decide the complete service, API, host, worker, resource, plugin, app, or
  harness blueprint catalog;
- decompose all Studio behavior and logic into target semantic owners;
- fresh-build the replacement Studio service, projections, app, or runtime
  harness;
- run a dual-authority production shadow or preserve the current runtime as a
  fallback for its future replacement;
- refactor unrelated repository domains merely because they are visible from
  the current stack;
- include unrelated branches or dirty sibling worktrees in stack accounting;
- make current package paths, routers, React orchestration, daemon wiring, or
  Habitat rules permanent by documenting them more elaborately.

The only new code allowed during closeout is code required to satisfy an
already accepted behavior, remove invalid behavior, make verification honest,
or keep a retained repository-wide tool green. Architectural expansion requires
a separate authority decision.

## Opening Baseline

Snapshot date: 2026-07-09

The opening facts are an anchor for the first census, not a promise that the
stack must retain this shape:

| Fact | Opening value |
| --- | --- |
| Worktree | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-codex-mapgen-studio-runtime-openspec-packets` |
| Branch | `codex/civ7-foundry-target-authority` |
| Head | `9f2e715fe159755b0db93bc1c80ec9bbdbea0383` |
| Main | `29e6e4bfdd5a8c576478c809c242b2cd35934501` |
| Commits above main | 39 |
| Graphite layers above main | 13 |
| Changed paths | 475 |
| Aggregate delta | 66,539 insertions, 13,529 deletions |
| Original packet train | 14 packets |
| Remediation packet train | 7 packets |

The opening worktree is clean. Other registered worktrees and independent
Graphite stacks are outside this workstream unless a later corpus row proves a
specific accepted patch must be imported. Mere path overlap, dirtiness, or a
`needs restack` marker on an independent stack is not such evidence.

Three remediation facts prevent an opening completion claim:

- `studio-run-generated-map-mod-visibility` has no closed task or verification
  row.
- `studio-run-saved-config-modset-reconciliation` still has open OpenSpec,
  Habitat, reviewer, and evidence-record gates despite implementation claims.
- `studio-run-real-user-matrix-closure` has no closed task or verification row.

The retained 2026-07-09 runtime logs are investigation evidence, not final
matrix evidence. They used seeds `1538316521` through `1538316523` rather than
the declared `1538316415`, retained a user-local saved-config path, and do not
record every exact request-artifact marker field required by the closure packet.
They may inform diagnosis but may not be relabeled as a successful final row.

Branch names, checked boxes elsewhere, old terminal logs, and prior summaries
do not override those facts.

## Authority Order

Resolve disagreements in this order:

1. Current user direction captured by this workstream, including the demand for
   complete config behavior, rendered-browser execution, real Civ7 verification,
   Habitat ownership, and no symptom patching.
2. Root and subtree `AGENTS.md` routers and current canonical product,
   architecture, testing, Graphite, and docs authority.
3. Accepted MapGen architecture baselines and current Habitat authority.
4. The two Run in Game packet indexes, their authoring contract, target
   vocabulary, structural authority matrix, and packet-local OpenSpec changes.
5. `.habitat/FUTURE-CIV7-FOUNDRY-ARCHITECTURE.md` and
   `.habitat/AUTHORITY-SEMANTIC-RATCHET-ADDENDUM.md` as draft target direction
   for transition and parking decisions, not as already realized topology.
6. Current source, tests, generated artifacts, Git history, Graphite metadata,
   runtime observations, and verification records as evidence.
7. Older proposals, stale ledgers, screenshots, logs, and chat-derived notes as
   discovery material only.

OpenSpec records express movement toward authority. Current code and current
Habitat rules are not allowed to define the target merely by existing.

An unresolved conflict between same-rank product or architecture sources is
recorded as `needs-authority` and stops dependent work. The DRA may resolve
routing, evidence, and mechanical implementation questions; it may not silently
seal a product contract or architecture decision. Resolution requires a cited
user decision or the owning authority record, followed by downstream
realignment before the gate reopens.

## Hard Invariants

### Configs Are Data

A map config is plain JSON conforming to the current recipe config contract.
Catalog entries, built-in configurations, imported configurations, browser
authoring state, Save/Deploy, browser generation, and Run in Game all consume
the same semantic config kind.

The retained flow must satisfy these laws:

- recipe stages, steps, schemas, and defaults are the only source of config
  shape and default values;
- materialization produces a complete JSON object, including defaulted values;
- a named catalog configuration is only an identified config instance with
  values changed from defaults, not a second config authority called a preset;
- Studio does not migrate, scrub, patch, inject, normalize by property name, or
  otherwise post-process a config after recipe materialization;
- browser persistence may retain selection and current authoring state, but it
  may not shadow repository-owned built-in config definitions;
- selecting or launching a built-in config resolves it fresh from its
  authoritative catalog source;
- every built-in config is enumerated and validated by the same behavior, with
  no config-, stage-, step-, or property-specific compatibility branch;
- tests assert complete materialization and schema-valid behavior, not the
  absence of retired keys or the exact presence of hand-listed property names.

The normative and user-facing term is `config`, refined as `catalog config` or
`authoring config` where needed. Public docs, UI copy, and contracts must not
present `preset` as a second product kind. Existing internal `preset` symbols
are either renamed in the bounded config-authority unit when they cross those
surfaces or listed in `TRANSITION.md` as disposable internal vocabulary. In
neither case do they carry separate authority.

### Runtime Mutation Has One Owner

- The Studio runtime host owns its admitted operation state for the lifetime of
  the process and must not restart because generation or deployment writes
  touch watched source paths.
- The public web client submits one closed oRPC request and projects daemon
  state. It does not resolve sources, materialize configs, own runtime phases,
  or replay mutations during recovery.
- Direct control owns Civ7 runtime transitions. Studio consumes its public oRPC
  client rather than adding caller-local process control.
- Ordinary Run in Game uses the supported Civ7 game soft restart or setup/start
  transition. Whole-application restart is not part of the normal path.
- Deployment, setup reconciliation, generated-row readback, Begin, and loaded
  game observation occur in one ordered operation without a later setup reload
  invalidating the state that was checked.
- Civ7 setup discovers exactly one generated row for the admitted request, and
  request freshness is observable through accepted identity, digest,
  deployment, and correlation fields. Stage 1 must resolve the current row-path
  conflict before implementation; this invariant does not pre-accept the
  proposed `maps/studio-run.js` representation.
- The generated-mod-visibility and saved-config packets must have one explicit,
  nonduplicated owner boundary for catalog refresh, generated-mod activation,
  row visibility, and saved-state composition. Stage 1 must decide its exact
  P19/P20 representation. Whatever representation is accepted must use the
  supported direct-control soft game/setup lifecycle and must not relaunch the
  whole Civilization VII application as the ordinary path.

Studio process lifecycle, private Codex worktree lifecycle, shared developer
lifecycle, Civ7 game soft restart, and whole-Civ application restart are five
separate ownership axes:

- `mapgen-studio:serve-daemon` is the canonical Studio daemon execution target;
- `scripts/codex/manage-mapgen-studio.sh` is a worktree-owned composition
  consumer with a private tmux socket, worktree-derived ports/state, and
  ownership-only teardown;
- shared developer restart/down commands retain their own explicitly bounded
  process scope and may not be substituted for the private Codex helper;
- Run in Game asks direct control for the supported Civ7 game/setup transition;
- no ordinary path turns a game soft restart into a whole-application restart.

### Public And Private State Stay Separate

- Public status/current/event payloads use closed public fields and safe error
  categories.
- Private paths, command output, source snapshots, manifests, attribution,
  mod-set details, and diagnostics sections do not cross public surfaces.
- A public diagnostics id may appear only when the corresponding private record
  exists for the same operation revision.
- Private diagnostics are retrieved by explicit lookup and retain enough
  request correlation to diagnose generation, deployment, setup, launch, and
  observation failures.

### Structural Authority Stays In Habitat

- Grit, Habitat-native checks, `structure.toml`, Nx metadata, Biome, hooks, and
  scripts are runners or execution mechanisms. Habitat remains the sole
  repository authority tree.
- TypeScript types own type-level contracts. Behavior tests own behavior.
  Habitat structure owns durable filesystem topology. Grit owns recurring
  source-pattern classes and import/export boundaries when that is the natural
  expression.
- No manual script may duplicate source code or describe a one-off file shape
  merely to make topology look enforced.
- No Grit rule may replicate an exact current implementation when the invariant
  is not a recurring kind of structure.
- Negative property-key archaeology, deleted-name scans, and exact transitional
  path assertions are removed unless current authority establishes a durable
  class they genuinely protect.
- A red Habitat rule is classified semantically. Valid authority changes the
  code; stale authority is updated, split, retired, or removed through its
  owning Habitat record. Local waivers and migration to another authority tree
  are forbidden.

### Transitional Code Is Not Target Authority

The closeout may retain pure kernels and accepted behavior while marking the
following as replacement-listed:

- current service, API, app-host, and daemon decomposition;
- `StudioOperationRuntime` and the current operation registry wiring;
- `engines.ts` and app-hosted orchestration;
- React-side request derivation and browser persistence topology;
- current router and transport assembly;
- Habitat rules that name exact disposable files, symbols, or package paths.

Documentation must not turn these replacement-listed surfaces into a more
elaborate target.

## Evidence Classes

Every completion claim names its evidence class. A weaker class cannot close a
stronger claim.

| Class | Establishes | Does not establish |
| --- | --- | --- |
| Authority | Intended ownership, behavior, and destination | Current implementation or runtime success |
| Review | Independent finding/closure assessment at the bound tree or document digest | The gate being reviewed unless its findings and reruns close |
| Source accounting | Every opening commit/path has a sink or terminal disposition | Semantic correctness of the sink |
| Static verification | Types, lint, OpenSpec validity, Habitat rules, structure, dependency metadata | Endpoint, browser, or Civ7 behavior |
| Behavior verification | Unit/integration behavior under controlled inputs | Running Studio endpoint or real Civ7 state |
| Endpoint verification | Actual public `/rpc` behavior from the running worktree | Rendered browser request construction or in-game authorship |
| Browser verification | Visible user controls produced and submitted the admitted request | Civ7 loaded the requested generated content |
| Setup verification | Direct-control readback sees the request-local row and selected setup state before Begin | Post-start game content |
| In-game verification | Request-specific marker plus live status/snapshot match the admitted run | Permanent architecture correctness |
| Integration verification | Graphite/PR/main tree contains the reviewed sink stack | Runtime behavior if the relevant tree or environment changed |

Operational evidence is bound to the Git tree hash, generated artifact digests,
Studio server identity and repo root, Civ7/runtime version where available, and
scenario inputs. A merge commit may reuse exact-head evidence only when the
relevant tree and environment fingerprints are unchanged. Any relevant tree
change invalidates affected evidence and reopens its gates.

## State Vocabulary

State axes are independent. A row never compresses a decision and its repair,
or semantic meaning and Graphite location, into one compound value.

| Axis | Allowed progression |
| --- | --- |
| Opening semantic proposal | `unresolved`, `proposed-retain`, `proposed-repair`, `proposed-split`, `proposed-delete`, `proposed-park`, `proposed-exclude` |
| Final semantic disposition | `retain-behavior`, `retain-pure-kernel`, `repair-before-merge`, `split-before-review`, `delete-or-supersede`, `park-future-initiative`, `exclude-unrelated` |
| Graphite accounting | `needs-adoption`, `adopted`, `superseded`, `excluded`, `reference-only`, `adoption-sink` |
| Finding disposition | `accepted`, `rejected`, `invalidated`, `waived`, `deferred` |
| Repair state | `not-required`, `open`, `repaired`, `rerun-pending`, `closed` |
| Verification state | `not-run`, `running`, `failed`, `passed`, `not-applicable`, `stale`, `invalidated`, `environment-unavailable` |
| Lifecycle state | `task-checked`, `branch-verified`, `integration-verified`, `runtime-ready`, `OpenSpec-archived`, `submitted`, `merged`, `workstream-closed` |

`integration tree` is the semantically complete Stage 2 staging tree.
`replacement-listed` identifies current topology explicitly slated for later
decomposition or replacement; it is not a provisional decision. `Sink branch`
and `sink stack` are Graphite destinations. `Future target architecture` is
reserved for the RAWR/Habitat destination. No lifecycle value implies the next.
`runtime-ready` is P21's Stage 5 state: implementation, static gates, and
pre-runtime reviews are closed while Stage 6 live rows remain open.

## Operating Model

This is a dual-role systematic workstream:

| Role | Accountable owner | Responsibilities | Forbidden substitution |
| --- | --- | --- | --- |
| Product/Development DRA | Current orchestrator | corpus synthesis, decisions, implementation sequencing, Graphite state, evidence claims, finding disposition, commits, merge, closure | cannot self-approve required review lanes |
| Supervisor/Enforcer DRA | One continuously assigned supervisor for every admitted execution interval, recorded in the live control record | authority drift, scope pressure, evidence integrity, stale record detection, correction transfer, closure readiness | does not implement the watched slice unless the role boundary is explicitly reset |

Agent waves follow these rules:

- Research, implementation, and review are separate team purposes. A team is
  not reused across those purposes.
- Every packet or cross-cutting code unit receives a fresh implementation team
  when delegation is useful and a fresh review team after the implementation
  diff exists.
- Required reviews are performed by agents, not replaced by the orchestrator's
  own inspection. The orchestrator remains the final arbiter and dispositions
  every finding.
- Fresh stage and packet reviewers report findings to the continuous supervisor
  for the admitted interval; they do not replace that role. Pre-admission
  planning review uses its named Wave Packet and may close with no execution
  supervisor assigned, but Stage 0 remains locked until one accepts the live
  ledger. Supervisor turnover requires a tailing frame,
  current repo/control-record read, open-correction and agent-fleet transfer,
  explicit role reassignment in the live ledger, and acceptance by the
  Product/Development DRA before the former supervisor closes.
- Prompts name the packet context, authority sources, exact write or review
  scope, expected output, and failure modes to hunt.
- Only the orchestrator mutates Graphite topology. Concurrent implementation
  agents use isolated forks or disjoint write sets and return bounded changes.
- Agents are closed when their wave is dispositioned. No stale agent is carried
  into a later packet.

Every delegated lane receives an Agent Packet, and every multi-agent phase
receives a Wave Packet. The live ledger records active, completed, and stale
agents. A packet includes:

- authority order and bounded objective;
- allowed and forbidden files;
- evidence inputs, output paths, and record target;
- expected diff or read-only output;
- required gates and Graphite constraints;
- lane done condition and DRA decision point;
- scratch path and redaction/retention rules;
- close condition.

No stage promotes while an assigned agent is unaccounted or stale.

## Universal Closed Loop

Every stage and every Stage 5 unit uses the same closure geometry:

1. **Admit.** Confirm entry facts, authority, clean repo state, write scope,
   protected paths, and invalidation triggers.
2. **Extract.** Build the complete controlled corpus for this loop before
   changing implementation.
3. **Decide.** Assign owner, expected behavior, disposition, gates, and stop
   conditions to every row. Resolve live ambiguity through investigation.
4. **Execute.** Make the smallest complete transformation that satisfies the
   decided rows.
5. **Verify.** Run every declared gate at the evidence class it claims and
   append one complete attempt row to `gate-register.jsonl`.
6. **Review.** Run fresh, risk-selected review lanes against the actual diff and
   records.
7. **Repair.** Disposition every finding. P1/P2 findings close only through
   verified repair, source-backed rejection, later-evidence invalidation, or a
   cited user/owning-authority decision. Only P3 findings may be waived or
   deferred. Every repair retains the original finding and links affected-gate
   reruns.
8. **Close.** Confirm the gate register and cleanup register are terminal for
   the loop, commit through Graphite, restack only affected descendants, update
   ledgers and downstream records, close agents, and leave the worktree clean.

A loop cannot close with an unmapped corpus row, an unchecked declared gate, an
undispositioned finding, stale downstream packet text, or an unexplained dirty
file.

When a gate is red, the loop classifies it as a product defect, implementation
defect, stale authority, harness defect, environment defect, or evidence defect.
If the remedy is not immediate, a focused investigation team is launched. The
result changes the responsible owner, code, rule, test, harness, or environment,
then the gate runs again. A red gate is an input to that loop, not a closeout
state. A genuinely unavailable external resource may pause execution with an
exact next action, but the workstream remains open and is not reported green.

### Semantic Backflow

Stages 3 through 9 are not new design surfaces. Any discovery that changes
implementation, product behavior, contract, authority, semantic ownership, or
code design invalidates the Stage 2 integration tree. If authority must change,
reopen Stage 1 first; then always rebuild and reclose Stage 2 before replaying
every affected later stage. No later stage may jump directly from an authority
change to Stage 3.

Only a discrepancy proven to be purely mechanical may close locally in Stages
3, 4, or 7: Graphite command syntax, source/sink transcription, archive command
mechanics, or record formatting that leaves accepted semantics and the Stage 2
tree unchanged. If that classification is uncertain, use semantic backflow.

### Graphite Mutation Lease

Every Graphite or branch-topology mutation cohort requires the same lease,
including the planning commit, Stage 2 integration-branch construction, Stage
4 recut, Stage 5 commits/restacks, P21 closure commit, Stage 7 archive layers,
Stage 8 submit/merge/drain, and Stage 9 handoff. Before each cohort:

1. capture fresh Git, Graphite, worktree, operation, remote, and PR state;
2. record the sole mutator, scope, and starting state in the live ledger and
   cleanup register;
3. forbid sibling Graphite mutation until a clean ending census is recorded;
4. release or explicitly transfer the lease before another cohort or owner.

No opening Studio source ref may be restacked, folded, reparented, deleted, or
rewritten until Stage 0 has verified the recovery bundle and Stage 1 has recorded
the accepted refreshed-main prerequisite checkpoint. External main-root
prerequisite branches may complete their own reviewed merge paths without
rewriting an opening source ref. The planning branch is the only pre-Stage-0
topology addition, and it must be created as a child without restacking its
ancestors. `needs restack` is therefore an observed source fact, not permission
to mutate the opening chain.

`gt undo` is allowed only for the last understood local, unsubmitted mutation
while the same lease remains held. It is never used for submitted, remote, or
merged operations; those use an owning-branch correction or reviewed revert.

## Durable Artifact Set

The project home is `docs/projects/mapgen-studio-runtime-transition/`.

| Artifact | Role | Creation point |
| --- | --- | --- |
| `WORKSTREAM.md` | This normative operating frame | opening |
| `stack-recut-manifest.md` | Opening snapshot, source-to-sink accounting, and sink branch graph | Stage 0 |
| `obligation-corpus-contract.md` | Superseded planning rider retained as history; not an executable Stage 0 requirement | planning history |
| `semantic-review-paths.txt` | Exact self-including path set for reproducible planning semantic digests | planning closure |
| `TRANSITION.md` | Accepted decision to merge behavior without canonizing current topology | Stage 1 |
| `verification-ledger.md` | Aggregate gate status, review findings/dispositions, evidence invalidation, merge state | Stage 0, maintained throughout |
| `gate-register.jsonl` | One immutable attempt row per planning, stage, packet, cross-cutting-unit, archive, merge, and cleanup gate | planning closure, appended throughout |
| `cleanup-register.jsonl` | Lifecycle accounting for agents, scratch, processes, listeners, watchers, tmux sessions, temporary worktrees, recovery artifacts, and protected refs | planning closure, maintained throughout |
| `evidence/runtime/<checkpoint>/<row-id>/<attempt-id>.md` | Immutable per-attempt runtime record; Stage 6 and Stage 8 never overwrite one another | Stage 6 and Stage 8 |
| `waves/<wave-id>.md` | Durable Agent/Wave Packet, assignments, output/finding links, handoff state, and close condition | every delegated wave |
| `deferrals.md` | Parked future initiatives and any consciously retained transitional risk, each with trigger | Stage 1 onward |
| `triage.md` | Unsequenced discoveries that require a later decision; an explicit empty state is allowed | Stage 0 onward |
| `NEXT-PACKET.md` | Zero-context return to the Habitat authority descent after closeout, or exact resume packet if paused | any pause; Stage 9 finalization |

Packet-local task and verification records remain the detailed homes for packet
claims. The aggregate ledger links them and records current validity; it does
not duplicate every terminal line. New rider documents require a distinct owner
or query that cannot be answered from this set.

Every `gate-register.jsonl` row records `gateId`, `attemptId`, `stage`,
`unit`, claim and `evidenceClass`, command or procedure, preconditions, source
tree and environment fingerprints, start/end timestamps, raw result and
artifact links, oracle, verdict, skipped/not-applicable rationale,
`invalidatedBy`, `rerunOf`, and review/finding links. A declared gate cannot
close as skipped. `not-applicable` requires a cited authority decision showing
that the gate does not apply.

Every `cleanup-register.jsonl` row records `resourceId`, `kind`, `owner`,
`purpose`, path/session/PID/ref `identity`, `openedAt`,
`expectedTerminalState`, `currentState`, `evidenceRefs`,
`preservationReason`, `retentionTrigger`, and `closedAt`. The live Agent Fleet
is an index over these rows, not a substitute for them.

## Planning Closure Loop: Trunk Drain And Design Lock

This loop is pre-execution work, not Stage 0 implementation. It exists because
the accepted prerequisite cohort must become one exact trunk substrate before
the Studio source range is decomposed.

**Entry gate**

- the branch census and patch-equivalence decisions are reviewed;
- the two investigation-branch retirements are explicitly authorized;
- one global Graphite mutation lease serializes each mutation cohort;
- the opening Studio source refs remain unchanged.

**Closed-loop work**

1. Retire only the two explicitly excluded investigation branches after exact
   descendant, worktree, remote, and PR revalidation.
2. Close each branch's own behavior/static/review gates before submission:
   - the local-environment repair and its final Studio handoff;
   - `codex/civ7-modding-foundry-architecture-draft` as the sole main-root
     Foundry authority sink;
   - the accepted token-value trunk change.
   Repair any harness or fixture defect exposed while closing those branches on
   its owning main-root branch; do not fold it into a Studio source packet.
3. Submit with Graphite and `--ai`, inspect the actual submitted SHA, checks,
   reviews, mergeability, and PR state, then merge through the owning branch's
   normal path. Mergeability alone cannot waive a declared gate.
4. Bind the final merged commit/tree and, for the environment repair, final
   handoff digest. Mark the patch-equivalent Foundry commit atop the Studio
   stack `reference-only`; never merge it with its runtime ancestors.
5. After the complete five-PR prerequisite cohort is merged, free only its clean
   dedicated worktrees and run `gt sync --force --no-restack` from a clean
   primary checkout. Re-census any filesystem residue, dirty-worktree
   boundaries, and every opening Studio ref.
6. Keep `studio_runner_parked` untouched. Keep the readiness PR stack parked as
   a post-Studio consumer because its aggregate records predate and conflict
   with the current Studio/Habitat work.
7. Repair this planning corpus with terminal identities, close fresh affected
   reviews, lock a reproducible semantic digest, run planning static gates, and
   create the planning Graphite child without restacking its ancestors.

The planning-child mutation is one exact cohort. Run this complete block under
`zsh`; any nonzero assertion aborts the cohort before the next command:

```bash
set -euo pipefail

assert_ref() {
  test "$(git rev-parse "$1")" = "$2"
}

assert_no_git_operation() {
  for operation_marker in MERGE_HEAD CHERRY_PICK_HEAD REVERT_HEAD REBASE_HEAD \
    rebase-merge rebase-apply; do
    test ! -e "$(git rev-parse --git-path "$operation_marker")"
  done
}

assert_protected_refs() {
  assert_ref main 46943c5f11656773b12ccbf5585f23f64c1cb266
  assert_ref agent-codex-mapgen-studio-runtime-openspec-packets \
    b58ee710a3e14866bf971af67293ef4714672213
  assert_ref codex/effect-biome-lint-rules-audit \
    d41a5d024a7dce2639bb652a32cef5676b14a463
  assert_ref codex/effect-biome-lint-baseline-stabilization \
    d7c77a273408193bb2bf5793bcde215c13c10cc5
  assert_ref codex/run-game-remediation-frame \
    a2c75a01c31fcc5c3afa9323a0399a49ca4d3e21
  assert_ref codex/foundation-orogeny-public-config-surface \
    b9a8ef24b2b16f8a9b2f849617f8daf44d6403b5
  assert_ref codex/run-game-remediation-six-packet-frame \
    a5b04ce049724e9c741c5fb77a268980cd2d262d
  assert_ref codex/studio-run-terminal-adoption-invariant \
    1a0b560e24fdf5aafadb9afc60b6d13c974ad6f7
  assert_ref codex/studio-run-browser-originated-contract \
    0a0285ac4fe64aa1f3d431e2941a4b2539ac54b2
  assert_ref codex/studio-run-setup-failure-taxonomy \
    a4c0569e5248a61ffbaa6ceee7441a45a7c113e3
  assert_ref codex/mapgen-studio-dev-runtime-control \
    d4fca4dd2ab58f49561f165c27c9e12890f04e07
  assert_ref codex/studio-preset-authority-single-source \
    d5f81b32a0e56ad39d571ab49a5adad3efea8f3b
  assert_ref codex/studio-run-live-playability \
    6b6946fe1027ec0bc461ba24b6d70d9747121b84
  assert_ref codex/civ7-foundry-target-authority \
    9f2e715fe159755b0db93bc1c80ec9bbdbea0383
  assert_ref codex/readiness-final-aggregate-proof-green \
    92cc1513cc5c43795f7b800fddc2325849869f5e
}

assert_protected_refs
assert_no_git_operation
test "$(git rev-parse HEAD)" = \
  9f2e715fe159755b0db93bc1c80ec9bbdbea0383

gt add -- \
  docs/projects/mapgen-studio-runtime-transition \
  docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/packet-index.md \
  docs/projects/mapgen-studio/workstream/run-in-game-runtime-openspec-packets/real-user-path-remediation-packet-index.md

test -n "$(git diff --cached --name-only)"
test -z "$(git diff --name-only)"
test -z "$(git ls-files --others --exclude-standard)"
git diff --cached --name-only | awk '
  $0 !~ /^docs\/projects\/mapgen-studio-runtime-transition\// &&
  $0 !~ /^docs\/projects\/mapgen-studio\/workstream\/run-in-game-runtime-openspec-packets\/(packet-index|real-user-path-remediation-packet-index)\.md$/ {
    print "unexpected staged path: " $0 > "/dev/stderr"
    unexpected = 1
  }
  END { exit unexpected }
'
assert_protected_refs
assert_no_git_operation

gt create --no-interactive --no-ai \
  --onto codex/civ7-foundry-target-authority \
  --message "docs(mapgen-studio): lock runtime transition planning" \
  codex/mapgen-studio-runtime-transition-planning

test "$(git branch --show-current)" = \
  codex/mapgen-studio-runtime-transition-planning
test "$(git rev-parse HEAD^)" = \
  9f2e715fe159755b0db93bc1c80ec9bbdbea0383
test "$(git rev-list --parents -n 1 HEAD | awk '{ print NF - 1 }')" = 1
test "$(git rev-list --count 9f2e715fe1..HEAD)" = 1
test -z "$(git status --porcelain)"
assert_protected_refs
assert_no_git_operation
```

Before `gt create`, the staged path set must equal those three selectors, every
opening ref in the manifest and the parked readiness tip must match the
pre-mutation census, and no Git operation may be active. After creation, the
new commit's sole parent must be `9f2e715fe1`; every opening ref, refreshed
`main`, and readiness tip must remain byte-for-byte identical to the census.
Abort without restacking, folding, undoing, or widening the staged set if any
assertion fails or Graphite refuses the operation.

Environment repair, Foundry authority, and token value-form are independent in
product semantics. The Habitat harness repair and semantic fixture correction
are verification-substrate repairs discovered while closing that cohort. Their
linear merge order is operational, not a new Studio product dependency.

The unchanged opening tip predates the merged Habitat harness repair. Planning
checks therefore use the accepted source-first Habitat implementation from the
exact refreshed-main worktree while retaining this worktree as the command cwd
and target root:

```bash
main_worktree="$(git worktree list --porcelain | awk '
  $1 == "worktree" { worktree = $2 }
  $1 == "branch" && $2 == "refs/heads/main" { print worktree; exit }
')"
test -n "$main_worktree"
test "$(git -C "$main_worktree" rev-parse HEAD)" = \
  46943c5f11656773b12ccbf5585f23f64c1cb266
NX_DAEMON=false bun "$main_worktree/tools/habitat/bin/dev.ts" classify \
  docs/projects/mapgen-studio-runtime-transition
NX_DAEMON=false bun "$main_worktree/tools/habitat/bin/dev.ts" check \
  --rule enforce_formatting_and_import_hygiene --json
```

This is not a local waiver or second authority tree: PR `#2058` is the accepted
Habitat enforcement implementation on main, and the opening copy is retained
only as source history. A check run through the opening copy is recorded as a
failed stale-harness attempt when it reproduces the retired `.repos/effect`
scan; it cannot close the planning gate. If the refreshed-main source cannot
target the current cwd deterministically, stop and repair the Habitat execution
contract rather than restacking the opening chain early.

**Exit gate**

- the authorized retirement rows are terminal;
- refreshed `main` contains the complete five-PR prerequisite cohort and every
  exact final identity is recorded;
- no opening Studio source ref changed;
- the readiness and parked-runner cohorts retain explicit untouched state;
- all planning review agents and mutation leases are terminal;
- the new semantic supervisor digest, classify-reported planning checks, full
  OpenSpec validation, and planning diff checks are green;
- the planning branch is committed as a clean child of the unchanged opening
  tip, and Stage 0 remains locked until an execution supervisor accepts it.

**Narrowing result:** ambient sibling-branch uncertainty becomes one exact
trunk checkpoint plus one immutable opening source chain.

## Narrowing Geometry

```mermaid
flowchart LR
  P["Planning: trunk drain and reviewed frame"] --> A["S0: finite opening corpus"]
  A --> B["S1: accepted semantic dispositions"]
  B --> C["S2: complete behavioral integration tree"]
  C --> D["S3: deterministic sink branch graph"]
  D --> E["S4: mechanically recut stacks"]
  E --> F["S5: individually closed change units"]
  F --> G["S6: preliminary P21 browser and Civ7 closure"]
  G --> H["S7: reconciled and archived change records"]
  H --> I["S8: final freeze, runtime matrix, merge, and drain"]
  I --> J["S9: merged closeout handoff and Habitat return"]
```

Each arrow is a gate. Work does not advance merely because activity occurred;
the prior stage must have reduced the next stage's decisions to a finite,
recorded set.

## Stage 0: Opening Census And Control Plane

**Purpose:** replace historical intuition with a finite corpus.

**Entry gate**

- the Planning Closure Loop is terminal and its final refreshed-main checkpoint
  is recorded;
- opening branch, main, and worktree match the baseline or the difference is
  recorded;
- current worktree is clean;
- Graphite and Git parentage agree;
- no unrelated worktree is treated as source material.

**Prework and corpus**

- Capture current `gt ls`, branch parentage, local/remote/PR state, restack
  markers, stashes, worktrees, main/head SHAs, tree hashes, and aggregate diff.
- Revalidate the final merged local-environment, main-root Foundry, Habitat
  harness, Studio UI fixture, and token commits/trees plus the final environment
  handoff digest. Treat them as external trunk inputs, not as opening source
  commits to replay.
- Revalidate the terminal deletion records for the two excluded investigation
  branches and the untouched readiness/parked-runner boundaries.
- Create the exact recovery bundle defined by the manifest before any branch
  can be rewritten. Verify its SHA-256, run `git bundle verify`, restore it into
  a disposable normal Git worktree/clone, and compare every in-scope branch tip
  and tree with the opening anchors. Record the command transcript, checksum,
  location, restore comparison, owner, and retention trigger in the manifest,
  gate register, and cleanup register.
- Represent the runtime tip and the future-authority tip as distinct corpus
  units even though they are physically stacked at opening.
- Enumerate every commit and every changed path from `main..opening-head`.
- Map the 14 original packets and 7 remediation packets to commits, files,
  task rows, verification rows, Habitat rules, generated outputs, and dependent
  packets.
- Enumerate cross-cutting units that are not packet-owned: Effect Biome plugin
  audit and repairs, config single-source work, Studio dev lifecycle, daemon
  stability, future foundry authority, transition records, and any actual
  residual discovered by the census.
- Mark generated/read-only paths and verify they were produced by normal
  generators rather than hand edits.
- Track product-affecting obligations in the existing manifest, verification
  ledger, packet tasks, and evidence records. Use direct structured command
  output for all-config, Effect, Habitat, and OpenSpec checks; do not construct a
  second validation or collection tool around those commands.
- Ingest phase records, review/downstream ledgers, Next Packets,
  `NOTE-TO-DRA*`, watcher/correction notes, inline correction TODOs, prior
  session records, and scratch. Classify each as authority, coordination,
  evidence, control, stale, or excluded, and carry every material open finding
  into the live ledger.
- Ingest the local-environment branch's exact CI attempts. Create one evidence
  row per failing Studio test or Habitat gate, including the observed tree,
  failure identity, raw artifact, provisional owner, and required rerun. The
  failures are not aggregated as environment noise and are not assigned back to
  environment setup merely because that branch exposed them.
- Record the current status of every declared gate. `not run`, stale,
  contradictory, and environment-blocked are first-class states.

**Disposition vocabulary for opening rows**

- `unresolved`
- `proposed-retain`
- `proposed-repair`
- `proposed-split`
- `proposed-delete`
- `proposed-park`
- `proposed-exclude`

No source row is silently dropped because a later commit appears to overwrite
it.

**Parallel work**

Stack census, packet/task audit, Habitat-rule audit, and verification-record
audit may run in parallel as read-only lanes. Corpus synthesis and status claims
are sequential DRA decisions.

**Review lanes**

- Graphite topology and source/sink accounting;
- packet/evidence integrity;
- authority-source order and scope exclusions.

**Exit gate**

- every opening commit has a row;
- every changed path maps to at least one primary unit;
- every packet, cross-cutting unit, task ledger, and touched Habitat rule is
  represented;
- every built-in config, current Effect diagnostic family, touched Habitat rule,
  and material prior correction has an owner, disposition, and direct rerun;
- every external trunk input, handoff obligation, inherited red gate, and
  planning branch-retirement decision has an exact row and terminal or
  explicitly unresolved owner state;
- the recovery bundle has passed bundle verification and disposable-restore
  comparison for every in-scope source ref;
- every declared Stage 0 gate has a terminal gate-register row and every opened
  agent, scratch path, recovery artifact, ref, and worktree has a cleanup row;
- no material prior review/correction finding is unmatched;
- unmatched paths, ambiguous owners, and contradictory statuses are explicit;
- `stack-recut-manifest.md` and `verification-ledger.md` can answer what exists
  without replaying Git history or chat.

**Narrowing result:** an unknown historical stack becomes a finite set of rows.

## Stage 1: Transition Authority And Semantic Disposition

**Purpose:** decide what deserves to survive before deciding how to package it.

**Entry gate**

- Stage 0 corpus is complete and reviewed;
- no corpus row lacks source references;
- refreshed `main` still contains the exact five-PR prerequisite checkpoint
  recorded by the Planning Closure Loop;
- the final environment handoff digest is unchanged, and the patch-equivalent
  Foundry commit in the opening Studio chain remains `reference-only`.

**Decision work**

Create `TRANSITION.md` with these explicit decisions:

- this stack merges as behavioral stabilization, not as target runtime
  architecture;
- retained pure kernels include accepted MapGen generation, recipe-owned config
  materialization, artifact planning/rendering, correlation/digest/path
  validation, direct-control setup/readback primitives, and pure reducers or
  classifiers that remain sound within their boundaries;
- accepted product behavior includes complete configs, request-local generation,
  safe public status, explicit diagnostics, coherent deployment/setup/start,
  terminal recovery, and real in-game attribution;
- current orchestration, transport, host wiring, React state derivation,
  persistence topology, and exact-topology rules are replacement-listed;
- legacy changes are limited to correctness, security, data integrity,
  verification integrity, and agreed-path playability;
- later architecture realization, behavior decomposition, target construction,
  and exclusive cutover are separate initiatives.

Route the decision durably:

- add a short ADR entry pointing to `TRANSITION.md`;
- add a system `DEFERRALS.md` entry for Foundry realization, Studio behavior
  decomposition, target construction, and exclusive cutover, pointing to the
  project deferral ledger;
- add a reverse link from `.habitat/AUTHORITY.md` identifying the transition
  document as the time-bound execution/disposition map for the current Studio
  transition;
- link `TRANSITION.md` back to current canonical authority, both packet trains,
  the future foundry reference, the semantic-ratchet addendum, the ADR, and the
  system/project deferral records;
- link the single local-environment Studio handoff as the operational
  composition contract consumed by the lifecycle unit; do not copy that
  contract into packet indexes or deferral records;
- state that the transition decision supersedes neither current accepted
  behavior authority nor the future target direction.

Do not add temporal stack-state backlinks to the future foundry document. Its
target direction should remain independent of this migration's current status.
The durable ownership/off-ramp law is written directly in
`.habitat/AUTHORITY.md` and the ADR. `TRANSITION.md` remains subordinate,
project-scoped rationale and mapping even though Habitat links to it for current
execution context.

Repair executable packet authority during Stage 1, before integration-tree
implementation:

The bullets below are the opening amendment payload from
`stack-recut-manifest.md`, not already-accepted packet authority. Stage 1 must
adjudicate each amendment against the source-map order, record its accepted or
rejected anchor, and then update the controlling packets. The accepted user
direction already forbids replacing the whole Civ7 application process for each
Run in Game request; the exact stable-row and P19/P20 ownership representation
still require this Stage 1 authority decision.

- update both packet indexes and the remediation execution frame to their
  actual closeout state;
- update `target-vocabulary.md` to recognize both packet trains as executable
  change records;
- amend P08, P18, P19, P20, and P21 specs/designs/tasks to use the stable
  `maps/studio-run.js` row and content/digest/correlation freshness rather than
  per-request path identity;
- remove P19's whole-application relaunch requirement and assign P19 an explicit
  direct-control-owned soft catalog-refresh, targeted generated-mod activation,
  and row-visibility primitive that P20 composes after saved-config load;
- amend P20 to depend on and invoke that exact P19 direct-control contract after
  saved-config load; P20 must not duplicate broad preparation, row polling, or
  catalog-refresh behavior under a second owner;
- expand P21 tasks/spec/evidence rows to the complete target-vocabulary and
  remediation matrix, including Editor while it remains admitted;
- assign `CONFIG-AUTHORITY` an explicit accepted change owner rather than
  leaving it as an untracked cross-cutting commit.

The direct-control primitive lets P19 independently establish that the generated
mod can become visible as a first-class map mod without importing P20's saved
config sequencing. P20 then owns composition of that primitive with the user's
saved setup state.

Assign every Stage 0 row one final semantic disposition:

- `retain-behavior`
- `retain-pure-kernel`
- `repair-before-merge`
- `split-before-review`
- `delete-or-supersede`
- `park-future-initiative`
- `exclude-unrelated`

For each touched Habitat rule, assign:

- `durable-invariant-retain`
- `valid-invariant-repair-code`
- `transitional-hazard-with-removal-trigger`
- `split-by-semantic-owner`
- `stale-retire-or-delete`

The minimum named rule corpus includes the aggregate
`habitat-studio-run-runtime-authority-closure` rule; the workspace, catalog,
and dev-runner topology rules
`structure-studio-run-workspace-topology`,
`structure-swooper-catalog-source-index`,
`structure-swooper-catalog-index-target-topology`, and
`enforce_studio_dev_runner_topology`; the `grit-studio-run-*` and
`grit-swooper-*` boundary rules; and the generated-entrypoint, recipe-artifact,
and public-authoring-surface rules changed by the stack. The aggregate closure
rule is reviewed as `proposed-retirement`, and exact topology rules are
reviewed for explicit transition off-ramps. Boundary and authoring rules are not
removed merely because their current owners are transitional; their semantic
invariants are judged independently.

The rule decision is based on meaning and authority, not on which runner is
fastest. No rule moves outside Habitat. A retained Grit rule must describe a
recurring kind, import/export boundary, or stable source-pattern class. Directory
shape belongs in Habitat structure authority. Type and behavior concerns return
to TypeScript and behavior verification.

The Effect plugin rows receive the same semantic treatment. Do not refactor
disposable orchestration into a more elaborate Effect shape merely to satisfy a
lint diagnostic. Retain the plugin only with a documented intended scope,
complete diagnostic corpus, and a rule-by-rule decision model. In-scope
diagnostics close through semantic fixes, deletion of invalid code, or an
authority-backed configuration decision, never a convenience suppression or a
baseline that hides live findings.

Stage 1 must also close these known decisions before implementation continues:

- whether `EditorLaunchSource` remains in the accepted public union; if it
  remains, its live matrix row remains mandatory, and if it is removed the
  contract/spec change is explicit and reviewed;
- whether the final merged local-environment handoff requires any Stage 2
  lifecycle composition change beyond its already accepted contract;
- confirmation that the merged main-root Foundry sink is consumed as future
  direction and its opening-chain duplicate stays `reference-only`;
- the exact scope of the retained Effect plugin and diagnostics;
- which late config, lifecycle, generated-visibility, saved-config, and daemon
  changes belong to each remediation packet versus a cross-cutting unit;
- which prior packet evidence remains valid after late changes touched its
  contracts.

Incomplete accepted product obligations are completed or explicitly removed by
an accepted scope/contract change. They are not withdrawn into deferrals merely
to clear the active OpenSpec list.

**Parallel work**

Independent architecture, config, Effect, Habitat, and product-behavior advisors
may propose dispositions in parallel. The final disposition of each row and all
cross-row conflicts are sequential DRA decisions.

**Review lanes**

- target-authority migration and supersession boundaries;
- product behavior retention and missing user obligations;
- Habitat/Grit/structure authority correctness and brittleness;
- Effect scope and lint-driven overengineering risk;
- documentation canonicality and reverse-link completeness.

**Exit gate**

- no row remains `unresolved` or merely `proposed-*`;
- every delete, park, and exclusion has a reason;
- every parked item has an owner, prerequisite, and re-entry trigger;
- the transition decision and authority routing are internally consistent;
- the environment handoff is linked once, its immediate lifecycle obligations
  are active rather than deferred, and its inherited red gates have owners;
- the packet indexes, target vocabulary, P08/P18/P19/P20/P21 records, and config
  change owner are repaired and strictly validated;
- no current implementation detail became target authority by default.

**Narrowing result:** a finite historical corpus becomes a finite accepted
intent set.

## Stage 2: Integration Tree Completion And Semantic Lock

**Purpose:** finish the accepted behavior on one controlled integration tip
before asking history surgery to express it.

Recutting an incomplete tree would force product and architecture decisions to
occur while resolving Git history. This stage keeps those decisions in their
own semantic loop. The integration tip is staging substrate, not a reviewable
final stack and not target architecture.

**Entry gate**

- all Stage 1 dispositions are final;
- refreshed `main` contains the exact accepted local-environment repair,
  main-root Foundry authority sink, Habitat harness repair, Studio UI semantic
  fixture repair, and token-value change, with their commits/trees and the
  environment handoff digest recorded;
- opening source refs and tree hashes are recorded;
- every incomplete current obligation has a semantic owner and expected
  evidence class.

**Candidate construction**

- Create the controlled integration branch from that exact refreshed-main
  commit, not from the old `6b6946fe10` runtime tip or the opening stacked
  authority branch. Replay every accepted runtime source row onto this base in
  dependency order. Keep the opening runtime and authority refs separately
  accounted until their sinks merge.
- Do not replay the environment bootstrap, Desktop environment,
  intelligence-bridge output, Foundry sink, Habitat harness repair, semantic UI
  fixture repair, or token branch into Studio sinks; they are already-owned
  trunk substrate.
- Confirm the Stage 0 recovery bundle remains readable and checksum-valid
  before changing the integration tip.
- Implement missing or invalid accepted behavior in focused, forward-locked
  commits on the integration tip. These commits are recut inputs, not final PR
  boundaries.
- Complete generated-map-mod visibility before saved-config reconciliation,
  and reconciliation before matrix closure.
- Repair the all-config materialization boundary generically before using any
  named config as a live scenario.
- Resolve the retained Effect diagnostic corpus without elaborating disposable
  runtime topology.
- Remove superseded debug scaffolding, property migrations, whole-application
  Civ restart paths, and brittle structural assertions according to Stage 1
  dispositions.
- Align the private Codex Studio helper as its own composition obligation:
  launch the daemon through `nx run mapgen-studio:serve-daemon`, preserve the
  canonical Vite owner and three port/RPC environment variables, require the
  frontend and daemon `/healthz`, preserve private socket/ports/state, and stop
  only the recorded worktree-owned session. Do not delegate it to shared
  restart/down or listener-wide kills.
- Resolve every inherited Studio-test and Habitat red row assigned by Stage 1.
  A stale/invalid guardrail is repaired or retired through its authority owner;
  a valid invariant repairs the code. No row remains labeled external noise.
- Regenerate all owned artifacts through their constructors.
- Update the corpus and downstream packet assumptions immediately when a
  legitimate implementation discovery changes a row.

Each semantic unit runs the universal loop through implementation review and
targeted verification, but it is not called branch-closed until Stage 5 places
and rechecks it in its final Graphite branch.

**Targeted integration-tree checks**

- strict OpenSpec validation for every changed packet;
- all classify-reported checks for each focused diff;
- focused behavior and config materialization tests;
- running Studio `/rpc` checks for changed endpoint behavior;
- targeted rendered-browser and Civ7 observations needed to resolve a disputed
  runtime design;
- aggregate tree comparison against the Stage 1 retain/delete/repair set.

The expensive complete live matrix remains the exact-head gate in Stage 6.
Stage 2 must nevertheless establish enough real runtime behavior to prevent a
known broken integration tree from being recut.

**Parallel work**

Disjoint owner research and implementation may run in parallel after their
semantic rows are locked. Shared contracts, config generation, deployment,
Studio daemon state, and Civ7 mutation remain serialized. Only the DRA mutates
the canonical integration branch.

**Review lanes**

- accepted-behavior completeness and no hidden symptom patching;
- TypeScript, code structure, and library correctness for every changed unit;
- config/default generality and generated-artifact ownership;
- Habitat rule disposition and Effect lint overengineering risk;
- runtime/direct-control sequencing for live-path repairs.

**Exit gate**

- no known accepted product defect remains in the integration tree;
- every inherited red-gate row is terminal at its assigned authority/behavior
  gate, and the environment branch is not blamed for unrelated failures;
- no semantic row is waiting for recut-time resolution;
- all integration-tree P1/P2 findings are repaired;
- focused static, behavior, endpoint, and necessary runtime checks are green;
- the integration tree hash and intentional delta from the opening tree are
  recorded;
- the worktree is clean and all staging commits are available as recut sources.

**Narrowing result:** accepted intent becomes one semantically complete tree,
leaving only topology, branch-local certification, and final composed runtime
verification unresolved.

## Stage 3: Sink Stack Design And Recut Simulation

**Purpose:** convert accepted intent into a deterministic Graphite graph before
mutating history.

**Entry gate**

- the Stage 2 integration tree is semantically complete and reviewed;
- all Stage 1 dispositions remain final after implementation discovery;
- source branch tips, staging commits, and integration tree hashes are recorded
  and retained;
- the integration tree still descends from the exact five-PR refreshed-main
  checkpoint, and the declared private Codex lifecycle sink satisfies the final
  environment handoff digest. Any prerequisite or handoff change reopens Stage
  2 before sink design continues.

**Target manifest**

For every sink branch, record:

- branch and PR title;
- source commit rows and terminal dispositions;
- parent branch and hard prerequisites;
- owning OpenSpec packet or cross-cutting change unit;
- allowed write set and generated-output procedure;
- expected source/sink patch relation;
- static, behavior, live, and review gates;
- downstream branches that must restack if it changes;
- exact rollback point and invalidation conditions.

The initial sink families are:

1. Effect Biome plugin admission and semantically grouped diagnostic repairs.
2. Original Run in Game packet train, split by its 14 packet boundaries.
3. Remediation framing and seven remediation packet boundaries.
4. Cross-cutting config, Studio lifecycle, daemon stability, and live-playability
   work assigned to the packets or explicit units they actually satisfy.
5. Transition, archive, checkpoint-specific runtime evidence, and closure
   records. Reserve a top-of-runtime-stack docs/evidence sink that survives P21
   archival and owns the Stage 8 `evidence/runtime/final-freeze/` records.

These are sink families, not permission to force a dependency. The corpus
decides whether a family is an independent stack, a prerequisite stack, or an
ordered layer in the runtime stack.

**Simulation and recovery design**

- Preserve opening source refs until all sink branches are merged and accounted.
- Use Graphite for branch creation, tracking, folding, modification, and
  restacking. Do not use ad hoc Git rebases or force pushes.
- In this multi-worktree repository, do not run a global restack. Use
  `gt sync --no-restack` only when synchronization is needed, followed by
  sink-stack restacks.
- Create a dedicated recut worktree from refreshed `main` with normal
  `git worktree add`. The opening source worktree remains frozen for comparison.
  Do not construct `.git` files or worktree directories manually.
- Instantiate the global Graphite mutation-lease protocol for the Stage 4
  recut and record the exact cohort boundaries. Read-only Git/Graphite
  inspection remains allowed.
- Precompute source-to-sink `range-diff`, patch-id, file-set, and aggregate-tree
  comparisons. Patch-id is supporting evidence; semantic moves and generated
  outputs require owner-aware comparison.
- Simulate the complete sequential OpenSpec archive/promotion plan against a
  disposable copy of the integration tree. Record every promoted-spec diff,
  skip-promotion decision, conflict, and archive layer before admitting the
  sink graph. No archive-time semantic decision is deferred to Stage 7.
- Simulate the reserved runtime-evidence sink across P21 archival and final
  restack so Stage 6 packet evidence and Stage 8 final evidence have distinct,
  durable homes.
- Model the exact bottom-to-top operation sequence before executing it.

**Parallel work**

Commit/write-set mapping, patch-overlap analysis, and proposed branch naming may
run in parallel. Parentage, merge order, and the final sink graph are one
sequential synthesis.

**Review lanes**

- Graphite command and recovery correctness;
- OpenSpec-to-branch cohesion;
- hidden semantic dependencies and cyclic parentage;
- source/sink completeness and generated-output handling;
- reviewability of branch size and intent.

**Exit gate**

- the sink graph is acyclic;
- every retained source row has exactly one primary sink;
- every deleted, parked, or excluded source row has a terminal disposition;
- every sink branch has entry, verification, review, and closeout gates;
- a dry-run reviewer can explain the complete recut without making a semantic
  choice during execution.

**Narrowing result:** accepted intent becomes a deterministic sink graph.

## Stage 4: Mechanical Recut And Stack Integrity

**Purpose:** realize the approved Graphite graph without changing semantics by
accident.

**Entry gate**

- Stage 3 manifest is approved;
- source refs are preserved;
- source and dedicated recut worktrees are clean;
- a fresh repository/Graphite/remote-operation census matches the admitted
  Stage 3 graph, and the Stage 4 exclusive Graphite mutation lease is held by
  the DRA;
- no independent worktree or stack is in the operation scope.

**Execution loop**

Recut strictly from the lowest affected ancestor upward. For one sink branch
at a time:

1. create, track, split, fold, or modify through the approved Graphite command;
2. apply only its manifest rows;
3. regenerate outputs through their owner commands;
4. compare source and sink patch, file set, tree effect, and deliberate semantic
   delta;
5. run the branch's recut-integrity checks;
6. update source/sink accounting;
7. restack only affected descendants;
8. confirm `gt ls`, Git parentage, and worktree cleanliness before the next
   branch.

If any comparison has unexplained drift, stop at that branch. Abort the active
Graphite operation if necessary and classify the mismatch. A proven mechanical
transcription or command error may repair the manifest/patch and repeat the
branch. Any implementation, contract, authority, semantic, ownership, or code-
design drift follows the global Stage 1/2 backflow. Do not continue upward with
a known mismatch.

The old source branches are not deleted merely because new branches exist. They
remain recovery sources until the corresponding sinks are merged and the final
accounting audit closes them.

**Parallel work**

History mutation is strictly sequential. Read-only comparison and review of an
already cut lower branch may run while the DRA prepares the next branch, but no
two agents mutate the canonical stack.

**Review lanes**

- source/sink and aggregate-tree equivalence;
- Graphite parentage and restack scope;
- semantic branch cohesion;
- accidental generated-output or unrelated-worktree adoption.

**Exit gate**

- all sink branches exist with approved parents;
- aggregate accepted behavior matches the Stage 1 disposition set;
- all deliberate deletions and repairs are explicit deltas;
- no sink branch contains an unexplained cross-packet write;
- no source branch has been prematurely destroyed;
- the worktree and Graphite stack are clean and coherent;
- the Graphite mutation lease is released or explicitly transferred.

**Narrowing result:** a deterministic graph becomes a reviewable physical
stack without semantic drift.

## Stage 5: Change-Unit Closure Train

**Purpose:** close every retained branch as a complete, independently reviewed
unit before relying on integrated success.

**Entry gate**

- Stage 4 stack integrity is green;
- sink branches are ordered by hard dependency;
- no branch is considered complete solely because its source commit once had a
  green log.

### Per-Unit Depth Cascade

Run one unit at a time in manifest order. For each packet or cross-cutting unit:

1. Read its proposal, design, spec deltas, tasks, workstream records, relevant
   authority, current source, tests, and dependent packets.
2. Reconcile each task and verification row with the recut branch and current
   tree. Reopen stale claims.
3. Confirm that no product, authority, contract, or code-design question remains.
   Any such question returns the workstream to Stage 2, rebuilds the integration
   tree, and reruns affected Stage 3 and Stage 4 work. Recut conflict resolution
   and branch certification are never implementation design surfaces.
4. Run strict OpenSpec validation, `bun habitat classify` on the actual write
   set, every classify-reported command, packet behavior tests, and declared
   endpoint/runtime checks.
5. Run fresh reviewer lanes against the actual branch diff.
6. Repair evidence/record findings and rerun affected gates. A finding that
   requires implementation, contract, authority, or code-design change returns
   to Stage 2 rather than being patched into the recut stack.
7. Commit reserved branch-local verification records through Graphite, restack
   descendants, close the wave's agents, and
   leave the worktree clean.

### Required Review Lanes For Every Code Unit

- TypeScript refactoring, anchored to the repository TypeScript refactoring
  skill: type ownership, state-space reduction, impossible states, inference,
  no escape hatches, and no property archaeology.
- Code quality and structure, anchored to code-quality review: owner placement,
  simplicity, module cohesion, no helper ladders or wrappers preserving wrong
  boundaries, and no code-shaped structural scripts.
- Library correctness, anchored to current official oRPC, Effect, TypeBox, and
  packet-relevant library documentation: service/client construction, resource
  lifecycle, error projection, schema/default materialization, and API use.

All three lanes inspect JSDoc and anchor comments. Cornerstone comments explain
what a boundary is for and why it exists; they do not narrate assignments or
line-by-line mechanics.

Add testing-design, Habitat authority, config/default materialization,
direct-control/Civ7, security/redaction, Graphite, or docs review when the unit's
risks require them. Required lanes are never replaced by DRA self-review.

### Named Closure Families

**Effect tooling and diagnostics**

- Confirm the plugin change enables only the intended Effect rule surface, not
  unrelated framework rule sets.
- Re-run the Effect-focused diagnostic inventory at the recut tip.
- Group fixes by semantic change type and dependency, not by arbitrary file
  count.
- Close every diagnostic in the declared scope with a fix, deletion, or
  authority-backed configuration decision.
- Reject fixes that make transitional Studio orchestration more elaborate solely
  to satisfy lint style.
- Keep root lint green and record whether diagnostics outside the Studio/runtime
  dependency closure are intentionally in or out of plugin scope.

**Original runtime packet train**

- Close all 14 packets in index order.
- Reuse prior evidence only when its tree/environment binding is still valid.
- Re-run invalidated static and behavior gates.
- Ensure packet-local Habitat rules survive the Stage 1 semantic disposition.

**Real-user-path remediation train**

- Close P15 through P20 in index order and move P21 to `runtime-ready`.
- Treat `studio-run-generated-map-mod-visibility` as open until its renderer,
  deployment identity, Civ7 catalog refresh, setup-row readback, reviews, and
  declared gates close.
- Treat `studio-run-saved-config-modset-reconciliation` as open until its current
  unchecked OpenSpec, Habitat, review, and ledger rows close.
- Treat `studio-run-real-user-matrix-closure` as `runtime-ready` only when its
  code, static gates, harness, and pre-runtime reviews are green; Stage 6 owns
  its live rows, final review, commit, and packet closure.

**Config single-source behavior**

- Enumerate every built-in catalog config.
- Materialize each through current recipe schemas/defaults.
- Serialize and parse it as ordinary JSON.
- Validate it against the current complete recipe contract.
- Exercise selection, authoring, browser generation, Save/Deploy, and Run in
  Game without Studio-side post-processing.
- Delete property-level migration and brittle key assertions instead of
  translating them into another guard.
- Regenerate checked-in config and map artifacts through their owner commands
  and inspect nondegenerate output using recipe-owned validation/statistics,
  never map-name special cases.

**Studio lifecycle and daemon stability**

- Keep shared `bun run dev:mapgen-studio:down` and restart behavior
  deterministic within their declared developer-owned scope.
- Ensure the runtime host does not use source watch in a way that restarts during
  generated/runtime writes.
- Ensure restart scripts start Studio from the active worktree and report the
  daemon repo root and server identity.
- Close `CODEX-WORKTREE-LIFECYCLE` as a distinct composition unit. Its helper
  uses the Habitat-owned Nx daemon target rather than raw Bun/watch, retains the
  canonical Vite launch and `STUDIO_DAEMON_PORT`, `STUDIO_DEV_PORT`, and
  `STUDIO_DEV_RPC_TARGET`, and requires both frontend reachability and daemon
  `/healthz` success from `start` and `status`.
- Verify the private helper keeps a worktree-derived tmux socket/session,
  disjoint ports, private ignored state, unchanged standard defaults, and
  ownership-only stop/cleanup. It may not call shared down/restart or use a
  listener scan as kill authority.
- Keep `.codex/environments/environment.toml`, the helper path, the Nx target,
  the local-environment handoff, and operator docs aligned. Run `bash -n`, build,
  start, status, explicit frontend/health probes, and stop before closing the
  unit.
- Ensure Run in Game invokes direct-control soft restart/start semantics and has
  no whole-Civ process restart path.

**Future authority input and transition records**

- Consume the separately merged foundry architecture and semantic-ratchet
  documents as future target direction without adding further Foundry scope.
- Keep current Studio behavior authority and transition status explicit.
- Do not create premature Habitat blueprints in this closeout.

**Exit gate**

- every P01-P20 and tooling sink branch has all declared gates recorded and
  green at a valid tree;
- P21 is `runtime-ready`, with every Stage 6 live row explicitly open;
- every required reviewer lane is complete with no unrepaired accepted P1/P2;
- downstream packet and authority records reflect legitimate deviations;
- no branch is closed by a narrower test than its claim;
- all per-unit worktrees and agents are clean/closed.

**Narrowing result:** a reviewable stack becomes a set of independently closed
behavioral and tooling units.

## Stage 6: Preliminary Integrated Product And P21 Closure

**Purpose:** establish that the composed product works through the path the user
actually uses before its OpenSpec changes are archived. Stage 8 repeats the
complete matrix against the final post-archive, post-restack runtime tree.

**Entry gate**

- every Stage 5 unit other than P21 is closed and P21 is `runtime-ready`;
- the exact-head recut tree is clean and built from the intended worktree;
- no open P1/P2 review finding remains.

### Fresh Environment Preflight

1. Record the exact clean source tree, lockfile digest, generated-artifact
   digests, and runtime-relevant path set.
2. Shut down only the Studio tmux sessions, listeners, and restart watchers
   explicitly owned by this verification checkpoint. Record ownership before
   teardown. Leave unrelated worktree-owned/private sessions untouched; if they
   occupy a default port, use an explicitly recorded replacement rather than a
   listener-wide kill.
3. Reinstall dependencies with the repository's frozen-lockfile Bun workflow
   and verify the Effect source submodule. Immediately verify the lockfile and
   source tree remain unchanged.
4. Regenerate recipe/config/map artifacts through owner commands. After each
   constructor, compare expected digests and confirm the source tree remains
   clean.
5. Run a clean Studio build and confirm generated outputs match the recorded
   constructor results.
6. Start the daemon and Vite frontend from this worktree on the standard ports,
   or record intentional replacement ports if occupied by an explicitly owned
   process.
7. Verify frontend reachability, daemon `/healthz`, and `studio.serverInfo`.
   Record the exact-head repo root, `serverInstanceId`, `startedAt`, and expected
   API version as the pre-operation daemon identity.
8. Put Civ7 in the required shell/setup state. Apply the single center-screen
   intro click on a fresh restart when needed rather than misclassifying the
   intro screen as tuner or setup failure.

Any unexpected install, generator, or build delta is an implementation input,
not live-test setup. Return it to Stage 2, then rerun affected Stages 3 through
5 before re-entering Stage 6.

### Static And Behavior Gate Set

At minimum, run and record:

- root lint, including the retained Effect plugin scope;
- strict validation for every active closeout change and full
  `bun run openspec:validate`;
- `nx run mapgen-studio:test`;
- classify-reported check/test/build commands for Studio app, UI, contract,
  server, direct control, MapGen core, and Swooper Maps;
- affected Habitat owner/rule checks through Habitat and Nx;
- recipe artifact generation and all-config materialization/validation;
- public/private schema and redaction behavior;
- `git diff --check` and clean generated-output status.

Use Nx parallel execution for independent graph tasks. Do not serialize checks
with ad hoc scripts when Nx already owns their dependency graph.

### Required Live Matrix

Live mutation rows run serially because Studio deployment and Civ7 setup have
one mutation owner.

Until Stage 1 amends and validates P21 and `target-vocabulary.md`, the rows and
acceptance fields below are the required amendment payload, not current
executable product authority. After that amendment, exact accepted anchors in
P21 and the target vocabulary own row behavior; this section owns ordering,
checkpoint repetition, invalidation, and aggregate closure only.

All primary realistic rows use the rendered Studio UI, saved setup config
`ToT_BasicModsEnabled.Civ7Cfg`, basic mods enabled, `MAPSIZE_HUGE`, 10 players,
balanced resources, and seed `1538316415` unless the row explicitly records the
different accepted input before admission.

Primary success rows:

1. Swooper Earthlike.
2. Latest Juicy.
3. Swooper Desert Mountains.

The integrated matrix also retains every non-overlapping row still required by
`target-vocabulary.md`:

- repeat Latest Juicy with fresh request/workspace/artifact/deployment identity;
- distinct-input Latest Juicy;
- editor launch while `EditorLaunchSource` remains in the accepted contract;
- validation failure;
- concurrent ownership conflict;
- explicit cancellation and lease release;
- missed terminal event or browser reload adoption;
- generated-row-missing failure;
- stale saved-config/generated-mod mismatch;
- `mapConfigs.saveDeploy`, `mapConfigs.status`, `civ7.live.status`, and
  `civ7.live.snapshot` through the public `/rpc` surface.

If the two packet trains disagree about a row, amend the controlling packet and
target vocabulary through an accepted authority decision before running the
matrix. Do not silently choose the smaller set.

### Per-Success-Row Acceptance

Each success row records one chain:

- exact source id or editor fixture, config/setup selections, seed, map size,
  player count, resources, rendered-button provenance, and admission timestamp;
- admitted request id and public operation phases;
- matching `runInGame.status`, `studio.operations.current`,
  `studio.events.watch`, and explicit `runInGame.diagnostics` lookup;
- applicable `mapConfigs.saveDeploy`, `mapConfigs.status`,
  `civ7.live.status`, and `civ7.live.snapshot` calls through the running public
  `/rpc` surface;
- generation manifest and config/source digests;
- request-local generated mod and run artifact id;
- copied deployment snapshot and digest;
- generated map setup row visible after saved-config/mod-set reconciliation;
- seed, map size, player count, resources, and target mods read back before
  Begin;
- no later setup reload invalidating the checked session;
- pre/post Civ7 process identity plus a direct-control soft-restart/setup/start
  receipt showing the application process was not replaced;
- fresh request-specific scripting marker and mapgen completion marker;
- live `/rpc` status and non-empty snapshot with expected dimensions;
- request-specific in-game marker matching request, artifact, deployment,
  config, seed, map size, mod id, snapshot identifiers, and every
  `RunCorrelation` field: `requestId`, `runArtifactId`,
  `launchSourceDigest`, `launchEnvelopeDigest`, and
  `generationManifestDigest`;
- recipe-owned nondegenerate/playability validation so an all-water or otherwise
  unusable map cannot pass merely because a snapshot exists;
- terminal public `completed` status and private attribution/diagnostics record;
- post-terminal `studio.serverInfo` with the same repo root,
  `serverInstanceId`, and `startedAt` recorded before admission, demonstrating
  that generation/deployment writes did not replace the operation owner;
- redaction scan showing no private data in public status/current/event output.

Each attempt is immutable under
`evidence/runtime/preliminary/<row-id>/<attempt-id>.md`, is linked by a
checkpoint-specific matrix-register row, and appends its gate attempt to
`gate-register.jsonl`. Failed attempts remain queryable and never overwrite the
accepted attempt.

No endpoint-only request, handler call, fake direct-control test, pre-Begin row,
scripting log alone, screenshot, or shape-only live snapshot substitutes for the
full rendered-button-to-in-game chain.

### Integrated Review Lanes

- product/user-path acceptance and all-config generality;
- TypeScript/state-machine simplification;
- code ownership and transitional-topology containment;
- oRPC, Effect, TypeBox, and direct-control correctness;
- testing design and evidence strength;
- Habitat/Grit/structure rule quality and brittleness;
- public/private security boundary;
- runtime/Civ7 attribution and nondegenerate map behavior.

**Exit gate**

- all static and behavior gates are green;
- every required live row is green at the exact-head recut tree and recorded
  with its exact inputs and identities in the preliminary runtime evidence
  checkpoint;
- all reviewers have dispositioned findings and no accepted P1/P2 remains;
- P21's live tasks, verification ledger, final review, and branch commit are
  closed at the exact-head recut tree;
- failed attempts are retained as diagnostic history but are not counted as
  successful rows;
- the exact-head recut tree and runtime environment fingerprints are
  recorded.

**Narrowing result:** individually closed units become a P21-closed preliminary
behavioral baseline that is eligible for archive simulation replay and final
freeze.

## Stage 7: Record Reconciliation And OpenSpec Archival

**Purpose:** make change-management state agree with the accepted implementation
and durable authority.

**Entry gate**

- Stage 6 integrated baseline is green;
- all packet tasks and ledgers reflect current evidence.

**Execution**

- Reconcile every task checkbox, verification row, review ledger, phase record,
  downstream note, and packet index status.
- Remove or correct stale claims, including claims that used a narrower evidence
  class than their wording.
- Promote durable decisions to the correct canonical docs, ADR, Habitat record,
  or project deferral before archival.
- Classify each change's spec delta as `target-neutral-promote`,
  `rewrite-target-neutral-then-promote`, or `historical-only-skip-promotion`.
  Topology-mixed deltas may not become canonical merely because the change is
  being archived. Any skip-promotion mode must be supported by the repo-local
  OpenSpec command and reviewed against change-management authority.
- Archive the 14 original changes in packet order with the repo-local OpenSpec
  archive command.
- Archive the 7 remediation changes in packet order after their dependencies.
- Validate promoted specs after each archive operation and compare them with the
  Stage 3 simulation. Any semantic conflict or unexplained diff stops archival
  and follows the global backflow: Stage 1 first when authority changes, then a
  mandatory Stage 2 rebuild before replaying later stages. A proven archive-
  command or record-only mismatch with unchanged semantics may return to Stage
  3 simulation. Stage 7 does not invent a new resolution while mutating
  records.
- Preserve or repoint
  `docs/projects/codex-local-environment/studio-refactor-handoff.md` so its one
  canonical helper/environment/daemon composition contract matches the final
  paths and Stage 8 isolation gate. Do not duplicate it into packet indexes,
  deferrals, or archived packet prose.
- Leave unrelated active OpenSpec changes untouched.

Archive changes may be grouped into reviewable Graphite layers by packet train
or promoted-spec interaction. The grouping must not hide a failed archive or
make one packet's spec delta silently overwrite another.

**Parallel work**

Read-only stale-record and link audits may run in parallel. Archive operations
and promoted-spec conflict resolution are sequential in packet order.

**Review lanes**

- OpenSpec task/spec/archive consistency;
- durable authority promotion and deferral routing;
- evidence language and status accuracy;
- docs link integrity and information duplication.

**Exit gate**

- no completed packet remains active merely from neglect;
- no incomplete packet is archived;
- no topology-specific delta is promoted as durable target authority;
- full OpenSpec validation is green;
- transition, ADR, Habitat, deferrals, packet indexes, and archived records
  agree;
- the local-environment handoff, helper, environment action, daemon target, and
  operator docs agree and retain one routing path;
- the aggregate ledger has no stale or contradictory status.

**Narrowing result:** a preliminary accepted baseline becomes durable,
non-contradictory change history ready for final runtime-tree freeze.

## Stage 8: Final Freeze, Runtime Verification, Submit, Merge, And Drain

**Purpose:** move the accepted sink stacks into `main` without
losing reviewability or evidence validity.

**Entry gate**

- Stage 7 records are closed;
- every branch is clean, reviewable, and has its required checks;
- sink stack/source accounting is complete;
- the reserved final runtime-evidence sink exists above the archived packet
  layers;
- a fresh Git/Graphite/worktree/remote-operation census agrees with the
  manifest and the Stage 8 mutation lease is held for the first mutation
  cohort.

**Final freeze and runtime gate**

1. Synchronize refreshed trunk state without global restacking, then restack
   only the admitted sink stacks.
2. Repeat the Stage 6 fresh-environment preflight and re-run branch/static gates
   affected by archive, promotion, or restack.
3. Freeze and record the runtime-relevant tree, lockfile, generated artifact,
   OpenSpec, and environment fingerprints.
4. Re-run the complete Stage 6 browser/endpoint/setup/in-game matrix. This is
   the final product gate; no preliminary row substitutes for it. Append one
   immutable record per attempt under
   `evidence/runtime/final-freeze/<row-id>/<attempt-id>.md` and link it from the
   matrix and gate registers.
5. Run fresh final integration reviewers and disposition every finding.

Any runtime-relevant tree or dependency change after this freeze reopens the
complete final matrix. A docs-only change still reruns affected static/link/
OpenSpec checks and must preserve the recorded runtime-relevant tree hash.
Any implementation, contract, authority, or code-design finding returns to
Stage 2, rebuilds the integration tree, and replays affected Stages 3 through 7
before Stage 8 begins again. Only evidence wording, links, and formatting that
cannot affect runtime or authority may be repaired locally, with their affected
gates rerun.

**Submit and merge**

- Submit Graphite stacks with `gt submit --stack --ai` in dependency order.
- Resolve evidence-only PR findings in their owning branch, rerun affected
  gates, and targeted restack descendants. Any PR finding that changes
  implementation, contract, authority, or code design follows the Stage 2
  backflow above; it is not repaired opportunistically in the submitted stack.
- Merge bottom to top through Graphite.
- After each merge, synchronize with `gt sync --no-restack` when needed and
  restack only the remaining sink stack.
- Do not touch independent sibling stacks or worktrees.
- Retire source branches only after their sink is present in `main` and the
  manifest records the terminal disposition.
- Compare merged `main` with the verified final runtime-relevant tree. Promote
  live evidence only when runtime paths, dependencies, generated artifacts, and
  environment binding are unchanged; otherwise rerun the complete affected
  matrix before closure.
- Use two fresh standard `git worktree add` checkouts of merged `main` for final
  clean install/build/static verification and the private Codex lifecycle
  isolation gate. In each worktree run the checked-in environment/helper
  composition, start and status, and explicit frontend plus daemon `/healthz`
  probes. Record distinct sockets, sessions, ports, and state paths. Stop the
  first instance and confirm the second frontend and `/healthz` remain
  reachable; then stop the second. Shared listener-wide down/restart is
  forbidden in this gate. Confirm both private sessions, listeners, and state
  rows are terminal, then remove both clean worktrees with
  `git worktree remove`.
- Never use `gt undo` to reverse a submitted or merged remote operation. Repair
  remote history through a normal owning-branch correction before merge or a
  reviewed corrective/revert PR after merge.

Release the mutation lease while waiting on remote review only after recording
a clean operation census. Reacquisition for any later submit, restack, merge,
or branch retirement requires a new census. The final Stage 8 release occurs
only after merged-tree comparison, source retirement, and cleanup accounting
are terminal.

**Parallel work**

PR review may proceed in parallel across already submitted branches. Merge,
restack, source retirement, and final tree accounting are sequential.

**Review lanes**

- Graphite integration and PR dependency state;
- final source/sink accounting;
- merged-tree/evidence equivalence;
- clean-worktree and process lifecycle closure.

**Exit gate**

- all accepted sink branches are merged;
- all rejected or superseded source work has an explicit terminal disposition;
- no current-stack branch remains `needs restack` or ambiguously active;
- the complete final matrix is green at the frozen runtime-relevant tree and
  remains valid after merge comparison;
- merged `main` is green at the valid evidence classes;
- Studio sessions started for verification are down unless intentionally handed
  off;
- the two-worktree private lifecycle isolation gate is green and stopping one
  instance left the other reachable;
- owned worktrees are clean and temporary worktrees removed.

**Narrowing result:** local accepted history becomes merged repository state
with no dangling source authority.

## Stage 9: Merge The Closeout Handoff And Return To Habitat

**Purpose:** close this topic in one final docs-only Graphite branch without
losing the work that should happen after the Habitat authority descent.

**Entry gate**

- Stage 8 merge and drain are complete;
- no current closeout obligation remains open;
- a fresh Git/Graphite/worktree/remote-operation census matches merged `main`,
  and the Stage 9 mutation lease is held before creating the final branch.

Create the final closeout branch from refreshed `main`. It may change only this
project's control/deferral/handoff records and required navigation links. Use
this explicit bootstrap:

1. under a mutation lease, create the branch and a bootstrap docs commit that
   records the preceding behavioral-baseline main SHA/tree, merged sink state,
   runtime-evidence binding, terminal source dispositions, and stable branch
   name;
2. submit that branch as a draft with `gt submit --stack --draft --ai` to obtain
   its stable PR identity, then record a clean lease release;
3. add the PR identity, terminal predicate, and terminal-record query to the
   tracked closeout records; run reviews and affected docs/static gates;
4. reacquire the mutation lease, commit the final tracked state, update the
   existing draft with `gt submit --stack --update-only --publish --ai`, satisfy
   review/CI, and merge;
5. after merge and local cleanup, write the external terminal record defined
   below.

Do not record the final branch's own future commit, tree, merge SHA, or future
post-merge main SHA inside itself; that is an unsatisfiable self-reference.

The named external terminal record is one structured comment on the final
closeout PR, written by the closing Product/Development DRA after merge. Its
first line is `MAPGEN-STUDIO-RUNTIME-CLOSEOUT: CLOSED`; its fields are final PR
URL, PR merge commit, refreshed-main commit/tree, required-check conclusion,
Graphite operation/restack state, owned-worktree state, agent fleet state,
scratch state, Studio tmux/listener/watcher/process state, temporary-worktree
state, recovery-artifact/ref disposition, observation timestamp/timezone, and
writer. Query it with:

```text
gh pr view <final-pr> --json state,mergeCommit,statusCheckRollup,comments
```

Before the final tracked commit, set the ledger to
`ready-to-close-on-terminal-record` and record this predicate: the named PR is
merged with green required checks; its merge is reachable from refreshed
`main`; and the uniquely labeled external terminal record exists with every
field terminal or explicitly handed off. Once true, the workstream is
`workstream-closed` without a follow-up tracked edit. A merge record alone is
insufficient because it cannot report local cleanup.

**Post-closeout readiness consumer**

The readiness stack rooted at
`codex/pre-descent-readiness-and-descent-roadmap` and ending at
`codex/readiness-final-aggregate-proof-green` is not merged before this
workstream. Its aggregate records cover an older Habitat/Studio tree and it has
real semantic conflicts with the Studio stack in Grit provider/runtime files.
Merging it first would publish stale conclusions and still require a second
reconciliation.

After the Studio behavioral baseline and this final closeout branch are merged:

1. preserve the readiness stack's current local-only final commit as historical
   input, not current truth;
2. acquire a separate mutation lease and run `gt sync --no-restack`;
3. target-restack PRs `#2036` through `#2043` bottom to top onto the merged
   Studio main checkpoint;
4. refresh rule counts, timing/corpus data, manifest-ledger parity, domain
   operation rows, and the post-merge reconciliation against the merged Studio
   implementation;
5. resolve Grit ownership semantically rather than restoring superseded
   fallback behavior;
6. rebuild the final aggregate branch, rerun its full Habitat/Nx/Grit gates and
   fresh reviews at exact submitted SHAs, then publish and merge bottom to top.

This is the first named consumer in the Habitat-return packet. It remains an
independent downstream stack, not a hidden Stage 8 dependency and not source
material for the Studio recut.

**Parked initiatives**

1. **RAWR architecture realization in Habitat.** Define and admit the required
   blueprint kinds and dependency laws, including service, API, host, worker,
   resource/provider, plugin, app, and harness species. This is a standalone
   platform initiative. Re-entry trigger: the relevant blueprint destinations
   are constructible and enforced by Habitat.
2. **Studio behavior and logic decomposition.** Inventory accepted user
   behaviors and state transitions independently of legacy code; separate
   domain invariants, orchestration, side effects, public contracts, private
   diagnostics, policies, resources, and projections; assign retain/rewrite/
   delete and target owners. Re-entry trigger: Habitat destinations needed for
   the decomposition are admitted.
3. **Target Studio construction.** Fresh-build semantic services, resources,
   projections, app composition, profiles, entrypoints, and runtime harness from
   the accepted decomposition. Re-entry trigger: behavior decomposition is
   accepted and destination constructors are available.
4. **Exclusive cutover and legacy deletion.** Quiesce legacy mutations, acquire
   target ownership, switch product/API/UI/runtime ownership as one cohort, and
   delete legacy authority without fallback or mirrored mutation. Re-entry
   trigger: target realization passes its own full acceptance workstream.

The project `deferrals.md` records these as intentional sequencing decisions,
not vague future cleanup. It also records any transitional risk consciously
retained at merge with a named owner and falsifier.

Create `NEXT-PACKET.md` as a zero-context handoff back to the active Habitat
authority descent. It must include:

- preceding merged behavioral-baseline main SHA/tree, final closeout branch
  name and PR identity, plus the command/query that resolves the branch's
  eventual merge commit from the PR record;
- expected pre-merge stack/worktree state and the terminal-record query for
  exact post-merge state;
- links to `TRANSITION.md`, deferrals, archived packets, and final verification
  ledger;
- what is now safe to assume about Studio behavior;
- what must not be assumed about target architecture;
- the exact Habitat authority objective to resume;
- the readiness-stack target-restack/reconciliation sequence that precedes or
  composes with that resumed authority descent;
- protected paths, known independent stacks, and excluded sibling worktrees;
- first command/query set for the returning DRA.

**Review lanes**

- zero-context handoff usability;
- deferral completeness and re-entry triggers;
- no accidental activation of later initiatives;
- final closure readiness.

**Exit gate**

- future work is discoverable without being active scope;
- no deferred item lacks an owner or trigger;
- no current obligation is mislabeled as future work;
- the returning Habitat DRA can resume without reading this conversation;
- the readiness stack is still parked with its exact post-Studio reconciliation
  trigger and has not been represented as current merged authority;
- the final docs-only closeout branch passes its required checks, is reviewed,
  submitted, merged, and leaves no subsequent tracked edit;
- the external terminal closeout comment satisfies the tracked predicate;
- refreshed final `main`, Graphite, worktree, agent, scratch, and Studio process
  state are clean, with all pre-merge resources terminal in the cleanup
  register and exact post-merge observations in that terminal record;
- all final review findings were dispositioned before the terminal merge.

**Narrowing result:** the Studio topic is put to bed as a merged transitional
baseline, and attention returns cleanly to the authority descent that enables
its eventual replacement.

## Parallelization Summary

| Surface | May run in parallel | Must remain sequential |
| --- | --- | --- |
| Opening | read-only stack, packet, Habitat, and ledger census lanes | corpus synthesis and status claims |
| Semantic disposition | specialist recommendations | final row dispositions and authority conflicts |
| Recut design | mapping, overlap analysis, proposed branch cuts | final parent graph and command order |
| Recut execution | read-only review of completed lower layers | all Graphite mutations bottom to top |
| Unit closure | independent research; reviewer lanes; Nx graph tasks | packets and branches with hard dependencies; finding disposition |
| Live verification | passive log capture and read-only analysis | Studio deployment, Civ7 setup, Begin, and scenario rows |
| OpenSpec closure | stale-link and record audits | archive and promoted-spec resolution in packet order |
| Merge | review of submitted branches | bottom-to-top merge, restack, source retirement |
| Final parking | independent handoff/deferral reviews | final closure decision |

## Finding And Deferral Policy

Review findings use `P1`, `P2`, or `P3` and one disposition:

- `accepted`
- `rejected`
- `invalidated`
- `waived`
- `deferred`

No finding is left implicit. Accepted P1/P2 findings block the dependent gate.
Rejected findings require source-backed reasons. Invalidated findings cite the
later evidence. Only P3 findings may be waived or deferred, with risk, owner,
and trigger. P1/P2 findings close only through verified repair, source-backed
rejection, later-evidence invalidation, or a cited user/owning-authority
decision. Every repair preserves the original finding and links the affected
gate reruns. Deferrals move only genuinely exterior work into `deferrals.md`;
they may not hide incomplete current behavior.

## Workstream Falsifiers

Stop and reframe the affected stage if any of these becomes true:

- current code shape is being used as the target architecture;
- a branch cut requires an unresolved semantic choice;
- a commit or changed path has no source/sink accounting row;
- a later packet is being used to excuse an unchecked earlier required gate;
- a config fix names individual config properties, stages, or map ids instead
  of repairing the general materialization boundary;
- a lint fix elaborates code already dispositioned for replacement;
- a Habitat/Grit/script rule duplicates implementation rather than expressing a
  durable class;
- a live success claim begins at the endpoint instead of the rendered button;
- a setup row, log line, screenshot, or mock is being substituted for post-start
  request-specific in-game observation;
- a merge or restack changes the relevant tree without invalidating prior
  evidence;
- unrelated worktrees or stacks enter the write set;
- a blocker is being recorded as a terminal result instead of entering an
  investigation and repair loop.

## Final Closure Checklist

- [ ] Planning trunk drain is terminal: environment, main-root Foundry, Habitat
      harness, semantic Studio UI fixture, and token-value changes are merged;
      the two authorized investigations are absent; opening Studio refs were
      not rewritten before recovery.
- [ ] Opening corpus is complete and reviewed.
- [ ] Obligation corpus has zero missing config, Effect, Habitat, packet, or
      material prior-control rows.
- [ ] Transition decision and reverse authority links are accepted.
- [ ] Every source row has a terminal semantic and stack disposition.
- [ ] Sink Graphite graph is realized and source/sink accounting is complete.
- [ ] Effect diagnostic scope is closed without hiding findings or elaborating
      disposable architecture.
- [ ] All 14 original packets are reconciled, verified, reviewed, and archived.
- [ ] All 7 remediation packets are reconciled, verified, reviewed, and
      archived.
- [ ] Every built-in config materializes and validates through one general
      recipe-owned path.
- [ ] Studio lifecycle, down/restart commands, stable daemon, and direct-control
      soft restart behavior are closed.
- [ ] The private Codex helper composes the canonical daemon target, requires
      frontend plus `/healthz`, and passes merged-main two-worktree isolation
      with ownership-only teardown.
- [ ] Static, behavior, endpoint, browser, setup, and in-game gates are green at
      valid tree/environment bindings.
- [ ] The complete matrix was rerun after archive/promotion and final restack at
      the Stage 8 frozen runtime-relevant tree.
- [ ] Required reviewer findings are fully dispositioned.
- [ ] Stage/unit gate register has no missing, skipped, stale, or invalidated
      gate counted as closed.
- [ ] Sink stacks are submitted, merged bottom to top, and drained.
- [ ] Merged `main` and final worktree/process state are clean.
- [ ] Future initiatives and transitional risks have owners and re-entry
      triggers.
- [ ] The readiness stack remains unmerged and has an exact post-Studio
      target-restack, reconciliation, verification, and merge handoff.
- [ ] Zero-context Habitat return packet is reviewed and usable.
- [ ] Final closeout branch records the preceding behavioral-baseline SHA/tree,
      stable branch/PR identity, terminal predicate, and final objective outcome;
      the structured post-merge terminal comment satisfies that predicate.
- [ ] All agents, scratch paths, temporary worktrees, Studio processes,
      listeners, watchers, and tmux sessions are closed or explicitly handed
      off.
- [ ] Cleanup register has a terminal row for every owned runtime or workstream
      resource and a retention trigger for every intentionally preserved item.
- [ ] Final review dispositions and all durable records are committed, and no
      tracked edit remains after closeout merge.
