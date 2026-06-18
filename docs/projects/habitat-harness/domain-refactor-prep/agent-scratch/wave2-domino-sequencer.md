# Wave 2 Domino Sequencer Scratch

Status: read-only preparation scratch for the DRA owner. This is not a Phase 2 packet draft and does not authorize implementation.

## Evidence Surfaces Read

- Required frame and domain input: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-frame.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-mapping/domain-design-packet.md`.
- Current Habitat reference docs: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/README.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/docs/SCENARIOS.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/docs/IMPLEMENTED-SURFACE.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/docs/DOMAIN-MAPPING.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/docs/CAPABILITIES.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/docs/GAPS.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/docs/AUTHORING-NEXT.md`.
- Project control docs: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/FRAME.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/dra-takeover-frame.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/effect-orchestration-evaluation.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/recovery-claim-ledger.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/grit-pattern-corpus-ledger.md`.
- Root/package integration: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/AGENTS.md`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/package.json`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/nx.json`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/package.json`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/generators.json`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/migrations.json`.
- Current source/test surfaces: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/commands`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/rules`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/generators`; `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/test`.

## Sequencing Premise

The first refactor domino is not a file split. The first domino is making public scenario contracts stable enough that later TypeScript moves preserve behavior and reduce reachable states. Current code evidence shows `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/command-engine.ts` mixes rule selection, check reports, baseline expansion, staged Grit scope, fix dispatch, verify proof, graph export, classify, and command summary. That file is an evidence hotspot, not a domain boundary.

Valid dominoes below follow the domain packet contexts and supported scenarios. Invalid cleanup candidates are rejected at the end.

## Domino List

