# Design - Boundary Taxonomy Tightening

## Frame

### Objective

Make Habitat's project-plane boundary taxonomy current, graph-proven, and
command-truthful so agents can use `kind:*` tags and `nx-boundaries` as a
reliable structural authority.

### Product Movement

The product outcome requires agents to classify before authoring and enforce
architecture through the correct owner layer. Boundary tags are the project
plane for that loop. If they are stale, speculative, or only historically
green, then classify/generate and Grit authority can inherit false structure.

### Selection

This design selects:

- Stage 0 `CLAIM-H3-TAXONOMY`;
- `docs/projects/habitat-harness/taxonomy.md`;
- historical H3 packet and phase record;
- package manifest `nx.tags`;
- resolved Nx graph nodes and dependency edges;
- `eslint.boundaries.config.mjs` depConstraints;
- `nx-boundaries` rule-pack and target wiring;
- dual-tag semantics for `mod-civ7-intelligence-bridge`;
- stale H3 and downstream records.

### Foreground

- Current resolved graph evidence over historical H3 closure language.
- Project-plane owner boundaries over broad architecture prose.
- Dual-tag and false-negative probes over spot checks.
- Whole-command success over target-internal success.
- Normal Nx defaults over daemon/cache workaround policy.
- Records truth for downstream classify and Grit workstreams.

### Exterior

- Product/runtime behavior.
- Intra-project Grit/file-layer/test semantics.
- Biome formatting or safe-write policy.
- New taxonomy categories unless current evidence forces a deliberate
  architecture decision.
- Nx Enterprise Conformance/Owners adoption.

### Hard Core

1. Nx owns project-plane JavaScript/TypeScript import and package dependency
   boundaries through resolved project tags and `@nx/enforce-module-boundaries`.
2. Grit, file-layer rules, tests, and manual review own intra-project and
   semantic obligations.
3. Taxonomy proof requires package manifests, resolved Nx tags, resolved graph
   edges, boundary config, probes, and records to agree.
4. A proof command is green only when the whole command exits 0.
5. Stale closure records must be repaired or explicitly downgraded.

### Structural Alternative Considered

Alternative: treat historical H3 as already closed and patch only the Stage 0
ledger row to records-only.

Rejected because current evidence found an enclosing Nx command failure on one
historical run-many path, while a focused target path passed. That kind of
distinction is exactly what the recovery frame is meant to preserve.
Records-only acceptance would keep the false-confidence loop alive.

### Falsifier

This design fails if implementation proves the current `kind:*` taxonomy can
only stay green by weakening constraints, ignoring resolved graph edges, or
claiming success from a subprocess when the enclosing Nx/Habitat command exits
nonzero.

## Current Diagnosis

