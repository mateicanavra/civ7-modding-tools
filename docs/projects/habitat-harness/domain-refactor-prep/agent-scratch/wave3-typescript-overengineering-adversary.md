# Wave 3 TypeScript Overengineering Adversary

## Lane

Role: TypeScript Overengineering Adversary.

Review target: `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/`.

Review question: will this corpus drive TypeScript state-space reduction for product scenarios, or will it authorize abstraction sprawl, excess packet count, broad facades, and ADTs that do not carry product contract value?

## Verdict

The corpus is directionally strong: it repeatedly rejects implementation, MapGen-specific leakage, proof-class collapse, generic proof frameworks, and file-move refactors. The risk is subtler. The packet suite can still overbuild because it treats every named responsibility as a separate domino, and because several TypeScript state-space findings are stated as type-shape repairs without an explicit product-state elimination test.

I would block Phase 2 goal attachment on the P2 findings below until they are dispositioned in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md`. I do not see a P1 from this lane.

## Findings

### P2: Packet-count inflation is not guarded by a packet-minimization test

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/README.md:40` says Phase 2 should produce a separate packet for every valid domino.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:7` repeats that every domino gets a packet.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:43` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:58` define sixteen dominoes.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:7` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:18` require owner, consumer, contract, state-space problem, dependency order, unblock, proof class, and records, but do not require justification that a separate packet reduces more state than it adds.

Why this matters:

The valid-domino standard rejects cosmetic cleanup, but it does not reject organizational over-splitting. A future owner can satisfy every listed field by naming an owner, proof class, and downstream record for each current concern. That is not enough to prove state-space reduction. It may create sixteen coordination surfaces, sixteen packet reviews, sixteen compatibility matrices, and more inter-packet dependency states than the current optional-heavy implementation has.

Concrete risk examples:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:44` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:55` split Proof Contract and Verify Command. That may be correct, but the corpus does not require the DRA to prove why the verify packet cannot be a consumer-scenario packet inside the proof boundary.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:46` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:47` split Workspace Graph Integration and Orientation/Routing. That may be a good dependency, but Phase 2 should prove the split removes impossible states instead of simply mirroring current `plugin.js` plus `nx-projects.ts`.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:56` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:57` split Scaffolding/Refusal and Authoring Topology Fence even though `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:46` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:56` already express the refusal and future-work boundary.

Required fix before goal attachment:

Add a packet-minimization gate to `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md` and/or `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md`: every domino must justify why it is a separate packet rather than a section, stop condition, or acceptance criterion inside an adjacent scenario packet. The proof should name the product state it eliminates and the new coordination states it introduces.

Goal attachment:

Block as P2 until dispositioned.

### P2: D15 makes an execution/provenance substrate a named domino despite saying broad migration is unjustified

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:37` says D15 activates only inside packets where typed failures/provenance require it.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:58` gives D15 its own owner, consumer, contract, unblocks, proof class, and downstream record.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:85` explicitly rejects moving all Habitat internals to Effect.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/README.md:40` and `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:7` imply D15 would still become one of the packets if every domino is packetized.

Why this matters:

D15 is framed as conditional, but the ledger's row shape turns it into a workstream object with a substrate owner and a broad contract: typed command results, argv, cwd, env, git state, cache policy, and output digests. That is close to an execution framework. In TypeScript terms, it invites a cross-cutting ADT/effect layer before a concrete scenario proves the existing state space cannot be reduced with local constructors, simpler value objects, or explicit command wrappers.

Required fix before goal attachment:

Convert D15 from a domino into a packet-local trigger/decision gate. It should not receive a standalone packet unless a concrete D6, D9, D7, or D11 packet demonstrates:

- the exact product scenario blocked by current untyped failures/provenance,
- the smaller local design that was attempted or rejected,
- the specific impossible states removed,
- the compile-time/runtime cost of the substrate,
- the non-goal that it does not become a general Habitat execution framework.

Goal attachment:

Block as P2 until D15 is dispositioned or rewritten as a trigger.