| ID | Domino | Owner | Consumer | Public/Internal Contract | Current State-Space Problem | Blocked By | Unblocks | Proof Class | Downstream Records |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D0 | Scenario/public contract inventory | DRA owner plus Command/API reviewer | All later packet authors | Public CLI/library shapes for `classify`, `check`, `verify`, `fix`, `hook`, `graph`, Nx generators, and proof payloads | Public types are exported from mixed internals and tests partly mock command engine, so refactors can accidentally change observable shape | Preflight and fresh source read | D1-D12 | Documentation/design proof plus command behavior proof when packets are later written | Phase 2 packet index; domain coverage matrix |
| D1 | Proof Contract boundary | Proof/evidence owner | `verify`, Grit adapter, apply transaction, hooks, DRA handoff | Explicit proof labels, non-claims, retention, post-state, stdout/stderr bounds, command provenance | `createVerifyProof`, `proof-artifact.ts`, `habitat-process.ts`, and `grit-apply.ts` each carry related proof language without one published Habitat proof contract | D0 | D6, D8, D10, D11 | Schema/test proof plus command behavior proof; explicit non-claims | Proof-class ledger; packet proof matrix |
| D2 | Rule Registry metadata contract | Structural Enforcement owner | `check`, `classify`, Nx plugin, Baseline Authority, Pattern Governance | Typed rule registry schema: rule id, owner project, owner tool, lane, machine-readable scope, baseline requirement, hook scope, manifest reference | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/rules/rules.json` is shared by CLI and plugin, but scope is prose-derived and plugin owner roots are hard-coded | D0 | D3, D4, D5, D6, D7, D10 | Schema validation, current-tree compatibility, selector tests | Rule-pack contract record; baseline/rule registry realignment |
| D3 | Workspace Graph Integration boundary | Workspace graph owner | Orientation/Routing, Verify, Nx targets, root scripts | Nx project/target truth and Habitat target inference remain graph-owned; Habitat consumes facts | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/plugin.js` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/nx-projects.ts` both expose graph facts, while classify and verify rely on them differently | D0, D2 | D4, D11, D12 | Nx target discovery tests, classify target tests, root script behavior | Nx/Habitat graph contract note |
| D4 | Orientation and Routing | Orientation/Routing owner | Agents and humans before editing; `verify` handoff | `classify` path/diff output with owner, tags, exact scoped rules, runnable targets, unavailable target facts, malformed/pathless diff failures | `classifyRuleScope` parses rule scope prose and returns `unresolved-metadata`; diff parsing is simple and does not define malformed/pathless proof boundaries | D2, D3 | D6, D11, D12 | Command behavior proof, classify tests, malformed/refusal tests | Scenario corpus; classify examples; API contract record |
| D5 | Baseline Authority | Baseline owner | Structural Enforcement, Pattern Governance, DRA proof | Explicit empty/debt/external-exception baseline states, shrink-only merge-base guard, authoring-only expansion guard | Baseline policy is fairly strong in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/baseline.ts`, but `createCheckReport` applies it inline and pattern admission also consumes it | D2 | D6, D7 | Unit tests for every baseline failure reason; check command proof | Baseline contract record; rule-introduction manifest expectations |
| D6 | Diagnostic Pattern Catalog | Diagnostic Pattern Catalog owner | Structural Enforcement, Pattern Governance, Local Feedback | Grit acquisition/projection contract: approved scan roots, exact JSON parse, typed adapter failures, current-tree projection, injected-probe proof | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/grit.ts` owns Grit adapter behavior, while Pattern Authority and apply share Grit vocabulary but not authority | D1, D2 | D7, D8, D10 | Native sample proof, current-tree wrapper proof, injected violation proof, adapter failure tests | Grit proof matrix; pattern corpus ledger references |
| D7 | Structural Enforcement pipeline | Structural Enforcement owner | `check`, `verify`, hooks, graph targets | Rule selection, rule execution, normalized CheckReport, baseline application, selector failure report, staged execution mode | `createCheckReport` currently centralizes selection, rule execution, baselines, status derivation, and built-in baseline integrity; this makes collect-all behavior and failure classes hard to reason about | D1, D2, D5, D6 | D10, D11 | CheckReport schema tests, selector command tests, staged rule-selection tests | Enforcement packet; report compatibility matrix |
| D8 | Pattern Governance | Pattern Governance owner | Humans/DRA admitting patterns; Structural Enforcement; Baseline Authority; Diagnostic Pattern Catalog | Candidate vs registered lifecycle, authority sources, proving sources, fixtures, baseline contract, hook-scope decision, apply-safety disposition | Pattern generator, manifest validator, registration code, Grit rows, and baselines jointly define admission but are not a single product boundary | D1, D2, D5, D6 | D9, D10, D12 | Manifest validation, registration tests, baseline contract proof, no-placeholder proof | Pattern Authority ledger; Grit pattern corpus ledger |
| D9 | Transformation Transaction | Transformation Transaction owner | `habitat fix`, approved apply patterns | Generic guarded apply transaction with dry-run, approved roots/paths, no unexpected writes, rollback, formatter handoff, per-pattern validation hooks | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/grit-apply.ts` is strong but embeds one pattern and MapGen-specific public-ops validation inside the generic transaction | D1, D6, D8 | D10, future apply packets | Safe-write proof, transaction-copy proof, rollback proof, Biome handoff proof, non-claims | Apply safety matrix; per-pattern proof rows |
| D10 | Generated/Protected Zone Authority | Generated zone owner | Hooks, Grit scan roots, `generated:check`, agents avoiding hand edits | Generated/protected zones, staged mutation guard, regeneration drift gate, remediation owner | `generated-zones.ts`, `verify-generated-zones.mjs`, Grit scan-root protection, and hooks all encode related protected-zone policy | D1, D2 | D7, D9, D11 | Staged file-layer tests, generated-check drift proof, no-unintended-writes proof | Protected-zone authority record |
| D11 | Local Feedback | Local Feedback owner | Developers and agents using Git hooks | Hook behavior says local feedback only; pre-commit staged checks/format/restage/resource policy; pre-push affected scope | `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/hooks.ts` orchestrates resource state, file-layer, Biome, Grit, and Nx affected, but must not own their truth | D1, D6, D7, D9, D10 | Clean Graphite handoff ergonomics | Hook trace tests, staged mutation tests, pre-push base tests; explicit non-claims | Hook contract doc; local-vs-CI proof wording |
| D12 | Proof/Handoff Verify command | Proof Contract owner | DRA owner, reviewers, agents handing off work | `habitat verify` runs check first, then affected Nx targets, emits proof and non-claims; root `bun run verify` remains Nx aggregate and distinct | `verify` currently depends on check report shape, graph target list, bounded stream parsing, git/resource post-state, and proof labels in one helper | D1, D3, D7 | Final Phase 2 closure model | VerifyProof schema/tests and command behavior proof | Verification command contract; closure checklist |
| D13 | Scaffolding and refusal contracts | Scaffolding owner | Agents creating supported uniform structures; DRA owner refusing unsupported authoring | Supported project generator contracts and explicit refusal for domain-owned shapes; pattern candidate generation routes to Pattern Governance | Project generator and pattern generator share Nx generator mechanics but serve different domains; unsupported MapGen authoring must remain refused | D0, D2, D8 | D14; agent authoring guidance | Generator tests, refusal tests, Nx discovery proof | Scaffolding matrix; unsupported request ledger |
| D14 | Authoring Topology fence | Future Authoring Topology owner, not current substrate owner | DRA owner deciding non-goal/defer rows | Explicit non-implementation boundary for MapGen recipe/domain/op/stage/step authoring until product-owned conventions and acceptance tests exist | Docs identify authoring as the north-star gap, but current Habitat substrate cannot generate MapGen topology and should not let scaffolding imply that capability | D4, D12, D13 | Future authoring investigation; prevents false Phase 2 scope | Non-claim/refusal proof; future acceptance-loop design only | Deferral row with trigger; Authoring Next reference |
| D15 | Execution provenance substrate trigger | Process/proof substrate owner | Grit adapter, apply transaction, future check/hook internals | Typed command results, argv/cwd/env/git state/cache policy/output digests, service seams, resource cleanup | Effect is already selected/proven for the Grit adapter area, but broad Effect migration is not justified by itself | D1; only activates where a packet proves manual internals preserve the failure dynamic | D6, D9, optionally D7/D11 | Effect parity tests or deliberate non-Effect proof with equivalent typed failures/provenance | Effect decision row per packet |