| Surface | Current evidence | Design consequence |
| --- | --- | --- |
| Stage 0 claim | `CLAIM-H3-TAXONOMY` remains unknown and owned by `habitat-boundary-taxonomy-tightening`. | A repair packet is required before downstream work can cite H3 as current truth. |
| Historical H3 | `openspec/changes/habitat-boundary-tags` is complete and records green gates. | Useful source, but must be reconciled against current command behavior. |
| Package tags | Fresh manifest audit found 22 workspace projects with expected `kind:*` tags, including `@internal/habitat-harness` and dual-tagged `mod-civ7-intelligence-bridge`. | Implementation must codify this as repeatable proof, not a one-time table. |
| Resolved tags | `nx show project @internal/habitat-harness --json` reports `kind:tooling`; `mod-civ7-intelligence-bridge` reports `kind:mod` and `kind:control`. | Resolved Nx tags, not package JSON alone, must be proof source. |
| Resolved edges | `nx graph --file /tmp/habitat-boundary-graph.json` produced 44 workspace edges. | Every edge must be evaluated against the depConstraint matrix. |
| Boundary config | `eslint.boundaries.config.mjs` contains only `@nx/enforce-module-boundaries` and the `kind:*` depConstraints. | Config parity with taxonomy must be machine-checked or reviewed line-by-line. |
| Direct target | Historical `nx run @internal/habitat-harness:boundaries --skipNxCache` exited 0. Current proof should use normal `nx run @internal/habitat-harness:boundaries` unless a documented target-specific reason requires otherwise. | Direct target remains a valid focused proof, but cache flags are not the steady-state proof contract. |
| Normal run-many | One historical `nx run-many -t boundaries --all --skipNxCache` ran the target successfully but exited 1 with SQLite foreign-key transaction failure. | A target-internal success is not enough; the normal aggregate path must either exit 0 or receive a root-cause repair/escalation record. |
| No-daemon run-many | Historical `NX_DAEMON=false nx run-many -t boundaries --all --skipNxCache` exited 0. | This is diagnostic evidence only. It is not accepted steady-state proof policy after the Nx workflow settlement. |
| Habitat rule | `bun run habitat:check -- --json --rule nx-boundaries` exits 0 and the parsed `rules` array contains `nx-boundaries` and `baseline-integrity`, both locked, passing, and diagnostics-empty. | Habitat rule proof requires JSON shape assertions; command-surface selector repair still owns invalid selector behavior. |
| Dual-tag probe | Created-and-reverted probe in `mod-civ7-intelligence-bridge` importing `@mateicanavra/civ7-sdk` failed on `kind:control`; probe was removed and boundary rerun passed. | The live `kind:mod` plus `kind:control` SDK-negative case is currently enforced and must become a required proof. |

## Official Nx Constraints

Official Nx docs support this owner boundary:

- Project tags may live in `package.json` or `project.json`.
- Nx module-boundary enforcement uses tags and dependency constraints.
- `@nx/enforce-module-boundaries` is the open-source JavaScript/TypeScript
  import and package dependency enforcement path.
- Nx Conformance provides language-agnostic project-boundary rules, but it is
  Enterprise-gated and not part of this repair.
- Multi-dimensional tag examples use `sourceTag` and `allSourceTags`; the
  local taxonomy's dual-tag/intersection claim must be proven against current
  installed behavior, not assumed from prose.

## System Dynamics

Reinforcing failure loop:

1. H3 says taxonomy is locked and green.
2. Downstream classify/Grit packets cite taxonomy as authority.
3. Agents use tags to author or enforce structural changes.
4. If tags, config, graph, or command proof drift, wrong structure becomes
   self-reinforcing.
5. Later records cite older H3 closure instead of current graph evidence.

Balancing loop introduced by this repair:

1. Taxonomy proof starts from current package manifests and resolved Nx graph.
2. Config parity and edge legality are checked before authority is claimed.
3. Violation probes prove false-negative resistance.
4. Command proof records whole-command exit status.
5. Downstream records cite exact proof boundaries instead of historical H3.

## Proof Matrix

Implementation must provide a repeatable proof matrix.

| Proof area | Required evidence | Closure claim allowed |
| --- | --- | --- |
| Project inventory | Workspace package manifests plus `nx show projects --json`. | All workspace projects in taxonomy are present and no unclassified project exists. |
| Tag parity | Manifest `nx.tags`, resolved Nx project tags, and taxonomy table comparison. | `kind:*` assignments are current. |
| Config parity | Parsed `eslint.boundaries.config.mjs` depConstraints compared to taxonomy table. | Boundary config implements the documented taxonomy. |
| Graph edge legality | Resolved `nx graph --file` workspace edges evaluated against matching source tag constraints. | Current graph has no illegal project-plane edge. |
| Dual-tag sentinel | Probe from `mod-civ7-intelligence-bridge` to an SDK-only-allowed target fails on `kind:control`. | Live `kind:mod` plus `kind:control` SDK-negative case is enforced; broader dual-tag claims require broader proof. |
| False-negative probes | Foundation-to-adapter and dual-tag-control-to-sdk probes fail and are reverted. | Boundary rule fails for selected forbidden edges that cover distinct constraint shapes. |
| Direct command | `nx run @internal/habitat-harness:boundaries` exits 0 on clean tree. | Focused boundary target works. |
| Run-many command | Normal `nx run-many -t boundaries --all` behavior recorded. | Aggregate boundary command is reliable, or records name the root-cause repair/escalation. |
| Habitat rule | `habitat:check -- --json --rule nx-boundaries` reports `nx-boundaries` in `rules[]` with locked pass, owner metadata, and empty diagnostics. | Habitat exposes the boundary owner without selector false-green proof inflation. |
| Downstream records | Stage 0, H3 proposal/tasks/phase record, Habitat workstream record, review-disposition architecture lane, README/AGENTS when command policy changes, and dependent packets patched or marked historical until repair lands. | Future agents see current proof boundaries. |

