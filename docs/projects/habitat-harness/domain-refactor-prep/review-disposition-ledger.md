# Review Disposition Ledger

This ledger records adversarial review findings against the preparation corpus.

## Review Standard

Accepted P1/P2 findings block goal attachment until dispositioned. Disposition requires one of:

- fixed in the corpus,
- explicitly deferred with trigger and owner,
- rejected with evidence,
- converted into a Phase 2 packet stop condition.

## Initial Self-Review Findings

| ID | Severity | Finding | Disposition | Evidence |
| --- | --- | --- | --- | --- |
| R0-001 | P1 | Bad-checkout agent findings must not contaminate the corpus. | Fixed. Only fresh agents on `/Users/mateicanavra/Documents/.nosync/DEV/worktrees/wt-codex-habitat-toolkit-domain-refactor-frame` branch `codex/habitat-fast-lint-checks` are indexed. | `agent-scratch-index.md`; each Wave 2 scratch has preflight. |
| R0-002 | P1 | Preparation might drift into packet writing. | Guarded. Corpus names dominoes and dependencies but does not write packet bodies. | `README.md`; `domino-candidate-ledger.md` scope and stop conditions. |
| R0-003 | P1 | Generic Habitat could be justified by Civ7/MapGen-only behavior. | Guarded. MapGen-specific apply and generated-zone behavior are marked as host/pattern policy boundaries. | `scenario-corpus.md`; `domain-responsibility-map.md`; `domino-candidate-ledger.md`. |
| R0-004 | P1 | Current full-suite Habitat test reliability is a proof risk. | Converted to Phase 2 stop condition and validation result. It does not block attaching the design goal, but blocks any packet proof closure that depends on Habitat tests until fixed or explicitly non-claimed. | `validation-results.md`; `domino-candidate-ledger.md`. |
| R0-005 | P1 | `habitat:rule:biome-ci` alias may report false green due to colon target parsing. | Converted to Phase 2 stop condition and validation result. It does not block attaching the design goal, but blocks graph/alias proof closure until fixed or explicitly dispositioned. | `validation-results.md`; `domino-candidate-ledger.md`. |
| R0-006 | P2 | Broad `src/index.ts` exports may harden internals as public API. | Converted to Phase 2 stop condition. D0 must produce an explicit public/private/export-state matrix before any packet moves internals or narrows package exports. | `domain-responsibility-map.md`; `domino-candidate-ledger.md`; `phase2-workstream-packets/D0-scenario-public-contract-inventory.md`. |

## Wave 3 Findings

| ID | Severity | Finding | Disposition | Evidence |
| --- | --- | --- | --- | --- |
| W3-PROD-001 | P1 | Host-specific policy was not a first-class packet gate. | Fixed as `G-HOST` Host Policy Boundary Gate and Host Policy Boundary domain. It is first-class but not automatically standalone; packet-minimization decides. | `domain-responsibility-map.md`; `domino-candidate-ledger.md`. |
| W3-PROD-002 | P2 | Scenario coverage was too command-surface-first. | Fixed by adding end-to-end workflow matrix. | `scenario-corpus.md`. |
| W3-PROD-003 | P2 | Refusal was not yet a product contract. | Fixed by adding refusal shape, refusal proof standard, and operator ergonomics standard. | `scenario-corpus.md`. |
| W3-PROD-004 | P3 | Goal should require source authority and conflict rules. | Fixed in objective text. | `phase2-goal.md`. |
| W3-OPS-001 | P1 | Accepted proof risks were only tracked, not dispositioned. | Fixed. Current proof risks are recorded in `validation-results.md` and converted to Phase 2 stop conditions. | `validation-results.md`; this ledger. |
| W3-OPS-002 | P1 | Validation command gate lacked durable result record. | Fixed by adding validation record with commands, branch, HEAD, exit, proof class, dispositions, non-claims, and Graphite state. | `validation-results.md`. |
| W3-OPS-003 | P2 | Graphite stack readiness was not recorded. | Fixed. Stack state and no-submit-readiness claim recorded. | `validation-results.md`. |
| W3-OPS-004 | P2 | Domino proof cells were too broad. | Fixed by requiring exact proof gates in the Phase 2 objective and validation stop conditions; Phase 2 packets must list exact commands and non-claims. | `phase2-goal.md`; `validation-results.md`; `domino-candidate-ledger.md`. |
| W3-TS-001 | P2 | Packet-count inflation lacked a minimization test. | Fixed by adding packet-minimization gate. | `README.md`; `domino-candidate-ledger.md`; `phase2-goal.md`. |
| W3-TS-002 | P2 | D15 read as standalone execution/provenance substrate. | Fixed by defining D15 as packet-local trigger unless a concrete scenario proves standalone necessity. | `domino-candidate-ledger.md`. |
| W3-TS-003 | P2 | Type-state/ADT candidates lacked product-contract value test. | Fixed by adding type-state value gate. | `domino-candidate-ledger.md`. |
| W3-TS-004 | P2 | Rule Registry Metadata risked becoming a mega-schema/facade. | Fixed by adding metadata facet/projection gate. | `domino-candidate-ledger.md`. |
| W3-COMP-001 | P1 | Wave 3 scratch existed but was not indexed/dispositioned. | Fixed. All Wave 3 scratch paths are indexed and this ledger dispositions findings. | `agent-scratch-index.md`; this ledger. |
| W3-COMP-002 | P1 | Validation results lacked durable record. | Fixed. | `validation-results.md`. |
| W3-COMP-003 | P2 | Wave 1 provenance was summary-only. | Dispositioned. Wave 1 is explicitly non-auditable owner synthesis; Phase 2 must cite consolidated corpus rather than raw Wave 1 claims. | `source-authority.md`; `agent-scratch-index.md`. |
| W3-COMP-004 | P3 | Historical/project-record authority lacked conflict trail. | Fixed with project record disposition table. | `source-authority.md`. |
