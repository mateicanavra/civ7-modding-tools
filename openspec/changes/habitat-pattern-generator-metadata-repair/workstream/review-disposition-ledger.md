# Review Disposition Ledger

**Change:** `habitat-pattern-generator-metadata-repair`
**Status:** P1/P2 design findings accepted and patched; candidate/refusal
checkpoint supervisor-accepted; manifest-validator checkpoint in review
**Owner:** DRA Habitat recovery owner

Accepted P1/P2 findings block implementation until repaired, rejected with
source evidence, invalidated with later evidence, or moved by explicit
authority decision.

Checkpoint note: this branch implements candidate-only sparse generation and
registered advisory/enforced no-write refusal. It does not close Pattern
Authority Manifest validation, registered rule promotion, Grit row proof,
baseline write/shrink proof, hook-scope proof, classify proof, or product proof.

Validator checkpoint note: the child branch
`agent-HR-habitat-pattern-authority-manifest-validator` adds a pure
Pattern Authority Manifest model and validator. It validates missing,
malformed, placeholder, contradicted, orphan, Grit-only, and Nx-options-only
states without consuming HG row proof, mutating baselines, adding hook scope,
or promoting registered rules.

## Findings

| ID | Lane | Severity | Finding | Disposition | Required repair | Status |
| --- | --- | --- | --- | --- | --- | --- |
| HPG-REV-P1-001 | adversarial workstream selection | P1 | `habitat-pattern-generator-metadata-repair` is valid as a design and contract gate, but must not become the next registered-rule implementation stream before command selector truth and baseline contract execution are real. | accepted | Proposal, design, and tasks now state that registered advisory/enforced writes are blocked until predecessor command, baseline, Grit proof, and classify contracts are executable where relevant. | patched |
| HPG-REV-P1-002 | owner-boundary review | P1 | Pattern-generator metadata will be unsafe if it absorbs neighboring owners: baseline semantics, current-tree proof, fixture/injected-violation proof, apply proof, hook proof, and classify target proof. | accepted | Design keeps this packet to generated Grit pattern candidate/registration state and manifest validation; protected paths and downstream ledgers preserve baseline, Grit proof, hooks, and classify ownership. | patched |
| HPG-REV-P1-003 | hidden dependency review | P1 | Command filters can still false-green, missing baseline files still mean empty locked baselines, and native Grit samples do not prove current-tree or hook safety. | accepted | Spec and tasks require command selector truth, baseline rule-introduction manifest, native fixture proof, current-tree scan, baseline action, false-positive controls, and hook-scope evidence before registered enforcement or pre-commit scope. | patched |
| HPG-REV-P2-004 | product/outcome review | P2 | This packet prevents generated structure from becoming unearned rule-pack truth, but it does not deliver the broader architecture-derived transformation catalog by itself. | accepted | Proposal and design position this work as generator truth and guardrail work that enables future Grit pilots and per-pattern workstreams rather than claiming product completion. | patched |
| HPG-REV-P2-005 | classify-boundary review | P2 | Pattern-generator metadata must stay separate from classify/generator target-existence repair. | accepted | Proposal and design list classify target proof as exterior/protected owner, with only downstream README/agent guidance realignment after both contracts exist. | patched |
| HPG-REV-P2-006 | authority assignment review | P2 | Nx, Grit, Biome, and Effect can own mechanics, but none supplies Habitat authority manifest, baseline policy, current-tree proof, or hook-scope acceptance. | accepted | Spec requires separation among Nx option schema, Grit metadata, Habitat authority manifest, and registered-promotion orchestration design; tests require those layers cannot substitute for each other. | patched |
| HPG-REV-P2-007 | Effect orchestration review | P2 | If current manual orchestration structurally creates gaps, registered promotion should reconsider Effect instead of preserving the same manual failure mode. | accepted | Design and spec make Effect a required decision point before registered promotion involving command proof, dry-run/no-write proof, scoped file transactions, scratch resources, rollback/diff proof, baseline manifest consumption, or hook-scope proof orchestration. | patched |
