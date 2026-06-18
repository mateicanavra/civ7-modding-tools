# Phase Record: D6 Diagnostic Pattern Catalog

## State

- Status: accepted for design/specification only after final
  after-observed-identity rereview found no unresolved P1/P2.
- Active worktree: `$ACTIVE_REMEDIATION_WORKTREE`.
- Active branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D6_SOURCE_PACKET`.
- OpenSpec change: `$D6_CHANGE`.
- Source implementation: not authorized.

## Objective

Convert D6 into complete OpenSpec design/specification authority for the
Diagnostic Pattern Catalog. The packet must leave implementation with no
product/domain/type-state decisions to invent for diagnostic catalog entries,
identity, scan roots, native command acquisition, adapter outcomes, diagnostic
projection, cache/freshness, injected diagnostic probes, downstream projections,
and D0/D1/D2 blockers.

## Current Gate

D6 is accepted for design/specification only. The packet was repaired from the
earlier incomplete scaffold using current negative review findings, first fresh
final rereview blockers, focused after-repair rereview, the non-empty
findings-state correction, and the observed-identity correction. Final
after-observed-identity rereview lanes recorded no unresolved P1/P2 findings.

Design/specification acceptance does not make D6 implementation-complete. Source
implementation remains blocked until:

- concrete D0 compatibility rows exist for every D6-touched public/durable
  surface;
- D1 output-family and compatibility decisions are available wherever D6 touches
  command outcomes, diagnostics, limitations, or retained proof-shaped
  compatibility fields;
- live D2 `ruleGritFacts` projections exist for Grit identity, scan metadata,
  exclusions, hook eligibility where relevant, and malformed metadata output
  families.

## Current Repair Inputs

| Input | Status | Control Use |
| --- | --- | --- |
| `$D6_DOMAIN_REVIEW` | blocking prior investigation | Imported as P1/P2 design repair source. |
| `$D6_TYPESCRIPT_REVIEW` | blocking prior investigation | Imported as P1/P2 type-state repair source. |
| `$D6_FINAL_DOMAIN_REVIEW` | negative final review against earlier disk | Imported as P1/P2 repair source; not acceptance evidence. |
| `$D6_FINAL_TYPESCRIPT_REVIEW` | negative final review against earlier disk | Imported as P1/P2 repair source; not acceptance evidence. |
| `$D6_FINAL_INFORMATION_REVIEW` | negative final review against earlier disk | Imported as P1/P2 repair source; not acceptance evidence. |
| `$D6_FINAL_TOPOLOGY_REVIEW` | negative code/vendor topology report against earlier disk | Imported as P1/P2 repair source; not acceptance evidence. Fresh final topology rereview of the repaired disk is still required before D6 status can move to accepted design/specification. |
| `$D6_FINAL_REREVIEW_DOMAIN_ONTOLOGY` | final rereview against first repaired disk | Accepted D6 for design/specification only in this lane; not implementation evidence. |
| `$D6_FINAL_REREVIEW_CODE_VENDOR_TOPOLOGY` | final rereview against first repaired disk | Accepted D6 for design/specification only in this lane; not implementation evidence. |
| `$D6_FINAL_REREVIEW_TYPESCRIPT_VALIDATION` | blocking final rereview against first repaired disk | Imported as P2 repair source for impossible parsed acquisition/projection/probe states and open command/catalog identity. |
| `$D6_FINAL_REREVIEW_OPENSPEC_INFORMATION` | blocking final rereview against first repaired disk | Imported as P2 repair source for native identity/projection mismatch and open command family. |
| `$D6_FINAL_REREVIEW_TYPESCRIPT_VALIDATION_AFTER_REPAIR` | focused after-repair rereview before non-empty findings-state repair | Partial closure evidence for command/identity/projection/probe blockers; not final acceptance evidence for latest disk. |
| `$D6_FINAL_REREVIEW_OPENSPEC_INFORMATION_AFTER_REPAIR` | focused after-repair rereview before non-empty findings-state repair | Partial closure evidence for native identity and command-family blockers; not final acceptance evidence for latest disk. |
| `$D6_FINAL_REREVIEW_DOMAIN_ONTOLOGY_LATEST` | blocking latest-disk rereview before observed-identity repair | Imported as P2 repair source for observed identity evidence versus accepted catalog identity. |
| `$D6_FINAL_REREVIEW_TYPESCRIPT_VALIDATION_LATEST` | accepted latest-disk rereview before observed-identity repair | Accepted TypeScript/validation lane for non-empty findings and prior P2 repairs; superseded by final after-observed-identity lane for acceptance. |
| `$D6_FINAL_REREVIEW_OPENSPEC_INFORMATION_LATEST` | accepted latest-disk rereview before observed-identity repair | Accepted OpenSpec/information lane; superseded by final after-observed-identity lane for acceptance. |
| `$D6_FINAL_REREVIEW_CODE_VENDOR_TOPOLOGY_LATEST` | accepted latest-disk rereview before observed-identity repair | Accepted code/vendor topology lane; superseded by final after-observed-identity lane for acceptance. |
| `$D6_FINAL_REREVIEW_DOMAIN_ONTOLOGY_AFTER_OBSERVED_IDENTITY` | final accepted rereview | No unresolved P1/P2 for domain/ontology; not implementation evidence. |
| `$D6_FINAL_REREVIEW_TYPESCRIPT_VALIDATION_AFTER_OBSERVED_IDENTITY` | final accepted rereview | No unresolved P1/P2 for TypeScript/validation; not implementation evidence. |
| `$D6_FINAL_REREVIEW_OPENSPEC_INFORMATION_AFTER_OBSERVED_IDENTITY` | final accepted rereview | No unresolved P1/P2 for OpenSpec/information; not implementation evidence. |
| `$D6_FINAL_REREVIEW_CODE_VENDOR_TOPOLOGY_AFTER_OBSERVED_IDENTITY` | final accepted rereview | No unresolved P1/P2 for code/vendor topology; not implementation evidence. |

## Design-Time Validation Gates

| Gate | Expected | What It Establishes | Non-Claim |
| --- | --- | --- | --- |
| D6 complete-standard wording audit over `$D6_CHANGE/**` and final D6 scratch | no reduced-standard guidance in active surfaces | Packet language does not lower the D6 domain bar | Does not prove TypeScript behavior |
| `bun run openspec -- validate deep-habitat-d6-diagnostic-pattern-catalog --strict` | exit 0 | D6 OpenSpec change is structurally valid | Does not prove packet acceptance |
| `bun run openspec:validate` | exit 0 | Full OpenSpec corpus remains valid | Does not prove runtime behavior |
| `git diff --check` | exit 0 | Diff hygiene is clean | Does not prove semantic correctness |
| Final after-observed-identity D6 rereview lanes | exit with no unresolved P1/P2 | Packet accepted for design/specification | Does not authorize source implementation |

## Later Implementation Validation Matrix

| Gate | Expected Oracle | Required Bad Case |
| --- | --- | --- |
| `bun run --cwd tools/habitat-harness test -- test/lib/grit-adapter.test.ts` | Adapter acquisition/projection states are closed and distinguish command failure, no JSON, malformed JSON, schema drift, unexpected shape, projection miss, unexpected identity, scan-root refusal, and cache observation failure. | Adapter failure cannot become a structural pass; malformed wrapper text cannot be clean. |
| `bun run --cwd tools/habitat-harness test -- test/lib/grit-injected-probe.test.ts` | Injected probes require fresh observable execution, exact matching probe, outside-scope control, cleanup state, and diagnostic-only validation class. | Control path matching, dirty final status, or missing freshness observation fails. |
| `bun run --cwd tools/habitat-harness test -- test/grit/grit-patterns.test.ts` | Native Grit fixture results pass and remain distinct from current-tree Habitat diagnostics. | Native fixture success cannot be claimed as current-tree diagnostic cleanliness. |
| New D6 failure-subset tests | D6 diagnostic acquisition/projection/probe states exclude D9 `GritApply*` tags. | Any apply transaction tag accepted inside D6 fails. |
| New D2 projection integration tests | D6 consumes live `ruleGritFacts`; missing Grit `patternIdentity` refuses before native command execution. | `gritPattern ?? ruleId` fallback fails. |
| New scan-root decision tests | Every accepted/refused scan-root family is a closed state. | Empty/outside/missing/generated/protected/unapproved/injected-probe roots cannot collapse into generic command failure. |
| New structured adapter projection tests | Machine failure state is structured before text rendering. | Regex over rendered diagnostic text is not required for downstream machine behavior. |
| `bun run habitat check --tool grit-check --json` | D0/D1-compatible command JSON exposes diagnostic findings/refusals without adapter failure becoming pass. | New public fields require D0 rows and D1 decisions. |
| `git status --short --branch` before/after injected probe validation | no probe residue | Probe cleanup state is observable | Does not prove apply transaction safety. |

## Non-Claims

- This packet does not implement Habitat source changes.
- This packet does not make D6 implementation-complete.
- OpenSpec validation is shape validation, not packet acceptance.
- Native Grit fixture results are not current-tree Habitat diagnostic outcomes.
- Diagnostic success is not Pattern Governance admission.
- Diagnostic success is not baseline authority.
- Diagnostic success is not apply safety.
- Injected diagnostic probe outcome is not full current-tree cleanliness.
- D15 substrate work is dormant unless D6 records an exact local representation
  failure.
