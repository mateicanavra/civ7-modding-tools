# Deep Habitat Toolkit Implementation Reference Frame

**Status:** active implementation reference frame
**Created:** 2026-06-18
**Owner:** directly responsible implementation agent
**Start branch:** `main`
**Primary packet suite:** `docs/projects/habitat-harness/phase2-workstream-packets/`
**Purpose:** compaction-safe normative frame for executing the prepared Deep Habitat Toolkit refactor domino by domino

## Operating Posture

I am the directly responsible implementation agent for the Deep Habitat Toolkit
refactor and consolidation. Prior planning is complete and merged to `main`.
My job is not to redesign the domain, compress the packet train into a cleanup,
or preserve current file layout because it is convenient. My job is faithful
implementation of the prepared packet suite, one domino at a time, through real
workstream execution, review, repair, Graphite closure, and product approval.

The current checkout is the implementation source of truth. Historical worktree
paths inside the Phase 2 corpus are provenance from planning. Use the files now
present under this repository root, starting from `main`, and rerun packet proof
commands in the active implementation branch before claiming behavior closure.

Habitat must remain a generic repo-local structural toolkit. Civ7 and MapGen
are the host repository and first high-value consumers, not the generic Habitat
domain. Host-specific generated zones, protected paths, and pattern gates must
enter through a host policy boundary rather than becoming hard-coded generic
truth.

## Source Authority

When sources conflict, use this order:

1. Current user instructions and supervisor corrections.
2. Root `AGENTS.md`, repo workflow docs, Graphite process, and closest subtree
   routers for touched files.
3. This implementation reference frame, the Phase 2 packet suite, and the
   packet-suite review disposition ledger.
4. `docs/projects/habitat-harness/domain-refactor-prep/` and
   `docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`.
5. Current Habitat docs under `tools/habitat-harness/docs/`.
6. Current source, tests, root scripts, Nx metadata, generated manifests, Grit
   patterns, baselines, and command behavior as present-behavior evidence.
7. Active OpenSpec records as downstream implementation control.
8. Archived ledgers, older project records, old branches, and chat summaries as
   discovery material only.

Current code can falsify a current-behavior claim. It does not, by itself,
define target domain authority.

## Product Outcome

The outcome is a stronger Habitat Toolkit that helps agents and humans classify,
check, verify, guard, scaffold, apply, refuse, and recover through a robust
repo-local structural harness. Habitat should reduce ambiguity before, during,
and after repository changes by making ownership, applicable rules, proof
classes, safe actions, refusal reasons, and non-claims explicit.

Supported product responsibilities include:

- classify a path or diff into owning project, tags, scoped rules, target facts,
  unavailable targets, unresolved facts, and non-claims;
- run structural checks with normalized diagnostics, selector failures,
  enforced/advisory separation, baselines, and current-tree proof boundaries;
- verify handoffs by assembling check proof, affected Nx proof when allowed,
  bounded streams, post-state, and explicit non-claims;
- provide local Git hook feedback without claiming CI, review, runtime, or
  product proof;
- run Grit diagnostics as diagnostics, not automatic repair or Pattern
  Authority admission;
- apply only approved structural transformations with dry-run inventory,
  approved-path proof, rollback, formatter handoff, and gate proof;
- maintain explicit baseline debt and shrink-only ratchets;
- scaffold only supported generic structures and candidate pattern artifacts;
- refuse unsupported shapes, unsafe rewrites, proof substitutions, and future
  Authoring Topology requests with stable, useful product reasons.

Unsupported product responsibilities remain unsupported unless a later accepted
packet explicitly changes them. In particular, Habitat does not yet generate
MapGen recipes, domains, operations, stages, steps, schemas, registries, Studio
artifacts, or runtime/product Civ7 behavior.

## Target Domain Model

The target model is responsibility-first, not file-first. Every domain has one
owner and explicit adjacent consumers.

