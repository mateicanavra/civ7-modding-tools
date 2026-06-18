# Domino Candidate Ledger

This ledger is the preparation-phase sequencing model for the Phase 2 packet suite. It is not the packet suite. Phase 2 must turn each valid domino into its own workstream packet and carry it through investigation, analysis, solution design, review, and polish.

## Valid Domino Standard

A valid domino must name:

- owner,
- consumer,
- public or internal contract,
- current state-space problem,
- dependency order,
- what it unblocks,
- proof class,
- downstream records.

Reject any candidate that is only a file move, cosmetic cleanup, or current-module reshuffle.

## Packet-Minimization Gate

Before Phase 2 turns any domino into a standalone packet, the packet must answer:

- Why is this a separate packet rather than a section, stop condition, proof gate, or acceptance criterion inside an adjacent packet?
- What dependency does it unlock that cannot be unlocked by the adjacent packet?
- What reachable TypeScript state does it remove?
- What simpler alternative was rejected, and why?

D15 is not a default standalone packet. It is a packet-local trigger for D6, D9, and optionally D7/D11. It becomes standalone only if a concrete scenario proves that typed command provenance cannot be delivered inside those packets without creating contradictory states.

## Type-State Value Gate

Every ADT, Result type, constructor, brand, or option-object split proposed in Phase 2 must name:

- the product state it prevents,
- the consumer it simplifies,
- the runtime evidence or command behavior backing it,
- the simpler alternative rejected.

If the type change only makes code look cleaner, reject it.

## Rule Metadata Facet Gate

D2 must not become a mega-schema. It must define the smallest typed metadata facets needed by each consumer:

- selector and owner facet for Structural Enforcement,
- scope/routing facet for Orientation and Routing,
- target/owner-root facet for Workspace Graph Integration,
- baseline facet for Baseline Authority,
- manifest/hook facet for Pattern Governance,
- generated-zone facet for Generated/Protected Zone Authority.

Consumers should receive projections, not the whole registry object, unless a packet proves the whole object is the smaller state.

## Critical Path

1. D0 Scenario/Public Contract Inventory.
2. D1 Proof Contract Boundary.
3. D2 Rule Registry Metadata Contract.
4. Parallel lanes:
   - D3 Workspace Graph Integration Boundary -> D4 Orientation and Routing.
   - D5 Baseline Authority.
   - D6 Diagnostic Pattern Catalog.
   - G-HOST Host Policy Boundary Gate.
5. D10 Generated/Protected Zone Authority after D2 and G-HOST.
6. D7 Structural Enforcement Pipeline after D5, D6, and D10.
7. D8 Pattern Governance after D5 and D6.
8. D9 Transformation Transaction after D8, D6, and D10.
9. D11 Local Feedback after D7, D9, and D10.
10. D12 Proof/Handoff Verify Command after D1, D3, and D7.
11. D13 Scaffolding and Refusal Contracts after D0, D2, D8, and G-HOST.
12. D14 Authoring Topology Fence after D4, D12, and D13.
13. D15 Execution Provenance Substrate Trigger activates only inside packets where typed failures/provenance require it.

## Dominoes

