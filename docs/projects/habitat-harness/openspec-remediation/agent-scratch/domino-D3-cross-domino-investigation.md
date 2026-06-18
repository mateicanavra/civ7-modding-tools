# D3 Cross-Domino Investigation

## Verdict

Not accepted.

D3 acceptance requires the complete Workspace Graph Integration authority contract. It is not a partial repair packet for `biome-ci`, target aliases, or classify output. `biome-ci` is only a current falsifying example proving the broader graph authority boundary is broken.

D3 may consume accepted D2 design/specification projections, especially the `ruleGraphFacts` projection contract, but D3 source implementation remains blocked until:

- concrete D0 public/durable surface rows exist for every classify JSON, verify output, Nx inferred target, root script, package export, docs/example, and command surface D3 touches; and
- D2 implementation provides live graph projection facts, not just accepted design text.

The current D3 packet still fails the cross-domino handoff gate because it does not yet define the full owner boundary for project ownership, target availability, alias dependency normalization, aggregate/workspace targets, graph-read errors, and graph refusal semantics. D4, D7, and D12 are left with the phrase "D3 graph facts" instead of exact facts, non-claims, and implementation gates.

Historical scratch evidence, including the prior D3 negative-control review, is provenance only. It is useful because it exposes concrete hazards, but it is not current guidance and does not recast D3 as an alias-only fix.

## Framing Correction

The review boundary is the full Workspace Graph Integration domain:

- **Exact domain owner:** Workspace Graph Integration.
- **Owner responsibility:** resolve and publish Habitat's current workspace graph facts from Nx project metadata, D2 graph declarations, Habitat-owned workspace gates, target alias declarations, and graph read/error states.
- **Forbidden local owners:** Orientation and Routing, Structural Enforcement, Verify Handoff, Rule Registry Metadata, and command renderers may consume graph facts, but may not construct graph truth, parse graph declarations into runnable targets, or convert unresolved graph states into success.
- **Why this boundary protects the complete solution:** all downstream packets need the same answer to "what project/target/gate/refusal exists right now?" If plugin target inference, classify, check, and verify each infer that answer locally, D3 has not reduced the state space; it has preserved the split-authority bug with a cleaner vocabulary.

During this review, `openspec/changes/deep-habitat-d3-workspace-graph-boundary/proposal.md` became modified with semantic D3 repair text while the rest of the D3 packet remained unrepaired. I did not author or revert that file. This investigation treats that as concurrent work and evaluates D3 acceptance against the complete Workspace Graph Integration contract, not a proposal-only or alias-only repair.

## Accepted Inputs D3 May Consume

D0 is accepted for design/specification only. It gives D3 the rule that public surfaces must be cited through concrete matrix rows before source edits. It does not give D3 permission to change classify JSON, verify JSON, Nx inferred targets, package exports, root scripts, or docs examples without those rows.

D2 is accepted for design/specification only. It gives D3 the target design handoff: `ruleGraphFacts` declarations, structured graph target references, and the rule that D3 owns resolved Nx graph truth, target availability, and graph error classification. It does not give D3 live implemented projections, and it does not authorize D3 to read whole registry rows or preserve colon-string target parsing.

## Exact Graph Facts For Downstream

After D3 is fully repaired and accepted, downstream packets may rely on these graph fact categories at design time:

| Graph fact | Meaning | Non-claim |
| --- | --- | --- |
| `available-project-target` | Current resolved Nx project metadata contains the named project and target. | Does not prove the target ran or passed. |
| `unavailable-project-target` | The project resolves, but the target does not. | Must not be emitted as a runnable command. |
| `alias-target` | A Habitat alias target whose dependency is a structured, resolved project/target reference. | Does not permit colon-string parsing, no-op wrapper success without dependency proof, or alias-specific special casing as the whole D3 solution. |
| `aggregate-workspace-target` | A Habitat-owned workspace gate such as workspace lint or aggregate Habitat checks. | Must not be mislabeled as a project-local target. |
| `graph-refusal` | Missing project, missing target, malformed graph metadata, unresolved alias dependency, or Nx graph/daemon/read failure. | Blocks execution or records blocked state; never converts to green output. |

