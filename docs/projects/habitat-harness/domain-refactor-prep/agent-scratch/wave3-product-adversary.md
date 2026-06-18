# Wave 3 Product Adversary Review

## Scope

- Role lane: Product Adversary.
- Worktree: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame`
- Branch: `codex/habitat-fast-lint-checks`
- Review target: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/`
- Constraint: review only; no implementation.

## Findings

### P1: Host-specific policy is identified as a generic-boundary risk but is not made a first-class packet gate.

The corpus correctly says Habitat must remain generic, but the Phase 2 domino model leaves host-specific policy split across D9, D10, and D14 instead of naming a single owner/contract for host policy injection or refusal. Current evidence says generic apply embeds MapGen-specific validation and generic generated-zone modules encode host-specific zones. The scenario corpus lists host-owned generated-zone configuration and pattern-specific apply gates as future product gaps, while the domain map says host-specific generated-zone and MapGen gates must not become generic core claims. Without a first-class Host Policy Boundary packet or explicit hard gate inside D9/D10, Phase 2 can refactor the code and still preserve the same product flaw: Civ7/MapGen assumptions hidden inside generic Habitat.

Evidence:

- `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:56` says Authoring Topology is future work, but `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:57` and `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:58` also name host-owned generated-zone configuration and product-specific apply gates as gaps.
- `docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:135` says generic transaction currently contains pattern-specific and MapGen-specific validation.
- `docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:137` says host-specific generated/protected zones live in the generic library.
- `docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:149` says generated-zone and MapGen-specific checks appear in generic modules without an explicit host policy boundary.
- `docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md:61` says host-specific generated-zone and MapGen gates must not become generic Habitat core claims without a host policy boundary.
- `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:52` and `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:53` place the issue inside D9 and D10, but no separate host-policy owner/contract appears in the domino list.

Required fix before goal attachment:

- Add either a valid domino for Host Policy Boundary, or update D9/D10/D14 so packet closure requires a named host-policy owner, generic host declaration contract, refusal behavior for unmodeled host validators, and proof that generic Habitat has not absorbed Civ7/MapGen semantics.

Attachment impact:

- Blocks goal attachment if accepted as P1.

### P2: The scenario corpus is still mostly command-surface-first, not workflow-first.

The product frame says Habitat helps agents and humans classify, check, verify, guard, scaffold, apply, refuse, and recover. The scenario corpus improves on module-centric planning, but the supported scenarios are still one row per command or capability surface, with proof classes and non-claims more concrete than end-to-end user journeys. D0 then asks for CLI verbs, flags, JSON shapes, exports, root scripts, Nx targets, generator and hook surfaces. That is necessary, but not sufficient. Without explicit cross-command workflows, Phase 2 can satisfy D0 by freezing current surfaces while missing the actual product experience: an agent or human starts from uncertainty, asks Habitat what is safe, receives a refusal or next action, runs bounded proof, and recovers from failure.

Evidence:

- `docs/projects/habitat-harness/domain-refactor-prep/README.md:5` defines the product as classify, check, verify, guard, scaffold, apply, refuse, and recover.
- `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:24` through `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:40` list supported scenarios primarily by command/capability rows.
- `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:63` through `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:73` require per-packet scenario, owner, consumer, contract, proof, and stop conditions, but not workflow traces, recovery paths, or user-visible success/failure semantics.
- `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:43` defines D0 around public surfaces and compatibility artifacts, not scenario journeys or recovery contracts.
- `docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:7` asks every domino packet to state product scenario and contract, but does not require end-to-end workflows or recovery/refusal examples.

Required fix before goal attachment:

- Add a workflow matrix to the corpus or make D0 require one. It should cover at least: pre-edit orientation, patch/diff orientation, check failure recovery, proof handoff, hook refusal recovery, generated-zone refusal, approved apply dry-run/live apply/rollback, scaffolding refusal, and unsupported MapGen authoring refusal.

Attachment impact:

- Blocks goal attachment if accepted as P2 under `docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md:7`.

### P2: Refusal is treated as a non-claim theme, but not as a product contract.

Refusal is one of Habitat's core product promises for agents: the tool should refuse unsupported shapes instead of silently inventing them. The unsupported scenario table names requests, responses, and reasons, but it does not define a refusal contract surface, machine-readable failure shape, recovery guidance, or proof class. D13 and D14 mention refusal tests/proof for scaffolding and Authoring Topology, but the corpus does not define a general refusal/recovery standard for proof substitution, generic apply overreach, baseline growth, generated-zone misuse, or unsupported host policy. That leaves room for vague prose refusals that are technically correct but not useful to agents.

Evidence:

- `docs/projects/habitat-harness/domain-refactor-prep/README.md:5` includes refuse and recover in the product frame.
- `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:42` through `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:52` list unsupported requests with response and reason only.
- `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:56` limits explicit unsupported-kind refusal to scaffolding.
- `docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:57` gives D14 non-claim/refusal proof for Authoring Topology, but not a general refusal contract across Habitat.

Required fix before goal attachment:

- Define a refusal contract requirement in the scenario corpus and D0/D1/D13/D14 packet criteria: refusal code/category, human-readable reason, machine-readable non-claim, allowed next actions, and proof for at least one injected unsupported request per refusal class.

Attachment impact:

- Blocks goal attachment if accepted as P2 under `docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md:7`.

### P3: Human operator ergonomics are thinner than agent/DRA proof ergonomics.

The corpus repeatedly names agents and humans, but the concrete acceptance material is stronger for DRA closure, proof labels, schemas, and command behavior than for a human developer's loop. That is acceptable for a DRA-prep packet, but it is a product risk for a repo-local toolkit. A human needs concise orientation, actionable errors, and low-friction recovery, not just correct proof taxonomy.

Evidence:

- `docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:7` says Habitat reduces ambiguity for agents and humans.
- `docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md:21` names agents, humans, tests, and package consumers for Command/API Contract.
- `docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md:36` through `docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md:52` thoroughly enumerate proof classes, but there is no matching human-facing ergonomics standard.

Optional improvement:

- Add a short human-operator acceptance standard: output should say what happened, whether the user may proceed, what proof class was produced, what is not proven, and the next safe command or edit path.

Attachment impact:

- Does not block goal attachment by itself.

### P3: The Phase 2 goal does not explicitly force use of the authority order during packet drafting.

The source-authority register is strong, but the Phase 2 objective can be read as using only the prepared summaries. Since current code is explicitly present-behavior evidence rather than target authority, Phase 2 packets should be required to follow the authority order and resolve conflicts rather than treating the preparation summaries as a complete substitute for the referenced frame, domain design packet, docs, and source.

Evidence:

- `docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:12` through `docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:21` define the authority order.
- `docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:94` through `docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:100` define conflict rules.
- `docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:7` says to design from the prepared register and maps, but does not explicitly say every packet must apply the authority order and conflict rules.

Optional improvement:

- Add to the Phase 2 goal or D0 stop conditions that every packet must cite the applicable authority order and conflict-rule outcome when source, docs, and target-domain authority disagree.

Attachment impact:

- Does not block goal attachment by itself.

## Summary

The corpus is materially product-first compared with a module-cleanup plan: it refuses MapGen authoring scope, separates proof classes, and starts from scenarios. The main remaining weakness is that the product model is still too easy to collapse into command-surface preservation plus proof taxonomy. The DRA owner should disposition the P1/P2 findings before attaching the Phase 2 goal.