## Implementation Decision Points

### Taxonomy Verifier

The implementation must decide whether to add a focused verifier script under
`tools/habitat-harness/scripts/**` or keep the proof as documented command
composition.

Accepted verifier criteria:

- parses taxonomy/config/package/Nx graph as structured data;
- reports missing project, extra project, tag mismatch, config mismatch,
  illegal edge, and unresolved graph output distinctly;
- produces deterministic JSON or stable text;
- can run without mutating `.nx`, generated outputs, or package manifests.

Accepted no-verifier criteria:

- the proof matrix remains executable through checked-in tests or commands;
- every comparison step has an exact command and expected output class;
- stale-record realignment records why no dedicated verifier is needed.

### Command Reliability

The implementation must settle the historical run-many failure observed during
diagnosis against the current Nx workflow contract.

Accepted outcomes:

- normal run-many exits 0 after repair and is used as proof;
- normal run-many still fails, with an exact root cause and owning repair
  workstream recorded before any broader command claim is made;
- a Habitat-owned command wraps the boundary check and records Nx command
  provenance and post-target failures explicitly, while still using normal Nx
  command resolution.

Rejected outcomes:

- treating target-internal success text as proof when the outer command exits
  nonzero;
- hiding Nx command failures by omitting the failing command from records;
- selecting `NX_DAEMON=false`, cache disabling, socket overrides, symlink
  repair, or routine cache reset as the accepted steady-state policy;
- weakening boundary checks because one command path is unreliable.

### Effect Substrate

Effect is not a semantic owner for taxonomy or Nx boundary rules. If this
repair stays in proof scripts, docs, and boundary config, no Effect adoption is
required.

If implementation changes Habitat's orchestration of Nx commands, command
provenance, cache/daemon error handling, or structured proof records, it must
consume the existing Effect decision criteria: adopt Effect when it removes
manual untyped orchestration, or prove equivalent typed state, service
substitution, runtime-edge discipline, and cleanup/error handling.

## Owner Boundaries

Nx boundary owner:

- project-level tags;
- project dependency constraints;
- JavaScript/TypeScript imports across projects;
- package dependency edges visible to the ESLint rule;
- resolved graph and target metadata for proof.

Habitat owner:

- taxonomy proof orchestration;
- rule-pack metadata;
- baseline and report semantics;
- command proof labels;
- stale-record realignment;
- classification guidance over Nx metadata.

Exterior owners:

- Grit owns intra-project source-shape rules.
- File-layer owns generated and path-zone write protection.
- Tests own semantic/runtime invariants.
- Biome owns hygiene and formatting.

## Write Set

Expected implementation write set:

- `docs/projects/habitat-harness/taxonomy.md`
- `docs/projects/habitat-harness/recovery-claim-ledger.md`
- `docs/projects/habitat-harness/workstream-record.md`
- `openspec/changes/habitat-boundary-tags/**`
- `openspec/changes/habitat-classify-generator-repair/**` only if dependency
  wording changes
- `eslint.boundaries.config.mjs`
- workspace `package.json` files only if tag mismatches are proven
- `tools/habitat-harness/src/plugin.js` only if boundary target inputs or
  command wiring need repair
- `tools/habitat-harness/src/rules/rules.json` only if rule metadata or detect
  argv changes
- possible verifier script under `tools/habitat-harness/scripts/**`
- focused tests under `tools/habitat-harness/test/**`
- `tools/habitat-harness/README.md`
- root `AGENTS.md` only if router wording is stale after proof policy settles