| ID | Domino | Owner | Consumer | Contract | State-Space Problem | Blocked By | Unblocks | Proof Class | Downstream Records |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| D0 | Scenario/Public Contract Inventory | Command/API owner | All Phase 2 packet authors | CLI verbs, flags, JSON shapes, exports, root scripts, Nx targets, generator and hook surfaces | Public surfaces are spread across commands, package exports, root scripts, tests, and generated manifest; accidental changes are likely if internals move first | Fresh checkout and source read | D1-D14 | Documentation/design proof; later command behavior proof | Packet index, API compatibility matrix |
| D1 | Proof Contract Boundary | Proof owner | Verify, check, hooks, Grit adapter, apply, DRA closure | Proof labels, non-claims, bounded streams, post-state, proof schema boundaries | Multiple proof shapes overlap without a shared vocabulary; a generic proof framework would overfit | D0 | D6, D7, D8, D9, D10, D11, D12 | Schema tests, command proof, explicit non-claims | Proof-class ledger |
| D2 | Rule Registry Metadata Contract | Structural metadata owner | Check, classify, Nx plugin, baseline, Pattern Governance | Typed rule metadata for id, owner, tool, lane, scope, hook scope, manifest, generated-zone relation | `rules.json` is shared but scope is prose and owner roots are hard-coded elsewhere | D0, D1 | D3-D8, D10, D13 | Schema validation, selector tests, graph compatibility | Rule-pack contract record |
| D3 | Workspace Graph Integration Boundary | Graph owner | Classify, verify, root scripts, Nx targets | Nx project/target facts and inferred target names | `plugin.js` and `nx-projects.ts` both carry graph knowledge; target aliases can drift | D2 | D4, D12 | Nx target discovery, classify target proof | Nx/Habitat graph contract |
| D4 | Orientation and Routing | Orientation owner | Agents and humans before editing | `habitat classify` path/diff output, owner, scoped rules, targets, unavailable facts | Classification uses optional-heavy shapes and prose-derived scope | D2, D3 | D14, scenario handoff packets | Command behavior, classify tests, malformed/refusal tests | Scenario corpus, classify examples |
| D5 | Baseline Authority | Baseline owner | Structural Enforcement, Pattern Governance | explicit empty/debt/external-exception states, shrink-only guard, introduction manifest | Strong current state machine is applied inline with check and pattern admission | D2 | D7, D8 | Baseline contract tests, baseline-integrity current-tree check | Baseline contract record |
| D6 | Diagnostic Pattern Catalog | Grit diagnostics owner | Structural Enforcement, Pattern Governance, Local Feedback | Grit acquisition/projection, scan roots, adapter failure projection, injected-probe proof | Grit diagnostics, pattern admission, and apply patterns share terms but not authority | D1, D2 | D7, D8, D9, D11 | Native sample, current-tree wrapper, injected violation, adapter failure tests | Grit proof matrix |
| D7 | Structural Enforcement Pipeline | Enforcement owner | `check`, `verify`, hooks, Nx targets | Rule selection, execution, normalized CheckReport, baseline application, staged mode | `createCheckReport` mixes selection, execution, baselines, built-ins, status, and rendering | D1, D2, D5, D6, D10 | D11, D12 | CheckReport schema, command behavior, selector tests | Enforcement compatibility matrix |
| D8 | Pattern Governance | Pattern Authority owner | Pattern authors, DRA, Structural Enforcement | Candidate vs registered lifecycle, manifest, baseline contract, hook-scope decision, fixture/proof sources | Generator, manifest validator, registration, Grit rows, and baselines jointly define admission | D1, D2, D5, D6 | D9, D13 | Manifest tests, registration tests, baseline proof | Pattern Authority ledger |
| D9 | Transformation Transaction | Apply owner | `habitat fix`, future approved apply packets | dry-run inventory, isolated-copy proof, approved roots/paths, rollback, Biome handoff, per-pattern gates | Generic transaction currently embeds one pattern and MapGen-specific export validation | D1, D6, D8, D10 | D11, future apply packets | Safe-write, transaction-copy, rollback, formatter handoff | Apply safety matrix |
| D10 | Generated/Protected Zone Authority | Generated-zone owner | Structural Enforcement, hooks, apply, agents avoiding hand edits | Generated/protected zone declarations, staged mutation guard, drift check | Host-specific zones are encoded in generic modules and scripts | D1, D2, G-HOST | D7, D9, D11 | Staged file-layer tests, generated-check proof | Protected-zone authority record |
| G-HOST | Host Policy Boundary Gate | Host policy owner | Generated/Protected Zone Authority, Transformation Transaction, Scaffolding | Host declaration/refusal contract for generated zones and pattern-specific gates | MapGen and Civ-specific policy currently appears inside generic modules | D0, D1 | D10, D13, D9 host-policy consumption | Host declaration/refusal tests, command behavior, non-claims | Host policy boundary record |
| D11 | Local Feedback | Hook owner | Developers and agents using Git hooks | local-only hook behavior, staged path policy, Graphite base detection, resource state guards | Hooks orchestrate many proof owners and can be mistaken for verification authority | D1, D6, D7, D9, D10 | Clean Graphite handoff ergonomics | Hook trace tests, staged mutation tests, pre-push base tests | Hook contract doc |
| D12 | Proof/Handoff Verify Command | Proof owner | DRA, reviewers, agents handing off work | `habitat verify` runs check then affected Nx and emits non-claims | Verify depends on check shape, graph target list, post-state, stream parsing, and proof labels | D1, D3, D7 | Phase 2 closure model | VerifyProof schema/tests and command behavior | Verification contract |
| D13 | Scaffolding and Refusal Contracts | Scaffolding owner | Agents creating supported uniform structures | supported project generator, pattern candidate generation, explicit unsupported-kind refusal | Project and pattern generators share Nx mechanics but answer different product questions | D0, D2, D8 | D14 | Generator tests, refusal tests, Nx discovery proof | Scaffolding matrix |
| D14 | Authoring Topology Fence | Future authoring owner | DRA, future product work | explicit non-implementation boundary for MapGen recipe/domain/op/stage/step generation | Docs identify authoring as a gap but current Habitat cannot safely own it | D4, D12, D13 | Future investigation only | Non-claim/refusal proof | Deferral row with trigger |
| D15 | Execution Provenance Substrate Trigger | Process/proof substrate owner | Grit adapter, apply, future check/hook internals | packet-local typed command results, argv/cwd/env/git state/cache policy/output digests | Effect/provenance exists in Grit/apply areas but broad migration is unjustified | D1; packet-specific need | D6, D9, optionally D7/D11 | Effect parity or equivalent typed failure proof | Per-packet decision row |

