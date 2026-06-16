# Review Disposition Ledger

**Change:** `habitat-pattern-generator-metadata-repair`
**Status:** P1/P2 design findings accepted and patched; candidate/refusal,
manifest-validator, registered-promotion Effect decision, and registered
manifest/reference contract, registered promotion gate/refusal, and registered
advisory output checkpoints are supervisor-accepted; registered enforced
non-hook output checkpoint is implemented locally and pending supervisor review
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

Effect decision checkpoint note: the child branch
`agent-HR-habitat-pattern-authority-effect-decision` records the
supervisor-accepted substrate/proof-contract decision for future registered
promotion. Registered promotion must consume the existing Habitat Effect
runtime/process/proof substrate and service boundaries when it performs command
proof, no-write proof, scoped file transactions, scratch-resource cleanup,
baseline-manifest consumption, hook-scope proof, or durable proof-record
orchestration. This note does not accept registered advisory/enforced writes,
baselines, hook scope, current-tree proof, or product/runtime proof.

Registered manifest/reference checkpoint note: this checkpoint adds the
rule-pack `manifestPath` contract, canonical registered manifest source-path
validation, baseline-introduction manifest reference validation, and duplicate
pattern/baseline refusal tests. The repaired checkpoint also requires complete
rule-pack identity fields for registered manifest validation, checks pre-commit
hook-scope agreement when hook scope is claimed, keeps normal candidate
generation validator-acceptable, and expands no-write assertions over the known
generator-owned side-effect paths. It does not write active registered patterns,
`rules.json` entries, baselines, or hook scope.

Registered promotion gate/refusal checkpoint note: this checkpoint routes
registered generator requests through the Pattern Authority Manifest validator
before the still-blocked active write path. It proves missing manifests,
placeholder authority, and hook-scope mismatch fail closed before writes, and
that accepted manifest inputs reach the explicit active-write block without
creating active patterns, baselines, hook scope, or `rules.json` entries.

Registered advisory output checkpoint note: this checkpoint implements the
advisory-only registered promotion path through the accepted Habitat Effect
runtime edge. It requires an accepted manifest, existing explicit baseline file,
and matching rule-introduction baseline manifest before writing; it writes the
generated advisory Grit pattern and appends a `rules.json` entry with
`manifestPath` while preserving rule-pack metadata. Native Grit sample proof and
Habitat wrapper proof are recorded for a scratch generated advisory rule. It
does not implement registered enforced output, pre-commit hook activation,
baseline creation/mutation, HG row semantics, or product/runtime proof.

Registered enforced non-hook output checkpoint note: this checkpoint extends
the same accepted Effect-backed promotion boundary to registered enforced
rules whose Pattern Authority Manifest explicitly declares no hook scope. It
requires the accepted manifest/reference contract, existing explicit baseline
file, matching rule-introduction baseline manifest, native Grit sample proof,
and Habitat wrapper current-tree proof before writing active artifacts. It
writes only the active enforced Grit pattern and `rules.json` reference for the
scratch proof, then cleans those scratch artifacts. Pre-commit hook scope,
baseline creation/mutation, HG row semantics, and product/runtime proof remain
non-claims.

P3 watch item: when registered rule-pack context is implemented, call
`validatePatternAuthorityManifest(...)` with `requireRuleReference: true` and
matching rule references. Do not treat an isolated registered manifest as
sufficient rule-pack authority.

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
| SUP-PAM-P1-001 | registration-contract review | P1 | Generated candidate manifests defaulted `openspecChangeId` to placeholder text that the validator rejects. | accepted | Candidate generator and Nx schema now default to this owning packet id, and generator tests validate the emitted candidate manifest through `validatePatternAuthorityManifest(...)`. | patched |
| SUP-PAM-P1-002 | registration-contract review | P1 | Sparse rule-pack references with only `ruleId` and `manifestPath` could satisfy `requireRuleReference` without proving pattern identity, owner tool, lifecycle lane, or hook-scope relationship. | accepted | The accepted rule reference type is complete; validator input may be sparse but missing identity/lane fields fails as `orphan-manifest`, and hook-scope contradictions fail as `contradicted-manifest`. | patched |
| SUP-PAM-P2-003 | registration-contract review | P2 | Registered refusal no-write tests did not cover the canonical registered manifest path and known generator-owned side-effect paths. | accepted | Refusal tests now assert candidate artifacts, registered manifest path, active `.grit` path, baseline path, and `rules.json` remain unwritten/unchanged for registered and collision refusals. | patched |
| SUP-PAM-P1-004 | registration-contract review | P1 | The phase verification section lacked the current registration-contract proof commands and boundary while tasks marked the checkpoint complete. | accepted | Phase verification now records the registration-contract commands, proof class, and non-claims. | patched |
| SUP-PAM-P2-005 | registration-contract review | P2 | Phase handoff/status still pointed at the Effect decision checkpoint and told the next DRA not to implement `rules.json` references even though this checkpoint implements the reference contract. | accepted | Phase status and next action now name the registration-contract checkpoint and leave registered writes/promotion, live baseline-manifest consumption, native/current-tree Grit proof, hook-scope proof, and packet closure open. | patched |
