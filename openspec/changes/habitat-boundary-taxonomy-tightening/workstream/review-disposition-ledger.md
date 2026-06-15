# Review Disposition Ledger

**Change:** `habitat-boundary-taxonomy-tightening`
**Status:** adversarial review complete; accepted findings patched into packet
**Owner:** DRA Habitat recovery owner

Accepted P1/P2 findings block implementation until repaired, rejected with
source evidence, invalidated with later evidence, or moved by explicit
authority decision.

## Findings

| ID | Lane | Severity | Finding | Disposition | Required repair | Status |
| --- | --- | --- | --- | --- | --- | --- |
| BTT-R1 | Taxonomy closure | P1 | Spec allowed illegal graph edges to become taxonomy closure through "baselined with authority". | ACCEPT | Removed baseline-as-closure wording; illegal edges must be repaired, moved by explicit architecture decision, or recorded as shrink-only debt that keeps closure mixed/unknown. | patched |
| BTT-R2 | Downstream records | P1 | Known stale H3 records were conditional watched items rather than required repair targets. | ACCEPT | Downstream ledger and design now enumerate exact H3/project/review/README/AGENTS/dependent packet repair targets and mark historical records non-current until repair lands. | patched |
| BTT-R3 | Evidence durability | P2 | Completed source-capture tasks lacked durable command evidence shape. | ACCEPT | Added `workstream/evidence-log.md` with cwd, branch, commit, argv, env, exit code, bounded output, parsed result, and touched-path status for design evidence. | patched |
| BTT-R4 | Habitat JSON selector proof | P2 | Habitat `nx-boundaries` proof needed parsed selected-rule assertions to avoid selector false-green acceptance. | ACCEPT | Proposal, design, spec, and tasks require `rules[]` to contain `nx-boundaries` with owner metadata, locked pass, and zero diagnostics. | patched |
| BTT-R5 | Dual-tag proof scope | P3 | Dual-tag wording overclaimed from one sentinel probe. | ACCEPT | Rephrased closure around the live `kind:mod` plus `kind:control` SDK-negative sentinel; broader claims require broader structured proof. | patched |