Protected paths:

- product/runtime implementation source except created-and-reverted probes;
- generated outputs and `.civ7/outputs/resources/**`;
- Grit pattern files;
- Biome config;
- lockfiles except package-manager-generated changes from a proven dependency
  need;
- broad command-surface implementation outside the boundary proof path.

## Test And Proof Design

### Structured Audits

- Parse taxonomy project rows and depConstraint rows.
- Parse all workspace package manifests and their `nx.tags`.
- Parse resolved Nx project metadata for all projects.
- Parse `eslint.boundaries.config.mjs` or inspect it through a stable exported
  helper if implementation refactors the config for testability.
- Parse `nx graph --file` dependencies and evaluate every workspace edge.

### Probe Matrix

- `kind:foundation` source importing `@civ7/adapter` fails.
- `mod-civ7-intelligence-bridge` source importing `@mateicanavra/civ7-sdk`
  fails through `kind:control`.
- Probes are created, run, removed, and followed by a clean rerun.
- Probes never remain staged or committed.

### Command Proofs

Implementation must record:

- cwd, argv, environment variables that affect Nx daemon/cache behavior, exit
  code, output class, and touched paths;
- direct target result;
- normal run-many result;
- Habitat `nx-boundaries` result;
- parsed Habitat JSON assertion that `rules[]` contains `nx-boundaries` with
  `ownerTool: nx-boundaries`, `lane: enforced`, `status: pass`, `locked: true`,
  and zero diagnostics;
- optional `habitat verify` result after command-surface repair is consumed;
- OpenSpec validation and guardrail scan results.

## Downstream Proof Boundaries

- OpenSpec validation proves artifact shape only.
- Tag parity proves taxonomy assignment, not product/runtime behavior.
- Graph edge legality proves current resolved project-plane edges, not future
  edges.
- Boundary probes prove selected false-negative resistance across distinct
  constraint shapes, not every possible illegal edge.
- `nx-boundaries` success proves only project-plane JS/TS import and package
  dependency rules documented for Nx ESLint boundaries.
- It does not prove Grit, file-layer, Biome, runtime, generated-output, or
  product claims.

## Required Stale-Record Repairs

Implementation must treat the following records as historical until this repair
lands and must patch or explicitly downgrade them before claiming
`CLAIM-H3-TAXONOMY` current:

- `openspec/changes/habitat-boundary-tags/proposal.md` lines that say the
  project plane was verified green at adoption or cite
  `bunx nx run-many -t boundaries --all` as the gate.
- `openspec/changes/habitat-boundary-tags/tasks.md` task 4.1 green run-many
  wording and task 4.3 closure posture.
- `openspec/changes/habitat-boundary-tags/workstream/phase-record.md` closure
  result lines for run-many, direct, affected, and locked-empty boundary gates.
- `docs/projects/habitat-harness/workstream-record.md` train-closed and H3
  closure rows that can be read as current recovery proof.
- `docs/projects/habitat-harness/review-disposition-ledger.md`
  Architecture-Review Lane verdict language that says lock-safe from declared
  manifest edges without the current resolved-graph and command proof matrix.
- `tools/habitat-harness/README.md` and root `AGENTS.md` command guidance if
  implementation selects a new verifier command.
- `openspec/changes/habitat-classify-generator-repair/**`,
  `openspec/changes/habitat-grit-proof-repair/**`, and later Grit pattern
  packets where they cite taxonomy as current proof rather than project-plane
  authority bounded by this repair.

## Review Lanes

- Product/outcome: does this make Habitat more trustworthy for agents, or only
  restate H3?
- Taxonomy/architecture: are every tag, constraint, and dual-tag rule backed
  by current authority?
- Nx/evidence: does the proof use resolved Nx state and official Nx limits?
- Command reliability: are normal Nx command behavior and whole-command exit
  status treated honestly?
- Owner-layer boundaries: are Nx, Grit, file-layer, Biome, tests, and Habitat
  separated correctly?
- Downstream records: are stale H3 and dependent records repaired or watched?