| Domain | Responsibility |
| --- | --- |
| Command/API Contract | CLI verbs, flags, JSON DTOs, package exports, root scripts, Nx target surfaces, generators, and hooks. |
| Proof Contract | Proof labels, non-claims, bounded streams, post-state, handoff proof DTOs, and proof substitution refusal. |
| Rule Registry Metadata | Typed metadata facets for selectors, routing, graph targets, baselines, Grit, Pattern Governance, hooks, and generated zones. |
| Workspace Graph Integration | Nx project and target truth, inferred Habitat targets, unavailable target facts, and graph error states. |
| Orientation and Routing | `habitat classify` path/diff states, owners, scoped rules, target facts, unresolved facts, refusals, and non-claims. |
| Baseline Authority | Explicit empty/debt/external/malformed/missing/orphan baseline states and shrink-only introduction guards. |
| Diagnostic Pattern Catalog | Grit diagnostic acquisition, scan-root validation, adapter failures, projected diagnostics, and injected proof. |
| Structural Enforcement | Rule selection, execution, normalized diagnostics, baseline consumption, `CheckReport` construction, staged checks, and rendering. |
| Pattern Governance | Candidate and registered pattern lifecycle, manifests, fixtures, baselines, hook scope, apply-safety decisions, and refusals. |
| Host Policy Boundary | Host declarations and refusals for generated zones, protected paths, host-owned scaffold shapes, and pattern-specific gates. |
| Generated/Protected Zone Authority | Generic zone declarations, staged mutation guard, drift check surface, remediation hints, and host-policy missing refusal. |
| Transformation Transaction | Approved structural write transactions, dry-run inventory, approved paths, isolated-copy proof, rollback, formatter handoff, and gates. |
| Local Feedback | Hook orchestration and local-only feedback around staged paths, resource state, Biome, Grit, generated-zone guards, and pre-push bases. |
| Scaffolding | Supported generic project scaffolds, candidate pattern writing, unsupported-kind refusal, and handoff to Pattern Governance. |
| Authoring Topology Fence | Explicit future boundary and refusal/future trigger for MapGen authoring topology. |
| Execution Provenance Trigger | Packet-local decision protocol for typed command provenance only when local DTOs cannot represent the needed proof honestly. |

Key relationships:

- Structural Enforcement consumes Rule Registry Metadata, Baseline Authority,
  Diagnostic Pattern Catalog, Generated/Protected Zone Authority, and Proof
  Contract. It does not own those authorities.
- Pattern Governance consumes Grit diagnostic proof and baseline contracts but
  owns pattern lifecycle. It does not make diagnostics apply-safe.
- Transformation Transaction consumes Pattern Governance, Diagnostic Pattern
  Catalog, Host Policy, and Generated/Protected Zone Authority. It does not
  admit patterns or prove product behavior.
- Local Feedback consumes published command contracts. It owns only local hook
  ergonomics and local-feedback non-claims.
- Scaffolding and Authoring Topology stay separate. Existing project/pattern
  generators do not imply MapGen authoring support.

## TypeScript Discipline

Each packet must reduce reachable TypeScript state or delete accidental
authority overlap. Cosmetic moves, broad facades, and framework migrations do
not count.

Required discipline:

- Stabilize public command/API/package surfaces before internal extraction.
- Treat exported types as public contracts until D0 classifies them otherwise.
- Separate command DTOs from internal domain models where that reduces coupling.
- Use discriminated states for real product states such as proof outcomes,
  graph target facts, classification variants, baseline states, Grit adapter
  failures, transaction states, resource states, and refusals.
- Pair type-level claims with runtime constructors, parsers, validators, or
  command behavior. Types without runtime backing are not proof.
- Keep type complexity proportional. Every ADT, brand, Result type, constructor,
  or option-object split must name the impossible product state it prevents, the
  consumer it simplifies, the runtime evidence behind it, and the simpler
  alternative rejected.
- Reject generic mega-frameworks such as a universal proof wrapper, whole-rule
  metadata object for every consumer, broad Effect migration, or generic
  "fix all Grit findings" apply path unless a packet proves it is the smallest
  state-space reduction.

## Domino Sequence

