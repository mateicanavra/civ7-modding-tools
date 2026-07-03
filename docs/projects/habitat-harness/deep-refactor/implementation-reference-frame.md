# Deep Habitat Toolkit Implementation Reference Frame

Status: normative implementation frame for the directly responsible implementation agent.

Created: 2026-06-18.

Branch/worktree used for preparation:
`agent-DRA-deep-habitat-prep-frame` at
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-agent-DRA-deep-habitat-prep-frame`,
created from `main` at `fbf77fe9e`.

This document is the durable frame I will use after compaction while implementing
the Deep Habitat Toolkit refactor domino by domino. It is not a remediation
frame, reconciliation frame, or documentation cleanup frame. It translates the
prepared corpus into product implementation terms: source behavior, command/API
contracts, domain responsibilities, test obligations, public/internal surfaces,
Graphite delivery, review loops, supervisor control, and packet-by-packet
closure.

## 1. Product Outcome

Habitat is a generic repo-local structural toolkit for agents and humans
maintaining a repository. Civ7 is the host repo, not the Habitat domain boundary.
The product outcome is a structural operating surface that reduces ambiguity
before, during, and after code changes:

- classify paths and diffs before editing;
- expose owners, scoped rules, targets, unavailable targets, and non-goals;
- run structural checks with truthful selector, diagnostic, baseline, and
  dependency behavior;
- verify handoffs without claiming CI, product, runtime, apply, OpenSpec, or
  Graphite readiness that was not actually proven;
- keep baselines explicit and shrink-only;
- acquire and project Grit/native diagnostics without confusing diagnostics
  with governance or write safety;
- preserve the human pattern-authoring direction: examples/counterexamples,
  normative sources, proving sources, scan roots, fixture strategy,
  false-positive model, check/apply/generator disposition, refusal, baseline
  contract, hook-scope decision, apply safety, receipt class, and non-goals
  before any pattern becomes agent-usable;
- admit, refuse, retire, and recover structural patterns through governed
  Patterns;
- apply only approved structural rewrites through a safe transaction envelope;
- guard generated, protected, host-owned, and forbidden surfaces;
- provide local hook feedback without turning hooks into receipt authority;
- scaffold supported generic shapes and refuse unsupported, host-specific, or
  future authoring shapes before writes.

The target is not a cleaner TypeScript layout by itself. The target is a repo
operating contract whose commands, JSON, human output, exported APIs, rule
metadata, transactions, refusals, hooks, generators, and handoff records match
real maintenance scenarios and make unsupported states harder to represent.

## 2. Authority And Operating Rules

For implementation, authority is resolved in this order:

1. Current user direction and root `AGENTS.md`.
2. `docs/projects/habitat-harness/FRAME.md`,
   `docs/projects/habitat-harness/dra-takeover-frame.md`, recovery claim
   ledgers, and adversarial recovery records where they define product,
   receipt-discipline, or control authority.
3. `docs/projects/habitat-harness/domain-refactor-frame.md`.
4. `docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`.
5. `docs/projects/habitat-harness/openspec-remediation/packet-index.md` and
   the accepted OpenSpec packets under `openspec/changes/deep-habitat-*` plus
   `openspec/changes/deep-habitat-host-policy-boundary-gate`.
6. The Phase 2 preparation corpus:
   `scenario-corpus.md`, `code-topology-map.md`,
   `domain-responsibility-map.md`, `domino-candidate-ledger.md`,
   review ledgers, validation results, source authority, and phase packets.
7. Current Habitat source, tests, scripts, manifests, generated records, and
   fresh command behavior as present-behavior evidence.
8. Scratch notes, stale worktree records, and historical packet task fixtures as
   provenance only.

Accepted OpenSpec packets are bounded implementation-control records downstream
of the Habitat product frame, takeover frame, recovery claim ledger, and
accepted domain design. They define the bounded source work for each packet only
when they do not soften higher product/domain/receipt authority. If an OpenSpec
packet, packet index row, task file, phase record, or current frame conflicts
with current user direction, `AGENTS.md`, `FRAME.md`, the DRA takeover frame,
the recovery claim ledger, the domain design packet, or fresh command/source
evidence, pause dependent implementation and repair the authority record before
proceeding.

Older Phase 2 packets and scratch/review files remain provenance unless they
state product/receipt authority accepted by the current control set. Historical
words such as "remediation", "recovery", "takeover", or "repair chain" are not
my operating frame by themselves. I translate them into implementation
workstreams, preconditions, closure evidence, control gates, and authority
corrections.

Hard constraints:

- Start from `main`; do not use stale feature branches as implementation base.
- All `apply_patch` file headers must use absolute paths.
- Keep one linear Graphite stack only. Multiple worktrees and parallel agents
  are allowed only when every branch weaves back into that one stack; no hidden
  side stacks.
- Before and after any Graphite stack operation, use broad stack visibility such
  as `gt log` and `gt status`, not only current-stack commands.
- Run one domino at a time unless the accepted packet sequence explicitly
  permits parallel work with disjoint write sets and no shared public contract.
- Do not redesign the domain or collapse the packet suite into a hygiene pass.
- Habitat remains generic; host-specific facts must cross G-HOST, not become
  generic Habitat constants.
- Public command/API/export/generator/hook/documented surfaces must cite D0
  compatibility rows before source changes.
- D1 output-family and non-goal handling is required wherever public command
  records, receipts, diagnostics, traces, transactions, or refusals are touched.
- D0 public-surface compatibility comes first. The D0 matrix is absent on
  current `main`, so D1/D2 source work must not begin until concrete D0 rows
  exist for touched public/durable surfaces. Accepted packet status is
  design/spec authority, not source readiness.
- Accepted P1/P2 findings block dependent implementation and packet closure
  until repaired, source-rejected with cited evidence, invalidated by later
  evidence, or explicitly moved outside the closure claim with owner and
  trigger. P1/P2 findings about authority conflict, product approval, owner
  boundary, shortcut language, source blockers, verification sufficiency,
  G-HOST/D15 gates, or downstream realignment are not locally waivable by the
  implementation DRA.
- Generated artifacts, lockfiles, `dist/**`, `mod/**`, `.civ7/outputs/**`, and
  baseline JSON are not hand-edit targets. Baseline files are written only
  through accepted baseline or rule-introduction flows.
- D15 remains dormant by default. A consuming packet may only record
  `trigger-requested` after the full D15 trigger request contract is satisfied.
  No D15 source work or shared command-observation substrate is authorized until
  a separate accepted OpenSpec owner packet moves the bounded command family to
  `trigger-accepted`, names the write/protected set, resolves D0/D1
  public-surface handling, and serializes any multi-consumer substrate work into
  one owner packet.

Before any packet closure, check for live control artifacts:
`NOTE-TO-DRA*.md`, `NEW.md`, `UPDATED.md`, watcher TODOs, conflict markers,
active correction ledgers, and unresolved accepted P1/P2 findings. A
non-Habitat `NOTE-TO-DRA.md` currently exists under
`openspec/changes/mapgen-studio-event-hub/`; it is not controlling for this
work unless a later Habitat packet touches that change.

## 3. Target Domain Model

Domain boundaries follow scenario responsibility, language, receipt class,
consumer, and authority, not current file layout. Every invariant needs one
owner.

| Domain | Single Authority | Owns | Consumes | Does Not Own |
| --- | --- | --- | --- | --- |
| Public Surface Compatibility | D0 | Current surface inventory, row completeness, compatibility state, `surface_id` stability, citation mechanics, current-behavior samples, and validation gates. | Current source, command output, package metadata, root scripts, docs examples, generated/derived surfaces. | Target redesign of command/API behavior. |
| Command/API Contract | D0 plus packet-specific command owners after D0 rows exist | CLI verbs, flags, JSON schemas, human renderer families, stdout/stderr/file-output contracts, exit codes, root scripts, package exports, generator/hook public surfaces, and D0 citations. | D0 compatibility rows and D1 output-family records. | Receipt meaning, rule metadata, graph truth, baseline decisions, host policy, or mutation safety. |
| Receipt Contract | D1 | Receipt/record/output-family vocabulary, `ClaimId`/`NonClaimId`, bounded streams, post-state, refusal links, legacy receipt-shaped compatibility, and forbidden substitutions. | D0 surface rows and owner-published command facts. | Command execution, check pass/fail decisions, graph truth, apply write safety, or runtime product claims outside named receipt classes. |
| Rule Registry Metadata | D2 | Versioned rule metadata and consumer-specific projections. | Current `rules.json`, Patterns sources, D0/D1 contract decisions. | Consumer interpretation of whole registry rows or prose fields. |
| Workspace Graph Integration | D3 | Nx project/target/dependency facts, graph refusals, inferred Habitat target declarations, graph read behavior, alias and aggregate truth. | D2 graph facts and Nx workspace metadata. | Check outcome, verify receipt, or command compatibility. |
| Orientation And Routing | D4 | `habitat classify` path/diff states, owner/rule/target guidance, refusals, recovery, and non-goals. | D2 routing facts and D3 graph projections. | Graph truth, rule metadata ownership, or verification receipt. |
| Baseline Authority | D5 | Explicit empty/debt/external exception states, shrink-only guard, introduction manifest decisions, and baseline authority projections. | D2 baseline facts and current baselines. | Diagnostic acquisition, check execution, or pattern admission. |
| Diagnostic Pattern Catalog | D6 | Grit/native diagnostic capability identity, scan-root decisions, native command observations, adapter outcomes, diagnostic projections, injected probes, and diagnostic non-goals. | D2 Grit facts, D1 records, native tool outputs. | Pattern governance, baseline authority, final check outcome, or apply admission. |
| Structural Enforcement | D7 | `habitat check` request normalization, selector outcome, rule execution disposition, check outcome, report construction, rendering, exit decision, and D11/D12 projections. | Live D2, D3, D5, D6, and D10 projections. | Rule metadata, graph truth, baseline decisions, diagnostics, protected-zone decisions, hook policy, or verify receipt assembly. |
| Patterns | D8 | Patterns lifecycle/admission/refusal/retirement and projections for diagnostics, hook runtime, apply, scaffolding, and recovery. | Live D2 governance facts, D5 baseline projections, D6 diagnostic projections. | Diagnostic execution, transaction sequencing, or generated/protected path safety. |
| Pattern Apply | D9 | Approved structural rewrite transactions: dry-run, isolated copy, candidate write-set approval, live write, formatter/gate handoff, rollback, recovery, and transaction non-goals. | D8 apply admission, D10 mutation decisions for every candidate write path, G-HOST projections when host policy is relevant, D6 diagnostics. | Pattern admission, generic path policy, host declarations, formatter authority, CI/product receipt. |
| Protected Zones | D10 | Generic mutation/protection decisions after consuming D2 and HostSurfaceProjection, plus D7/D9/D11 projections. | D2 zone facts and G-HOST host-surface projections. | Host declarations, host owners, host path lists, host recovery instructions, transaction sequencing, or authoring readiness. |
| Host Policy Boundary | G-HOST | Host declarations, host owners, host recovery, host apply/project/authoring projections, declaration failures, and host policy refusals. | D0/D1 public-surface handling and host-authored declaration sources. | Generic mutation decisions, transaction sequencing, rule metadata, baseline authority, or authoring implementation. |
| Hook Runtime | D11 | Hook sequencing, staged-file workflow, resource-state local handling, formatter restage policy, pre-push affected invocation, local trace output, and local-only non-goals. | D3, D6, D7, D8, D9, D10, and D1 projections. | CI, review, Graphite, product receipt, check ownership, transaction authority, or protected-zone decisions. |
| Verify Handoff | D12 | Verify handoff receipt assembly, affected target run/skip/failure records, bounded streams, post-state, and handoff non-goals. | D1, D3, D7, and conditional D11 projections. | Root `bun run verify`, CI, review approval, or product acceptance. |
| Scaffolding | D13 | Supported uniform project creation, Patterns candidate creation, registered promotion handoff/refusal, unsupported-kind refusal, host-policy refusal, and no-write recovery. | D0, D2, D8, G-HOST, D10 where touched, and D14 fence facts. | Pattern admission, host policy declaration, authoring topology implementation, or current-tree receipt. |
| Authoring Topology Fence | D14 | Current refusal boundary for MapGen authoring topology and future authoring acceptance criteria. | D0, D4, D12, D13, and G-HOST authoring projections. | Authoring generator/source topology implementation. |
| Execution Provenance Trigger | D15 | Trigger protocol for future shared command-observation substrate work when local DTOs cannot model a concrete contradiction. | Trigger request artifacts from consuming packets. | Any source implementation unless a separate accepted owner packet authorizes `trigger-accepted` work. |

Projection ownership must be explicit before a packet changes public or durable
records. Each packet that touches DTOs/output families must maintain a local
projection ownership matrix with: DTO/output family, owning domain, producer,
allowed consumers, forbidden consumers, source parser/schema, D0 surface rows,
D1 output family, allowed `ClaimId`s, and `NonClaimId`s. Consumers may depend
only on owner-published projections, never whole records from another domain.

Current code is evidence, not target authority. Important current surfaces:
`tools/habitat/src/commands/*`, `src/index.ts`, `src/lib/command-engine.ts`,
`src/lib/baseline.ts`, `src/lib/grit.ts`, `src/lib/grit-apply.ts`,
`src/lib/generated-zones.ts`, `src/lib/hooks.ts`, `src/lib/nx-projects.ts`,
`src/plugin.js`, `src/rules/rules.json`, Patterns modules,
generators, `.grit/patterns/habitat/**`, baselines, root package scripts,
Nx/Biome/Grit/Husky configuration, and focused tests under
`tools/habitat/test/**`.

Known current execution precondition: the prep worktree did not have dependency
install state when source topology was inspected. Commands that depend on local
packages, Nx, or Effect must be rerun after `bun install` in the active
implementation worktree before they are used as receipt.

## 4. Packet Sequence And Product Closure

Implementation proceeds in packet-index order. Each packet starts with fresh
grounding, dependency/build state, D0/D1 compatibility preconditions where
applicable, source/tests/docs inspection, and current watcher/control artifact
checks. Each packet closes only after implementation, tests, review, repair,
downstream realignment, explicit product approval at the packet boundary,
Graphite hygiene, and clean worktree.

Before executing any packet task list, reconcile packet-local operational
fixtures. Absolute worktree paths, branch names, `$ACTIVE_*` values, and command
samples from prior remediation packets are provenance unless they match the
active implementation worktree and current source. If task files name a stale
path, branch, generated output, or dependency state, repair the task/phase
record before source, matrix, or command work.

| Packet | Product Implementation Obligation | Closure Standard |
| --- | --- | --- |
| D0 `deep-habitat-d0-command-surface-inventory` | Build the public surface compatibility matrix covering CLI, per-command stdout/stderr/file-output/exit-code/help/example/JSON-schema/human-renderer/parser-stability rows, every exported symbol from `$HABITAT_TOOL/src/index.ts`, package subpath exports, root scripts, Nx inferred targets, generators, migrations, hooks, docs examples, and generated/derived surfaces. No source behavior change. | Every surface has deterministic `surface_id`, plane, type/value kind where relevant, import path or command path, current consumer evidence, contract state, compatibility handling (`preserve`, `version`, `deprecate`, `internalize`, `document-only`, `generated-only`), target owner, relationship links, validation gate, and non-goals. Later packets may not add, remove, rename, narrow, or reinterpret public surfaces unless they cite rows. JSON output is machine-only with no human log interleaving; human output is non-parseable unless a row explicitly declares it stable. |
| D1 `deep-habitat-d1-receipt-contract-boundary` | Separate bounded command records from legacy receipt/evidence-shaped compatibility surfaces. Define check report, verify receipt, hook trace/hook runtime, apply transaction, adapter command artifact, refusal, handoff link, canonical output families, `ClaimId`, and `NonClaimId`. | Contradictory records are unrepresentable or rejected; public output family changes cite D0; each output family maps allowed claim ids, observed boundary, producer command, and forbidden substitutions. Public target names use `record`, `receipt`, `trace`, `decision`, or `result`; `Receipt` remains only as a D0 compatibility alias with explicit deprecation/retention handling. No generic receipt framework or broad artifact substrate is introduced. |
| D2 `deep-habitat-d2-rule-registry-metadata-contract` | Replace optional/prose rule rows with a versioned registry contract and typed consumer projections for selection, routing, graph, baseline, Grit, governance, generated zone, and hook runtime eligibility. | Consumers receive named projections, not whole registry rows; malformed metadata fails through D1-aligned output families; D3-D8/D10/D13 can consume stable facets. |
| D3 `deep-habitat-d3-workspace-graph-boundary` | Make Workspace Graph Integration the sole owner of Nx project, target, dependency, alias, aggregate, and graph-refusal truth. | Alias false-greens are impossible, especially `habitat:rule:biome-ci`; graph errors and unresolved dependencies cannot become normal pass states; classify/verify/check consumers receive graph projections. |
| D4 `deep-habitat-d4-orientation-routing` | Implement command-facing `ClassifyResult` states for path and diff orientation using D2 routing facts and D3 graph facts. | Project path, workspace path, diff, malformed/pathless diff, unresolved owner, and graph refusal are distinct; unsupported or unresolved states include refusal, recovery, and non-goals. |
| D5 `deep-habitat-d5-baseline-authority` | Make Baseline Authority the single owner of explicit debt state, shrink-only integrity, external exception projection, introduction manifests, and baseline projection/refusal results. | Existing-rule growth is refused; introduced-rule baseline seeding requires manifest authority; D7/D8 consume baseline projections rather than deciding debt locally. |
| D6 `deep-habitat-d6-diagnostic-pattern-catalog` | Implement diagnostic catalog entries, scan-root decisions, bounded native Grit/native command observations, adapter failure states, diagnostic projection, cache/freshness observations, and injected probe outcomes. | No fallback from missing pattern identity to rule id; no raw `HarnessRule`/`GritReport` leakage; adapter/projection failures cannot become pass; D8/D9/D11 consume bounded projections only. |
| D7 `deep-habitat-d7-structural-enforcement-pipeline` | Assemble `habitat check` from selector, rule execution, diagnostics, baseline, graph, and protected-zone inputs into one final check outcome/report/render/exit decision. | Selector and dependency refusals cannot become executed-rule passes; advisory and enforced lanes are distinct; covered debt remains visible; public report `ok` is derived, not set independently. |
| D8 `deep-habitat-d8-pattern-governance` | Implement Patterns lifecycle and admission states: candidate draft, under review, invalid candidate, diagnostic admitted, local-feedback admitted, apply admitted, refused, retired. | File presence, Grit frontmatter, generator options, `rules.json`, baseline file, or hook field cannot imply admission. Diagnostic admission and apply admission are separate. |
| G-HOST `deep-habitat-host-policy-boundary-gate` | Introduce host policy declarations and projections for host-owned generated/protected/external surfaces, apply gates, project support/refusal, authoring relation, recovery, and declaration failure states. | Generic Habitat no longer embeds Civ7/MapGen path or public-ops truth. D9/D10/D13/D14 consume projections; missing, malformed, unavailable, conflicting, or unsupported host policy does not pass silently. |
| D9 `deep-habitat-d9-pattern-apply` | Implement Pattern Apply around D8-admitted apply: dry-run intent, live-write planning, approved write set, path approval, isolated copy, live write, formatter/gate handoff, rollback, recovery, non-goals. | Live writes require D8 apply admission and D10 protected-zone decisions for every candidate write path before live writes, plus G-HOST projections where host policy is relevant. No live apply transaction may proceed until D10 and G-HOST can return allow/refuse decisions for all approved paths. No `ok` plus nullable receipt bag as target model; formatter/gate success is not product/runtime/current-tree receipt. |
| D10 `deep-habitat-d10-protected-zones` | Implement generic protected/generated/host-owned/forbidden mutation decisions, declarations, recovery instructions, drift inputs, and D7/D9/D11 projections by consuming D2 and G-HOST. | Protected/generated mutations cannot warn-only or silently pass; generated drift is not mutation authorization; D7/D9/D11 do not reimplement path policy. |
| D11 `deep-habitat-d11-local-feedback` | Implement hook-hook runtime sequencing, staged-file policy, resource decision, formatter restage, partial-staging refusal, staged diagnostics/checks, pre-push affected invocation, local trace, and recovery rendering. | Hook output consumes upstream projections and preserves local-only non-goals. Formatter restage touches only formatter-touched files. Hook success is never CI/review/product/apply/Graphite/OpenSpec receipt. |
| D12 `deep-habitat-d12-verify-handoff-receipt` | Implement `habitat verify` as Verify Handoff assembler using D7 check summary, D3 target plan, affected Nx execution/skip/failure, bounded streams, post-state, and canonical non-goals. | Failed/refused check does not run affected targets as pass; missing graph/check projection is not success; `habitat verify` remains distinct from root `bun run verify` and from CI/review approval. |
| D13 `deep-habitat-d13-scaffolding-refusal-contracts` | Implement supported uniform project creation, Patterns candidate drafts, registered promotion handoff/refusal through D8, unsupported-kind refusal, host-policy refusal, and authoring-topology refusal envelope. | Unsupported project/host/authoring requests write nothing and return typed recovery. Candidate output is not active rule/baseline/hook/apply/current-tree receipt. |
| D14 `deep-habitat-d14-authoring-topology-fence` | Implement or preserve the authoring fence facts that D13 uses to refuse MapGen authoring topology requests and publish future acceptance criteria. | No current Habitat signal can imply MapGen authoring support. D14 adds no authoring generator/source topology implementation in this suite. |
| D15 `deep-habitat-d15-execution-provenance-trigger` | Keep the trigger protocol dormant unless a consuming packet records a complete `trigger-requested` artifact proving local DTO insufficiency. | No D15 source work or shared command-observation substrate is implemented unless a separate accepted owner packet moves the bounded command family to `trigger-accepted` with command family, contradiction, attempted local shape, field owners, D0/D1 handling, write/protected set, validation, serialization plan, and rollback plan. |

The dependency bullets below are scheduling shorthand only. Source
implementation prerequisites are controlled by the packet-index Requires/Status
cells and the active packet proposal/design/tasks/spec files. If the shorthand
omits D0/D1 compatibility rows, live upstream projections, conditional
G-HOST/D10/D11/D14 blockers, review-ledger closure, source-blocker language, or
packet-local stop conditions, the packet-local blocker wins. No implementation
may begin from the shorthand alone.

The accepted dependency shorthand is:

- D0 -> D1 -> D2 are foundational.
- D3 -> D4 is the graph/orientation lane.
- D5 is the baseline lane.
- D6 is the diagnostic lane.
- G-HOST is a source-blocking owner, not a side note. D9, D10, D13, and D14 may
  not implement host-owned/generated/protected/external behavior from generic
  Habitat literals or drift observations. They must consume accepted/live G-HOST
  projections where their packets require host policy. Drift-observation rows
  under `mod/**` are not D10 guard/protected/generated facts until a later
  accepted declaration row upgrades them.
- D10 cannot close until D2 and G-HOST projections are live where required.
- D7 waits for live D2 registry projections, live D3 graph projections, live D5
  baseline projections, live D6 diagnostic projections, and live D10
  protected-zone projections.
- D8 waits for live D2 governance/admission registry projections plus D5 and
  D6.
- D9 waits for D8, D6, D10, and G-HOST where host gates are touched.
- D11 waits for D7, D9, and D10.
- D12 waits for D1, D3, and D7.
- D13 waits for D0, D2, D8, and G-HOST.
- D14 waits for D4, D12, and D13.
- Accepted design/specification is not sufficient for source consumers unless
  the packet explicitly allows compatibility stubs and names their D0/D1 rows.
- D15 activates only through a complete `trigger-requested` artifact followed by
  a separate accepted owner packet for `trigger-accepted` source work.

## 5. Systematic Workstream Execution

Every packet is a real workstream, not a code sprint. The owner loop is:

1. Frame objective, non-goals, hard core, falsifier, write set, protected paths,
   review lanes, and stop conditions.
2. Isolate repo state: branch, worktree, Graphite stack, dirty files, dependency
   install state, generated/read-only surfaces, and active control artifacts.
3. Diagnose current behavior from source, tests, command output, OpenSpec
   packet, and ledgers before designing source edits.
4. Extract packet-specific corpus: public surfaces, DTOs, registry facets, graph
   facts, baselines, diagnostic rows, host declarations, transaction states,
   hook surfaces, generator requests, or authoring refusals.
5. Predeclare expected behavior, receipt classes, and non-goals before using
   observed results to justify closure.
6. Translate into the owning domain boundary and TypeScript state-space change.
7. Implement within the packet write set only.
8. Verify focused behavior first; broaden only when focused receipt is coherent.
9. Run review lanes, disposition findings, repair accepted P1/P2 findings, and
   rerun affected lanes.
10. Realign downstream docs, OpenSpec tasks, tests, ledgers, command examples,
    compatibility matrix rows, and future packet assumptions.
11. Close with Graphite commit, clean worktree, receipt labels, residual
    non-goals, and explicit product approval before advancing.

Global stop conditions:

- missing concrete D0 rows or D1 output-family handling for a touched
  public/durable surface;
- live upstream projection absent where the packet requires it;
- accepted P1/P2 finding unresolved;
- G-HOST declaration missing/malformed where host policy is consumed;
- D15 state is only `trigger-requested` or prose-justified;
- implementation diff leaves the packet write set or touches
  protected/generated paths outside the active packet authority;
- receipt claim depends on cached output, stale generated output, hook success,
  OpenSpec validation, or native fixture receipt as a substitute receipt class;
- product approval or supervisor-blocking correction is absent;
- Graphite/worktree state would force unrelated conflict resolution or create a
  hidden side stack.

Minimum review lanes for every implementation packet:

- product/domain outcome;
- owner-boundary and generic Habitat scope;
- OpenSpec/spec readiness;
- source-blocker audit;
- D0/D1 compatibility audit;
- TypeScript state-space and public API compatibility;
- validation/falsifier adequacy;
- command/DTO/human-output contract;
- receipt-class and non-goal adequacy;
- information design and human-operability;
- source topology/write-set/protected-path hygiene;
- cross-domino sequencing;
- downstream realignment and stale-record audit;
- Graphite/worktree closure.

Add G-HOST and D15 review lanes whenever a packet touches host policy,
protected/generated/host-owned paths, apply gates, command observations, or
shared substrate questions.

I may use agents for focused investigation, implementation slices with disjoint
write sets, and review lanes. Delegation does not transfer ownership. I remain
accountable for synthesis, receipt claims, review disposition, repo state, and
packet closure.

## 6. TypeScript Implementation Discipline

The TypeScript refactor must reduce reachable state. Valid changes make invalid
combinations unrepresentable, parse runtime boundaries honestly, or hide
internal implementation behind explicit public surfaces.

Required discipline:

- Preserve public behavior/types unless D0/D1 and the active packet explicitly
  authorize versioning, facade, deprecation, refusal, or generated/document-only
  handling.
- Packet implementation must replace optional bags on public DTOs with
  discriminated state unions. Optional fields are allowed only for
  backward-compatible projection rows listed in D0, and each optional field must
  name the discriminant/state that makes absence meaningful. New target DTOs use
  `kind`/`status` unions with required fields per variant.
- Every command/native/tool/file boundary must parse `unknown` through an owned
  parser/schema before constructing public DTOs. `JSON.parse`, native stdout
  parsing, Grit output parsing, Nx graph reads, git status parsing, and baseline
  JSON reads must return closed success/refusal unions. `as TargetType`,
  partial validators, and optional traversal over alleged DTOs are compatibility
  debt unless isolated behind a D0/D1 row.
- Keep projections narrow. Consumers receive owner-published facts, not whole
  registry rows, manifests, Grit output, baseline internals, graph objects, or
  transaction records.
- Use proportional type complexity. A type-state model must name the product
  state it prevents and the consumer it simplifies.
- Keep legacy receipt/evidence-shaped names as D0/D1 compatibility facts unless a
  packet earns them for a concrete scenario.
- Do not add shims, fallbacks, dual paths, silent skips, or compatibility lanes
  unless explicitly authorized by the active packet and recorded in D0/D1.

Current state-space hotspots to treat carefully:

- `tools/habitat/src/index.ts` exports many internals and compatibility
  DTOs.
- `command-engine.ts` mixes check, classify, verify, graph, fix, baseline,
  selector, report, and receipt helpers.
- `rules.json` mixes prose scope, tool ownership, graph target hints, Grit
  identity, baseline relation, hook scope, governance, and generated-zone facts.
- `plugin.js` and `nx-projects.ts` share graph knowledge.
- `grit.ts`, `grit-failures.ts`, and `grit-injected-probe.ts` need diagnostic
  boundary discipline.
- `grit-apply.ts` currently mixes generic transaction sequencing with
  pattern-specific and host-specific validation.
- `generated-zones.ts` carries host-specific truth inside generic Habitat.
- `hooks.ts` orchestrates multiple receipt owners but owns only hook runtime.

## 7. Verification And Receipt Language

Use exact receipt labels and state non-goals:

- Spec validation.
- Unit behavior.
- Native tool behavior.
- Habitat wrapper behavior.
- Injected violation receipt.
- Clean sample receipt.
- Baseline receipt.
- Apply safety receipt.
- Runtime/product receipt.
- Record truth receipt.
- Graphite/worktree state.

No receipt class substitutes for another. OpenSpec validation does not prove
command behavior. Native Grit samples do not prove Habitat wrapper scans. Hook
success does not prove CI. A local command sample proves only the named path and
receipt class. It becomes runtime/product receipt only when it is an end-to-end
Habitat command path that protects the stated product outcome, records current
tree/worktree state, expected and actual status, post-state, and explicit
non-goals. Generated manifests do not prove source truth. Cached Nx output is
not fresh receipt unless cache stance is explicitly part of the claim.

Packet closure summaries must name commands run, exact scope, expected status,
actual status, receipt class, skipped gates, non-goals, dirty/worktree state, and
downstream records updated or intentionally unchanged.

## 8. Supervisor Relationship

The supervisor is product/domain steward, not implementer. Their guidance is a
control input when it flags product thinning, domain drift, over-engineering,
under-engineering, skipped packet authority, ignored control notes, receipt-class
substitution, stale records, or premature closure.

My responsibilities:

- Continue when the path is clear; do not wait for supervision to do ordinary
  implementation work.
- Ask for product approval at packet boundaries before advancing.
- Stop and resolve supervisor-blocking corrections before proceeding.
- Repair the material issue, not just local wording.
- Escalate only real authority conflicts, irreversible sequence changes,
  destructive repo operations, or public contract decisions not resolved by the
  packet suite.

Product approval means explicit supervisor/user acceptance recorded in the
packet phase record or review-disposition ledger after implementation evidence,
review dispositions, downstream realignment, receipt labels, Graphite state, and
clean worktree state are available. Silence, green tests, OpenSpec validation,
local command success, or lack of new supervisor notes is not product approval.
No next packet may begin source implementation until this approval is recorded
or the supervisor explicitly scopes it outside the packet boundary. This does
not move implementation responsibility to the supervisor: I own the workstream,
closure evidence, repairs, and readiness case before asking.

## 9. Graphite And Repo Hygiene

Work uses Graphite stacked PRs, not ad hoc branch closure. Before and after
each packet:

- inspect branch, stack, worktree, dirty state, untracked files, and unpushed
  state;
- use isolated agent-prefixed worktrees when parallel work or branch locks make
  that safer;
- keep one linear Graphite stack only; do not split stacks or leave preparation
  branches/worktrees as hidden side stacks;
- before and after stack operations, use broad visibility such as `gt log` and
  `gt status`;
- use `gt sync --no-restack` in parallel contexts and stack-scoped restacks;
- commit reviewable layers through Graphite;
- do not leave the repo dirty unless the user explicitly directs it;
- never clean up unrelated user work destructively.

This preparation document was created in an isolated worktree because it is a
repo artifact. Before D0 opens, this preparation branch/worktree must be
integrated into the one linear implementation stack or closed cleanly so it does
not become a hidden side stack. The main checkout remained clean during
preparation.

## 10. Immediate Execution Entry

After this frame is committed and the active goal is attached, execution starts
with D0. D0's first implementation obligation is not TypeScript refactor work:
it is the public surface compatibility matrix at
`docs/projects/habitat-harness/public-surface-compatibility-matrix.md`.
That matrix is absent on current `main`; therefore D1/D2 source work must not
begin until concrete D0 rows exist for every touched public/durable surface.
Accepted packet status is design/spec authority, not source readiness.

D0 execution preconditions:

- active branch/worktree starts from current `main`;
- dependency install/build state is grounded in the active worktree;
- D0 OpenSpec files, source Phase 2 packet, review ledgers, and current source
  surfaces are reread from disk;
- current public surfaces are inventoried from source, not historical paths;
- command probes are rerun after dependencies are installed;
- D0 does not change Habitat source behavior;
- D0 stops for product approval after review/repair/verification closure.