### P2: Type-state/ADT candidates lack a product-contract value test

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:141` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/code-topology-map.md:149` list option bags, optional-heavy shapes, correlated status fields, discriminated-union candidates, constructor constraints, and centralized construction opportunities.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:61` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:75` require a TypeScript state-space problem but do not require a product-contract value test.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/source-authority.md:100` says a future packet must name state-space reduction, but not how to prove the type design earns its cost.

Why this matters:

The listed state-space findings are plausible, but they are not all equal. `CheckReport.ok` correlation likely has direct contract value. `Classification` variants may reduce malformed/diff/project ambiguity. But a discriminated union for every `ok/message/reason` result or a constructor for every option bag can easily produce shallow ADT sprawl: more types, more conversion code, more generic helpers, and no fewer product states.

Required fix before goal attachment:

Add a TypeScript proportionality gate to every Phase 2 packet: each proposed ADT, branded type, constructor, Result type, or option-object split must name the impossible product state it prevents, the consumer whose code gets simpler or safer, the runtime validation backing it, and the simpler alternative rejected. If the answer is only "cleaner types" or "more explicit," the packet should stop or downgrade the change to local implementation detail.

Goal attachment:

Block as P2 until this gate is added or converted into a packet stop condition.

### P2: Rule Registry Metadata risks becoming a mega-schema/facade for unrelated consumers

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:45` gives D2 one typed metadata contract covering id, owner, tool, lane, scope, hook scope, manifest, and generated-zone relation.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domain-responsibility-map.md:23` gives Rule Registry Metadata consumers across check, classify, Nx plugin, baseline, and Pattern Governance.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:28` through `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:38` separate orientation, selector validation, checks, baselines, diagnostic Grit, and pattern admission as distinct scenarios.

Why this matters:

D2 is dependency-heavy and intentionally early. If it becomes one all-purpose rule metadata schema, later packets can overfit to that facade rather than reducing their own states. A classify consumer needs routable scope and target facts; check needs executable rule selection and diagnostics; Pattern Governance needs admission/proof metadata; generated zones need host policy declarations. Forcing these through one broad typed registry can harden unrelated fields as required and make simple changes expensive.

Required fix before goal attachment:

D2 should require facet/projection discipline: one source may exist, but each consumer must receive the smallest typed projection that matches its scenario. The packet should reject a single exported `RuleMetadata` facade if fields are only meaningful to some consumers. It should also prove that adding a new rule cannot require unrelated Pattern Governance, generated-zone, hook, or Nx fields unless the scenario actually uses them.

Goal attachment:

Block as P2 until dispositioned.

### P3: Authoring Topology Fence may be a stop condition, not a full packet

Evidence:

- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:46` already says MapGen domain/op/stage/step/recipe topology should be refused or deferred.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/scenario-corpus.md:56` records Authoring Topology as future work.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/domino-candidate-ledger.md:57` gives Authoring Topology Fence a full D14 row.
- `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/phase2-goal.md:22` says not to generate MapGen Authoring Topology.

Why this matters:

The fence is important, but making it a full packet can still become process theater: a packet to say "do not implement" after multiple upstream packets already carry refusal contracts. If D14 exists only to restate a non-goal, it adds coordination without reducing TypeScript states.

Optional improvement:

Fold D14 into D0 and D13 unless the DRA owner can name a distinct refusal contract that cannot be captured in scenario inventory plus scaffolding refusal tests. If D14 remains, require it to be a compact deferral/refusal packet with no new implementation surface.

Goal attachment:

Does not block unless the owner accepts it as P2.

## Required Fixes Before Goal Attachment

1. Add a packet-minimization gate so "one packet per domino" cannot create review and dependency sprawl without proving net state-space reduction.
2. Convert D15 into a packet-local trigger unless concrete scenario evidence justifies a standalone execution/provenance substrate packet.
3. Add a TypeScript proportionality gate for ADTs, Result types, constructors, branded types, and option-object splits.
4. Add Rule Registry facet/projection discipline so D2 cannot become a broad metadata facade.
5. Record all accepted P2 dispositions in `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame/docs/projects/habitat-harness/domain-refactor-prep/review-disposition-ledger.md` before attaching the Phase 2 goal.

## Optional Improvements

- Consider collapsing D14 into D0 and D13 unless it has a distinct product refusal contract.
- For D1 and D12, require the DRA owner to prove what belongs in the common proof vocabulary versus what belongs only to `habitat verify`.
- For D3 and D4, require a note on why graph facts and orientation output are separate state reducers rather than a current-file-layout split.

## Attachment Recommendation

Block goal attachment on the four P2 findings above. No P1 finding from this lane.