The repaired critical sequence is normative:

1. **D0 Scenario/Public Contract Inventory.** Classify every public and
   internal-facing surface before moving internals: commands, flags, JSON,
   package exports, root scripts, Nx targets, generators, hooks, and examples.
2. **D1 Proof Contract Boundary.** Define proof labels, non-claims, proof DTO
   boundaries, and impossible proof substitutions before downstream proof
   shapes change.
3. **D2 Rule Registry Metadata Contract.** Introduce minimal typed metadata
   facets and consumer projections for rule identity, selectors, routing, graph
   facts, baselines, Grit, generated zones, and governance.
4. **G-HOST Host Policy Boundary Gate.** May start after D0/D1 while D2
   proceeds. It defines host declaration/refusal contracts so generic Habitat
   does not embed Civ7/MapGen policy.
5. **D3 Workspace Graph Integration Boundary.** After D2, centralize Nx project
   and target truth and remove false-green target alias states.
6. **D4 Orientation and Routing.** After D2/D3, refactor classify into explicit
   path/diff/unresolved/error variants with target facts and non-claims.
7. **D5 Baseline Authority.** After D2, separate baseline state and
   shrink-only introduction guard from enforcement and governance.
8. **D6 Diagnostic Pattern Catalog.** After D1/D2, separate Grit diagnostics,
   scan roots, adapter failures, current-tree wrapper proof, and injected
   violation proof from governance and apply.
9. **D10 Generated/Protected Zone Authority.** After D1/D2/G-HOST, move
   generated/protected-zone authority behind declarations and staged guards.
10. **D7 Structural Enforcement Pipeline.** After D1/D2/D5/D6/D10, refactor
    check pipeline around selection, execution, diagnostics, baselines, report
    construction, and rendering.
11. **D8 Pattern Governance.** After D1/D2/D5/D6, separate candidate and
    registered lifecycle, baseline proof, hook-scope decisions, and apply
    approval.
12. **D9 Transformation Transaction.** After D1/D6/D8/D10, refactor guarded
    apply around dry-run, approved paths, rollback, formatter handoff, and
    pattern/host gates.
13. **D11 Local Feedback.** After D1/D6/D7/D9/D10, refactor hooks as local
    feedback consumers and preserve hook non-claims.
14. **D12 Proof/Handoff Verify Command.** After D1/D3/D7, refactor verify as a
    proof assembler that skips affected Nx proof when check fails and records
    explicit non-claims.
15. **D13 Scaffolding and Refusal Contracts.** After D0/D2/D8/G-HOST, separate
    supported generic scaffolding and candidate pattern writing from unsupported
    host/domain authoring refusals.
16. **D14 Authoring Topology Fence.** After D4/D12/D13, make future Authoring
    Topology an explicit refusal/future-trigger boundary. No authoring
    generator implementation enters this refactor through D14.
17. **D15 Execution Provenance Substrate Trigger.** Not a standalone migration
    by default. Evaluate only inside D6, D7, D9, or D11 when typed provenance is
    impossible to model locally without contradictory states.

Parallelism is allowed only where the suite permits it and where write sets,
public contracts, and owner boundaries are disjoint. Even then, I own synthesis
and integration.

## Per-Packet Execution Notes

Each packet must answer the same control questions during execution:

- What product scenario is served?
- Which domain responsibility is clarified?
- What current ambiguity or invalid state is removed?
- What public or internal contract is affected?
- What behavior, type surface, JSON surface, command invocation, or proof label
  must remain stable?
- What proof is required, what does it not prove, and what current proof risks
  are explicitly carried?
- What prerequisites block closure?
- What downstream packets or docs are unlocked?
- What review lanes are required?
- What supervisor/product approval point applies before moving on?

Packet-specific anchors:

