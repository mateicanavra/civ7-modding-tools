# Review Disposition Ledger: deep-habitat-d13-scaffolding-refusal-contracts

## Current Status

D13 source implementation is in validation. All fresh final rereview lanes
recorded no unresolved P1/P2 findings against the repaired disk state, and the
implementation now follows the corrected product boundary: plugin scaffold,
candidate pattern drafts, and no-write refusals.

## Imported First-Wave Findings

| Finding | Severity | Disposition | Repair Record |
| --- | --- | --- | --- |
| Global constraints are concern catalogs, not D13 acceptance records. | Global constraint | applied as background only | D13 review gate remains packet-specific. |
| Packet lacked a closed ontology and state/refusal model. | P1 | accepted and repaired; final rereview accepted | `design.md` now defines D13 owner, accepted/rejected terms, target request/decision model, request/outcome matrix, and refusal contract. `spec.md` encodes closed pre-write decisions and refusal scenarios. |
| Current Civ/workspace terms and package namespace were implicit generic Habitat semantics. | P1 | accepted and repaired; final rereview accepted | `design.md` classifies Civ/MapGen/current workspace names as compatibility/workspace facts unless D0/D2/G-HOST accepts them; target language uses generic scaffold/refusal terms. |
| Host-policy consumption was named but not modeled while G-HOST remains unresolved. | P1 | accepted and repaired; final rereview accepted | D13 source no longer implements host placeholders or local host inference; host scaffolding is outside D13 source scope. |
| Candidate pattern generation and registered Pattern Governance promotion were blurred. | P1 | accepted and repaired; final rereview accepted | `design.md` separates candidate draft writes from Pattern Governance active registration; source refuses active registration requests before writes. |
| D13/D14 sequencing was circular for Authoring Topology refusal language. | P1 | accepted and repaired; final rereview accepted | D13 source no longer implements Authoring Topology placeholders; D14 owns generator-safe authoring request classes. |
| Spec was not falsifying enough for scaffold/refusal behavior. | P1 | accepted and repaired; final rereview accepted | `spec.md` now contains requirement families for closed decisions, supported plugin scaffolds, unsupported refusals, candidate drafts, Pattern Governance active registration refusals, and D0 compatibility blockers. |
| Validation referenced nonexistent `bun run habitat generate --help`. | P1 | accepted and repaired; final rereview accepted | `design.md`, `proposal.md`, `tasks.md`, and phase record use Nx generator dry-runs and generator tests instead; `habitat generate` is rejected as a D13 gate. |
| Refusal shape omitted blocked action, request class, no-write result, and retry condition. | P2 | accepted and repaired; final rereview accepted | `design.md` defines required scaffold refusal fields; `spec.md` uses refusal scenarios; source uses a TypeBox-backed refusal schema. |
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

D13 implementation consumes concrete D0 rows for touched public surfaces and
keeps host policy and Authoring Topology outside source scope. Pattern candidate
generation remains non-active, and active registration requests refuse before
writes through Pattern Governance wording.