D3 also needs one implementation owner for graph truth under the Workspace Graph Integration domain. `plugin.js`, `nx-projects.ts`, classify, check, and verify may consume the graph boundary, but they must not maintain separate owner-root maps, target availability rules, alias dependency normalization, workspace-gate classification, or graph-refusal semantics.

## P1 Findings

### P1-1: D3's dependency gate still collapses design acceptance and source readiness

D3's packet names D0 and D2 as prerequisites, but the acceptance boundary is more precise:

- D3 design may consume D0 and D2 accepted design/specification.
- D3 source implementation is blocked behind concrete D0 rows and implemented D2 graph projections.

The current D3 tasks still reduce this to "Re-run or cite the required dependency gates: D0, D2." That is not enough. It would allow implementation to start from accepted D2 design text without live `ruleGraphFacts` and without D0 row citations for public surfaces.

Required repair: D3 `design.md`, `tasks.md`, `phase-record.md`, and packet-index row must explicitly separate design/specification consumption from source implementation gates.

### P1-2: D4, D7, and D12 are not realigned to the full D3 graph authority contract

D4 says it defines orientation from "D2 registry and D3 graph facts." D7 says it composes "registry metadata, diagnostics, baselines, generated-zone guards, and graph facts." D12 says verify assembles over D1/D3/D7 outputs. None names the complete D3 graph authority contract above or the non-claims.

This is a cross-domino blocker because each downstream packet can accidentally recreate D3 authority:

- D4 could infer target truth while presenting next commands.
- D7 could recompute graph availability while trying to prevent false greens.
- D12 could turn graph availability into handoff proof language.

Required repair: add downstream rows for D4, D7, and D12 that identify consumed D3 facts, forbidden local inference, source implementation gates, and non-claims for the full graph boundary, not only alias targets.

### P1-3: D3 still lacks an implementation-ready owner/write-set boundary for complete graph truth

The source D3 packet explicitly requires one graph boundary for owner roots, target facts, aggregate/workspace targets, alias dependency normalization, and graph error/refusal states. Current code evidence shows duplicate graph truth in `plugin.js` owner roots and alias wrappers, `nx-projects.ts` graph reads, and classify/verify target output construction.

The OpenSpec scaffold still leaves "concrete write set and protected paths" to the executor. For D3, that is too late: the packet's purpose is to prevent duplicate graph owners before implementation starts.

Required repair: D3 must name the Workspace Graph Integration implementation owner module/API and the approved write set covering `plugin.js`, `nx-projects.ts`, `command-engine.ts`, graph tests, D0/D2 compatibility/projection touchpoints, and every discovered graph-authority surface. A bounded implementation boundary is acceptable only if it explains why all graph truth flows through that owner and why excluded surfaces are consumers rather than parallel authorities.

## P2 Findings

### P2-1: Packet-index compatibility is directionally right but too weak for D3 acceptance

The packet index correctly keeps D3, D4, D7, and D12 as draft/blocking, and correctly marks D0/D2 as accepted for design/specification but not implementation-complete. It still needs acceptance-ready language for the D3 row and downstream source gates.

Required packet-index repair after D3 packet repair:

- D3: "accepted for design/specification only after the complete Workspace Graph Integration authority contract is repaired; not implementation-complete; source implementation blocked until concrete D0 public-surface rows and live D2 `ruleGraphFacts` implementation exist."
- D4: "may design against accepted D2 routing projections and accepted D3 graph fact categories; source implementation blocked until D2 routing facts and D3 graph facts are implemented and D0 rows cover classify surfaces."
- D7: "may design against named D3 graph facts; source implementation blocked until D3 graph facts, D2 projections, and D5/D6/D10 owner facts are live."
- D12: "may design receipt assembly against D3 graph outcomes and D7 check outcomes; source implementation blocked until D3 and D7 implementation facts exist. D12 does not consume D2 directly."