| Packet | Primary state reduction | Closure cannot claim until |
| --- | --- | --- |
| D0 | Public/internal/export/command states are explicit. | Export matrix and command invocation matrix exist; no later surface is unclassified. |
| D1 | Proof DTOs cannot represent proof substitution or impossible check/affected states. | Proof labels and non-claims are reviewed and schema/command tests cover bad cases. |
| D2 | Consumers receive typed registry facets instead of parsing prose or whole-rule blobs. | Malformed metadata fails before execution; target aliases do not rely on colon parsing. |
| G-HOST | Host-specific policy becomes declared host data or refusal, not generic core truth. | Missing host policy refuses; D9/D10/D13 consumer matrix is explicit. |
| D3 | Target facts distinguish available, unavailable, alias, aggregate, and graph-error states. | False-green alias risk is fixed or non-claimed; plugin and classify share graph truth. |
| D4 | Classify output is an explicit scenario union. | Malformed/pathless diff, unresolved owner, and graph errors are distinct and tested. |
| D5 | Baseline authority is a closed state machine. | Baseline expansion cannot grow existing debt without introduction proof. |
| D6 | Grit diagnostics are not governance or apply state. | Native sample, wrapper, injected-probe, and adapter-failure proofs remain separate. |
| D10 | Generated/protected-zone guard consumes host declarations. | Staged mutation refusal includes owner, remediation, proof class, and non-claims. |
| D7 | Check pipeline consumes metadata, baseline, Grit, and zone contracts. | `CheckReport.ok` cannot contradict rule statuses; selector failures are distinct. |
| D8 | Pattern lifecycle is typed and explicit. | Candidate output cannot become registered, hook-scoped, or apply-safe by file presence. |
| D9 | Apply transaction state is explicit and narrow. | Unapproved writes, dirty trees, rollback failure, formatter failure, and host-gate failure are distinct. |
| D11 | Hooks are local-feedback pipelines. | Resource state cannot contradict allowed commit behavior; hook success is never CI proof. |
| D12 | Verify is a handoff proof assembler. | Affected proof cannot run after failed check without explicit contract; non-claims are visible. |
| D13 | Scaffolding requests and refusals are typed scenarios. | Unsupported kinds and Authoring Topology requests refuse before writes. |
| D14 | Authoring Topology is fenced as future work. | Future acceptance criteria and refusal path are concrete; no authoring implementation enters scope. |
| D15 | Provenance substrate exists only if locally justified. | A consuming packet proves the contradictory state, rejected local DTO, performance risk, and public impact. |

## Done Criteria

A packet is operationally done only when:

- it starts from the correct Graphite position and records branch, worktree,
  dirty state, protected paths, and write set;
- an OpenSpec change or project workstream artifact exists when public behavior
  or implementation contracts change;
- implementation stays inside the packet write set or the workstream record is
  updated before expanding scope;
- tests and commands named in the packet run from the current branch with proof
  labels, expected exit statuses, cache/freshness stance, and non-claims;
- accepted P1/P2 review findings are repaired, rejected with source evidence,
  invalidated by later evidence, or explicitly moved outside the closure claim;
- downstream docs, ledgers, examples, tests, generators, and future packet
  assumptions are realigned;
- generated artifacts, lockfiles, `.civ7/outputs/resources`, `dist/`, and
  `mod/` are not hand-edited;
- Graphite state is clean, committed as one logical layer, and not overclaimed
  as submitted/PR-ready unless actually submitted;
- the supervisor/product authority has approved packet closure before the next
  domino starts.

Product-wise, a packet is done when a future agent can use Habitat with less
guesswork in the scenario the packet serves, and the packet has not hidden
ambiguity by broadening types, moving files, or softening proof language.

## Team And Review Model

I own implementation, synthesis, proof claims, review disposition, Graphite
hygiene, and downstream realignment. Agents and reviewers may inspect, draft,
test, or challenge bounded work, but they do not own closure.

Use focused review lanes per packet risk:

- Product/domain review for scenario value, refusals, generic Habitat scope, and
  user-visible command ergonomics.
- Architecture/boundary review for owner placement, imports/exports, generated
  output hygiene, and host policy separation.
- TypeScript review for state-space reduction, type/runtime honesty, public
  surface stability, and overengineering risk.