## Parallelism Model

Safe parallel work:

- G-HOST can start after D0 and D1. It may proceed while D2-D6 continue, but
  D10 cannot close until both G-HOST and D2 are stable.
- D3 then D4 can proceed as the graph/orientation lane.
- D5 can proceed as the baseline lane.
- D6 can proceed as the diagnostic Grit lane.
- D10 may investigate current generated-zone evidence in parallel, but it
  cannot design or close generic generated/protected-zone authority until
  G-HOST defines the host declaration/refusal boundary and D2 defines the
  metadata facets it consumes.

Sequential blockers:

- D10 must wait for G-HOST before claiming generic closure.
- D7 must wait for D5, D6, and D10.
- D8 must wait for D5 and D6.
- D9 must wait for D8, D6, and D10.
- D11 must wait for D7, D9, and D10.
- D12 must wait for D1, D3, and D7.
- D13 must wait for D0, D2, D8, and G-HOST.
- D14 must wait for D4, D12, and D13.

## Anti-Dominoes

Rejected as invalid packet foundations:

- Split `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/tools/habitat-harness/src/lib/command-engine.ts` by size.
- Rewrite the CLI command classes.
- Move all Habitat internals to Effect.
- Create a generic proof supertype/framework.
- Wire every diagnostic Grit rule to `habitat fix`.
- Add MapGen authoring generators in Phase 2.
- Consolidate project and pattern generators because they share Nx mechanics.
- Perform generic docs cleanup without a contract/refusal/proof boundary.

## Known P1/P2 Risks

P1:

- Public command/report shapes can change if internal extraction begins before D0 and D1.
- `classify` can overclaim precision while rule scope remains prose-derived.
- Baseline growth and Pattern Governance can deadlock if rule introduction, manifests, and baseline expansion are not sequenced.
- Generic apply can absorb MapGen-specific validation and cease being generic.
- `@internal/habitat-harness:test` full-suite reliability was observed as a current proof risk.
- An inferred `habitat:rule:biome-ci` alias can report false green despite a missing `biome` project dependency warning.

P2:

- Hooks can be mistaken for proof authority.
- Broad Nx inputs make small changes slower than they need to be.
- Package exports can accidentally harden internals as public API.
- Root graph targets and Habitat diagnostic commands can be confused by users and agents.
- Pattern Authority can become process theater if not tied to scenario outcomes and proof rows.

## Stop Conditions

Stop Phase 2 packet writing if:

- a packet lacks owner, consumer, contract, state-space problem, dependencies, proof class, and downstream record;
- a packet is only a module cleanup or file move;
- a public surface changes without compatibility and explicit command/API proof;
- generic Habitat boundaries are justified by Civ7/MapGen-specific behavior;
- Authoring Topology implementation enters scope before the refusal/future-acceptance contract exists;
- two consecutive packet sketches preserve current file layout because it is convenient rather than because it follows scenario authority.
- a packet adds a standalone proof/process/type substrate without passing the packet-minimization and type-state value gates;
- a packet consumes all rule metadata where a smaller facet would remove the same state;
- D9, D10, or D13 closes while host-specific policy remains embedded in generic Habitat code without the G-HOST declaration/refusal gate.
