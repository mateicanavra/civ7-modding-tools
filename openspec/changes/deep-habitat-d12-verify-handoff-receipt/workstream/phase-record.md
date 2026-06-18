# Phase Record: D12 Verify Handoff Receipt

## State

- Status: accepted for design/specification only after final rereviews found no unresolved P1/P2 findings.
- Worktree: `$ACTIVE_REMEDIATION_WORKTREE`.
- Branch: `$ACTIVE_REMEDIATION_BRANCH`.
- Source packet: `$D12_SOURCE_PACKET`.
- OpenSpec change: `$D12_CHANGE`.
- Implementation: not started and not authorized.

## Objective

Design D12 as the Verify Handoff packet: a `VerifyReceipt` contract that
assembles D1 receipt language, D3 verify target plan facts, D7 check summary
projection, affected Nx command observations, post-state observations, and
canonical non-claims into a bounded handoff record.

## Current Gate

D12 is accepted for design/specification only. Source implementation remains
blocked until concrete D0 rows, D1 output-family handling, live D3 verify target
plan facts, live D7 verify check projection facts, and live D11 projections
where consumed are available.

The final design/specification gate closed after:

- first-wave D12 review findings are imported and repaired;
- final D12 domain/ontology, TypeScript/validation, OpenSpec/information,
  code/vendor topology, and cross-domino/product rereviews run against the
  repaired disk state;
- all accepted P1/P2 findings are repaired;
- strict D12 OpenSpec validation, full OpenSpec validation, wording audit, and
  diff hygiene pass.

## Source Blockers Preserved

- Concrete D0 rows are required before verify command JSON, human output, help,
  exit behavior, exports, docs/examples, scripts, or tests change source
  behavior.
- D1 live output-family mapping is required before replacing or facading
  legacy `VerifyProof` surfaces.
- D3 live `VerifyTargetPlan` and graph-refusal facts are required before source
  verify behavior consumes graph/target facts.
- D7 live `VerifyCheckSummaryProjection` is required before source verify
  behavior consumes check allow/skip and selector states.
- D11 live local-feedback or hook trace projections are required before source
  verify behavior observes any D11-owned local-feedback surface.

## Validation Matrix

| Gate | Expected status | Current use | Non-claim |
| --- | --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d12-verify-handoff-receipt --strict` | 0 before design acceptance | Validates D12 packet structure. | Does not test Habitat source behavior. |
| `bun run openspec:validate` | 0 before design acceptance | Validates whole OpenSpec corpus. | Does not make D12 implementation-ready. |
| D12 wording audit over `$D12_CHANGE/**`, `$REMEDIATION_DIR/packet-index.md`, and `$AGENT_SCRATCH/domino-D12-*.md` | Clean except classified legacy compatibility names and canonical traceability | Prevents reduced-standard or legacy target wording in active guidance. | Does not test command output. |
| `git diff --check` | 0 before commit | Patch hygiene. | Does not validate domain design. |
| `bun run --cwd tools/habitat-harness test -- test/lib/verify-proof.test.ts test/commands/habitat-commands.test.ts` | Later implementation gate | Verify source/test compatibility after source edits. | Not a design-acceptance gate and not CI. |
| `bun run --cwd tools/habitat-harness test -- test/lib/enforcement-surface.test.ts` | Later implementation gate when public surfaces change | Verifies surface inventory alignment. | Does not prove verify runtime behavior. |
| `bun run habitat verify --json` | Later implementation gate with scenario-specific expected status | Public verify JSON behavior after source edits. | Not Graphite readiness, OpenSpec acceptance, apply safety, product completion, runtime behavior, current-tree cleanliness, or rule correctness. |

## Review Lanes

| Lane | Scratch path | Current status |
| --- | --- | --- |
| Domain/ontology | `$D12_FINAL_DOMAIN_REVIEW` | final rereview accepted; no unresolved P1/P2 |
| TypeScript/validation | `$D12_FINAL_TYPESCRIPT_VALIDATION_REVIEW` | final rereview accepted; no unresolved P1/P2 |
| Code/vendor topology | `$D12_FINAL_CODE_VENDOR_TOPOLOGY_REVIEW` | final rereview accepted; no unresolved P1/P2 |
| OpenSpec/information/testing | `$D12_FINAL_OPENSPEC_INFORMATION_REVIEW` | final rereview accepted; no unresolved P1/P2 |
| Cross-domino/product | `$D12_FINAL_CROSS_DOMINO_PRODUCT_REVIEW` | final rereview accepted; no unresolved P1/P2 |

## Supervisor Control Repair Before Final Rereview

- Affected non-execution is aligned to D1/D7 `skipped` / skipped-affected
  reason semantics. D12 does not introduce an alternate target affected state.
- D11 local-feedback and hook trace surfaces are explicit observation
  boundaries. D12 may observe named D11 projections only with D0/D1-compatible
  surfaces and must not treat hook pass as verify completion or readiness.

## Current Non-Claims

- This packet does not implement Habitat source changes.
- This packet accepts D12 for design/specification only; source implementation
  remains blocked by the named upstream public-surface and live-projection
  requirements.
- This packet does not authorize legacy proof-named target code; those names are
  compatibility surfaces until D0/D1 decide handling.
- Later passing verify commands do not claim CI, product/runtime behavior,
  Graphite readiness, OpenSpec acceptance, apply safety, current-tree
  cleanliness, or rule correctness unless a separate owner explicitly provides
  that authority.