### P2-2: D3 validation remains shape-valid but not falsifying enough for full-domain trust

`bun run openspec -- validate deep-habitat-d3-workspace-graph-boundary --strict` and `bun run openspec:validate` passed. That proves OpenSpec shape only. It does not prove D3 graph readiness, alias dependency safety, downstream contract clarity, or source implementation readiness.

Required repair: keep OpenSpec validation, but add D3-specific falsifiers for every graph state family: available target, unavailable target, alias target, aggregate/workspace target, missing project, missing target, malformed graph metadata, Nx graph read/daemon failure, classify JSON compatibility, and no-op wrapper refusal when dependency resolution fails. The `biome-ci` case should remain a regression probe, not the definition of done.

### P2-3: D12's dependency posture is correct but fragile

D2's downstream ledger says D12 consumes D2 only through D3/D7. The packet index and D12 packet reflect that by requiring D0, D1, D3, and D7, not D2. That is correct.

The fragility is that D12 currently says "graph outcomes" without stating that graph availability is not target execution proof. D12 must record graph outcomes as receipt inputs and non-claims, not as proof that affected targets ran, CI passed, runtime behavior is correct, or Graphite state is safe.

## Required Downstream Repairs

D4 downstream row should say:

> D4 may present D3 `available-project-target`, `unavailable-project-target`, `alias-target`, `aggregate-workspace-target`, and `graph-refusal` facts in orientation output. D4 must not infer Nx graph truth, parse rule graph declarations, turn unavailable targets into commands, special-case aliases, or claim target execution success. Source implementation waits for D2 `ruleRoutingFacts`, D3 graph facts, and D0 classify surface rows.

D7 downstream row should say:

> D7 may consume D3 target and graph-refusal facts to decide whether structural enforcement can run, must block/fail, or must report an unavailable input. D7 must not construct alias dependencies, read Nx graph directly as authority, special-case missing project/target states, or treat graph refusal as a passing check. Source implementation waits for live D3 graph facts plus D2/D5/D6/D10 implementation facts and D0/D1 compatibility rows.

D12 downstream row should say:

> D12 may record D3 graph outcomes and D7 check outcomes in a handoff receipt. D12 must not create graph truth, execute D3-owned targets independently, turn graph availability into target-success proof, claim product/runtime/CI/Graphite readiness, or turn skipped/blocked graph states into success. Source implementation waits for D3 and D7 implementation facts plus D0/D1 receipt compatibility.

D3 downstream ledger should replace "Later domino packets: pending" with explicit rows for D4, D7, and D12 using the same facts and non-claims.

## Required D3 Packet Repairs

- Repair `design.md` so the complete Workspace Graph Integration authority contract is normative and closed: owner/root lookup, current Nx project/target availability, alias dependency normalization, workspace aggregate gates, and graph error/refusal states.
- Repair `tasks.md` so source work cannot start by "defining" graph ownership; it must implement the already-designed complete graph boundary.
- Repair `specs/habitat-harness/spec.md` with scenarios for available project target, unavailable project target, alias target, unresolved alias dependency, workspace aggregate target, graph refusal, malformed graph metadata, and Nx graph read/daemon failure.
- Repair `workstream/downstream-realignment-ledger.md` with D4/D7/D12 rows.
- Repair `workstream/review-disposition-ledger.md` to import the prior D3 negative-control findings and this cross-domino review as blocking until repaired.
- Repair the packet index with the status/gate language above.

## Non-Claims

- This investigation does not accept D3.
- This investigation does not accept D4, D7, or D12.
- This investigation does not implement source code.
- Passing OpenSpec validation proves only OpenSpec shape.
- D2 accepted design/specification is not live registry behavior.
- D3 graph facts do not prove target execution success, rule correctness, check correctness, verify receipt correctness, CI, runtime/product behavior, or Graphite readiness.
- The `biome-ci` false-green case is provenance and a regression probe only; it is not the D3 scope.

Skills used: domain-design, information-design, solution-design, typescript-refactoring, civ7-open-spec-workstream, civ7-habitat-dra-workstream.