- API/CLI review for JSON shape, command flags, root-script/direct-Oclif
  invocation, generator schema, hooks, and compatibility.
- Verification/proof review for exact commands, cache/freshness stance, proof
  labels, bad-case fixtures, and non-claims.
- Stale-record/downstream review for docs, OpenSpec records, review ledgers,
  Next Packets, and handoff usability.

Review loops are part of implementation, not optional theater. Findings without
disposition are unfinished work. Accepted P1/P2 findings block closure.

## Supervisor Integration

Supervisor guidance is product/domain control input. If the supervisor flags
domain drift, product thinning, overengineering, sequencing errors, ignored
control notes, or premature closure, stop the affected work and resolve the
substance before moving on.

Do not turn the supervisor into the implementer. Continue when the path is
clear, make ordinary implementation decisions from the packet suite and repo
conventions, and ask for product approval at packet boundaries. If supervision
is quiet, keep executing the current packet faithfully. If a correction arrives,
repair the material issue described, not just the local symptom.

## Hard Constraints And Stop Conditions

Global hard constraints:

- Start from `main`; do not reuse stale feature branches or old worktree state
  as implementation state.
- Do not redesign the domain.
- Do not collapse the packet suite into a minimal cleanup.
- Do not justify generic Habitat boundaries from Civ7/MapGen-only behavior.
- Do not implement future Authoring Topology during this refactor.
- Do not skip dependency/build grounding when execution begins.
- Do not skip review loops or downstream realignment.
- Do not leave dirty or unexplained repo state.
- Do not claim proof classes interchangeably.
- Do not advance to the next domino before current packet implementation,
  review, repair, Graphite hygiene, and product approval are complete.

Stop immediately if:

- live `NOTE-TO-DRA*.md`, `NEW.md`, `UPDATED.md`, watcher TODOs, conflict
  markers, open watcher corrections, or unresolved accepted P1/P2 findings
  affect the packet closure claim;
- D0 has not classified a public surface needed by the current packet;
- a packet proposes a broad framework migration or generic abstraction without
  proving the impossible state it removes;
- a public CLI, JSON, package export, Nx target, generator, or hook surface
  changes without compatibility/versioning/refusal proof;
- a packet makes hooks, generated-zone checks, OpenSpec validation, build/lint,
  or Graphite state stand in for runtime/product/CI proof;
- current-tree Habitat test/check risks are used as green proof rather than
  fixed, rejected with evidence, or explicitly non-claimed for the packet.

## Known Current Proof Risks To Carry

The Phase 2 validation records were planning evidence, not implementation
proof. During implementation, rerun packet-specific commands on the active
packet branch. Known risks that block relevant closure claims unless repaired
or explicitly non-claimed:

- Habitat leaf/full test target failures observed in the Phase 2 corpus.
- Nx daemon/project-graph failures and generated scratch project ENOENT risks.
- `habitat check --json` current-tree structural failures.
- `bun run habitat check -- --json` rejected by Oclif while direct `--json`
  was used elsewhere.
- `habitat:rule:biome-ci` false-green risk from colon target parsing.
- Ancestor Graphite branch `06-13-keep_things` reported `needs restack` in
  planning records; check current Graphite truth before any submit/PR claim.

These risks do not invalidate this frame. They constrain proof claims.

## First Execution Step After This Frame

After this document is committed and the active goal is attached, start D0 as
the first packet. D0 must open with repo isolation, dependency/build grounding,
public-surface inventory, and command/API compatibility matrix. No internal
extraction should occur before D0 classifies the relevant public and internal
surfaces.

The controlling active goal should be:

```text
Implement the Deep Habitat Toolkit refactor and consolidation domino by domino
from the prepared packet suite, preserving the generic repo-local Habitat
domain model while reducing TypeScript state space, clarifying command/API
contracts, preserving intended behavior unless a packet explicitly changes it,
and closing each packet through systematic workstream execution, agent review,
product approval, Graphite hygiene, and documented downstream realignment. Do
not advance to the next domino until the current packet is implemented,
reviewed, repaired, and approved.
```
