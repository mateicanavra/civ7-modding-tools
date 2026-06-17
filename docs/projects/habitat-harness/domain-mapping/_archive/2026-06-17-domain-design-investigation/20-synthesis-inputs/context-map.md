# Habitat Candidate Context Map

This is a candidate domain map for review, not a refactor plan. Contexts are
derived from scenario responsibility, authority, proof class, and language.

## Candidate Bounded Contexts

| Context | Responsibility | Primary Scenarios | Owned Invariants | Main Consumers |
| --- | --- | --- | --- | --- |
| Orientation and Routing | Classify paths and diffs, expose owners, tags, scoped rules, target truth, and unavailable target facts. | S01, S02 | One route report per input; target availability is explicit. | agents, maintainers, DRA owners |
| Structural Enforcement | Select and execute Habitat rules, normalize diagnostics, and report pass/fail/advisory state. | S03 | Selector integrity; one normalized diagnostic contract. | CI, maintainers, agents |
| Baseline Authority | Own explicit debt state and shrink-only baseline ratchets. | S03, S09 | Baseline growth requires accepted rule introduction; parser-owned baselines cannot bypass contract. | rule authors, CI, maintainers |
| Workspace Graph Integration | Publish and consume Nx graph/project/target facts for Habitat workflows. | S01, S04 | Graph facts come from Nx; Habitat reports but does not invent them. | classify, verify, root workflows |
| Diagnostic Pattern Catalog | Acquire Grit findings from approved scan roots and project them into Habitat diagnostics. | S03 | Grit acquisition has parse/cache/root provenance and non-claims. | Structural Enforcement |
| Pattern Governance | Admit candidates, promote registered patterns, and record normative/proving sources, fixtures, baselines, hook scope, and apply safety. | S08, S09, S11 | A pattern is not enforced without accepted authority and proof. | rule authors, Structural Enforcement, Transformation |
| Transformation Transaction | Apply approved structural rewrites under clean-tree, changed-path, rollback, and handoff controls. | S05 | No live mutation without pre-approval evidence and rollback posture. | agents, maintainers |
| Local Feedback | Orchestrate pre-commit/pre-push checks and formatting ergonomics. | S06 | Local hooks help; CI remains authoritative. | local developers |
| Generated/Protected Zone Authority | Guard generated or externally regenerated zones from direct mutation. | S06 | Regeneration owner decides protected content. | hooks, CI, agents |
| Scaffolding | Generate narrow uniform project shells and refuse domain-owned shapes. | S07 | Supported kind contracts are explicit and refusal-capable. | agents creating projects |
| Authoring Topology | Future capability to generate and wire domain/product structures such as MapGen domains, ops, stages, steps, and contracts. | S10, S11, S12 | Not implemented today; must be product-owned and proof-backed. | future agents and maintainers |
| Proof Contract | Represent proof artifacts, non-claims, streams, cache facts, post-state, and handoff evidence. | S04, S05, S12 | Claims and non-claims are explicit and consumer-readable. | DRA owner, reviewers, agents |

## Context Relationships

| Relationship | Pattern | Rationale |
| --- | --- | --- |
| Orientation and Routing -> Workspace Graph Integration | Customer/supplier | Orientation consumes Nx facts but should not own graph truth. |
| Structural Enforcement -> Baseline Authority | Customer/supplier | Enforcement applies baselines; Baseline authority owns ratchet state. |
| Structural Enforcement -> Diagnostic Pattern Catalog | Customer/supplier | Enforcement consumes normalized findings; Grit acquisition owns parser/tool facts. |
| Diagnostic Pattern Catalog -> Pattern Governance | Conformist with admission gate | Grit can run only accepted registered patterns; governance owns admission. |
| Pattern Governance -> Baseline Authority | Customer/supplier | Registered pattern promotion requires a valid baseline contract. |
| Transformation Transaction -> Pattern Governance | Customer/supplier | Apply safety depends on pattern-owned approval. |
| Local Feedback -> Structural Enforcement | Open host / published language | Hooks invoke checks through command contracts and must not own enforcement truth. |
| Verify / Proof Contract -> Structural Enforcement and Workspace Graph Integration | Published language | Proof summarizes check and affected graph facts without swallowing their authority. |
| Scaffolding -> Authoring Topology | Separate ways for now | Current scaffolding handles uniform project shells; authoring topology is unimplemented and product-specific. |
| Generated/Protected Zone Authority -> Local Feedback and Structural Enforcement | Published language | Hooks and targets consume protected-zone decisions. |

## Rejected Boundaries

- `src/lib` versus `src/commands`: rejected because command flows cross several
  domain authorities and proof classes.
- "All Grit": rejected because diagnostics, pattern admission, and apply safety
  are separate responsibilities.
- "All generators": rejected because project scaffolding, pattern governance,
  and future MapGen authoring topology have different owners and refusal modes.
- "Habitat as MapGen authoring toolkit": rejected as current-state claim; kept
  as future product direction only.
