# D2 Final OpenSpec/Testing Rereview

## Scope

Final rereview of the repaired Deep Habitat D2 Rule Registry Metadata Contract
OpenSpec packet:

`openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/`

Lane: OpenSpec/testing. This review decides whether D2 clears the prior D2
P1/P2 design/specification blockers. It does not implement source code, does
not edit D2 packet files, and does not accept D2 implementation.

## Verdict

Accepted for design/specification.

D2 now clears the prior OpenSpec/testing P1/P2 blockers. The repaired packet is
no longer a thin "typed facets later" scaffold: it specifies the registry field
inventory, target ontology, versioned state model, facet contract, consumer
projection matrix, D0/D1 prerequisite inventory, validation result contract,
ordered implementation gates, and downstream projection handoffs.

No P1/P2 findings remain in this final OpenSpec/testing lane. D2 remains not
implementation-complete. Source implementation is still blocked until concrete
D0 `surface_id` rows exist for every D2-touched public/durable surface and the
later implementation phase records D1 output-family mappings and D2 validation
results.

## Sources Read

- Required skills:
  - `/Users/mateicanavra/.agents/skills/domain-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/information-design/SKILL.md`
  - `/Users/mateicanavra/.agents/skills/testing-design/SKILL.md`
- Repo-local workstream skills/references:
  - `.agents/skills/civ7-open-spec-workstream/SKILL.md`
  - `.agents/skills/civ7-open-spec-workstream/references/source-map.md`
  - `.agents/skills/civ7-open-spec-workstream/references/phase-loop.md`
  - `.agents/skills/civ7-open-spec-workstream/references/team-and-review-lanes.md`
  - `.agents/skills/civ7-open-spec-workstream/references/artifact-contracts.md`
  - `.agents/skills/civ7-open-spec-workstream/references/validation-checks.md`
  - `.agents/skills/civ7-open-spec-workstream/references/failure-patterns.md`
  - `.agents/skills/civ7-systematic-workstream/SKILL.md`
  - `.agents/skills/civ7-systematic-workstream/references/evidence-and-proof.md`
  - `.agents/skills/civ7-systematic-workstream/references/team-review-lanes.md`
  - `.agents/skills/civ7-habitat-dra-workstream/SKILL.md`
  - `.agents/skills/civ7-habitat-dra-workstream/references/authority-map.md`
  - `.agents/skills/civ7-habitat-dra-workstream/references/proof-classes.md`
  - `.agents/skills/civ7-habitat-dra-workstream/references/review-and-realignment.md`
  - `.agents/skills/civ7-habitat-dra-workstream/references/repair-chain.md`
- Repo/project control:
  - `AGENTS.md`
  - `.agents/skills/README.md`
  - `docs/process/GRAPHITE.md`
  - `docs/projects/habitat-harness/FRAME.md`
  - `docs/projects/habitat-harness/dra-takeover-frame.md`
  - `docs/projects/habitat-harness/openspec-remediation-frame.md`
  - `docs/projects/habitat-harness/openspec-remediation/packet-index.md`
  - `docs/projects/habitat-harness/openspec-remediation/review-disposition-ledger.md`
- D0/D1 acceptance controls:
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D0-final-review.md`
  - `openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/review-disposition-ledger.md`
  - `openspec/changes/deep-habitat-d0-command-surface-inventory/workstream/closure-checklist.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-final-openspec-review.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D1-rereview-validation-openspec.md`
  - `openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/review-disposition-ledger.md`
  - `openspec/changes/deep-habitat-d1-receipt-contract-boundary/workstream/closure-checklist.md`
- D2 controls:
  - `docs/projects/habitat-harness/phase2-workstream-packets/D2-rule-registry-metadata-contract.md`
  - `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-review.md`
  - all fresh `docs/projects/habitat-harness/openspec-remediation/agent-scratch/domino-D2-*-investigation.md` files
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/proposal.md`
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/design.md`
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/specs/habitat-harness/spec.md`
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/tasks.md`
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/phase-record.md`
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/review-disposition-ledger.md`
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/downstream-realignment-ledger.md`
  - `openspec/changes/deep-habitat-d2-rule-registry-metadata-contract/workstream/closure-checklist.md`

