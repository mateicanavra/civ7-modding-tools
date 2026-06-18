# Review Disposition Ledger: deep-habitat-d13-scaffolding-refusal-contracts

## Current Status

D13 is accepted for design/specification only after final rereview. No source
implementation is authorized. All fresh final rereview lanes recorded no
unresolved P1/P2 findings against the post-fix repaired disk state.

## Imported First-Wave Findings

| Finding | Severity | Disposition | Repair Record |
| --- | --- | --- | --- |
| Global constraints are concern catalogs, not D13 acceptance records. | Global constraint | applied as background only | D13 review gate remains packet-specific. |
| Packet lacked a closed ontology and state/refusal model. | P1 | accepted and repaired; final rereview accepted | `design.md` now defines D13 owner, accepted/rejected terms, target request/decision model, request/outcome matrix, refusal contract, and receipt contract. `spec.md` encodes closed pre-write decisions and refusal scenarios. |
| Current Civ/workspace terms and package namespace were implicit generic Habitat semantics. | P1 | accepted and repaired; final rereview accepted | `design.md` classifies Civ/MapGen/current workspace names as compatibility/workspace facts unless D0/D2/G-HOST accepts them; target language uses generic scaffold/refusal terms. |
| Host-policy consumption was named but not modeled while G-HOST remains unresolved. | P1 | accepted and repaired; final rereview accepted | `design.md`, `spec.md`, `tasks.md`, and downstream ledger keep host behavior source-blocked behind G-HOST and define `host-policy-missing` refusal only as consumed projection behavior. |
| Candidate pattern generation and registered Pattern Governance promotion were blurred. | P1 | accepted and repaired; final rereview accepted | `design.md` separates candidate draft write from D8-owned registered promotion; `spec.md` adds candidate-only and registered-promotion requirements; tasks require D8 live projections before source behavior. |
| D13/D14 sequencing was circular for Authoring Topology refusal language. | P1 | accepted and repaired; final rereview accepted | `design.md` makes D13 owner of generic refusal shape and D14 owner of authoring-specific blocked actions/future criteria; source implementation remains blocked behind D14 early-fence language. |
| Spec was not falsifying enough for scaffold/refusal behavior. | P1 | accepted and repaired; final rereview accepted | `spec.md` now contains requirement families for closed decisions, supported project scaffolds, unsupported/host refusals, Authoring Topology, candidate drafts, D8 registered promotion, and D0 compatibility blockers. |
| Validation referenced nonexistent `bun run habitat generate --help`. | P1 | accepted and repaired; final rereview accepted | `design.md`, `proposal.md`, `tasks.md`, and phase record use Nx generator dry-runs and generator tests instead; `habitat generate` is rejected as a D13 gate. |
| Refusal shape omitted blocked action, request class, no-write result, non-claims, and retry condition. | P2 | accepted and repaired; final rereview accepted | `design.md` defines required scaffold refusal fields; `spec.md` uses refusal scenarios; tasks require structured refusals. |
| Write set and protected paths were deferred. | P2 | accepted and repaired; final rereview accepted | `design.md` names later implementation write set, protected paths, and D0 blockers. |
| Nx generator options could become authority. | P2 | accepted and repaired; final rereview accepted | `design.md` rejects schema enum values as authority and constrains options to input/compatibility surfaces. |
| Pattern generator public description contradicts candidate-only behavior. | P2 | accepted and repaired; final rereview accepted | `design.md` and `spec.md` make this a D0 compatibility blocker and tasks require correction/disposition before source closure. |
| Durable packet path/status metadata used stale branch and brittle absolute paths. | P2 | accepted and repaired; final rereview accepted | `$ACTIVE_REMEDIATION_BRANCH` and D13 variables are recorded in `$REMEDIATION_DIR/context.md`; D13 durable artifacts use variables for control paths. |

## Final Rereview Acceptance Records

Final acceptance cites these post-fix final review files:

- `$D13_FINAL_DOMAIN_REVIEW`
- `$D13_FINAL_TYPESCRIPT_VALIDATION_REVIEW`
- `$D13_FINAL_OPENSPEC_INFORMATION_REVIEW`
- `$D13_FINAL_CODE_VENDOR_TOPOLOGY_REVIEW`
- `$D13_FINAL_CROSS_DOMINO_PRODUCT_REVIEW`

Each final review read the repaired disk state after the D14 proposal boundary
cleanup and first-wave OpenSpec scratch wording cleanup. All five lanes accepted
D13 for design/specification only with no unresolved P1/P2 findings.

## Source Blockers Preserved

D13 is not implementation-complete. Source implementation remains blocked behind
concrete D0 rows, live D2 governance/generated-zone facts, live D8
candidate/admission projections, accepted/live G-HOST host declarations where
consumed, D10 path/zone decisions where touched, and D14 early-fence language for
authoring-specific refusals.