## Dependency Shape

Recommended critical path:

1. D0 -> D1 -> D2.
2. D2 -> D3 and D5 in parallel.
3. D3 -> D4.
4. D1 + D2 -> D6; D5 + D6 -> D7.
5. D1 + D2 + D5 + D6 -> D8.
6. D1 + D6 + D8 -> D9.
7. D1 + D2 -> D10.
8. D1 + D6 + D7 + D9 + D10 -> D11.
9. D1 + D3 + D7 -> D12.
10. D0 + D2 + D8 -> D13.
11. D4 + D12 + D13 -> D14.
12. D15 is not first by default; it is a substrate trigger used inside D6/D9 and later only if D7 or D11 cannot achieve typed failure/provenance without it.

## Parallelism Model

Safe parallel lanes after D0/D1/D2:

- Lane A: D3 then D4, because graph truth must precede classify/routing contracts.
- Lane B: D5, because Baseline Authority can be designed independently once rule metadata contract is known.
- Lane C: D6, because Diagnostic Pattern Catalog can progress with its own adapter/projection proof after proof labels and rule metadata are fixed.
- Lane D: D10, because generated/protected zones can be bounded from current file-layer and regeneration evidence, then consumed by hooks and apply.

Hold until dependencies are settled:

- D7 must wait for D5 and D6; otherwise Structural Enforcement will re-entangle baseline and Grit semantics.
- D8 must wait for D5 and D6; otherwise Pattern Governance cannot state registration proof or baseline action truthfully.
- D9 must wait for D8 for future patterns, though it can preserve the existing transaction substrate as current evidence.
- D11 must wait for D7, D9, and D10 because hooks consume those authorities.
- D14 must wait for D13 plus proof/refusal contracts because unsupported authoring must be a designed refusal, not an omission.

## Rejected Dominoes

- Reject "split `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/command-engine.ts` by function size" as a domino. It is a likely implementation move inside multiple packets, but it is not a scenario authority by itself.
- Reject "move all Habitat internals to Effect" as a domino. Effect adoption is a substrate trigger where typed failures, provenance, or cleanup are otherwise not achievable; it is not product authority.
- Reject "wire every diagnostic Grit rule to `habitat fix`" as a domino. Current docs explicitly say most patterns are diagnostics; apply safety is per-pattern proof.
- Reject "add MapGen authoring generators now" as a Phase 2 refactor domino. Authoring Topology needs a future product/convention investigation and acceptance loop.
- Reject "consolidate generators" as a domino. Project scaffolding and Pattern Authority share Nx mechanics but answer different product questions.
- Reject "docs cleanup for Habitat docs" as a domino unless it records a contract/refusal/proof boundary that reduces reachable state.

## P1/P2 Risks

- P1: Public command/report shape can change accidentally if D0/D1 are skipped and packets start by extracting files from `command-engine.ts`.
- P1: `classify` can overclaim rule precision while scope remains prose-derived; D2/D4 must make unresolved metadata an explicit contract or eliminate it with machine metadata.
- P1: Baseline and Pattern Governance can deadlock if seeded baseline growth, new-rule registration, and manifest acceptance are not sequenced together.
- P1: Generic apply transaction can absorb MapGen-specific validation and stop being generic; D9 must separate generic safe-write proof from per-pattern/product checks.
- P2: Hooks can be misread as verification proof unless D11 carries local-only non-claims from D1.
- P2: Nx plugin hard-coded owner roots can lag rule registry or package renames unless D2/D3 define the source of truth.
- P2: Pattern Authority process can become product theater if D8 is not tied to scenario outcomes and proof rows.

## Stop Conditions For Phase 2 Packet Writing

- Stop if a packet cannot name a single owner, consumer, contract, current state-space problem, dependencies, proof class, and downstream record.
- Stop if a packet is only a module cleanup or file move.
- Stop if a public surface changes without compatibility and explicit command/API proof.
- Stop if a packet uses Civ7/MapGen product behavior to justify a generic Habitat substrate boundary.
- Stop if Authoring Topology implementation enters scope before the refusal/future-acceptance contract is written.
- Stop if two consecutive packet sketches preserve current file layout because it is convenient rather than because it follows scenario authority.