## Blocker Clearance

| Prior blocker family | Cleared? | Evidence |
| --- | --- | --- |
| Facet/projection contract missing | Yes | `design.md:144-195` records field inventory, facet contract, and projection matrix; `spec.md:34-45` forbids whole-row leakage. |
| Target ontology and inherited terms unresolved | Yes | `design.md:46-91` defines D2 ownership and target ontology; `design.md:197-215` classifies inherited terms. |
| TypeScript state model left to implementation | Yes | `design.md:93-142` chooses `RuleRegistryDocumentV1`, `schemaVersion: 1`, closed `ownerTool` union, and variant constraints; `tasks.md:17-30` requires parser/projection tests and malformed cases. |
| D0/D1 dependency semantics unresolved | Yes | `proposal.md:44-49`, `design.md:217-243`, and `tasks.md:10-15` block source implementation until concrete D0 rows exist and D1 output families are cited. |
| Spec delta too thin | Yes | `spec.md:3-169` now has separate requirements/scenarios for schema, terms, projections, selectors, routing, graph, baseline, Grit, generated-zone, governance, malformed metadata, and downstream use. |
| Validation gates not falsifying enough | Yes for design/spec | `proposal.md:90-100`, `tasks.md:52-65`, and `phase-record.md:39-54` name focused gates, bad-case intent, freshness/non-claims, OpenSpec checks, and `git diff --check`. Implementation behavior gates remain later by design. |
| Downstream realignment generic | Yes | `downstream-realignment-ledger.md:7-49` names direct and indirect consumers, consumed projections, design status, and source implementation gates. |
| G-HOST dependency contradiction | Yes | `packet-index.md:24-26` and `downstream-realignment-ledger.md:24,45-49` align G-HOST as D0/D1-gated parallel host-policy work and D10 as the D2+G-HOST join point. |
| Tasks were open design questions | Yes | `tasks.md:17-73` is now an ordered implementation sequence with model, projection, consumer migration, deletion/compatibility, validation, and review/index gates. |

## Validation

Commands run from
`/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-deep-habitat-openspec-remediation`:

| Command | Result | Claim |
| --- | --- | --- |
| `bun run openspec -- validate deep-habitat-d2-rule-registry-metadata-contract --strict` | Exit 0; `Change 'deep-habitat-d2-rule-registry-metadata-contract' is valid` | D2 OpenSpec shape is valid only. |
| `bun run openspec:validate` | Exit 0; `249 passed, 0 failed` | Full OpenSpec tree shape is valid only. |
| `git diff --check` | Exit 0 | No whitespace errors in the current diff. |
| Shortcut/placeholder scan over the D2 packet | No authorized shortcut strategy found | Hits were forbidden-language, current-diagnosis, or deletion/compatibility-gate text; no fallback/shim/silent-skip path is authorized. |

## Residual Risk And Non-Claims

- D2 implementation remains blocked until concrete D0 rows exist for the
  D2-touched CLI JSON/human output, package exports, Nx target metadata,
  generator output, hook/local-feedback output, and docs/examples surfaces.
- D2 implementation must cite D1 command/report/refusal families for each
  malformed metadata failure family before source edits.
- OpenSpec validation does not prove TypeScript implementation, current-tree
  Habitat behavior, public compatibility, downstream safety, Graphite
  readiness, runtime/product proof, or source closure.
- The D2 workstream files still say "pending final rereview" because this
  review was instructed not to edit D2 packet files. That is bookkeeping to
  import after acceptance, not a remaining design/specification blocker.

## Packet Index Disposition

The packet index can mark D2 accepted for design/specification only, with
wording equivalent to:

`accepted for design/specification; final OpenSpec/testing rereview found no unresolved P1/P2 blockers; not implementation-complete; source implementation remains blocked until concrete D0 matrix rows exist and D1 malformed-metadata output families are cited`.

Do not mark D2 implementation-complete and do not proceed with D2 source edits
from this review alone.

Skills used: domain-design, information-design, testing-design, civ7-open-spec-workstream, civ7-systematic-workstream, civ7-habitat-dra-workstream.
